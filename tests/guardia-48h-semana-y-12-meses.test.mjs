// 1) Regla de las 48 h por SEMANA en Control Guardia Diaria (las 7 noches se ven y desaparecen juntas).
// 2) Una noche de hace ~12 meses se puede consultar (historial por año) y corregir con las rutas reales. Datos ficticios.
process.env.DATABASE_URL = "pglite://prueba";
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { llamar, req, HOST } from "./helpers/http.mjs";

const libro = await import("../app/api/guardia/libro/route.js");
const acred = await import("../app/api/guardia/acreditacion/route.js");
const estadoRoute = await import("../app/api/state/[key]/route.js");
const { ensureSchema, writeState } = await import("../lib/state-store.js");
const { neon } = await import("@neondatabase/serverless");
// Pendiente: adaptar el servidor a un adaptador SQL aislado de pruebas.
// Nunca conectar esta prueba a la base original de Germania.
const sql = neon("x");
await ensureSchema(sql);
await sql`CREATE TABLE IF NOT EXISTS document_assets(key text PRIMARY KEY, data bytea, active boolean DEFAULT true, source text, effective_year int, updated_at timestamptz DEFAULT now())`;

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

/* ---------- 2) servidor: ver y corregir una noche de ~12 meses atrás ---------- */
const P = (id, cargo = "Bombero", extra = {}) => ({ id, clave: id, nombre: "N" + id, apellidoPaterno: "A" + id, activo: true, cargo, ...extra });
const roster = [P("45", "Capitán"), P("501", "Teniente Primero"), P("502", "Teniente Segundo"), P("503", "Teniente Tercero"), P("504", "Ayudante de Capitán"),
  ...["9001", "9002", "9003"].map((id) => P(id, "Bombero", { conductor: true })),
  ...Array.from({ length: 24 }, (_, i) => P(String(9100 + i)))];
await writeState(sql, "roster:v8", roster);
const obacs = ["45", "501", "502", "503", "9100", "9101", "9102"];
const maqs = ["9001", "9002", "9003", "9001", "9002", "9003", "9001"];
const nochesRev = Object.fromEntries(noches.map((f, i) => [f, { maq: maqs[i], obac: obacs[i], vol: [String(9110 + i), String(9111 + i), String(9112 + i)] }]));
const revision = { estado: "aprobada", aprobadaEn: "2026-10-27T12:00:00Z", noches: nochesRev };
const PNG = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(64, 7)]);
const putState = (key, value) => estadoRoute.PUT(req("/api/state/" + key, { method: "PUT", body: { value } }), { params: Promise.resolve({ key }) });
const cerrarLibro = (fecha, actorId) => {
  const f = new FormData(); f.set("fecha", fecha); f.set("actorId", actorId); f.set("foto", new Blob([PNG], { type: "image/png" }), "libro.png");
  return libro.POST(new Request("https://" + HOST + "/api/guardia/libro", { method: "POST", headers: { host: HOST, origin: "https://" + HOST }, body: f }));
};
const asistencias = (f, ausentes = []) => Object.fromEntries([nochesRev[f].maq, nochesRev[f].obac, ...nochesRev[f].vol].map((id) => [id, ausentes.includes(id) ? "ausente" : "presente"]));
const corregir = (fecha, actorId, body = {}) => llamar(acred.POST, "/api/guardia/acreditacion", { method: "POST", body: { fecha, actorId, ifVersion: 0, asistencias: asistencias(fecha), ...body } });

test("12 meses: una noche de hace un año aparece en el historial y se puede corregir", async () => {
  const f = noches[2]; // 2026-10-30
  assert.equal((await putState("guardia-revision:" + W, revision)).status, 200);
  reloj(dia(f, 1) + "T06:30:00-03:00");
  try { assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200); } finally { mock.timers.reset(); }

  reloj("2027-10-27T12:00:00-03:00"); // casi 12 meses después
  try {
    // el historial del año de la semana (2026) la trae completa, con sus 7 noches
    const h26 = await llamar(libro.GET, "/api/guardia/libro?historial=1&anio=2026&actorId=45");
    assert.equal(h26.status, 200);
    const delSemana = h26.json.items.filter((x) => noches.includes(x.fecha));
    assert.equal(delSemana.length, 7, "las 7 noches de la semana antigua");
    assert.ok(delSemana.every((x) => x.finalizada === true));
    // el año actual (2027) también es válido: el cliente pide el año elegido y el anterior
    assert.equal((await llamar(libro.GET, "/api/guardia/libro?historial=1&anio=2027&actorId=45")).status, 200);
    // pasadas las 48 h desde la foto del libro, la noche ya quedó aprobada sola (versión 1); un oficial puede corregirla
    // sin límite de antigüedad, y corregir una noche ya revisada exige motivo (trazabilidad)
    const antes = delSemana.find((x) => x.fecha === f);
    assert.equal(antes.acreditacion.automatica, true);
    const v = antes.acreditacionVersion;
    const sin = await corregir(f, "503", { ifVersion: v });
    assert.equal(sin.status, 400); assert.equal(sin.json.error, "motivo_correccion_requerido");
    const con = await corregir(f, "503", { ifVersion: v, asistencias: asistencias(f, [nochesRev[f].vol[0]]), motivoCorreccion: "Según la foto del libro" });
    assert.equal(con.status, 200, JSON.stringify(con.json));
    const x = (await llamar(libro.GET, "/api/guardia/libro?historial=1&anio=2026&actorId=45")).json.items.find((i) => i.fecha === f);
    assert.equal(x.acreditacion.historial.length, 1, "queda registrado el cambio anterior");
    assert.equal(x.acreditacion.acreditadoPorId, "503");
    assert.deepEqual(x.acreditacion.ausentes, [nochesRev[f].vol[0]]);
  } finally { mock.timers.reset(); }
});
