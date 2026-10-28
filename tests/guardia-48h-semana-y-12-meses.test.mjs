// 1) Regla de las 48 h por SEMANA en Control Guardia Diaria (las 7 noches se ven y desaparecen juntas).
// 2) Una noche de hace ~12 meses se puede consultar (historial por año) y corregir con las rutas reales. Datos ficticios.
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reloj = (iso) => mock.timers.enable({ apis: ["Date"], now: Date.parse(iso) });
const dia = (b, n) => { const d = new Date(b + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/* ---------- 1) regla cliente: se extraen las funciones reales del archivo ---------- */
const fuente = readFileSync(new URL("../public/legacy/germania-cierre-libro.js", import.meta.url), "utf8");
const trozo = (nombre) => {
  const i = fuente.indexOf("function " + nombre + "(");
  assert.ok(i >= 0, "no se encontró " + nombre);
  const j = fuente.indexOf("\nfunction ", i + 10);
  return fuente.slice(i, j > 0 ? j : undefined);
};
const { semanaDe, semanaVigente48, etiquetaSemana } = new Function(
  trozo("fechaBonita") + "\n" + trozo("semanaDe") + "\n" + trozo("semanaVigente48") + "\n" + trozo("etiquetaSemana") + "\nreturn {semanaDe,semanaVigente48,etiquetaSemana};")();

const W = "2026-10-28"; // miércoles; la guardia termina el miércoles 4-nov 06:00; visible hasta el viernes 6-nov 06:00
const noches = Array.from({ length: 7 }, (_, i) => dia(W, i));

test("semana: las 7 noches se ven durante la semana y hasta 48 h después de que termina", () => {
  for (const [momento, esperado] of [
    ["2026-10-31T12:00:00-03:00", true],   // a mitad de semana: la noche del 28 NO desaparece (antes sí)
    ["2026-11-04T05:00:00-03:00", true],   // aún no termina la guardia
    ["2026-11-05T12:00:00-03:00", true],   // 30 h después de terminar
    ["2026-11-06T05:59:00-03:00", true],   // 47 h 59 min después
    ["2026-11-06T06:01:00-03:00", false],  // pasadas las 48 h
    ["2026-12-01T12:00:00-03:00", false],
  ]) {
    reloj(momento);
    try { for (const f of noches) assert.equal(semanaVigente48(f), esperado, f + " a " + momento); } finally { mock.timers.reset(); }
  }
});

test("semana: el miércoles abre la semana y el cambio de año no la parte", () => {
  assert.equal(semanaDe("2026-10-28"), "2026-10-28");
  assert.equal(semanaDe("2026-11-03"), "2026-10-28");
  assert.equal(semanaDe("2027-01-02"), "2026-12-30", "una semana que cruza el 1 de enero conserva su inicio");
  assert.match(etiquetaSemana("2026-10-28"), /28.*→.*4/);
});

