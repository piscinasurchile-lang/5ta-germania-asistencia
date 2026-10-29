// La «Tabla semanal de Guardia» respeta la regla de 48 h: sin selección explícita no muestra una semana ya vencida.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../public/legacy/app.js", import.meta.url), "utf8");
const pagina = readFileSync(new URL("../app/guardia/actualizar-planilla/page.js", import.meta.url), "utf8");

test("la tabla semanal ya no recurre a la semana pasada más reciente", () => {
  const bloque = app.slice(app.indexOf("async function renderGnTablaSemanal"), app.indexOf("gnTablaSemanaVisible=p.inicio"));
  assert.match(bloque, /Date\.now\(\)<instanteChile\(gnAdd\(x\.inicio,9\),"06:00"\)/);
  assert.doesNotMatch(bloque, /\|\|planes\.slice\(\)\.sort/, "sin respaldo a la última semana vencida");
  assert.match(bloque, /No hay una semana vigente\. Toca un miércoles/);
});

test("la página de planilla vuelve con «Atrás» sin recargar Germania", () => {
  assert.match(pagina, /window\.history\.back\(\)/);
  assert.match(pagina, /← Atrás/);
  assert.doesNotMatch(pagina, /Volver a Germania/);
});
