import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "../public/legacy/germania-guardia-reglas.js";
import "../public/legacy/germania-obac.js";

const validar = globalThis.GermaniaGuardiaReglas.evaluarDotacion;
const obacDeNoche = globalThis.GermaniaObac.obacDeNoche;
const file = path => readFileSync(new URL(path, import.meta.url), "utf8");

test("mínimo institucional: 2 voluntarios + 1 maquinista + 1 OBAC, distintos", () => {
  const r=validar({vol:["v1","v2"],maq:"maq",obac:"obac"});
  assert.equal(r.completa,true);
  assert.equal(r.personasDistintas,true);
  assert.deepEqual(r.razones,[]);
});

test("una persona no puede contar dos veces, aunque ocupe dos roles o se repita", () => {
  for (const caso of [
    {vol:["v1","obac"],maq:"maq",obac:"obac"},
    {vol:["v1","v2"],maq:"v1",obac:"obac"},
    {vol:["v1","v1"],maq:"maq",obac:"obac"},
    {vol:["v1","v2"],maq:"maq",obac:"maq"}
  ]) {
    const r=validar(caso);
    assert.equal(r.completa,false,JSON.stringify(caso));
    assert.equal(r.personasDistintas,false);
    assert.ok(r.razones.includes("una persona está repetida en la dotación"));
  }
});

test("faltantes y maquinistas múltiples impiden declarar completa una noche", () => {
  assert.equal(validar({vol:["v1"],maq:"maq",obac:"obac"}).faltanVoluntarios,1);
  assert.equal(validar({vol:["v1","v2"],maq:null,obac:"obac"}).completa,false);
  assert.equal(validar({vol:["v1","v2"],maq:["maq1","maq2"],obac:"obac"}).completa,false);
  assert.equal(validar({vol:["v1","v2"],maq:"maq",obac:null}).completa,false);
  assert.equal(validar({vol:["v1","v2"],maq:"maq",obac:["o1","o2"]}).completa,false);
  assert.equal(validar(null).completa,false);
});

test("no cambia el mínimo personal de dos noches ni las ODD", () => {
  const app=file("../public/legacy/app.js");
  assert.match(app,/GN_DOTACION_MIN=\{voluntarios:2,conductor:1,obac:1\}/);
  assert.match(app,/GN_NOCHES_MIN=2/);
  assert.ok(!app.includes("GN_NOCHES_MIN=1"));
  const html=file("../public/legacy/index.html");
  const idxR=html.indexOf("germania-guardia-reglas.js");
  const idxApp=html.indexOf("app.js?v=");
  assert.ok(idxR>=0 && idxR<idxApp,"validación debe cargarse antes de app.js");
});

test("interfaz de aprobación usa la función de dotación real, no suma apariciones", () => {
  const src=file("../public/legacy/germania-roles.js");
  const r=src.slice(src.indexOf("function revCov("),src.indexOf("function revDiferencias("));
  const c=src.slice(src.indexOf("function cobertura("),src.indexOf("function nombreNoche("));
  assert.ok(r.includes("GermaniaGuardiaReglas.evaluarDotacion"),"revisión");
  assert.ok(c.includes("GermaniaGuardiaReglas.evaluarDotacion"),"cobertura");
  assert.ok(r.includes("v.completa"));
  assert.ok(c.includes("valido.completa"));
});

test("OBAC automático: el capitán maquinista deja el cargo al siguiente", () => {
  const r=obacDeNoche({
    inscritos:[{id:"cap",habilitadoMaquinista:true},{id:"teniente"},{id:"v1"},{id:"v2"}],
    orden:["cap","teniente","v1","v2"]
  });
  assert.equal(r.maquinistaPorRespaldo,"cap");
  assert.equal(r.obac,"teniente");
  assert.equal(validar({vol:r.voluntarios,maq:r.maquinistas,obac:r.obac}).completa,true);
});

test("no confunde cobertura aprobada con presencia acreditada", () => {
  const src=file("../public/legacy/germania-roles.js");
  // Se documenta el riesgo existente para el siguiente PR (no afirmar que ya se solucionó).
  assert.ok(src.includes("cumpl.forEach(function(e){ e.cuenta=!e.aviso; });"),"riesgo: acreditación por fecha, pendiente de corregir");
});
