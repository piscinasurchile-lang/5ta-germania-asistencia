import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {idsEfectivos,validarComplementos} from "../lib/guardia-asistencia-efectiva.js";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const panel=read("../public/legacy/germania-cierre-libro.js"),
index=read("../public/legacy/index.html"),
api=read("../app/api/guardia/acreditacion/route.js");

test("Control Guardia Diaria muestra nombre del asistente nuevo en asistencia efectiva y la programación aparte",()=>{
 assert.doesNotThrow(()=>new vm.Script(panel));
 assert.match(panel,/htmlAsistenciaRatificada\(x\)/);
 assert.match(panel,/Asistencia real ratificada/);
 assert.match(panel,/Asistente adicional · verificado en libro/);
 assert.match(panel,/Voluntarios programados en la ODD original/);
 assert.match(panel,/participantesEfectivos\(x\)/);
 assert.match(panel,/new Set\(\)/);
 assert.match(panel,/data-lgn-acta-fecha/);
 assert.match(panel,/lgn-acta-adicional/);
});
test("T3 accede a corregir la noche exacta desde Control Guardia Diaria, aunque sea histórica",()=>{
 assert.match(panel,/data-lgn-corregir/);
 assert.match(panel,/abrirPanelMando\(btn\.dataset\.lgnCorregir\)/);
 assert.match(panel,/data-lgn-dia/);
 assert.match(panel,/historial=1&anio=/);
 assert.match(panel,/if\(t3&&x\.cierre\)/);
 assert.match(panel,/Guardar corrección de acreditación/);
 assert.match(panel,/historial=null;/);
});
test("T3 confirma cotejo con foto y recibe resumen antes de ratificar o corregir",()=>{
 assert.match(panel,/data-lgn-comprobado/);
 assert.match(panel,/querySelector\("\[data-lgn-comprobado\]"\)\?\.checked/);
 assert.match(panel,/incluidos los no programados/);
 assert.match(panel,/Nuevos asistentes:/);
 assert.match(panel,/motivoCorreccion:motivo/);
 assert.match(api,/if \(anteriorRegistro && !soloAcreditaFinal && !motivoCorreccion\)/);
 assert.match(api,/readState\(sql,"guardia-libro:"\+fecha\)/);
 assert.match(api,/writeState\(sql,"guardia-acreditacion:"\+fecha/);
 assert.doesNotMatch(api,/writeState\(sql,"guardia-revision:/);
});
test("un ID por guardia y no doble conteo de rezagado o excusado",()=>{
 const programados=["maq","obac","v1","v2"],extra=[{id:"t3",motivo:"Verificado en foto de libro físico"}];
 const asistencia={maq:"presente",obac:"presente",v1:"presente",v2:"ausente",t3:"presente"};
 const nomina=[{id:"t3",activo:true}];
 assert.deepEqual(idsEfectivos(programados,extra),["maq","obac","v1","v2","t3"]);
 assert.equal(validarComplementos(programados,extra,{v2:"Eximido por razón informada"},asistencia,nomina),null);
 assert.equal(validarComplementos(programados,[...extra,...extra],{},asistencia,nomina),"rezagado_duplicado");
 assert.equal(validarComplementos(programados,[{id:"v1",motivo:"Presente en libro firmado"}],{},asistencia,nomina),"rezagado_duplicado");
 assert.match(index,/germania-cierre-libro\.js\?v=\d{8}[a-z0-9]+/);
});
