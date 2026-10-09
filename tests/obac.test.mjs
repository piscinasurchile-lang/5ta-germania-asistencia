import test from "node:test";
import assert from "node:assert/strict";
import "../public/legacy/germania-obac.js";
const { obacDeNoche, ordenDePrecedencia } = globalThis.GermaniaObac;

// Orden de precedencia: Capitán (cap), Teniente 1° (t1), Teniente 2° (t2), Teniente 3° (t3), luego voluntarios v1, v2.
const ORDEN = ["cap", "t1", "t2", "t3", "v1", "v2"];
const ins = (...ids) => ids.map((id) => ({ id }));

test("solo voluntarios: el de mayor precedencia es OBAC", () => {
  const r = obacDeNoche({ inscritos: ins("v2", "v1"), orden: ORDEN });
  assert.equal(r.obac, "v1");
  assert.deepEqual(r.voluntarios, ["v2"]);
});

test("un oficial inscrito pasa a OBAC y los voluntarios quedan voluntarios", () => {
  const r = obacDeNoche({ inscritos: ins("v1", "t3", "v2"), orden: ORDEN });
  assert.equal(r.obac, "t3");
  assert.deepEqual(r.voluntarios, ["v1", "v2"]);
});

test("llegada tardía: Teniente 3° → llega Teniente 2° → Teniente 1° → Capitán", () => {
  const pasos = [["t3", "t3"], ["t2", "t2"], ["t1", "t1"], ["cap", "cap"]];
  const inscritos = [];
  for (const [llega, esperado] of pasos) {
    inscritos.push({ id: llega });
    const r = obacDeNoche({ inscritos, orden: ORDEN });
    assert.equal(r.obac, esperado);
    assert.equal(r.voluntarios.length, inscritos.length - 1);
  }
});

test("el orden de llegada no cambia el resultado", () => {
  const a = obacDeNoche({ inscritos: ins("t3", "t1", "v1"), orden: ORDEN });
  const b = obacDeNoche({ inscritos: ins("v1", "t1", "t3"), orden: ORDEN });
  assert.equal(a.obac, "t1");
  assert.equal(b.obac, "t1");
});

test("cada noche es independiente: sin límite de noches como OBAC", () => {
  const noches = [ins("cap", "v1"), ins("t1", "v1"), ins("cap", "t2"), ins("v1", "v2")];
  const obacs = noches.map((n) => obacDeNoche({ inscritos: n, orden: ORDEN }).obac);
  assert.deepEqual(obacs, ["cap", "t1", "cap", "v1"]);
});

test("el maquinista inscrito no compite por OBAC", () => {
  const r = obacDeNoche({ inscritos: [{ id: "t1", maquinista: true }, { id: "v1" }, { id: "v2" }], orden: ORDEN });
  assert.equal(r.obac, "v1");
  assert.deepEqual(r.maquinistas, ["t1"]);
  assert.equal(r.maquinistaPorRespaldo, null);
});

test("sin maquinista, el Capitán pasa a maquinista y el OBAC es el siguiente en precedencia", () => {
  const r = obacDeNoche({
    inscritos: [{ id: "cap", habilitadoMaquinista: true }, { id: "t2" }, { id: "v1" }],
    orden: ORDEN,
  });
  assert.equal(r.maquinistaPorRespaldo, "cap");
  assert.deepEqual(r.maquinistas, ["cap"]);
  assert.equal(r.obac, "t2");
  assert.deepEqual(r.voluntarios, ["v1"]);
});

test("con maquinista inscrito, el Capitán sigue como OBAC", () => {
  const r = obacDeNoche({
    inscritos: [{ id: "cap", habilitadoMaquinista: true }, { id: "m1", maquinista: true }, { id: "v1" }],
    orden: [...ORDEN, "m1"],
  });
  assert.equal(r.obac, "cap");
  assert.equal(r.maquinistaPorRespaldo, null);
  assert.deepEqual(r.maquinistas, ["m1"]);
});

test("otro oficial habilitado puede cubrir de maquinista más adelante (marca, no cargo fijo)", () => {
  const r = obacDeNoche({
    inscritos: [{ id: "t1", habilitadoMaquinista: true }, { id: "t2" }, { id: "v1" }],
    orden: ORDEN,
  });
  assert.equal(r.maquinistaPorRespaldo, "t1");
  assert.equal(r.obac, "t2");
});

test("sin nadie habilitado y sin maquinista: no se inventa maquinista", () => {
  const r = obacDeNoche({ inscritos: ins("t1", "v1"), orden: ORDEN });
  assert.deepEqual(r.maquinistas, []);
  assert.equal(r.obac, "t1");
});

test("los voluntarios sin posición quedan al final, nunca sobre uno con posición", () => {
  const r = obacDeNoche({ inscritos: ins("nuevo1", "v2", "nuevo2"), orden: ORDEN });
  assert.equal(r.obac, "v2");
  assert.deepEqual(r.voluntarios, ["nuevo1", "nuevo2"]);
  assert.equal(r.empateSinPosicion, false);
});

test("solo sin posición: se avisa el empate para que lo resuelva el Teniente 3°", () => {
  const r = obacDeNoche({ inscritos: ins("nuevo1", "nuevo2"), orden: ORDEN });
  assert.equal(r.obac, "nuevo1");
  assert.equal(r.empateSinPosicion, true);
});

test("noche sin inscritos o solo maquinistas: no hay OBAC", () => {
  assert.equal(obacDeNoche({ inscritos: [], orden: ORDEN }).obac, null);
  const r = obacDeNoche({ inscritos: [{ id: "m1", maquinista: true }], orden: ORDEN });
  assert.equal(r.obac, null);
});

test("el Capitán habilitado solo y sin maquinista: pasa a maquinista y no queda OBAC", () => {
  const r = obacDeNoche({ inscritos: [{ id: "cap", habilitadoMaquinista: true }], orden: ORDEN });
  assert.equal(r.obac, null);
  assert.deepEqual(r.maquinistas, ["cap"]);
});

test("ids repetidos o datos inválidos no rompen y no se modifican las entradas", () => {
  const inscritos = [{ id: "v1" }, { id: "v1" }, null, {}, { id: "t3" }];
  const copia = JSON.stringify(inscritos);
  const r = obacDeNoche({ inscritos, orden: ORDEN });
  assert.equal(r.obac, "t3");
  assert.deepEqual(r.voluntarios, ["v1"]);
  assert.equal(JSON.stringify(inscritos), copia);
  assert.equal(obacDeNoche({}).obac, null);
});

test("ids numéricos y de texto se tratan igual", () => {
  const r = obacDeNoche({ inscritos: [{ id: 5 }, { id: "7" }], orden: [7, "5"] });
  assert.equal(r.obac, "7");
});

test("ordenDePrecedencia: usa la lista, omite los que no figuran y los repetidos", () => {
  const nomina = { "Fernando Jerez": "cap", "Tomás Lara": "t1" };
  const orden = ordenDePrecedencia(
    [{ nombre: "Fernando Jerez" }, { nombre: "Alguien Nuevo" }, { nombre: "Tomás Lara" }, { nombre: "Fernando Jerez" }],
    (n) => nomina[n] ?? null,
  );
  assert.deepEqual(orden, ["cap", "t1"]);
  assert.deepEqual(ordenDePrecedencia(null, () => null), []);
});
