import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {GET,POST,PATCH} from "../app/api/informaciones/prueba/route.js";

const path=url=>new URL(url,"https://germania.example");
function req({origin="https://germania.example",body={}}={}){
 return {url:path("/api/informaciones/prueba").href,
   headers:new Headers({"origin":origin,"host":"germania.example"}),
   json:async()=>body};
}
test("canal de prueba no acepta publicación con origen ajeno ni sin origen",async()=>{
 let r=await POST(req({origin:"https://otro.example"}));
 assert.equal(r.status,403);
 r=await PATCH(req({origin:"https://otro.example"}));
 assert.equal(r.status,403);
});
test("solo se publican avisos para la Compañía, nunca mensajes privados",async()=>{
 const r=await POST(req({body:{texto:"ensayo",destino:"oficiales",emisorId:"517"}}));
 assert.equal(r.status,400);
 assert.equal((await r.json()).error,"canal_solo_compania");
});
test("texto vacío, excesivo y remitentes no válidos no llegan a Neon",async()=>{
 let r=await POST(req({body:{destino:"compania",texto:" ",emisorId:"517"}}));
 assert.equal(r.status,400);
 r=await POST(req({body:{destino:"compania",texto:"x".repeat(501),emisorId:"517"}}));
 assert.equal(r.status,400);
 r=await POST(req({body:{destino:"compania",texto:"ensayo",emisorId:"otro"}}));
 assert.equal(r.status,400);
});
test("la fecha explícita de prueba admite más de 48 horas, hasta un máximo de 30 días",async()=>{
 const r=await POST(req({body:{destino:"compania",texto:"ensayo",emisorId:"517",
  vence:new Date(Date.now()+40*24*60*60*1000).toISOString()}}));
 assert.equal(r.status,400);
 assert.equal((await r.json()).error,"vigencia_maxima_30_dias");
});
test("sin id de aviso y voluntario válido no hay confirmación",async()=>{
 let r=await PATCH(req({body:{id:"fake",voluntarioId:"517"}}));
 assert.equal(r.status,400);
 r=await PATCH(req({body:{id:"93bbfdee-b5c7-446b-9f1c-5b8f0ab4b36a",voluntarioId:"otro"}}));
 assert.equal(r.status,400);
});
test("API de prueba usa almacén aislado y bloquea acceso genérico",()=>{
 const src=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");
 const general=readFileSync(new URL("../app/api/state/[key]/route.js",import.meta.url),"utf8");
 assert.match(src,/KEY="informaciones-prueba:v1"/);
 assert.match(src,/LECTURAS="informaciones-prueba-lecturas:"/);
 assert.match(src,/if\(!trialOfficer\(p\)\)return err\("emisor_no_oficial",403\)/);
 assert.match(src,/writeState\(sql,KEY,next,\{ifVersion:v\.version\}\)/);
 assert.match(src,/addToList\(sql,LECTURAS\+item\.id,/);
 assert.match(general,/key === "informaciones-prueba:v1" \|\| key\.startsWith\("informaciones-prueba-lecturas:"\)/);
});
test("no se generan avisos de prueba de manera automática desde el servidor",()=>{
 const src=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");
 assert.doesNotMatch(src,/setInterval|setTimeout|cron:/);
 assert.match(src,/export async function POST\(request\)/);
});
