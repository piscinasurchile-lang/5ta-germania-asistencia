import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const GB = require("../public/legacy/germania-reglamentos-buscar.js");
const carpeta = new URL("../public/legacy/reglamentos/", import.meta.url);
const avisos = fs.readFileSync(new URL("../public/legacy/germania-avisos.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../public/legacy/index.html", import.meta.url), "utf8");
const ARCHIVOS = [
  ["reglamento-guardia-nocturna", "747b1d47"],
  ["reglamento-general-cbv-2023", "19391160"],
];

test("el texto buscable corresponde al PDF vigente y `v` de avisos.js está al día", () => {
  for (const [archivo, v] of ARCHIVOS) {
    const sha = createHash("sha256").update(fs.readFileSync(new URL(`${archivo}.pdf`, carpeta))).digest("hex");
    const json = JSON.parse(fs.readFileSync(new URL(`${archivo}.json`, carpeta), "utf8"));
    assert.equal(json.pdfSha256, sha, `${archivo}: el JSON no sale de este PDF (ejecutar scripts/extraer-reglamentos.mjs)`);
    assert.ok(sha.startsWith(v), `${archivo}: v distinto del SHA del PDF`);
    assert.ok(avisos.includes(`v:"${v}"`), `${archivo}: avisos.js no usa v=${v}`);
    assert.ok(json.paginas.length >= 3);
  }
});

test("busca sin importar mayúsculas ni tildes y resalta sobre el texto original", () => {
  const pag = GB.preparar(["Del RÉGIMEN disciplinario\nde la   Compañía", "otra cosa"]);
  const r = GB.buscar(pag, "regimen DISCIPLINARIO");
  assert.equal(r.estado, "frase");
  assert.equal(r.paginas, 1);
  assert.equal(GB.resaltar(pag[0].texto, r.resultados[0].rangos, (x) => x), "Del <mark>RÉGIMEN disciplinario</mark>\nde la   Compañía");
  assert.equal(GB.buscar(pag, "disciplinario de la compania").estado, "frase"); // cruza saltos de línea
});

test("sin frase exacta busca páginas con todas las palabras; sin nada, avisa", () => {
  const pag = GB.preparar(["alfa y beta", "solo alfa", "beta y alfa"]);
  assert.equal(GB.buscar(pag, "beta alfa").estado, "palabras");
  assert.deepEqual(GB.buscar(pag, "beta alfa").resultados.map((x) => x.pagina), [1, 3]);
  assert.equal(GB.buscar(pag, "zzz").estado, "nada");
  assert.equal(GB.buscar(pag, "a").estado, "corta");
  assert.equal(GB.buscar(pag, "   ").estado, "corta");
});

test("el resaltado escapa el HTML del texto (no inyecta marcas)", () => {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const pag = GB.preparar(["x <b>guardia</b> y"]);
  const r = GB.buscar(pag, "guardia");
  assert.equal(GB.resaltar(pag[0].texto, r.resultados[0].rangos, esc), "x &lt;b>" + "<mark>guardia</mark>" + "&lt;/b> y");
});

test("busca de verdad en los dos reglamentos reales", () => {
  for (const [archivo] of ARCHIVOS) {
    const json = JSON.parse(fs.readFileSync(new URL(`${archivo}.json`, carpeta), "utf8"));
    const pag = GB.preparar(json.paginas);
    const palabra = json.paginas.join(" ").match(/[A-Za-zÁÉÍÓÚáéíóúñ]{7,}/)[0];
    assert.ok(GB.buscar(pag, palabra).total > 0, `${archivo}: no encuentra «${palabra}»`);
  }
});

test("«Reglamentos» solo abre su visor: no navega ni toca Oficiales", () => {
  const ini = avisos.indexOf("function abrirReglamentos");
  const fin = avisos.indexOf("/* ---------- Archivo de ODD", ini);
  const bloque = avisos.slice(ini, fin);
  assert.ok(ini > 0 && fin > ini);
  assert.ok(!/__mostrarPestana|data-go|config|oficial/i.test(bloque.replace(/Orden del Día/g, "")), "el visor no debe navegar ni tocar el módulo de Oficiales");
  assert.ok(bloque.includes("window.GermaniaBuscar"));
});

test("index.html carga el buscador antes que avisos.js", () => {
  const a = index.indexOf("germania-reglamentos-buscar.js");
  const b = index.indexOf("germania-avisos.js");
  assert.ok(a > 0 && b > a);
});
