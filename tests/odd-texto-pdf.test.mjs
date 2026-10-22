import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const dir = new URL("../public/legacy/", import.meta.url);
const T = require("../public/legacy/germania-odd-texto.js");
const OB = require("../public/legacy/germania-odd-buscar.js");
const GB = require("../public/legacy/germania-reglamentos-buscar.js");
const avisos = fs.readFileSync(new URL("germania-avisos.js", dir), "utf8");
const index = fs.readFileSync(new URL("index.html", dir), "utf8");
const sha = (u) => createHash("sha256").update(fs.readFileSync(u)).digest("hex");

test("PDF.js incluido es exactamente la versión 4.10.38 sin modificar", () => {
  assert.equal(T.PDFJS_VERSION, "4.10.38");
  assert.equal(sha(new URL("vendor/pdfjs/pdf.min.mjs", dir)), "44ec6f011027ee77791386b66c14876a5fc29e20bf0433c07c6726fff7212b72");
  assert.equal(sha(new URL("vendor/pdfjs/pdf.worker.min.mjs", dir)), "bd88805178a26c729db8c0107a5b630cb900ec070f4d8c7529a3e45530afd41d");
  assert.ok(fs.readFileSync(new URL("vendor/pdfjs/LEEME.txt", dir), "utf8").includes("4.10.38"));
});

test("extrae el texto real de un PDF y lo encuentra buscando como lo haría un voluntario", async () => {
  const lib = await import(pathToFileURL(new URL("vendor/pdfjs/pdf.min.mjs", dir).pathname).href);
  lib.GlobalWorkerOptions.workerSrc = pathToFileURL(new URL("vendor/pdfjs/pdf.worker.min.mjs", dir).pathname).href;
  const pdf = new Uint8Array(fs.readFileSync(new URL("reglamentos/reglamento-guardia-nocturna.pdf", dir)));
  const paginas = await T.extraerTexto(lib, pdf);
  const ref = JSON.parse(fs.readFileSync(new URL("reglamentos/reglamento-guardia-nocturna.json", dir), "utf8")).paginas;
  assert.equal(paginas.length, ref.length);
  paginas.forEach((p, i) => assert.ok(Math.abs(p.length - ref[i].length) <= 25, `pág ${i + 1}: largo muy distinto`));
  const r = GB.buscar(GB.preparar(paginas), "DOTACION minima de 4");
  assert.equal(r.estado, "frase");
  assert.deepEqual(r.resultados.map((x) => x.pagina), [2]);
  const ix = T.crearIndice({ id: "odd-2026-070", pdf: "odd-pdf:2026-070", version: 1 }, paginas);
  assert.equal(ix.sinTexto, false);
});

test("el índice solo vale para la misma versión y el mismo PDF; si cambian, vuelve a pendiente", () => {
  const odd = { id: "odd-2026-070", numero: "070/2026", pdf: "odd-pdf:2026-070", version: 1 };
  const ix = T.crearIndice(odd, ["texto de la página con contenido suficiente"]);
  assert.equal(T.claveTexto(odd), "odd-texto:2026-070");
  assert.equal(T.vigente(ix, odd), true);
  assert.equal(T.vigente(ix, { ...odd, version: 2 }), false); // PDF reemplazado: la versión sube
  assert.equal(T.vigente(ix, { ...odd, pdf: "odd-pdf:2026-071" }), false);
  assert.equal(T.vigente(null, odd), false);
  const lista = [odd, { id: "odd-2026-062", numero: "062/2026", pdf: null, version: 1 }, { id: "odd-2026-071", pdf: "odd-pdf:2026-071", version: 3 }];
  assert.deepEqual(T.pendientes(lista, { "odd-2026-070": ix }).map((o) => o.id), ["odd-2026-071"]); // sin PDF nunca está pendiente
  assert.equal(T.crearIndice(odd, ["", " "]).sinTexto, true); // PDF que es una imagen
});

test("la búsqueda encuentra una ODD por lo que dice su PDF aunque el título no lo diga", () => {
  const L = [
    { id: "odd-2026-070", numero: "070/2026", titulo: "Disposición general", tipo: "disposicion", pdf: "odd-pdf:2026-070", version: 1, publicadaEn: "2026-10-20T10:00:00Z" },
    { id: "odd-2026-062", numero: "062/2026", titulo: "Academia de Extricación I", tipo: "academia", pdf: null, publicadaEn: "2026-10-06T10:00:00Z" },
  ];
  const textos = { "odd-2026-070": GB.preparar(["Uso obligatorio del casco en maniobras.\nSe prohíbe el ingreso sin credencial."]) };
  assert.deepEqual(OB.filtrar(L, { q: "CASCO" }, {}, textos).map((o) => o.numero), ["070/2026"]);
  assert.deepEqual(OB.filtrar(L, { q: "prohibe ingreso" }, {}, textos).map((o) => o.numero), ["070/2026"]); // palabras en la misma página
  assert.deepEqual(OB.filtrar(L, { q: "casco" }, {}, {}).map((o) => o.numero), []); // sin índice no hay coincidencia
  assert.deepEqual(OB.filtrar(L, { q: "extricacion" }, {}, textos).map((o) => o.numero), ["062/2026"]); // sigue buscando en título
  const r = OB.enPdf(L[0], "casco", textos);
  assert.equal(r.resultados[0].pagina, 1);
});

test("la pantalla: solo oficiales indexan, solo se escribe odd-texto y el lector se carga bajo demanda", () => {
  const ini = avisos.indexOf("async function abrirArchivoOdd");
  const b = avisos.slice(ini, avisos.indexOf("async function citPendientes", ini));
  assert.ok(b.includes("if(!c||!ofi||!OT)return;"), "el botón de indexar es solo para oficiales");
  assert.ok(b.includes("OT.indexarUno(pend[i],sGet,sSet)"));
  assert.ok(!/sSet\(/.test(b.replace("OT.indexarUno(pend[i],sGet,sSet)", "")), "la pantalla no escribe nada por su cuenta");
  const mod = fs.readFileSync(new URL("germania-odd-texto.js", dir), "utf8");
  assert.equal((mod.match(/sSet\(/g) || []).length, 1);
  assert.ok(mod.includes("sSet(claveTexto(odd),indice)"));
  assert.ok(mod.includes("isEvalSupported:false"));
  assert.ok(mod.includes('import(base+"pdf.min.mjs?v="+PDFJS_VERSION)'));
  assert.ok(!index.includes("pdf.min.mjs"), "PDF.js no se carga al abrir la app");
  // quién ve qué no cambia
  assert.ok(b.includes('indexOf("voluntarios")>=0'));
});

test("index.html carga el índice de texto antes que avisos.js", () => {
  const t = index.indexOf("germania-odd-texto.js"), a = index.indexOf("germania-avisos.js");
  assert.ok(t > 0 && t < a);
});
