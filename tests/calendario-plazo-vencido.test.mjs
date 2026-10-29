// Calendario de programación semanal: «Inscripción abierta» (verde) solo mientras el plazo no haya vencido.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const app = readFileSync(new URL("../public/legacy/app.js", import.meta.url), "utf8");

test("una semana con estado «abierta» pero plazo vencido ya no se pinta como inscripción abierta", () => {
  assert.match(app, /else if\(p\.estado==="abierta"&&Date\.now\(\)<gnInsCierreMs\(p\)\)\{cls\+=" open";mini="Inscripción";\}/);
  assert.doesNotMatch(app, /else if\(p\.estado==="abierta"\)\{cls\+=" open";mini="Inscripción";\}/);
});
test("el plazo usa la misma función que el resto de la pantalla (cierre guardado o día anterior 19:00)", () => {
  assert.match(app, /function gnInsCierreMs\(p\)\{ const t=p\.cierre\?Date\.parse\(p\.cierre\):NaN; return Number\.isNaN\(t\)\?instanteChile\(gnAdd\(p\.inicio,-1\),"19:00"\):t; \}/);
  assert.match(app, /inscripcionCerrada=Date\.now\(\)>=cierreMs/);
});
