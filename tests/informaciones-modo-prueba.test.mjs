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
 vm.runInContext(source,vm.createContext({window,Date,Math,JSON,Error,Number,String,Array}));
 return window.GermaniaInformacionesPrueba;
}
test("simulación interna sigue siendo local y no envía mensajes privados",()=>{
 const d=app();
 const m=d.publicar({texto:"Prueba de comunicado",destino:"oficiales",autor:"Oficial prueba"});
 assert.equal(d.listar("compania").length,0);
 assert.equal(d.listar("oficiales").length,1);
 assert.equal(m.texto,"Prueba de comunicado");
 assert.ok(m.id.startsWith("demo-"));
 assert.equal(Date.parse(m.vence)-Date.parse(m.en),172800000);
});
test("simulador no registra ni expone confirmaciones de lectura",()=>{
 const d=app(),m=d.publicar({texto:"Comunicado",destino:"compania"});
 assert.equal(typeof d.confirmar,"undefined");
 assert.equal(Object.hasOwn(m,"lecturas"),false);
 assert.equal(d.listar("compania").length,1);
 assert.doesNotMatch(source,/voluntarioId|lecturas|confirmar\(/);
});
test("vencimiento de prueba oculta aviso en hora exacta",()=>{
 const d=app(),a=d.publicar({texto:"Prueba",destino:"compania",vence:new Date(Date.now()+6000).toISOString()});
 assert.equal(d.vigente(a,Date.parse(a.vence)-1),true);
 assert.equal(d.vigente(a,Date.parse(a.vence)),false);
 assert.equal(d.retirar(a.id),true);
 assert.equal(d.listar("compania").length,0);
});
test("interfaz de prueba muestra informaciones sin clave, botones de lectura ni acuses",()=>{
 assert.match(html,/PRUEBA SIN CLAVE/);
 assert.match(html,/germania-informaciones-prueba\.js\?v=/);
 assert.doesNotMatch(html,/Toca «Leído»|id="informacionesPin"|id="informacionesEntrar"/);
 const start=roles.indexOf("/* ---------- Novedades (Inicio) ---------- */");
 const end=roles.indexOf("/* ---------- Datos de la semana ---------- */",start);
 const ui=roles.slice(start,end);
 assert.match(ui,/NOV_PRUEBA\.publicar/);
 assert.match(ui,/fetch\("\/api\/informaciones\/prueba"/);
 assert.match(ui,/NOV_PRUEBA\.listar\("oficiales"\)/);
 assert.doesNotMatch(ui,/method:"PATCH"|data-nov-read|confirmarLectura/);
 assert.doesNotMatch(ui,/fetch\("\/api\/informaciones"/);
});
