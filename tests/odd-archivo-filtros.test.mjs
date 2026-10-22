import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const OB = createRequire(import.meta.url)("../public/legacy/germania-odd-buscar.js");
const avisos = fs.readFileSync(new URL("../public/legacy/germania-avisos.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../public/legacy/index.html", import.meta.url), "utf8");
const TIPOS = { academia: "Academia", citacion: "Citación", disposicion: "Disposición" };
const L = [
  { numero: "062/2026", titulo: "Academia de Extricación I", tipo: "academia", lugar: "Cuartel", tema: "Corte de vehículos", cuando: { fecha: "2026-10-07", hora: "20:00" }, publicadaEn: "2026-10-01T10:00:00Z" },
  { numero: "051/2026", titulo: "Citación a sesión", tipo: "citacion", vestimenta: "Parada", cuando: { fecha: "2026-09-12" }, publicadaEn: "2026-09-05T10:00:00Z" },
  { numero: "009/2025", titulo: "Uso del casco", tipo: "disposicion", cuando: null, publicadaEn: "2025-03-20T10:00:00Z" },
];

test("busca por palabras de cualquier campo, sin tildes ni mayúsculas, sin saber el número", () => {
  assert.deepEqual(OB.filtrar(L, { q: "EXTRICACION" }, TIPOS).map((o) => o.numero), ["062/2026"]);
  assert.deepEqual(OB.filtrar(L, { q: "vehiculos corte" }, TIPOS).map((o) => o.numero), ["062/2026"]); // varias palabras, cualquier orden
  assert.deepEqual(OB.filtrar(L, { q: "parada" }, TIPOS).map((o) => o.numero), ["051/2026"]); // vestimenta
  assert.deepEqual(OB.filtrar(L, { q: "casco" }, TIPOS).map((o) => o.numero), ["009/2025"]);
  assert.deepEqual(OB.filtrar(L, { q: "citacion" }, TIPOS).map((o) => o.numero), ["051/2026"]); // etiqueta del tipo
  assert.deepEqual(OB.filtrar(L, { q: "zzz" }, TIPOS), []);
});

test("filtra por año, mes y tipo; ordena por fecha, la más reciente primero", () => {
  assert.deepEqual(OB.filtrar(L, {}, TIPOS).map((o) => o.numero), ["062/2026", "051/2026", "009/2025"]);
  assert.deepEqual(OB.filtrar(L, { anio: "2026" }, TIPOS).map((o) => o.numero), ["062/2026", "051/2026"]);
  assert.deepEqual(OB.filtrar(L, { anio: "2026", mes: "9" }, TIPOS).map((o) => o.numero), ["051/2026"]);
  assert.deepEqual(OB.filtrar(L, { mes: "3" }, TIPOS).map((o) => o.numero), ["009/2025"]); // sin fecha de actividad: usa la de publicación
  assert.deepEqual(OB.filtrar(L, { tipo: "disposicion" }, TIPOS).map((o) => o.numero), ["009/2025"]);
  assert.deepEqual(OB.anios(L), ["2026", "2025"]);
});

test("fechas legibles y tolera registros incompletos", () => {
  assert.equal(OB.fechaCorta("2026-10-07"), "7 oct 2026");
  assert.equal(OB.fechaCorta(""), "");
  assert.doesNotThrow(() => OB.filtrar([null, {}, { numero: "1/2026" }], { q: "x", anio: "2026" }, TIPOS));
});

test("la pantalla usa el módulo, no muestra campos inexistentes y se carga antes", () => {
  const ini = avisos.indexOf("async function abrirArchivoOdd");
  const fin = avisos.indexOf("async function citPendientes", ini);
  const b = avisos.slice(ini, fin);
  assert.ok(b.includes("window.GermaniaOddBuscar"));
  assert.ok(!/o\.detalle|o\.descripcion|o\.texto/.test(b), "la ODD no guarda esos campos");
  assert.ok(index.indexOf("germania-odd-buscar.js") > 0 && index.indexOf("germania-odd-buscar.js") < index.indexOf("germania-avisos.js"));
  // Quién ve qué no cambia: voluntarios solo las no retiradas dirigidas a ellos
  assert.ok(b.includes('indexOf("voluntarios")>=0'));
});
