import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const api=read("../app/api/guardia/acreditacion/route.js"),
  panel=read("../public/legacy/germania-cierre-libro.js"),
  atras=read("../public/legacy/germania-atras.js"),
  dot=read("../public/legacy/germania-dotacion-oficiales.js"),
  index=read("../public/legacy/index.html"),
  store=read("../lib/state-store.js");

test("T3 puede ratificar una guardia en la que participó, con trazabilidad en el registro",()=>{
  assert.match(api,/t3Participante:ids\.includes\(String\(actor\)\)/);
  assert.match(api,/"OBAC"/);assert.match(api,/"Maquinista"/);assert.match(api,/"Asistente adicional"/);
  assert.doesNotMatch(api,/participo.*return Response\.json\(\{error/i); // no se bloquea
  assert.match(panel,/lgn-aviso-propio/);
  assert.match(panel,/Participaste en esta guardia como/);
  assert.match(panel,/Trazabilidad:/);
});
test("El Capitán recibe el informe automáticamente al ratificar y queda constancia",()=>{
  assert.match(api,/informeCapitan:\{estado:"disponible_automatico"/);
  assert.match(panel,/El Capitán fue informado automáticamente/);
  assert.match(panel,/pendientes de Visto/);
});
test("Botón Atrás: archivo válido, cargado en el index con versión y sin duplicar historial tras recarga",()=>{
  assert.doesNotThrow(()=>new vm.Script(atras));
  assert.match(index,/germania-atras\.js\?v=\d{8}[a-z0-9]+/);
  assert.match(atras,/Presiona Atrás otra vez para salir/);
  assert.match(atras,/est&&est\.gAtras===1/);
  assert.match(atras,/Tienes datos escritos que no se han enviado/);
  assert.match(atras,/cerrarSuperpuesto/);
});
test("Dotación para T1 y T3: solo lectura, mínimo de 4 y sin escribir datos",()=>{
  assert.doesNotThrow(()=>new vm.Script(dot));
  assert.match(index,/germania-dotacion-oficiales\.js\?v=\d{8}[a-z0-9]+/);
  assert.match(dot,/teniente\\s\*\(primero\|1\)/);
  assert.match(dot,/teniente\\s\*\(tercero\|3\)/);
  assert.match(dot,/Mínimo: 4/);
  assert.doesNotMatch(dot,/method:\s*["']?(PUT|POST|PATCH|DELETE)/i);
  assert.doesNotMatch(dot,/sSet\(|sAddToList\(/);
});
test("Lectura por prefijo de confirmaciones de guardia (solo listado de lectura)",()=>{
  const lista=store.slice(store.indexOf("export const PREFIJOS_LECTURA"),store.indexOf("export async function listByPrefix"));
  assert.match(lista,/"guardia-asiste:"/);
});
