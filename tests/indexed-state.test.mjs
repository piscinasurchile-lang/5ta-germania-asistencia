import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { ensureSchema, resetSchemaCache, readState, writeState, listHistory } from "../lib/state-store.js";
import { indexedRecordSpec, writeIndexedState } from "../lib/indexed-state.js";

/* PostgreSQL real en memoria; no conecta ni escribe en Neon. */
async function nuevaBase() {
  const db = new PGlite();
  const sql = (strings, ...vals) => {
    let query = strings[0];
    vals.forEach((_, i) => { query += "$" + (i + 1) + strings[i + 1]; });
    return db.query(query, vals).then(r => r.rows);
  };
  resetSchemaCache();
  await ensureSchema(sql);
  return { db, sql };
}

const parte = (dia, tipo = "Emergencia") => ({ date: dia, tipo, records: { "517": "presente" } });
const guardia = dia => ({ fechaIng: dia, guardianes: [{ id: "517", estado: "si" }] });
const servicio = dia => ({ svFecha: dia, svTipoAct: "Emergencia", concurrencia: {} });

test("solo familias válidas crean índices definidos por el servidor", () => {
  assert.deepEqual(indexedRecordSpec("parte:2026-10-14__emergencia", parte("2026-10-14")), {
    indexKey: "partes:index:v1", item: { clave: "2026-10-14__emergencia", date: "2026-10-14", tipo: "Emergencia" }
  });
  assert.deepEqual(indexedRecordSpec("guardia:2026-10-14__2300", guardia("2026-10-14")), {
    indexKey: "guardias:index", item: { clave: "2026-10-14__2300", fecha: "2026-10-14" }
  });
  assert.deepEqual(indexedRecordSpec("servicio:2026-10-14__2300", servicio("2026-10-14")), {
    indexKey: "servicio:index:v1", item: { clave: "servicio:2026-10-14__2300", fecha: "2026-10-14", tipo: "Emergencia" }
  });
  assert.equal(indexedRecordSpec("roster:v8", [{ id: 1 }]), null);
  assert.equal(indexedRecordSpec("parte:2026-10-15__x", parte("2026-10-14")), null);
  assert.equal(indexedRecordSpec("guardia:2026-10-15__2300", guardia("2026-10-14")), null);
  assert.equal(indexedRecordSpec("servicio:2026-10-15__2300", servicio("2026-10-14")), null);
});

test("parte, guardia y servicio se registran junto a sus índices sin perder campos", async () => {
  const { sql } = await nuevaBase();
  const casos = [
    ["parte:2026-10-14__emergencia", parte("2026-10-14"), "partes:index:v1"],
    ["guardia:2026-10-14__2300", guardia("2026-10-14"), "guardias:index"],
    ["servicio:2026-10-14__2300", servicio("2026-10-14"), "servicio:index:v1"]
  ];
  for (const [key, value, indexKey] of casos) {
    const r = await writeIndexedState(sql, key, value, { ifVersion: 0 });
    assert.equal(r.ok, true, key);
    assert.equal(r.version, 1);
    assert.deepEqual((await readState(sql, key)).value, value);
    const index = (await readState(sql, indexKey)).value;
    assert.equal(index.length, 1);
    assert.equal(index[0].clave, key.startsWith("parte:") || key.startsWith("guardia:") ? key.split(":").slice(1).join(":") : key);
    await writeIndexedState(sql, key, value, { ifVersion: 1 });
    assert.equal((await readState(sql, indexKey)).value.length, 1, "no duplica índice al editar");
  }
});

test("dos usuarios crean partes distintos a la vez: no desaparece ningún registro del índice", async () => {
  const { sql } = await nuevaBase();
  const dias = Array.from({ length: 20 }, (_, i) => "2026-10-" + String(i + 1).padStart(2, "0"));
  const resultados = await Promise.all(dias.map(d => writeIndexedState(sql, "parte:" + d + "__emergencia", parte(d), { ifVersion: 0 })));
  assert.equal(resultados.filter(x => x.ok).length, 20);
  const idx = (await readState(sql, "partes:index:v1")).value;
  assert.equal(idx.length, 20);
  assert.equal(new Set(idx.map(x => x.clave)).size, 20);
  for (const dia of dias) assert.deepEqual((await readState(sql, "parte:" + dia + "__emergencia")).value, parte(dia));
});

test("dos usuarios guardan la misma guardia con versión idéntica: uno gana y el otro recibe conflicto, sin duplicación", async () => {
  const { sql } = await nuevaBase();
  const key = "guardia:2026-10-15__2300";
  await writeIndexedState(sql, key, guardia("2026-10-15"), { ifVersion: 0 });
  const r = await Promise.all([
    writeIndexedState(sql, key, { ...guardia("2026-10-15"), oficial: "A" }, { ifVersion: 1 }),
    writeIndexedState(sql, key, { ...guardia("2026-10-15"), oficial: "B" }, { ifVersion: 1 })
  ]);
  assert.equal(r.filter(x => x.ok).length, 1);
  assert.equal(r.filter(x => x.conflict).length, 1);
  const vigente = (await readState(sql, key)).value;
  assert.ok(["A", "B"].includes(vigente.oficial));
  assert.equal((await readState(sql, "guardias:index")).value.length, 1);
  const historial = await listHistory(sql, key);
  assert.equal(historial.length, 1, "la versión rechazada no entra en historial");
});

test("una versión obsoleta no crea índice ni modifica el registro", async () => {
  const { sql } = await nuevaBase();
  const key = "parte:2026-10-16__emergencia";
  const actual = parte("2026-10-16");
  await writeIndexedState(sql, key, actual, { ifVersion: 0 });
  const r = await writeIndexedState(sql, key, { ...actual, detalle: "B" }, { ifVersion: 0 });
  assert.equal(r.ok, false);
  assert.equal(r.conflict, true);
  assert.deepEqual((await readState(sql, key)).value, actual);
  assert.equal((await readState(sql, "partes:index:v1")).value.length, 1);
  const nuevo = await writeIndexedState(sql, "parte:2026-10-17__emergencia", parte("2026-10-17"), { ifVersion: 7 });
  assert.equal(nuevo.conflict, true, "una versión >0 no debe crear un registro inexistente");
  assert.equal((await readState(sql, "parte:2026-10-17__emergencia")).value, null);
});

test("índice defectuoso provoca rollback: nunca deja un registro sin índice", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "partes:index:v1", { roto: true });
  const key = "parte:2026-10-18__emergencia";
  await assert.rejects(() => writeIndexedState(sql, key, parte("2026-10-18"), { ifVersion: 0 }));
  assert.equal((await readState(sql, key)).value, null);
  assert.deepEqual((await readState(sql, "partes:index:v1")).value, { roto: true });
});
