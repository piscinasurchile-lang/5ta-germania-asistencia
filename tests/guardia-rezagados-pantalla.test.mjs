import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const vista=read("../public/legacy/germania-cierre-libro.js"),
 api=read("../app/api/guardia/acreditacion/route.js"),
 stats=read("../public/legacy/app.js"),hoja=read("../public/legacy/index.html");
test("T3 agrega rezagados de nómina, confirma presencia fotografiada y tiene botón Excusar por persona",()=>{
 assert.doesNotThrow(()=>new vm.Script(vista));
 assert.match(vista,/data-lgn-agregar/);
 assert.match(vista,/data-lgn-excusar/);
 assert.match(vista,/data-lgn-excusa/);
 assert.match(vista,/data-lgn-rezagado/);
 assert.match(vista,/¿Confirmas que /);
 assert.match(vista,/fotografía del libro/);
 assert.match(vista,/adicionales\.push\(\{id,motivo\}\)/);
 assert.match(vista,/asistencias\[id\]="presente"/);
 assert.match(vista,/body:JSON\.stringify\(\{fecha,actorId:actual,asistencias,excusas,adicionales/);
});
test("API no modifica programación ni crea nueva guardia",()=>{
 assert.match(api,/idsEfectivos\(programados,adicionales\)/);
 assert.match(api,/validarAcreditacion/);
 assert.match(api,/ifVersion:b\.ifVersion/);
 assert.match(api,/writeState\(sql,"guardia-acreditacion:"\+fecha/);
 assert.doesNotMatch(api,/writeState\(sql,"guardia-revision:/);
 assert.match(api,/cierreLibroFotoSHA256:libro\.value\.fotoSHA256/);
});
test("Capitán y control ven adicionales, excusas y datos históricos de la misma acreditación",()=>{
 assert.match(vista,/participantesEfectivos\(x\)/);
 assert.match(vista,/acreditacion\.excusas\?/);
 assert.match(vista,/ratificar\(b\.dataset\.lgnRatificar,b\)/);
 assert.match(stats,/guardiasCompletas/);
 assert.match(stats,/fechasExistentes/);
 assert.match(hoja,/germania-cierre-libro\.js\?v=20261016rez1/);
});
