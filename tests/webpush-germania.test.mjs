import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {cifrarPayload,firmaVapid,validarSuscripcion,difundir} from "../lib/germania-webpush.mjs";
import {POST as registrar} from "../app/api/push/suscripcion/route.js";
import {POST as probar} from "../app/api/push/prueba/route.js";

function keyPair(){
  const ec=crypto.createECDH("prime256v1");ec.generateKeys();
  return {ec,publicKey:ec.getPublicKey(undefined,"uncompressed").toString("base64url"),
    privateKey:ec.getPrivateKey().toString("base64url")};
}
function expand(prk,info,len){
  let prev=Buffer.alloc(0),out=Buffer.alloc(0);
  for(let i=1;out.length<len;i++){
    prev=crypto.createHmac("sha256",prk).update(Buffer.concat([prev,Buffer.from(info),Buffer.from([i])])).digest();
    out=Buffer.concat([out,prev]);
  }
  return out.subarray(0,len);
}
test("Web Push aes128gcm entrega contenido íntegro a la clave del teléfono",()=>{
  const ua=keyPair(),as=keyPair(),auth=crypto.randomBytes(16),salt=crypto.randomBytes(16);
  const payload={tipo:"germania-informacion",clase:"odd",titulo:"ODD 064/2026",url:"/"};
  const body=cifrarPayload({p256dh:ua.publicKey,auth:auth.toString("base64url")},
    payload,{sal:salt,servidor:as.ec});
  assert.deepEqual(body.subarray(0,16),salt);
  assert.equal(body.readUInt32BE(16),4096);
  assert.equal(body[20],65);
  const pub=body.subarray(21,86);
  assert.deepEqual(pub,as.ec.getPublicKey(undefined,"uncompressed"));
  const shared=ua.ec.computeSecret(pub);
  const prk=crypto.createHmac("sha256",auth).update(shared).digest();
  const ikm=expand(prk,Buffer.concat([Buffer.from("WebPush: info\0"),
    ua.ec.getPublicKey(undefined,"uncompressed"),pub]),32);
  const first=crypto.createHmac("sha256",salt).update(ikm).digest();
  const cek=expand(first,"Content-Encoding: aes128gcm\0",16);
  const nonce=expand(first,"Content-Encoding: nonce\0",12);
  const enc=body.subarray(86);
  const decrypt=crypto.createDecipheriv("aes-128-gcm",cek,nonce);
  decrypt.setAuthTag(enc.subarray(-16));
  const clear=Buffer.concat([decrypt.update(enc.subarray(0,-16)),decrypt.final()]);
  assert.equal(clear.at(-1),2);
  assert.deepEqual(JSON.parse(clear.subarray(0,-1).toString("utf8")),payload);
});

test("VAPID ES256 usa firma validada y audiencia del proveedor push",()=>{
  const cfg=keyPair();
  const header=firmaVapid("https://fcm.googleapis.com/fcm/send/xyz",{
    publicKey:cfg.publicKey,privateKey:cfg.privateKey,contact:"mailto:test@example.com"
  },{ahora:1730000000000});
  assert.match(header,/^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]+$/);
  const token=header.slice("vapid t=".length).split(", k=")[0];
  const [h,p,sig]=token.split(".");
  assert.equal(JSON.parse(Buffer.from(h,"base64url")).alg,"ES256");
  const claims=JSON.parse(Buffer.from(p,"base64url"));
  assert.equal(claims.aud,"https://fcm.googleapis.com");
  assert.equal(claims.sub,"mailto:test@example.com");
  assert.equal(claims.exp,1730000000+3600);
  const pub=crypto.createPublicKey(crypto.createPrivateKey({key:{
    kty:"EC",crv:"P-256",x:cfg.ec.getPublicKey().subarray(1,33).toString("base64url"),
    y:cfg.ec.getPublicKey().subarray(33).toString("base64url"),
    d:cfg.privateKey
  },format:"jwk"}));
  assert.ok(crypto.verify("sha256",Buffer.from(h+"."+p),
    {key:pub,dsaEncoding:"ieee-p1363"},Buffer.from(sig,"base64url")));
});

test("suscripción rechaza HTTP, claves falsas y acepta claves válidas",()=>{
  const key=keyPair();
  const subscription={endpoint:"https://fcm.googleapis.com/fcm/send/demo",
    keys:{p256dh:key.publicKey,auth:crypto.randomBytes(16).toString("base64url")}};
  const valid=validarSuscripcion(subscription);
  assert.match(valid.endpointHash,/^[0-9a-f]{64}$/);
  assert.throws(()=>validarSuscripcion({...subscription,endpoint:"http://localhost:8000"}));
  assert.throws(()=>validarSuscripcion({...subscription,endpoint:"https://example.com/api/notificar"}));
  assert.throws(()=>validarSuscripcion({...subscription,keys:{...subscription.keys,auth:"invalid"}}));
});

test("API evita registro y prueba push desde un origen ajeno",async()=>{
  const req={url:"https://germania.example/api/push/suscripcion",
    headers:new Headers({origin:"https://otro.example"}),json:async()=>({})};
  assert.equal((await registrar(req)).status,403);
  req.url="https://germania.example/api/push/prueba";
  assert.equal((await probar(req)).status,403);
});

test("sin activación explícita no se envía push general a voluntarios",async()=>{
  const previous=process.env.GERMANIA_PUSH_ENVIO_GENERAL;
  delete process.env.GERMANIA_PUSH_ENVIO_GENERAL;
  try{
    assert.deepEqual(await difundir({tipo:"odd",id:"odd-demo:1",
      titulo:"ODD de prueba",origen:"https://germania.example"}),{habilitado:false,enviados:0});
  }finally{
    if(previous===undefined)delete process.env.GERMANIA_PUSH_ENVIO_GENERAL;
    else process.env.GERMANIA_PUSH_ENVIO_GENERAL=previous;
  }
});

test("service worker recibe sólo tipo Germania, muestra icono y limpia al abrir",()=>{
  const sw=readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
  const page=readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
  const avisos=readFileSync(new URL("../app/avisos/page.js",import.meta.url),"utf8");
  const general=readFileSync(new URL("../app/api/state/[key]/route.js",import.meta.url),"utf8");
  const normal=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");
  assert.doesNotThrow(()=>new vm.Script(sw));
  assert.match(sw,/mensaje.tipo!=="germania-informacion"/);
  assert.match(sw,/showNotification/);
  assert.match(sw,/GERMANIA_PUSH_TAG/);
  assert.match(sw,/setAppBadge/);
  assert.match(page,/clearAppBadge/);
  assert.match(page,/getNotifications/);
  assert.match(avisos,/Notification.requestPermission/);
  assert.match(avisos,/pushManager.subscribe/);
  assert.match(avisos,/\/api\/push\/suscripcion/);
  assert.match(avisos,/\/api\/push\/prueba/);
  assert.match(general,/key === "odd-avisos:v1" && esEnvioGeneralActivo/);
  assert.match(normal,/difundir\(\{tipo:"informacion"/);
});
