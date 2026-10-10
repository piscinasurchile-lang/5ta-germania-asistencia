import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Regresión del flujo: la disponibilidad como suplente NO es reserva titular.
const fuente=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");

test("guardia consulta los suplentes en una clave separada de la dotación",()=>{
  assert.match(fuente,/guardia-maq-reserva:/);
  assert.match(fuente,/D\.S=\{vol:S\[0\],maq:S\[1\],obac:S\[2\],conf:S\[3\],reserva:S\[4\]\|\|\{\}\}/);
  assert.match(fuente,/cobertura\(\{vol:S\[0\],maq:S\[1\],obac:S\[2\]\},D\.noches\)/);
});

test("ofrecerse como suplente no modifica guardia-maq ni crea segunda plaza",()=>{
  const inicio=fuente.indexOf("async function cambiarSuplente(");
  const fin=fuente.indexOf("async function guardarRol(",inicio);
  assert.ok(inicio>0 && fin>inicio);
  const bloque=fuente.slice(inicio,fin);
  assert.match(bloque,/key="guardia-maq-reserva:"/);
  assert.doesNotMatch(bloque,/guardia-conductor:/);
  assert.doesNotMatch(bloque,/guardia-confirmacion:/);
  assert.match(bloque,/ifVersion:lectura\.version/);
});

test("solo titulares reales bloquean la elección, no el Capitán de respaldo provisional",()=>{
  assert.match(fuente,/ocupada=esM&&!!tit&&!tit\.respaldo&&!soyTit/);
  assert.match(fuente,/Ofrecerme como suplente/);
  assert.match(fuente,/Suplentes disponibles \(no titulares\)/);
});
