// ADR 0014 · El administrador (517) sube la foto del libro de una noche terminada sin cierre; nada más se amplía.
// Rutas reales contra PGlite en memoria (sin tocar Neon ni producción). Datos ficticios.
import { register } from "node:module";
register("./helpers/pglite-hooks.mjs", import.meta.url);
process.env.DATABASE_URL = "pglite://adminfoto";
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { llamar, HOST } from "./helpers/http.mjs";

const libro = await import("../app/api/guardia/libro/route.js");
const { ensureSchema, readState, writeState } = await import("../lib/state-store.js");
const { neon } = await import("@neondatabase/serverless");
const sql = neon("x");
await ensureSchema(sql);
await sql`CREATE TABLE IF NOT EXISTS document_assets(key text PRIMARY KEY, data bytea, active boolean DEFAULT true, source text, effective_year int, updated_at timestamptz DEFAULT now())`;

const dia = (b, n) => { const d = new Date(b + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const conReloj = async (iso, fn) => { mock.timers.enable({ apis: ["Date"], now: Date.parse(iso) }); try { return await fn(); } finally { mock.timers.reset(); } };
const P = (id, cargo = "Bombero", extra = {}) => ({ id, clave: id, nombre: "N" + id, apellidoPaterno: "A" + id, activo: true, cargo, ...extra });
const ADM = "517", CAP = "45", AYU = "504", VOL = "9110";
const roster = [P(ADM), P(CAP, "Capitán"), P(AYU, "Ayudante de Capitán"), ...["9001", "9002", "9003"].map((id) => P(id, "Bombero", { conductor: true })), ...Array.from({ length: 30 }, (_, i) => P(String(9100 + i)))];
await writeState(sql, "roster:v8", roster);

const W = "2026-10-28";
const noches = Array.from({ length: 7 }, (_, i) => dia(W, i));
const obacs = ["9100", "9101", "9102", "9103", "9104", "9105", "9106"], maqs = ["9001", "9002", "9003", "9001", "9002", "9003", "9001"];
const nochesRev = Object.fromEntries(noches.map((f, i) => [f, { maq: maqs[i], obac: obacs[i], vol: [String(9110 + i), String(9120 + i), String(9115 + i)] }]));
await writeState(sql, "guardia-revision:" + W, { estado: "aprobada", aprobadaEn: "2026-10-27T12:00:00Z", noches: nochesRev });

const PNG = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(64, 7)]);
const subir = (fecha, actorId) => {
  const f = new FormData(); f.set("fecha", fecha); f.set("actorId", actorId); f.set("novedades", "Foto subida"); f.set("foto", new Blob([PNG], { type: "image/png" }), "libro.png");
  return libro.POST(new Request("https://" + HOST + "/api/guardia/libro", { method: "POST", headers: { host: HOST, origin: "https://" + HOST }, body: f }));
};
const antes = (f) => dia(f, 1) + "T05:00:00-03:00", tarde = (f) => dia(f, 4) + "T10:00:00-03:00";

test("el administrador sube la foto de una noche pasada (fuera de la ventana del OBAC) y queda registrado con su nombre", async () => {
  const f = noches[0];
  await conReloj(tarde(f), async () => {
    assert.equal((await subir(f, obacs[0])).status, 409, "el OBAC ya no está en su ventana");
    const r = await subir(f, ADM);
    assert.equal(r.status, 200, await r.clone().text());
    const c = (await readState(sql, "guardia-libro:" + f)).value;
    assert.equal(c.estado, "enviado"); assert.equal(c.cierrePorAdministrador, true);
    assert.equal(c.cerradoPorId, ADM); assert.equal(c.cerradoPorCargo, "Administrador"); assert.ok(c.fotoSHA256 && c.fotoClave);
    const otra = await subir(f, ADM);
    assert.equal(otra.status, 200); assert.equal((await otra.json()).repetido, true, "reintento con la misma foto no duplica");
  });
});

test("no se puede subir antes de que termine la noche, ni reemplazar un cierre existente", async () => {
  const f = noches[1];
  await conReloj(antes(f), async () => { assert.equal((await subir(f, ADM)).status, 409); });
  await conReloj(tarde(f), async () => {
    assert.equal((await subir(f, obacs[1])).status, 409);
    assert.equal((await subir(f, ADM)).status, 200);
    const f2 = new FormData(); f2.set("fecha", f); f2.set("actorId", ADM); f2.set("novedades", "otra"); f2.set("foto", new Blob([Buffer.concat([PNG, Buffer.from("x")])], { type: "image/png" }), "o.png");
    const r = await libro.POST(new Request("https://" + HOST + "/api/guardia/libro", { method: "POST", headers: { host: HOST, origin: "https://" + HOST }, body: f2 }));
    assert.equal(r.status, 409, "una segunda foto distinta no reemplaza el cierre");
  });
});

test("el permiso es solo del 517 activo: Capitán, Ayudante y voluntarios siguen sin poder", async () => {
  const f = noches[2];
  await conReloj(tarde(f), async () => {
    for (const quien of [CAP, AYU, VOL]) assert.equal((await subir(f, quien)).status, 403, "actor " + quien);
    await writeState(sql, "roster:v8", roster.map((p) => (p.id === ADM ? { ...p, activo: false } : p)));
    assert.equal((await subir(f, ADM)).status, 403);
    await writeState(sql, "roster:v8", roster);
    assert.equal((await readState(sql, "guardia-libro:" + f)).value, null);
  });
});

test("la interfaz: subida solo para el administrador y corrección de noche aprobada tras un despliegue explícito, con cambios a la vista", () => {
  const ui = readFileSync(new URL("../public/legacy/germania-cierre-libro.js", import.meta.url), "utf8");
  assert.match(ui, /if\(!admin\|\|x\.cierre\|\|!x\.finalizada\)return ""/);
  assert.match(ui, /data-lgn-adm-subir/);
  assert.match(ui, /<details class="lgn-corregir-det"/);
  assert.match(ui, /No hay cambios respecto de la aprobación vigente/);
  assert.match(ui, /Esta guardia YA ESTÁ APROBADA/);
});

test("la lista de noches no despliega por defecto una noche ya aprobada y el aviso de corrección se muestra en un solo bloque", () => {
  const ui = readFileSync(new URL("../public/legacy/germania-cierre-libro.js", import.meta.url), "utf8");
  assert.doesNotMatch(ui, /\(i===0\?"open":""\)/, "ya no se abre siempre la primera noche");
  assert.match(ui, /actualizados\.findIndex\(x=>x\.cierre&&!x\.acreditacionVigente\)/);
  assert.match(ui, /\(i===primeraPendiente\?"open":""\)/);
  assert.match(ui, /<summary><span><strong>Corregir esta aprobación<\/strong>/);
});
