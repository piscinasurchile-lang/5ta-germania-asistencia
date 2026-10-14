import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AVISO_VIGENCIA_MS,avisoEstaVigente,vencimientoAlPublicar} from "../lib/informaciones-vigencia.mjs";

const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const roles=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../app/api/informaciones/route.js",import.meta.url),"utf8");

test("sin fecha/hora: expira exactamente a las 48 horas desde su publicación",()=>{
  const start=Date.parse("2026-10-14T16:00:00.000Z");
  assert.equal(AVISO_VIGENCIA_MS,172800000);
  assert.equal(vencimientoAlPublicar(start,null),"2026-10-16T16:00:00.000Z");
  const n={en:new Date(start).toISOString()};
  assert.equal(avisoEstaVigente(n,start+AVISO_VIGENCIA_MS-1),true);
  assert.equal(avisoEstaVigente(n,start+AVISO_VIGENCIA_MS),false);
});
test("fecha y hora explícitas: caduca exactamente al llegar la hora elegida",()=>{
  const start=Date.parse("2026-10-14T12:00:00Z");
  const v=vencimientoAlPublicar(start,"2026-10-14T21:30:00-03:00");
  assert.equal(v,"2026-10-15T00:30:00.000Z");
  const n={en:new Date(start).toISOString(),vence:v};
  assert.equal(avisoEstaVigente(n,Date.parse(v)-1),true);
  assert.equal(avisoEstaVigente(n,Date.parse(v)),false);
});
test("no acepta hora inválida ni vencimiento pasado",()=>{
 const now=Date.parse("2026-10-14T12:00:00Z");
 assert.throws(()=>vencimientoAlPublicar(now,"2026-10-13T12:00:00Z"),/futuro/);
 assert.throws(()=>vencimientoAlPublicar(now,"2026-10-14T15:00"),/invalida/);
 assert.throws(()=>vencimientoAlPublicar(now,"2026-02-30T15:00:00Z"),/invalida|futuro/);
 assert.equal(avisoEstaVigente({en:"no-fecha"},now),false);
});
test("la publicación se redacta en Oficiales; lectura con botón Leído en Inicio",()=>{
 assert.match(html,/id="informacionesPublicarCard"/);
 assert.match(html,/id="informacionesDestino"/);
 assert.match(html,/id="informacionesVence" type="datetime-local"/);
 assert.match(html,/id="novedadAgregar">Publicar información/);
 assert.match(html,/id="inicioNovedades"/);
 const ini=html.indexOf('id="inicioNovedades"');
 assert.ok(ini>=0);
 assert.match(html.slice(ini,ini+420),/id="novedadesLista"/);
 assert.match(roles,/data-nov-read/);
 assert.match(roles,/✓ Leído/);
 assert.match(roles,/novVigente\(n\)/);
 assert.match(roles,/!n\.destino\|\|n\.destino==="compania"/);
});
test("avisos de oficiales tienen una ruta separada, no se muestran en listado público",()=>{
 assert.match(html,/id="informacionesPrivadas"/);
 assert.match(api,/KEY_OFICIALES="security:informaciones-oficiales:v1"/);
 assert.match(api,/if\(!isOfficial\(request\)\)return error\("acceso_oficial_requerido",403\)/);
 assert.match(api,/avisoEstaVigente\(n,ahora\)/);
 assert.match(api,/destino==="oficiales"\?KEY_OFICIALES:KEY_PUBLICA/);
 assert.match(roles,/Inicia sesión con la clave institucional de Oficialidad/);
});
