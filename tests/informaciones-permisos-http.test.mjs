import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {readFileSync} from "node:fs";
import {GET,POST,DELETE} from "../app/api/informaciones/route.js";
import {PUT as statePut,PATCH as statePatch} from "../app/api/state/[key]/route.js";

const cookieValue=crypto.createHmac("sha256","test-secret-no-real").update("5ta-germania-oficialidad").digest("hex");
function request({origin="https://germania.example",cookie="",json=()=>({texto:"Prueba local, no se publica",destino:"oficiales"})}={}){
  return {
    cookies:{get:key=>key==="quinta_oficialidad"&&cookie?{value:cookie}:undefined},
    headers:new Headers({"origin":origin,"host":"germania.example"}),
    json:async()=>json()
  };
}
test("GET privado sin sesión oficial recibe 403 antes de tocar Neon",async()=>{
 const env=process.env.SESSION_SECRET;process.env.SESSION_SECRET="test-secret-no-real";
 try{
  const r=await GET(request());
  assert.equal(r.status,403);
  assert.equal((await r.json()).error,"acceso_oficial_requerido");
  assert.equal(r.headers.get("Cache-Control"),"private, no-store");
 }finally{if(env===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=env}
});
test("GET privado no acepta firma falsa ni siquiera cuando el cliente dice ser oficial",async()=>{
 const env=process.env.SESSION_SECRET;process.env.SESSION_SECRET="test-secret-no-real";
 try{assert.equal((await GET(request({cookie:"517"}))).status,403);
     assert.equal((await GET(request({cookie:"wrong-signature"}))).status,403);}
 finally{if(env===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=env}
});
test("POST exige firma institucional y origen legítimo; no publica mensajes en pruebas",async()=>{
 const env=process.env.SESSION_SECRET;process.env.SESSION_SECRET="test-secret-no-real";
 try{
  assert.equal((await POST(request())).status,403);
  assert.equal((await POST(request({origin:"https://atacante.example",cookie:cookieValue}))).status,403);
  assert.equal((await POST(request({cookie:"517"}))).status,403);
  const r=await POST(request({cookie:cookieValue,json:()=>({texto:"",destino:"compania"})}));
  assert.equal(r.status,400);
  assert.equal((await r.json()).error,"texto_invalido");
 }finally{if(env===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=env}
});
test("canal privado no es accesible mediante API genérica /api/state",()=>{
 const code=readFileSync(new URL("../app/api/state/[key]/route.js",import.meta.url),"utf8");
 const store=readFileSync(new URL("../lib/state-store.js",import.meta.url),"utf8");
 assert.match(code,/const reserved = \(key\) => key\.startsWith\("security:"\)/);
 assert.match(code,/if \(reserved\(key\)\) return Response\.json\(\{ error: "forbidden_key" \}, \{ status: 403 \}\)/);
 assert.match(store,/export const PREFIJOS_LECTURA = \[/);
 const prefixes=store.slice(store.indexOf("export const PREFIJOS_LECTURA"),store.indexOf("export async function listByPrefix"));
 assert.doesNotMatch(prefixes,/security:/);
});

test("DELETE rechaza usuarios sin sesión y orígenes ajenos sin tocar datos",async()=>{
  const env=process.env.SESSION_SECRET;
  process.env.SESSION_SECRET="test-secret-no-real";
  try{
    assert.equal((await DELETE(request())).status,403);
    assert.equal((await DELETE(request({origin:"https://atacante.example",cookie:cookieValue}))).status,403);
    assert.equal((await DELETE(request({cookie:cookieValue,json:()=>({id:""} )}))).status,400);
  }finally{if(env===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=env}
});
test("la API genérica conserva GET pero bloquea PUT/PATCH de novedades:v1",async()=>{
  const req=request();
  const key={params:Promise.resolve({key:"novedades:v1"})};
  for(const result of [await statePut(req,key),await statePatch(req,key)]){
    assert.equal(result.status,409);
    assert.equal((await result.json()).error,"ruta_informaciones_requerida");
  }
});
