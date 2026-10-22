import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const leer = (p) => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const peso = (p) => fs.statSync(new URL("../" + p, import.meta.url)).size;

test("la portada existe y es liviana para una pantalla de espera", () => {
  assert.ok(peso("public/legacy/portada-germania.webp") < 160 * 1024, "la portada debe pesar menos de 160 KB");
  assert.ok(peso("public/legacy/splash-1170x2532.jpg") < 400 * 1024);
});

test("la pantalla de carga usa la portada completa y mantiene estado y reintento accesibles", () => {
  const page = leer("app/page.js");
  assert.ok(page.includes("/legacy/portada-germania.webp"));
  assert.ok(page.includes('aspectRatio: "960 / 1600"') && !page.includes('objectFit: "cover"'), "la imagen se muestra completa, sin recortar sus textos");
  assert.ok(page.includes('role="status"') && page.includes('aria-live="polite"'));
  assert.ok(page.includes("Estamos cargando tu información…") && page.includes("Reintentar"));
  assert.ok(/minHeight: 44[^}]*fontWeight: 700 \}\}>Reintentar/.test(page), "el botón Reintentar mide al menos 44 px");
  assert.ok(page.includes("setTimeout(() => setPortadaViva(false), 450)"), "la portada se retira sola tras desvanecerse");
  assert.ok(page.includes("<Portada visible={!ready}>"));
});

test("el splash de iOS apunta al mismo archivo en el layout y en la app", () => {
  const a = leer("app/layout.js"), b = leer("public/legacy/index.html");
  assert.ok(a.includes("/legacy/splash-1170x2532.jpg?v=5") && b.includes("/legacy/splash-1170x2532.jpg?v=5"));
});
