// La foto del libro se abre en una capa sobre la misma pantalla: no sale a otra página ni recarga Germania.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const js = readFileSync(new URL("../public/legacy/germania-foto-libro.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../public/legacy/index.html", import.meta.url), "utf8");

test("intercepta solo los enlaces a la foto del libro y abre una capa con Cerrar", () => {
  assert.match(js, /\/api\/guardia\/libro\?/);
  assert.match(js, /foto=1/);
  assert.match(js, /e\.preventDefault\(\)/);
  assert.match(js, /aria-modal/);
  assert.match(js, /textContent="Cerrar"/);
  assert.match(js, /Escape/);
});

test("convive con el botón Atrás del teléfono: usa la clase cit-ov y no toca el historial", () => {
  assert.match(js, /className="cit-ov"/);
  assert.doesNotMatch(js, /pushState|popstate|history\.back/);
});

test("el script está incluido en la app", () => {
  assert.match(html, /germania-foto-libro\.js\?v=20261029f1/);
});
