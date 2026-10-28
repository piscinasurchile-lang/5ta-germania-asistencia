// «Mis noches» del voluntario: una noche terminada se sigue viendo hasta 48 h después de que termina la guardia
// semanal; después desaparece de esa pantalla pero queda en «Noches cumplidas» (historial). Datos ficticios.
// Se extraen las funciones reales de los archivos del navegador y se ejecutan con el reloj simulado.
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const leer = (f) => readFileSync(new URL("../public/legacy/" + f, import.meta.url), "utf8");
const roles = leer("germania-roles.js"), app = leer("app.js");
const trozo = (src, nombre) => {
  const m = new RegExp("^(async )?function " + nombre + "\\(", "m").exec(src);
  assert.ok(m, "no se encontró " + nombre);
  const resto = src.slice(m.index + 10);
  const sig = resto.search(/\n(async )?function |\n\/\*|\nvar /);
  return src.slice(m.index, sig > 0 ? m.index + 10 + sig : undefined);
};
const W = "2026-10-28"; // miércoles; la guardia semanal termina el miércoles 4-nov 06:00; visible hasta el viernes 6-nov 06:00
const dia = (b, n) => { const d = new Date(b + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const noches = Array.from({ length: 7 }, (_, i) => dia(W, i));
const WHO = "9110";
const datos = {
  "guardia-revision:": [{ key: "guardia-revision:" + W, value: { estado: "aprobada", aprobadaEn: "x", noches: Object.fromEntries(noches.map((f) => [f, { maq: "9001", obac: "501", vol: [WHO, "9111", "9112"] }])) } }],
  "guardia-aviso:": [], "guardia-acreditacion:": [],
};
const construir = () => new Function("leerPrefijo", "window", "HOR_NOCHE", "HORARIOS",
  trozo(app, "gnISO") + "\n" + trozo(app, "gnAdd") + "\n" + trozo(app, "instanteChile") + "\n" +
  trozo(roles, "horaNoche") + "\n" + trozo(roles, "finNoche") + "\n" + trozo(roles, "inicioSemanaDe") + "\n" + trozo(roles, "avKey") + "\n" +
  "var MN={cache:null,who:\"\",en:0};\n" + trozo(roles, "misNochesDatos") + "\nreturn misNochesDatos;")(
  async (p) => datos[p] || [], { GermaniaGuardiaReglas: { acreditacionVigente: () => false } }, {}, { def: "22:45", dom: "22:45", fin: "06:00" });

const en = async (iso) => { mock.timers.enable({ apis: ["Date"], now: Date.parse(iso) }); try { return await construir()(WHO, true); } finally { mock.timers.reset(); } };

test("Mis noches: terminadas de la semana se ven hasta el viernes 06:00 y luego solo quedan en el historial", async () => {
  // a mitad de semana: las ya terminadas aparecen como «terminadas esta semana»; las futuras siguen como próximas
  let d = await en("2026-10-31T12:00:00-03:00");
  assert.deepEqual(d.recientes.map((e) => e.f), ["2026-10-28", "2026-10-29", "2026-10-30"]);
  assert.deepEqual(d.prox.map((e) => e.f), ["2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03"].filter((f) => f >= "2026-10-31"));
  // un día después de terminar la semana: las 7 se ven
  d = await en("2026-11-05T12:00:00-03:00");
  assert.equal(d.prox.length, 0); assert.equal(d.recientes.length, 7);
  // 47 h 59 min después: todavía
  d = await en("2026-11-06T05:59:00-03:00"); assert.equal(d.recientes.length, 7);
  // pasadas las 48 h: desaparecen de la pantalla, pero el historial («cumplidas») las conserva
  d = await en("2026-11-06T06:01:00-03:00");
  assert.equal(d.recientes.length, 0); assert.equal(d.cumpl.length, 7);
});
