import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/demo-avisos/page.jsx", import.meta.url), "utf8");
const local = readFileSync(new URL("../app/demo-avisos/PruebaNotificacion.jsx", import.meta.url), "utf8");

test("demo visual no envía avisos a otros voluntarios", () => {
  assert.match(page, /DEMOSTRACIÓN INTERACTIVA · SIN ENVÍOS REALES/);
  assert.match(page, /setPendiente\(true\)/);
  assert.match(page, /setPendiente\(false\)/);
  assert.match(page, /limpiarAvisosLocales\(\)/);
  assert.doesNotMatch(page, /fetch\(|DATABASE_URL|Neon|webpush\.sendNotification/);
});

test("prueba nativa requiere toque y permiso del propio teléfono", () => {
  assert.match(local, /Notification\.requestPermission\(\)/);
  assert.match(local, /registro\.showNotification\(/);
  assert.match(local, /serviceWorker\.register\("\/sw\.js"/);
  assert.match(local, /getNotifications\(\{ tag: "germania-informaciones" \}\)/);
  assert.match(local, /navigator\.clearAppBadge/);
  assert.doesNotMatch(local, /fetch\(|DATABASE_URL|emisorId|voluntarioId/);
});

test("la prueba está marcada como no operativa", () => {
  assert.match(page, /No modifica la app oficial, no envía Web Push/);
  assert.match(local, /No envía nada a otros teléfonos/);
});
