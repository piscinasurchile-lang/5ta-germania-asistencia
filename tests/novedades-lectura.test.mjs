import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";

const source=fs.readFileSync("public/legacy/germania-roles.js","utf8");
function setup(fail=false){
 const requests=[],member={id:517};
 const context={
  miembro:()=>member,novReadPending:{},novVisible:[{id:"aviso1"}],
  fetch:async (url,args)=>{
   requests.push({url,args});
   if(fail)return {ok:false,status:500};
   return {ok:true,status:200};
  },
  renderNovedades:async()=>{},Date,JSON
 };
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf("async function confirmarLectura("),source.indexOf("async function publicarNovedad(")),context);
 return {context,requests};
}
test("confirma Leído con ID del voluntario contra la API de avisos compartidos",async()=>{
 const {context,requests}=setup(),button={};
 await context.confirmarLectura("aviso1",button);
 assert.equal(requests.length,1);
 assert.equal(requests[0].url,"/api/informaciones/prueba");
 assert.equal(requests[0].args.method,"PATCH");
 assert.equal(JSON.parse(requests[0].args.body).voluntarioId,"517");
 assert.equal(JSON.parse(requests[0].args.body).id,"aviso1");
 assert.equal(button.textContent,"✓ Lectura confirmada");
});
test("fallo HTTP permite reintento sin confirmar falsamente",async()=>{
 const {context}=setup(true),button={};
 await context.confirmarLectura("aviso1",button);
 assert.equal(button.disabled,false);
 assert.equal(button.textContent,"Reintentar confirmar lectura");
 assert.equal(context.novReadPending.aviso1,undefined);
});
test("sin identidad o aviso ausente no escribe",async()=>{
 const {context,requests}=setup();
 await context.confirmarLectura("otro",{});
 context.miembro=()=>null;
 await context.confirmarLectura("aviso1",{});
 assert.equal(requests.length,0);
});
test("doble pulsación concurrente produce una sola confirmación",async()=>{
 const {context,requests}=setup();
 await Promise.all([context.confirmarLectura("aviso1",{}),context.confirmarLectura("aviso1",{})]);
 assert.equal(requests.length,1);
});
