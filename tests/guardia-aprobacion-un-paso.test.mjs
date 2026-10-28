// ADR 0012 · Aprobación de la guardia en UN solo paso por un oficial autorizado.
// Rutas reales contra PGlite en memoria (sin tocar Neon ni producción). Datos ficticios.
import { register } from "node:module";
register("./helpers/pglite-hooks.mjs", import.meta.url); // solo este archivo reemplaza @neondatabase/serverless
process.env.DATABASE_URL = "pglite://prueba";
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { llamar, req, HOST } from "./helpers/http.mjs";
import "../public/legacy/germania-guardia-reglas.js";
import "../public/legacy/germania-guardia-estadisticas.js";

const libro = await import("../app/api/guardia/libro/route.js");
const acred = await import("../app/api/guardia/acreditacion/route.js");
const semanal = await import("../app/api/guardia/cierre-semanal/route.js");
const { ensureSchema, readState, writeState } = await import("../lib/state-store.js");
const { validarAcreditacion } = await import("../lib/guardia-acreditacion.js");
const { neon } = await import("@neondatabase/serverless");
const sql = neon("x");
await ensureSchema(sql);
await sql`CREATE TABLE IF NOT EXISTS document_assets(key text PRIMARY KEY, data bytea, active boolean DEFAULT true, source text, effective_year int, updated_at timestamptz DEFAULT now())`;

const R = globalThis.GermaniaGuardiaReglas, E = globalThis.GermaniaGuardiaEstadisticas;
const reloj = (iso) => mock.timers.enable({ apis: ["Date"], now: Date.parse(iso) });
const dia = (b, n) => { const d = new Date(b + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const conReloj = async (iso, fn) => { reloj(iso); try { return await fn(); } finally { mock.timers.reset(); } };

/* ---------- datos ficticios ---------- */
const P = (id, cargo = "Bombero", extra = {}) => ({ id, clave: id, nombre: "N" + id, apellidoPaterno: "A" + id, activo: true, cargo, ...extra });
const CAP = "45", T1 = "501", T2 = "502", T3 = "503", AYU = "504", VOL = "9110";
const roster = [P(CAP, "Capitán"), P(T1, "Teniente Primero"), P(T2, "Teniente Segundo"), P(T3, "Teniente Tercero"), P(AYU, "Ayudante de Capitán"),
  ...["9001", "9002", "9003"].map((id) => P(id, "Bombero", { conductor: true })),
  ...Array.from({ length: 30 }, (_, i) => P(String(9100 + i)))];
await writeState(sql, "roster:v8", roster);

const W = "2026-10-28"; // miércoles; semana de 7 noches
const noches = Array.from({ length: 7 }, (_, i) => dia(W, i));
const obacs = ["9100", "9101", "9102", "9103", "9104", "9105", "9106"];
const maqs = ["9001", "9002", "9003", "9001", "9002", "9003", "9001"];
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
const instante = (f) => dia(f, 1) + "T07:00:00-03:00"; // 07:00 del día siguiente: la noche terminó y el OBAC puede cerrar

/* ---------- 1) el flujo: OBAC cierra → oficial aprueba → cuenta en estadísticas ---------- */
test("flujo de un solo paso: el OBAC cierra el libro y un oficial aprueba; no hay segundo paso", async () => {
  const f = noches[0];
  await conReloj(instante(f), async () => {
    // antes del cierre del libro no se puede aprobar
    const antes = await aprobar(f, CAP);
    assert.equal(antes.status, 409); assert.equal(antes.json.error, "libro_no_cerrado_o_desactualizado");
    // solo el OBAC designado cierra el libro
    assert.equal((await cerrarLibro(f, VOL)).status, 403);
    assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200);
    // un voluntario y un ayudante (no autorizados) no pueden aprobar
    for (const quien of [VOL, AYU, nochesRev[f].obac]) {
      const r = await aprobar(f, quien);
      assert.equal(r.status, 409, "actor " + quien); assert.equal(r.json.error, "solo_oficiales_autorizados");
    }
    assert.equal((await registro(f)).value, null, "ningún intento rechazado deja registro");
    // el Capitán aprueba: un único paso
    const ok = await aprobar(f, CAP);
    assert.equal(ok.status, 200, JSON.stringify(ok.json));
    assert.equal("cumplimientoFinal" in ok.json, false, "la respuesta ya no habla de cumplimiento final");
    const r = (await registro(f)).value;
    assert.equal(r.estado, "acreditada");
    assert.equal(r.acreditadoPorId, CAP); assert.equal(r.acreditadoPorCargo, "Capitán"); assert.ok(r.acreditadoEn);
    assert.equal("cumplimientoFinal" in r, false, "no se guarda ninguna acreditación final");
    assert.deepEqual(r.historial, []);
    // la aprobación es lo que cuenta en las estadísticas
    assert.equal(R.acreditacionVigente(r, revision, f), true);
    const res = E.calcularResumen({ guardias: [{ fechaIng: f }], acreditaciones: { [f]: { revision, acta: r } },
      rosterIds: roster.map((p) => p.id), ahoraChile: dia(f, 3) + "T10:00" });
    for (const id of integrantes(f)) assert.equal(res.por[id].hechas, 1, "cuenta para " + id);
    assert.equal(res.pendientes, 0);
    // lectura del libro: sin campos del paso eliminado
    const g = await llamar(libro.GET, "/api/guardia/libro?actorId=" + CAP);
    assert.equal(g.status, 200);
    assert.equal("esT3" in g.json, false);
    const it = g.json.items.find((x) => x.fecha === f);
    assert.equal(it.acreditacionVigente, true); assert.equal("cumplimientoFinal" in it, false);
  });
});

test("cada oficial autorizado (Capitán, T1, T2, T3) aprueba por sí solo; ninguno necesita al T3", async () => {
  const quienes = [[noches[1], CAP], [noches[2], T1], [noches[3], T2], [noches[4], T3]];
  for (const [f, actor] of quienes) {
    await conReloj(instante(f), async () => {
      assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200);
      const r = await aprobar(f, actor);
      assert.equal(r.status, 200, f + " " + actor + " " + JSON.stringify(r.json));
      const reg = (await registro(f)).value;
      assert.equal(reg.acreditadoPorId, actor);
      assert.equal(R.acreditacionVigente(reg, revision, f), true, "cuenta de inmediato");
    });
  }
});

test("no se aprueba antes de terminar la noche (06:00) ni con asistencia incompleta", () => {
  const f = noches[5];
  const base = { fecha: f, noche: nochesRev[f], asistencias: asistencias(f), revision, actor: CAP, roster };
  assert.equal(validarAcreditacion({ ...base, ahoraLocal: dia(f, 1) + "T05:59" }), "noche_no_finalizada");
  assert.equal(validarAcreditacion({ ...base, ahoraLocal: dia(f, 1) + "T06:00" }), null);
  assert.equal(validarAcreditacion({ ...base, ahoraLocal: dia(f, 1) + "T07:00", asistencias: { ...asistencias(f), [VOL]: "" } }), "asistencia_incompleta");
});

/* ---------- 2) trazabilidad: idempotencia, correcciones, historial ---------- */
test("reintento con el mismo contenido no duplica ni toca el historial", async () => {
  const f = noches[1]; // ya aprobada por el Capitán
  await conReloj(instante(f), async () => {
    const v = (await registro(f)).version;
    const otra = await aprobar(f, T1); // otro oficial envía exactamente el mismo contenido
    assert.equal(otra.status, 200); assert.equal(otra.json.repetida, true);
    const reg = await registro(f);
    assert.equal(reg.version, v, "no se escribió de nuevo");
    assert.equal(reg.value.acreditadoPorId, CAP, "se conserva quién aprobó primero");
    assert.equal(reg.value.historial.length, 0);
  });
});

test("corregir una guardia aprobada exige motivo y deja historial con quién, cuándo, por qué, antes y después", async () => {
  const f = noches[2]; // aprobada por T1
  await conReloj(instante(f), async () => {
    const reg0 = await registro(f);
    const ausente = nochesRev[f].vol[0];
    const sinMotivo = await aprobar(f, T3, { ifVersion: reg0.version, asistencias: asistencias(f, [ausente]) });
    assert.equal(sinMotivo.status, 400); assert.equal(sinMotivo.json.error, "motivo_correccion_requerido");
    assert.equal((await registro(f)).version, reg0.version, "sin motivo no se escribe nada");
    const ok = await aprobar(f, T3, { ifVersion: reg0.version, asistencias: asistencias(f, [ausente]), motivoCorreccion: "Según la foto del libro" });
    assert.equal(ok.status, 200, JSON.stringify(ok.json));
    const reg = (await registro(f)).value;
    assert.equal(reg.acreditadoPorId, T3, "la aprobación vigente es la corrección");
    assert.deepEqual(reg.ausentes, [ausente]);
    assert.equal(reg.historial.length, 1);
    const h = reg.historial[0];
    assert.equal(h.por, T1); assert.equal(h.modificadoPorId, T3); assert.equal(h.motivo, "Según la foto del libro");
    assert.ok(h.fecha && h.modificadoEn);
    assert.deepEqual(h.ausentes, [], "valores anteriores");
    assert.deepEqual(h.despues.ausentes, [ausente], "valores posteriores");
    // versión desactualizada: otro oficial corrigió mientras tanto
    const viejo = await aprobar(f, T2, { ifVersion: reg0.version, asistencias: asistencias(f), motivoCorreccion: "Intento con versión vieja" });
    assert.equal(viejo.status, 409); assert.equal(viejo.json.error, "version_conflict");
    // segunda corrección: el historial acumula, no reemplaza
    const v = (await registro(f)).version;
    const dos = await aprobar(f, CAP, { ifVersion: v, asistencias: asistencias(f), motivoCorreccion: "Se verificó que sí asistió" });
    assert.equal(dos.status, 200);
    const reg2 = (await registro(f)).value;
    assert.equal(reg2.historial.length, 2); assert.equal(reg2.historial[0].modificadoPorId, T3); assert.equal(reg2.historial[1].modificadoPorId, CAP);
    // avisos a oficiales con la redacción nueva
    const avisos = await sql`SELECT value->>'titulo' AS t FROM app_state WHERE key LIKE 'guardia-aviso-oficial:%' ORDER BY updated_at`;
    const titulos = avisos.map((a) => a.t).join(" | ");
    assert.match(titulos, /Guardia aprobada · 2026-10-30/); assert.match(titulos, /Aprobación corregida · 2026-10-30/);
    assert.doesNotMatch(titulos, /T3|acredit|ratific/i, "ningún aviso menciona el paso eliminado");
  });
});

test("un registro antiguo con acreditación final del T3 se conserva en el historial al corregirlo y sigue contando", async () => {
  const f = noches[3]; // aprobada por T2
  await conReloj(instante(f), async () => {
    const r0 = await registro(f);
    const cf = { estado: "acreditado", porId: T3, porNombre: "N503 A503", porCargo: "Teniente Tercero", en: "2026-10-30T12:00:00.000Z", firma: "x" };
    const w = await writeState(sql, "guardia-acreditacion:" + f, { ...r0.value, cumplimientoFinal: cf }, { ifVersion: r0.version });
    assert.ok(w.ok);
    assert.equal(R.acreditacionVigente((await registro(f)).value, revision, f), true, "el campo antiguo se ignora");
    const ausente = nochesRev[f].vol[1];
    const ok = await aprobar(f, CAP, { ifVersion: w.version, asistencias: asistencias(f, [ausente]), motivoCorreccion: "Corrección posterior" });
    assert.equal(ok.status, 200);
    const reg = (await registro(f)).value;
    assert.equal("cumplimientoFinal" in reg, false, "el registro nuevo no arrastra el paso eliminado");
    assert.deepEqual(reg.historial[0].cumplimientoFinalAnterior, cf, "pero la historia anterior no se pierde");
  });
});

/* ---------- 3) cierre semanal con aprobación de un paso ---------- */
test("la semana se puede cerrar cuando las 7 noches están aprobadas por cualquier oficial", async () => {
  for (const f of noches.slice(5)) { // las noches 5 y 6 faltan
    await conReloj(instante(f), async () => { assert.equal((await cerrarLibro(f, nochesRev[f].obac)).status, 200); });
  }
  const fin = dia(W, 8) + "T10:00:00-03:00";
  await conReloj(fin, async () => {
    // noche 5 con libro cerrado pero sin aprobar; noche 6 sin aprobar: la semana no se cierra
    const bloqueada = await llamar(semanal.POST, "/api/guardia/cierre-semanal", { method: "POST", body: { actorId: CAP, semana: W } });
    assert.equal(bloqueada.status, 409); assert.equal(bloqueada.json.error, "noches_pendientes");
    assert.deepEqual(bloqueada.json.pendientes.map((p) => p.fecha), [noches[5], noches[6]]);
    assert.ok(bloqueada.json.pendientes.every((p) => p.estado === "registro_cerrado"), "estado: libro cerrado, falta aprobar");
    // se aprueban las dos que faltan, cada una por un oficial distinto
    assert.equal((await aprobar(noches[5], T1)).status, 200);
    assert.equal((await aprobar(noches[6], T2)).status, 200);
    const g = await llamar(semanal.GET, "/api/guardia/cierre-semanal?semana=" + W + "&actorId=" + CAP);
    assert.equal(g.status, 200); assert.deepEqual(g.json.pendientes, []); assert.equal(g.json.puedeCerrar, true);
    assert.ok(g.json.noches.every((n) => n.estado === "aprobada"));
    assert.ok(g.json.noches.every((n) => !("cumplimientoFinal" in n)));
    // un ayudante (oficial no autorizado) puede mirar pero no cerrar
    assert.equal((await llamar(semanal.POST, "/api/guardia/cierre-semanal", { method: "POST", body: { actorId: AYU, semana: W } })).status, 403);
    const cierre = await llamar(semanal.POST, "/api/guardia/cierre-semanal", { method: "POST", body: { actorId: CAP, semana: W, observaciones: "Todo en orden" } });
    assert.equal(cierre.status, 200, JSON.stringify(cierre.json));
    assert.equal(cierre.json.cierre.resumen.length, 7);
  });
});

/* ---------- 4) lectura: quién ve qué (permisos sin cambios) ---------- */
test("permisos de lectura del libro: autorizados ven todo; el ayudante solo lo aprobado; el voluntario nada ajeno", async () => {
  await conReloj(dia(W, 9) + "T10:00:00-03:00", async () => {
    const capi = await llamar(libro.GET, "/api/guardia/libro?actorId=" + CAP);
    const ayu = await llamar(libro.GET, "/api/guardia/libro?actorId=" + AYU);
    const vol = await llamar(libro.GET, "/api/guardia/libro?actorId=" + VOL);
    assert.equal(capi.json.puedeRatificar, true); assert.equal(ayu.json.puedeRatificar, false); assert.equal(vol.json.puedeRatificar, false);
    assert.equal(capi.json.items.length, 7);
    assert.ok(ayu.json.items.length > 0 && ayu.json.items.every((x) => x.acreditacionVigente), "el ayudante solo ve guardias aprobadas");
    assert.equal(vol.json.items.length, 0);
    const hist = await llamar(libro.GET, "/api/guardia/libro?historial=1&anio=2026&actorId=" + VOL);
    assert.equal(hist.status, 403, "el historial es solo para oficiales");
  });
});

/* ---------- 5) el paso eliminado ya no existe en ninguna parte ---------- */
test("sin rastro del paso eliminado: ruta, funciones, botones y mensajes", () => {
  const raiz = new URL("..", import.meta.url).pathname;
  assert.equal(existsSync(join(raiz, "app/api/guardia/acreditar-final/route.js")), false, "la ruta no existe");
  const archivos = (dir) => readdirSync(join(raiz, dir)).flatMap((n) => {
    const p = join(dir, n); const st = statSync(join(raiz, p));
    return st.isDirectory() ? (n === "vendor" || n === "reglamentos" ? [] : archivos(p)) : /\.(js|mjs|html|css)$/.test(n) ? [p] : [];
  });
  const fuentes = [...archivos("app"), ...archivos("lib"), ...archivos("public/legacy")].filter((p) => !/\/(tests|vendor)\//.test(p));
  for (const p of fuentes) {
    const t = readFileSync(join(raiz, p), "utf8");
    assert.doesNotMatch(t, /acreditar-final|cumplimientoFinalT3|cargoTeniente3|solo_teniente_3|acreditada_oficial|ratificada_pendiente_acreditacion|data-lgn-final|data-final=|acreditarFinal|Acreditadas T3|Acreditar cumplimiento|falta acreditación/,
      p + " aún menciona el paso eliminado");
    if (p !== "app/api/guardia/acreditacion/route.js") assert.doesNotMatch(t, /cumplimientoFinal/, p + " aún usa cumplimientoFinal");
  }
  // el único uso permitido: conservar en el historial lo que traían los registros antiguos
  assert.match(readFileSync(join(raiz, "app/api/guardia/acreditacion/route.js"), "utf8"), /cumplimientoFinalAnterior/);
});

test("la interfaz del oficial ofrece un solo botón de aprobación y ningún botón de acreditación final", () => {
  const js = readFileSync(new URL("../public/legacy/germania-cierre-libro.js", import.meta.url), "utf8");
  assert.match(js, /"Aprobar guardia"/); assert.match(js, /Revisar y aprobar esta guardia/); assert.match(js, /"Guardar corrección de la aprobación"/);
  assert.match(js, /Control Guardia Diaria · Aprobar/);
  assert.equal((js.match(/data-lgn-ratificar=/g) || []).length, 1, "un único botón que guarda la aprobación");
  const flujo = readFileSync(new URL("../public/legacy/germania-guardia-flujo.js", import.meta.url), "utf8");
  assert.match(flujo, /Aprobación de la guardia/); assert.match(flujo, /Un solo paso/);
  assert.doesNotMatch(flujo, /data-final/);
});
