// ADR 0013 · El administrador del proyecto (código 517) aprueba y corrige guardias sin ingresar como otro voluntario.
// Rutas reales contra PGlite en memoria (sin tocar Neon ni producción). Datos ficticios.
import { register } from "node:module";
register("./helpers/pglite-hooks.mjs", import.meta.url);
process.env.DATABASE_URL = "pglite://admin";
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { llamar, HOST } from "./helpers/http.mjs";
import "../public/legacy/germania-guardia-reglas.js";

const libro = await import("../app/api/guardia/libro/route.js");
const acred = await import("../app/api/guardia/acreditacion/route.js");
const cierreOficial = await import("../app/api/guardia/cierre-oficial/route.js");
const { ensureSchema, readState, writeState } = await import("../lib/state-store.js");
const { neon } = await import("@neondatabase/serverless");
const sql = neon("x");
await ensureSchema(sql);
await sql`CREATE TABLE IF NOT EXISTS document_assets(key text PRIMARY KEY, data bytea, active boolean DEFAULT true, source text, effective_year int, updated_at timestamptz DEFAULT now())`;

const R = globalThis.GermaniaGuardiaReglas;
const dia = (b, n) => { const d = new Date(b + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const conReloj = async (iso, fn) => { mock.timers.enable({ apis: ["Date"], now: Date.parse(iso) }); try { return await fn(); } finally { mock.timers.reset(); } };

const P = (id, cargo = "Bombero", extra = {}) => ({ id, clave: id, nombre: "N" + id, apellidoPaterno: "A" + id, activo: true, cargo, ...extra });
const ADM = "517", CAP = "45", T1 = "501", T2 = "502", T3 = "503", AYU = "504", VOL = "9110";
const roster = [P(ADM), P(CAP, "Capitán"), P(T1, "Teniente Primero"), P(T2, "Teniente Segundo"), P(T3, "Teniente Tercero"), P(AYU, "Ayudante de Capitán"),
  ...["9001", "9002", "9003"].map((id) => P(id, "Bombero", { conductor: true })), ...Array.from({ length: 30 }, (_, i) => P(String(9100 + i)))];
await writeState(sql, "roster:v8", roster);

const W = "2026-10-28";
const noches = Array.from({ length: 7 }, (_, i) => dia(W, i));
const obacs = ["9100", "9101", "9102", "9103", "9104", "9105", "9106"], maqs = ["9001", "9002", "9003", "9001", "9002", "9003", "9001"];
const nochesRev = Object.fromEntries(noches.map((f, i) => [f, { maq: maqs[i], obac: obacs[i], vol: [String(9110 + i), String(9120 + i), String(9115 + i)] }]));
const revision = { estado: "aprobada", aprobadaEn: "2026-10-27T12:00:00Z", noches: nochesRev };
await writeState(sql, "guardia-revision:" + W, revision);

const PNG = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(64, 7)]);
const cerrarLibro = (fecha, actorId) => {
  const f = new FormData(); f.set("fecha", fecha); f.set("actorId", actorId); f.set("novedades", "Sin novedades"); f.set("foto", new Blob([PNG], { type: "image/png" }), "libro.png");
  return libro.POST(new Request("https://" + HOST + "/api/guardia/libro", { method: "POST", headers: { host: HOST, origin: "https://" + HOST }, body: f }));
};
const integrantes = (f) => [nochesRev[f].maq, nochesRev[f].obac, ...nochesRev[f].vol];
const asistencias = (f, ausentes = []) => Object.fromEntries(integrantes(f).map((id) => [id, ausentes.includes(id) ? "ausente" : "presente"]));
const aprobar = (fecha, actorId, extra = {}) => llamar(acred.POST, "/api/guardia/acreditacion", { method: "POST", body: { fecha, actorId, ifVersion: 0, asistencias: asistencias(fecha), ...extra } });
const registro = async (f) => (await readState(sql, "guardia-acreditacion:" + f));
const instante = (f) => dia(f, 1) + "T07:00:00-03:00";

test("el administrador (517) aprueba en un solo paso y queda registrado como «Administrador»", async () => {
  const f = noches[0];
  await conReloj(instante(f), async () => {
    assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200);
    const ok = await aprobar(f, ADM);
    assert.equal(ok.status, 200, JSON.stringify(ok.json));
    const r = (await registro(f)).value;
    assert.equal(r.acreditadoPorId, ADM); assert.equal(r.acreditadoPorCargo, "Administrador"); assert.ok(r.acreditadoEn);
    assert.equal(R.acreditacionVigente(r, revision, f), true, "cuenta en estadísticas como cualquier otra aprobación");
    const g = await llamar(libro.GET, "/api/guardia/libro?actorId=" + ADM);
    assert.equal(g.json.puedeRatificar, true); assert.equal(g.json.esAdmin, true);
    assert.equal(g.json.items.find((x) => x.fecha === f).acreditacionVigente, true);
  });
});

test("el administrador corrige una aprobación: exige motivo y deja historial con su nombre y cargo", async () => {
  const f = noches[1];
  await conReloj(instante(f), async () => {
    assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200);
    assert.equal((await aprobar(f, CAP)).status, 200);
    const ausente = nochesRev[f].vol[0];
    const sinMotivo = await aprobar(f, ADM, { ifVersion: 1, asistencias: asistencias(f, [ausente]) });
    assert.equal(sinMotivo.status, 400); assert.equal(sinMotivo.json.error, "motivo_correccion_requerido");
    const v = (await registro(f)).version;
    const ok = await aprobar(f, ADM, { ifVersion: v, asistencias: asistencias(f, [ausente]), motivoCorreccion: "Verificado contra la fotografía del libro" });
    assert.equal(ok.status, 200, JSON.stringify(ok.json));
    const r = (await registro(f)).value;
    assert.equal(r.historial.length, 1);
    assert.equal(r.historial[0].modificadoPorId, ADM); assert.equal(r.historial[0].modificadoPorCargo, "Administrador");
    assert.equal(r.historial[0].por, CAP, "queda quién aprobó antes");
    assert.match(r.historial[0].motivo, /fotografía del libro/);
  });
});

test("siguen sin poder aprobar: Ayudante, voluntarios, OBAC y un 517 inactivo", async () => {
  const f = noches[2];
  await conReloj(instante(f), async () => {
    assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200);
    for (const quien of [AYU, VOL, nochesRev[f].obac]) {
      const r = await aprobar(f, quien);
      assert.equal(r.status, 409, "actor " + quien); assert.equal(r.json.error, "solo_oficiales_autorizados");
    }
    await writeState(sql, "roster:v8", roster.map((p) => (p.id === ADM ? { ...p, activo: false } : p)));
    const inactivo = await aprobar(f, ADM);
    assert.equal(inactivo.status, 409); assert.equal(inactivo.json.error, "solo_oficiales_autorizados");
    await writeState(sql, "roster:v8", roster);
    assert.equal((await registro(f)).value, null, "ningún intento rechazado deja registro");
  });
});

test("el administrador NO amplía otros permisos: cierre sin foto sigue siendo de oficiales y externos solo T3/Capitán", async () => {
  const f = noches[3];
  await conReloj(instante(f), async () => {
    const r = await llamar(cierreOficial.POST, "/api/guardia/cierre-oficial", { method: "POST", body: { fecha: f, actorId: ADM, motivo: "Sin fotografía del libro", novedades: "Sin novedades" } });
    assert.equal(r.status, 403); assert.equal(r.json.error, "solo_oficiales_autorizados");
    const flags = {};
    for (const [nombre, id] of [["adm", ADM], ["cap", CAP], ["t1", T1], ["t3", T3]]) flags[nombre] = (await llamar(libro.GET, "/api/guardia/libro?actorId=" + id)).json;
    assert.equal(flags.adm.puedeExternos, false, "el administrador no ve el registro de externos (el servidor lo rechazaría)");
    assert.equal(flags.t1.puedeExternos, false);
    assert.equal(flags.t3.puedeExternos, true); assert.equal(flags.cap.puedeExternos, true);
    assert.equal(flags.adm.puedeRatificar, true); assert.equal(flags.t1.puedeRatificar, true);
    assert.equal((await llamar(libro.GET, "/api/guardia/libro?actorId=" + AYU)).json.puedeRatificar, false);
  });
});

test("la interfaz oculta el registro de externos cuando el servidor no lo permite", () => {
  const ui = readFileSync(new URL("../public/legacy/germania-cierre-libro.js", import.meta.url), "utf8");
  assert.match(ui, /puedeExternos=!!d\.puedeExternos/);
  assert.match(ui, /\(puedeExternos\?'<div class="lgn-externos"/);
  assert.match(ui, /el administrador del proyecto\. Los demás oficiales/);
});
