/* Germania Web Push: VAPID + RFC8291/RFC8292, sin dependencias externas.
   Solo guarda las suscripciones de dispositivos; NO registra lecturas. */
import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";

export const PUSH_TAG="germania-informaciones";
const B64=/^[A-Za-z0-9_-]+$/;

export function decodeBase64Url(value){
  if(typeof value!=="string"||!B64.test(value))throw Error("clave_invalida");
  return Buffer.from(value,"base64url");
}
export function configuracion(){
  const publicKey=process.env.GERMANIA_VAPID_PUBLIC_KEY||"";
  const privateKey=process.env.GERMANIA_VAPID_PRIVATE_KEY||"";
  if(!publicKey||!privateKey)return null;
  try{
    if(decodeBase64Url(publicKey).length!==65||decodeBase64Url(privateKey).length!==32)return null;
    if(decodeBase64Url(publicKey)[0]!==4)return null;
    return {publicKey,privateKey,contact:process.env.GERMANIA_VAPID_CONTACT||"mailto:contacto@germaniavillarrica.cl"};
  }catch{return null;}
}
export function validarSuscripcion(subscription){
  if(!subscription||typeof subscription!=="object")throw Error("suscripcion_invalida");
  const {endpoint,keys}=subscription;
  if(typeof endpoint!=="string"||endpoint.length>2048)throw Error("endpoint_invalido");
  let url;
  try{url=new URL(endpoint)}catch{throw Error("endpoint_invalido")}
  if(url.protocol!=="https:"||url.username||url.password||!url.hostname||url.hash)throw Error("endpoint_invalido");
  const p256dh=keys?.p256dh,auth=keys?.auth;
  if(decodeBase64Url(p256dh).length!==65||decodeBase64Url(p256dh)[0]!==4)throw Error("p256dh_invalida");
  if(decodeBase64Url(auth).length!==16)throw Error("auth_invalida");
  return {endpoint,p256dh,auth,endpointHash:crypto.createHash("sha256").update(endpoint).digest("hex")};
}
export function origenCoincide(request){
  try{
    const origin=request.headers.get("origin");
    return !!origin&&new URL(origin).origin===new URL(request.url).origin;
  }catch{return false}
}
export function baseDatos(){return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;}
export async function asegurarSuscripciones(sql){
  await sql`CREATE TABLE IF NOT EXISTS germania_push_suscripciones (
    endpoint_hash text PRIMARY KEY,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    vapid_public text NOT NULL,
    origen text NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    ultimo_test timestamptz,
    invalida boolean NOT NULL DEFAULT false
  )`;
}
export function esEnvioGeneralActivo(){return process.env.GERMANIA_PUSH_ENVIO_GENERAL==="1";}
export function esPruebaActiva(){return process.env.GERMANIA_PUSH_PRUEBA_LOCAL==="1";}

function hkdfExpand(prk,info,len){
  let resultado=Buffer.alloc(0),anterior=Buffer.alloc(0);
  for(let i=1;resultado.length<len;i++){
    anterior=crypto.createHmac("sha256",prk).update(Buffer.concat([anterior,Buffer.from(info),Buffer.from([i])])).digest();
    resultado=Buffer.concat([resultado,anterior]);
  }
  return resultado.subarray(0,len);
}
export function cifrarPayload(usuario,payload,{sal,servidor}={}){
  const ua=decodeBase64Url(usuario.p256dh),auth=decodeBase64Url(usuario.auth);
  const ec=servidor||crypto.createECDH("prime256v1");
  if(!servidor)ec.generateKeys();
  const publica=ec.getPublicKey(undefined,"uncompressed");
  const secreto=ec.computeSecret(ua);
  const primer=crypto.createHmac("sha256",auth).update(secreto).digest();
  const ikm=hkdfExpand(primer,Buffer.concat([Buffer.from("WebPush: info\0"),ua,publica]),32);
  const salt=sal||crypto.randomBytes(16);
  const prk=crypto.createHmac("sha256",salt).update(ikm).digest();
  const cek=hkdfExpand(prk,"Content-Encoding: aes128gcm\0",16);
  const nonce=hkdfExpand(prk,"Content-Encoding: nonce\0",12);
  const message=Buffer.concat([Buffer.from(JSON.stringify(payload),"utf8"),Buffer.from([2])]);
  if(message.length>3500)throw Error("push_muy_largo");
  const cipher=crypto.createCipheriv("aes-128-gcm",cek,nonce);
  const data=Buffer.concat([cipher.update(message),cipher.final(),cipher.getAuthTag()]);
  const header=Buffer.alloc(21);
  salt.copy(header,0);
  header.writeUInt32BE(4096,16);
  header[20]=publica.length;
  return Buffer.concat([header,publica,data]);
}
export function firmaVapid(endpoint,config,{ahora=Date.now()}={}){
  const url=new URL(endpoint);
  const pub=decodeBase64Url(config.publicKey);
  const d=decodeBase64Url(config.privateKey);
  const key=crypto.createPrivateKey({key:{
    kty:"EC",crv:"P-256",x:pub.subarray(1,33).toString("base64url"),
    y:pub.subarray(33,65).toString("base64url"),d:d.toString("base64url")
  },format:"jwk"});
  const head=Buffer.from(JSON.stringify({typ:"JWT",alg:"ES256"})).toString("base64url");
  const claims=Buffer.from(JSON.stringify({aud:url.origin,exp:Math.floor(ahora/1000)+3600,sub:config.contact})).toString("base64url");
  const input=head+"."+claims;
  const sig=crypto.sign("sha256",Buffer.from(input),{key,dsaEncoding:"ieee-p1363"}).toString("base64url");
  return "vapid t="+input+"."+sig+", k="+config.publicKey;
}
export async function enviarPush(subscription,payload,config,{fetchImpl=fetch}={}){
  const body=cifrarPayload(subscription,payload);
  const response=await fetchImpl(subscription.endpoint,{
    method:"POST",
    headers:{
      "Authorization":firmaVapid(subscription.endpoint,config),
      "Content-Encoding":"aes128gcm",
      "Content-Type":"application/octet-stream",
      "TTL":"86400",
      "Urgency":"normal"
    },
    body,signal:AbortSignal.timeout(6500)
  });
  return {ok:response.ok,status:response.status,expirada:response.status===404||response.status===410};
}
export async function difundir({tipo,titulo,id,origen}){
  if(!esEnvioGeneralActivo())return {habilitado:false,enviados:0};
  const config=configuracion(),sql=baseDatos();
  if(!config||!sql)return {habilitado:false,enviados:0};
  const eventId=tipo+":"+id;
  await asegurarSuscripciones(sql);
  // Sólo las publicaciones nuevas producen un aviso; reintentos no duplican.
  await sql`CREATE TABLE IF NOT EXISTS germania_push_publicaciones (
    id text PRIMARY KEY, creado_en timestamptz NOT NULL DEFAULT now()
  )`;
  const lock=await sql`INSERT INTO germania_push_publicaciones (id) VALUES (${eventId})
    ON CONFLICT (id) DO NOTHING RETURNING id`;
  if(!lock.length)return {duplicado:true,enviados:0};
  const rows=await sql`SELECT endpoint_hash,endpoint,p256dh,auth
    FROM germania_push_suscripciones
    WHERE vapid_public=${config.publicKey} AND origen=${origen}
      AND invalida=false ORDER BY creado_en DESC LIMIT 200`;
  let enviados=0,errores=0;
  for(let i=0;i<rows.length;i+=6){
    await Promise.all(rows.slice(i,i+6).map(async s=>{
      try{
        const answer=await enviarPush(s,{tipo:"germania-informacion",clase:tipo,
          titulo:String(titulo||"Nueva información").slice(0,120),url:"/"},config);
        if(answer.ok)enviados++;
        else{
          errores++;
          if(answer.expirada)await sql`UPDATE germania_push_suscripciones SET invalida=true WHERE endpoint_hash=${s.endpoint_hash}`;
        }
      }catch{errores++;}
    }));
  }
  return {habilitado:true,enviados,errores,total:rows.length};
}
