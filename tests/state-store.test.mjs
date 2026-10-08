import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  ensureSchema, resetSchemaCache, readState, writeState, addToList, listHistory, listByPrefix
} from "../lib/state-store.js";

/* Adaptador: PGlite como si fuera la función `sql` de Neon (plantilla etiquetada → filas). */
async function nuevaBase() {
  const db = new PGlite();
  const sql = (strings, ...vals) => {
    let text = strings[0];
    vals.forEach((_, i) => { text += "$" + (i + 1) + strings[i + 1]; });
    return db.query(text, vals).then((r) => r.rows);
  };
  resetSchemaCache();
  await ensureSchema(sql);
  return { db, sql };
}

test("la esquema se crea y es repetible", async () => {
  const { sql } = await nuevaBase();
  resetSchemaCache();
  await ensureSchema(sql);
  const estado = await readState(sql, "no-existe");
  assert.deepEqual(estado, { value: null, version: 0, updatedAt: null });
});

test("escribir sin ifVersion sigue funcionando y sube la versión", async () => {
  const { sql } = await nuevaBase();
  const a = await writeState(sql, "guardia:2026-10-14__2300", { oficial: "1" });
  assert.equal(a.ok, true);
  assert.equal(a.version, 1);
  const b = await writeState(sql, "guardia:2026-10-14__2300", { oficial: "2" });
  assert.equal(b.version, 2);
  const leido = await readState(sql, "guardia:2026-10-14__2300");
  assert.deepEqual(leido.value, { oficial: "2" });
  assert.equal(leido.version, 2);
});

test("P1: sobrescribir una clave de guardia deja el valor anterior en el historial", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:x", { n: 1 });
  await writeState(sql, "guardia:x", { n: 2 });
  await writeState(sql, "guardia:x", { n: 3 });
  const h = await listHistory(sql, "guardia:x");
  assert.deepEqual(h.map((r) => r.value.n), [2, 1]);
  assert.deepEqual(h.map((r) => Number(r.version)), [2, 1]);
});

test("P1: las claves que no son de guardia no llenan el historial", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "disponibilidad:vigente", { a: 1 });
  await writeState(sql, "disponibilidad:vigente", { a: 2 });
  assert.equal((await listHistory(sql, "disponibilidad:vigente")).length, 0);
  for (const k of ["guardia-inscripcion:2026-10-14:517", "guardias:index", "guardia-plan:2026-10-14", "guardia-confirmacion:2026-10-14:517"]) {
    await writeState(sql, k, { v: 1 });
    await writeState(sql, k, { v: 2 });
    assert.equal((await listHistory(sql, k)).length, 1, k);
  }
  await writeState(sql, "guardiax:otra", { v: 1 });
  await writeState(sql, "guardiax:otra", { v: 2 });
  assert.equal((await listHistory(sql, "guardiax:otra")).length, 0);
});

test("P2: con ifVersion correcto escribe; con versión vieja devuelve conflicto y no pisa nada", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:y", { turno: "A" });            // v1
  const lecturaDeAna = await readState(sql, "guardia:y");        // Ana ve v1
  const lecturaDeLuis = await readState(sql, "guardia:y");       // Luis ve v1
  const luis = await writeState(sql, "guardia:y", { turno: "B" }, { ifVersion: lecturaDeLuis.version });
  assert.equal(luis.ok, true);
  assert.equal(luis.version, 2);
  const ana = await writeState(sql, "guardia:y", { turno: "C" }, { ifVersion: lecturaDeAna.version });
  assert.equal(ana.ok, false);
  assert.equal(ana.conflict, true);
  assert.equal(ana.version, 2);
  assert.deepEqual(ana.value, { turno: "B" });
  const final = await readState(sql, "guardia:y");
  assert.deepEqual(final.value, { turno: "B" });               // lo de Luis sigue intacto
  const h = await listHistory(sql, "guardia:y");
  assert.deepEqual(h.map((r) => r.value.turno), ["A"]);        // el intento rechazado no ensució el historial
});

test("P2: dos guardados simultáneos con la misma versión → exactamente uno gana", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:z", { n: 0 });
  const resultados = await Promise.all([
    writeState(sql, "guardia:z", { n: 1 }, { ifVersion: 1 }),
    writeState(sql, "guardia:z", { n: 2 }, { ifVersion: 1 })
  ]);
  assert.equal(resultados.filter((r) => r.ok).length, 1);
  assert.equal(resultados.filter((r) => r.conflict).length, 1);
});

test("P3: addToList no pierde elementos cuando se agrega en paralelo", async () => {
  const { sql } = await nuevaBase();
  const fechas = Array.from({ length: 12 }, (_, i) => ({ clave: "g" + i, fecha: "2026-10-" + String(i + 1).padStart(2, "0") }));
  await Promise.all(fechas.map((f) => addToList(sql, "guardias:index", f, { uniqueBy: "clave" })));
  const { value } = await readState(sql, "guardias:index");
  assert.equal(value.length, 12);
  assert.deepEqual(new Set(value.map((x) => x.clave)), new Set(fechas.map((x) => x.clave)));
});

test("P3: addToList no repite por uniqueBy ni por valor simple", async () => {
  const { sql } = await nuevaBase();
  await addToList(sql, "guardias:index", { clave: "a", fecha: "1" }, { uniqueBy: "clave" });
  await addToList(sql, "guardias:index", { clave: "a", fecha: "2" }, { uniqueBy: "clave" });
  assert.equal((await readState(sql, "guardias:index")).value.length, 1);
  await addToList(sql, "guardia-plan:index", "2026-10-14");
  await addToList(sql, "guardia-plan:index", "2026-10-14");
  assert.deepEqual((await readState(sql, "guardia-plan:index")).value, ["2026-10-14"]);
});

test("P3: addToList con sort deja las fechas ordenadas", async () => {
  const { sql } = await nuevaBase();
  for (const f of ["2026-10-21", "2026-10-07", "2026-10-14"]) await addToList(sql, "guardia-plan:index", f, { sort: "asc" });
  assert.deepEqual((await readState(sql, "guardia-plan:index")).value, ["2026-10-07", "2026-10-14", "2026-10-21"]);
});

test("P3: addToList sobre algo que no es lista no lo destruye", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:no-lista", { a: 1 });
  const r = await addToList(sql, "guardia:no-lista", "x");
  assert.equal(r.ok, false);
  assert.deepEqual((await readState(sql, "guardia:no-lista")).value, { a: 1 });
});

test("P3: uniqueBy rechaza nombres peligrosos", async () => {
  const { sql } = await nuevaBase();
  await assert.rejects(() => addToList(sql, "guardias:index", { a: 1 }, { uniqueBy: "a'; DROP TABLE app_state;--" }), /invalid_unique_by/);
});

test("P1: guardar exactamente lo mismo no ensucia el historial", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:igual", { v: 1 });
  await writeState(sql, "guardia:igual", { v: 1 });
  assert.equal((await listHistory(sql, "guardia:igual")).length, 0);
});

test("P1: con 20 guardados en paralelo no se pierde ningún valor intermedio del historial", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia:carrera", { n: 0 });
  await Promise.all(Array.from({ length: 20 }, (_, i) => writeState(sql, "guardia:carrera", { n: i + 1 })));
  const finalVal = (await readState(sql, "guardia:carrera")).value.n;
  const h = (await listHistory(sql, "guardia:carrera", 100)).map((r) => r.value.n);
  assert.equal(h.length, 20);                       // 21 valores en total: 20 en historial + el vigente
  assert.equal(new Set([...h, finalVal]).size, 21); // ninguno repetido ni perdido
});

test("listByPrefix: lee solo las claves de la semana pedida y rechaza prefijos no permitidos", async () => {
  const { sql } = await nuevaBase();
  await writeState(sql, "guardia-inscripcion:2026-10-14:517", ["2026-10-14", "2026-10-15"]);
  await writeState(sql, "guardia-inscripcion:2026-10-14:518", ["2026-10-16"]);
  await writeState(sql, "guardia-inscripcion:2026-10-21:517", ["2026-10-21"]);
  await writeState(sql, "roster:v8", [{ n: 1 }]);
  const r = await listByPrefix(sql, "guardia-inscripcion:2026-10-14:");
  assert.deepEqual(r.map((x) => x.key), ["guardia-inscripcion:2026-10-14:517", "guardia-inscripcion:2026-10-14:518"]);
  await assert.rejects(() => listByPrefix(sql, "roster:"), /invalid_prefix/);
  await assert.rejects(() => listByPrefix(sql, "security:"), /invalid_prefix/);
  await assert.rejects(() => listByPrefix(sql, "guardia-inscripcion:%"), /invalid_prefix/);
});
