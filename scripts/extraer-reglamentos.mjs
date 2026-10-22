#!/usr/bin/env node
/* GERMANIA · Extrae el texto de los reglamentos (PDF) a JSON para el buscador de «Reglamentos».
 *
 * Uso:   node scripts/extraer-reglamentos.mjs
 * Requiere `pdftotext` (poppler-utils) instalado.
 *
 * Genera, junto a cada PDF de public/legacy/reglamentos/, un .json con una cadena de texto por página
 * y el SHA-256 del PDF del que salió. Cuando cambie un PDF hay que volver a ejecutar este script y poner
 * en REGLAMENTOS (public/legacy/germania-avisos.js) el nuevo valor `v` (primeros 8 caracteres del SHA-256);
 * la prueba tests/reglamentos-buscador.test.mjs falla si el JSON o `v` no corresponden al PDF.
 * El PDF sigue siendo el documento oficial: el JSON solo sirve para buscar y mostrar fragmentos. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const carpeta = new URL("../public/legacy/reglamentos/", import.meta.url);
const DOCUMENTOS = [
  { id: "guardia", titulo: "Reglamento de Guardia Nocturna", archivo: "reglamento-guardia-nocturna" },
  { id: "general", titulo: "Reglamento General del CBV", archivo: "reglamento-general-cbv-2023" },
];

function textoPorPagina(rutaPdf) {
  const salida = execFileSync("pdftotext", ["-enc", "UTF-8", rutaPdf, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const paginas = salida.split("\f");
  if (paginas.length && paginas[paginas.length - 1].trim() === "") paginas.pop(); // pdftotext termina con \f
  return paginas.map((p) =>
    p
      .replace(/[ \t]+\n/g, "\n") // espacios al final de línea
      .replace(/\n{3,}/g, "\n\n") // líneas en blanco de más
      .trim(),
  );
}

for (const d of DOCUMENTOS) {
  const rutaPdf = fileURLToPath(new URL(`${d.archivo}.pdf`, carpeta));
  const sha = createHash("sha256").update(readFileSync(rutaPdf)).digest("hex");
  const paginas = textoPorPagina(rutaPdf);
  const vacias = paginas.map((p, i) => (p.length < 20 ? i + 1 : 0)).filter(Boolean);
  const json = { id: d.id, titulo: d.titulo, pdf: `${d.archivo}.pdf`, pdfSha256: sha, paginas };
  writeFileSync(new URL(`${d.archivo}.json`, carpeta), JSON.stringify(json));
  console.log(
    `${d.archivo}: ${paginas.length} páginas · v=${sha.slice(0, 8)}` +
      (vacias.length ? ` · páginas casi sin texto: ${vacias.join(", ")}` : ""),
  );
}
