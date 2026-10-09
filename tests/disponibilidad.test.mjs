import test from "node:test";
import assert from "node:assert/strict";
import { hoyChile, clavesDisponibilidad, resumenDisponibilidad } from "../lib/disponibilidad.js";

test("claves: vigente + 15 días hacia atrás, cruzando mes", () => {
  const c = clavesDisponibilidad("2026-10-02");
  assert.equal(c.length, 16);
  assert.equal(c[0], "disponibilidad:vigente");
  assert.equal(c[1], "disponibilidad:2026-10-02");
  assert.equal(c[3], "disponibilidad:2026-09-30");
});

test("hoy en Chile no usa la fecha UTC (01:00 UTC del 9 sigue siendo 8 en Chile)", () => {
  assert.equal(hoyChile(new Date("2026-10-09T01:00:00Z")), "2026-10-08");
});

test("resumen: último estado por voluntario, solo activos, maquinistas en cuartel o disponibles", () => {
  const roster = [
    { id: "a", activo: true, conductor: true }, { id: "b", activo: true }, { id: "c", activo: true, conductor: true },
    { id: "d", activo: false, conductor: true }, { id: "e", activo: true }
  ];
  const v = {
    "disponibilidad:2026-10-07": { a: { estado: "cuartel", desde: "2026-10-07T10:00:00Z" }, b: { estado: "disponible", desde: "2026-10-07T10:00:00Z" } },
    "disponibilidad:vigente": { a: { estado: "no", desde: "2026-10-08T08:00:00Z" }, c: { estado: "disponible", desde: "2026-10-08T08:00:00Z" }, d: { estado: "cuartel", desde: "2026-10-08T08:00:00Z" } }
  };
  assert.deepEqual(resumenDisponibilidad(roster, v), { cuartel: 0, disponibles: 2, maquinistas: 1 });
});

test("resumen: datos vacíos o inválidos no fallan", () => {
  assert.deepEqual(resumenDisponibilidad(null, null), { cuartel: 0, disponibles: 0, maquinistas: 0 });
  assert.deepEqual(resumenDisponibilidad([], { x: [1, 2], y: null }), { cuartel: 0, disponibles: 0, maquinistas: 0 });
});
