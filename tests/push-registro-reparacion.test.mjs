import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const leer=r=>readFileSync(new URL(r,import.meta.url),"utf8");
const cliente=leer("../app/avisos/page.js");
const prueba=leer("../app/api/push/prueba/route.js");

test("no se declara activo un teléfono sin respuesta positiva de registro",()=>{
  assert.match(cliente,/setHabilitado\(confirmado\.ok\)/);
  assert.match(cliente,/if\(!vivo\)return/);
  assert.match(cliente,/Avisos activados y registrados en Germania/);
});
test("antes de enviar prueba se repara el registro del mismo teléfono",()=>{
  const inicio=cliente.indexOf("async function probar()");
  const fin=cliente.indexOf("async function desactivar()",inicio);
  const accion=cliente.slice(inicio,fin);
  assert.ok(inicio>0&&fin>inicio);
  assert.ok(accion.indexOf('fetch("/api/push/suscripcion"')>=0);
  assert.ok(accion.indexOf('fetch("/api/push/suscripcion"')<accion.indexOf('fetch("/api/push/prueba"'));
  assert.match(accion,/Ya se solicitó una prueba/);
  assert.match(accion,/reintentarEnSegundos/);
});
test("servidor distingue registro inexistente y límite de un minuto",()=>{
  assert.match(prueba,/suscripcion_no_registrada/);
  assert.match(prueba,/esperar_entre_pruebas/);
  assert.match(prueba,/reintentarEnSegundos/);
  assert.match(prueba,/ultimo_test<now\(\)-interval '60 seconds'/);
  assert.doesNotMatch(prueba,/difundir/);
});
