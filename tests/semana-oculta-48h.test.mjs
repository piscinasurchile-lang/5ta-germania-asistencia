// Regla de 48 h en Gestión de guardia: una semana pasada no debe mostrarse sola; solo al buscarla.
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const leer = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const app = leer("../public/legacy/app.js"), roles = leer("../public/legacy/germania-roles.js");
function funcion(src, nombre) { // extrae «function nombre(...){...}» por balance de llaves
  const i = src.indexOf("function " + nombre + "("); assert.ok(i >= 0, "no existe " + nombre);
  let n = 0, j = src.indexOf("{", i);
  for (let k = j; k < src.length; k++) { if (src[k] === "{") n++; else if (src[k] === "}" && --n === 0) return src.slice(i, k + 1); }
  throw new Error("llaves sin cerrar en " + nombre);
}
const RelojDate = new Proxy(Date, { get: (t, k) => (k === "now" ? () => globalThis.Date.now() : t[k]) }); // sigue al reloj simulado
const ctx = vm.createContext({ Date: RelojDate, Intl, Number, String, Math, parseInt, isNaN });
for (const f of ["gnISO", "gnAdd", "instanteChile"]) vm.runInContext(funcion(app, f), ctx);
vm.runInContext(funcion(roles, "semanaVigente48"), ctx);
const vigente = (inicio, ahoraISO) => { mock.timers.enable({ apis: ["Date"], now: Date.parse(ahoraISO) }); try { return vm.runInContext(`semanaVigente48({inicio:"${inicio}"})`, ctx); } finally { mock.timers.reset(); } };

test("la semana del 14 al 20 de octubre deja de ser vigente 48 h después de su última guardia", () => {
  // última noche: 20-oct 22:45 → termina 21-oct 06:00; +48 h = 23-oct 06:00 (hora de Chile, UTC-3 en octubre)
  assert.equal(vigente("2026-10-14", "2026-10-22T12:00:00-03:00"), true, "aún dentro de las 48 h");
  assert.equal(vigente("2026-10-14", "2026-10-23T05:59:00-03:00"), true, "un minuto antes del límite");
  assert.equal(vigente("2026-10-14", "2026-10-23T06:00:00-03:00"), false, "en el límite se oculta");
  assert.equal(vigente("2026-10-14", "2026-10-29T00:30:00-03:00"), false, "hoy (29-oct) ya no se muestra");
});
test("una semana futura o en curso sigue vigente", () => {
  assert.equal(vigente("2026-10-28", "2026-10-29T00:30:00-03:00"), true);
  assert.equal(vigente("2026-11-04", "2026-10-29T00:30:00-03:00"), true);
});
test("el código ya no cae a «la última semana» ni la muestra sin búsqueda explícita", () => {
  assert.doesNotMatch(roles, /if\(!p&&esGestion&&lista\.length\)p=lista\[lista\.length-1\];/);
  assert.doesNotMatch(roles, /\|\|pa\.lista\[pa\.lista\.length-1\];/);
  assert.match(roles, /if\(!p&&esGestion\)\{ var vig=lista\.filter\(semanaVigente48\)/);
  assert.match(roles, /\(GR\.buscada&&pa\.lista\.filter\(enLista\)\[0\]\)/);
  assert.match(roles, /GR\.semana=semana\.inicio; GR\.buscada=true;/);
  assert.match(roles, /if\(ev\.target\.id==="grSemana"\)\{ GR\.semana=ev\.target\.value; GR\.buscada=false;/);
  assert.match(roles, /var visibles=lista\.filter\(semanaVigente48\);/);
});
