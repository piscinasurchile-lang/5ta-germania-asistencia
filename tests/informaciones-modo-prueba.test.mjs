import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../public/legacy/germania-informaciones-prueba.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const roles=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
function app(){
  const map=new Map();
  const window={localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}};
  const c=vm.createContext({window,Date,Math,JSON,Error,Number,String,Array});
  vm.runInContext(source,c);
  return window.GermaniaInformacionesPrueba;
}
test("simulación interna para Oficiales sigue siendo local, sin clave",()=>{
 const d=app();
 const m=d.publicar({texto:"Prueba de comunicado",destino:"oficiales",autor:"Oficial prueba"});
 assert.equal(d.listar("compania").length,0);
 assert.equal(d.listar("oficiales").length,1);
 assert.equal(m.texto,"Prueba de comunicado");
 assert.ok(m.id.startsWith("demo-"));
 assert.equal(Date.parse(m.vence)-Date.parse(m.en),172800000);
});
test("prueba simula confirmación Leído y no duplica la misma persona",()=>{
 const d=app(),id=d.publicar({texto:"Comunicado",destino:"compania"}).id;
 assert.equal(d.confirmar(id,"517"),true);
 assert.equal(d.confirmar(id,"517"),true);
 assert.equal(d.listar("compania")[0].lecturas.length,1);
 assert.equal(d.confirmar(id,"otra"),true);
 assert.equal(d.listar("compania")[0].lecturas.length,2);
});
test("prueba separa destino oficiales y confirma solo avisos de la compañía",()=>{
 const d=app(),id=d.publicar({texto:"Mensaje interno de prueba",destino:"oficiales"}).id;
 assert.equal(d.listar("compania").length,0);
 assert.equal(d.listar("oficiales").length,1);
 assert.equal(d.confirmar(id,"517"),false);
});
test("vencimiento de prueba oculta aviso en la hora exacta",()=>{
 const d=app(),a=d.publicar({texto:"Prueba",destino:"compania",vence:new Date(Date.now()+6000).toISOString()});
 assert.equal(d.vigente(a,Date.parse(a.vence)-1),true);
 assert.equal(d.vigente(a,Date.parse(a.vence)),false);
 assert.equal(d.retirar(a.id),true);
 assert.equal(d.listar("compania").length,0);
});
test("la interfaz de prueba no solicita clave; generales compartidos e internos locales",()=>{
 assert.match(html,/PRUEBA SIN CLAVE/);
 assert.match(html,/germania-informaciones-prueba\.js\?v=/);
 assert.doesNotMatch(html,/id="informacionesPin"/);
 assert.doesNotMatch(html,/id="informacionesEntrar"/);
 const start=roles.indexOf("/* ---------- Novedades (Inicio) ---------- */");
 const end=roles.indexOf("/* ---------- Datos de la semana ---------- */",start);
 const ui=roles.slice(start,end);
 assert.match(ui,/NOV_PRUEBA\.publicar/);
 assert.match(ui,/fetch\("\/api\/informaciones\/prueba"/);
 assert.match(ui,/method:"PATCH"/);
 assert.match(ui,/NOV_PRUEBA\.listar\("oficiales"\)/);
 assert.doesNotMatch(ui,/fetch\("\/api\/informaciones"/);
});
