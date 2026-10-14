import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {GET} from "../app/api/informaciones/prueba/route.js";

const dashboard=readFileSync(new URL("../public/legacy/dashboard-preview.html",import.meta.url),"utf8");
const home=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const roles=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");

test("dashboard muestra nombre y dos apellidos reales de la nómina",()=>{
  const match=dashboard.match(/^function nombre\(m\)\{.*\}$/m);
  assert.ok(match,"función de nombre individual en Dashboard V2");
  const nombre=vm.runInNewContext("("+match[0]+")");
  assert.equal(nombre({id:"10",nombre:"Ana",apellidoPaterno:"Rojas",apellidoMaterno:"Muñoz"}),"Ana Rojas Muñoz");
  assert.equal(nombre({id:"11",nombre:"Mario",apellidoPaterno:"Pérez"}),"Mario Pérez");
  assert.equal(nombre({id:"12",nombre:"Mario",apellidos:"Torres Soto"}),"Mario Torres Soto");
  assert.equal(nombre({id:"13",nombreCompleto:"Persona Antigua"}),"Persona Antigua");
  assert.match(dashboard,/escapeHtml\(nombre\(x\.m\)\)/);
  assert.match(dashboard,/escapeHtml\(nombre\(m\)\)/);
});
test("Informes y Dashboard V2 tienen regreso directo al Inicio, sin abrir un segundo dashboard",()=>{
  const fixes=readFileSync(new URL("../public/legacy/germania-fixes-20261002.js",import.meta.url),"utf8");
  assert.match(fixes,/location\.href=destino/);
  assert.match(fixes,/legacy\.remove\(\)/);
  assert.match(dashboard,/id="volver">← Inicio/);
  assert.match(dashboard,/window\.top\.location\.href='\/'/);
});
test("el canal compartido conserva avisos, incluso vencidos, y pagina su historial",()=>{
  assert.match(api,/historial=params\.get\("historial"\)==="1"/);
  assert.match(api,/historial\s*\?\s*todos\.slice\(\)\.reverse\(\)\.slice\(offset,offset\+30\)/);
  assert.match(api,/nextOffset:historial&&offset\+items\.length<todos\.length/);
  assert.match(api,/const next=list\.concat\(item\)/);
  assert.doesNotMatch(api,/MAX_RECORDS|list\.slice\(-\(MAX_RECORDS/);
  assert.match(api,/LECTURAS\+n\.id/);
});
test("offset incorrecto se rechaza antes de consultar Neon",async()=>{
  const request={url:"https://germania.example/api/informaciones/prueba?historial=1&offset=-1"};
  const response=await GET(request);
  assert.equal(response.status,400);
  assert.equal((await response.json()).error,"offset_invalido");
});
test("marcar Leído deja el aviso consultable en Historial",()=>{
  assert.match(home,/data-nov-vista="pendientes"/);
  assert.match(home,/data-nov-vista="historial"/);
  assert.match(roles,/novVista="pendientes", novHistorialOffset=0/);
  assert.match(roles,/historial\|\|novVigente\(n\)/);
  assert.match(roles,/novPestanas\(\)/);
  assert.match(roles,/data-nov-page/);
  assert.match(roles,/novRefreshPending=true/);
  assert.match(roles,/method:"PATCH"/);
  assert.match(roles,/button\.textContent="✓ Lectura confirmada"/);
  assert.match(roles,/lista=lista\.filter\(function\(n\)\{/);
});
test("la interfaz no interviene Guardia, ODD ni cálculos de asistencia",()=>{
  assert.doesNotMatch(roles.slice(roles.indexOf("/* ---------- Novedades"),roles.indexOf("async function confirmarLectura(")),/writeState|guardia-|parte:/);
  assert.ok(home.includes('id="pnDetalle"'));
  new vm.Script(roles,{filename:"germania-roles.js"});
});