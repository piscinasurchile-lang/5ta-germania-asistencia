import {informeRatificado} from "../lib/guardia-libro.js";
import test from "node:test";
import assert from "node:assert/strict";
import {firmaDotacion,validarAcreditacion,registroVigente} from "../lib/guardia-acreditacion.js";
import {validarComplementos,resumenEfectivo} from "../lib/guardia-asistencia-efectiva.js";

const fecha="2026-10-15";
const noche={maq:"m1",obac:"o1",vol:["v1","v2","v3"]};
const roster=[
 {id:"t3",activo:true,cargo:"Teniente Tercero"},
 ...["m1","o1","v1","v2","v3","r1"].map(id=>({id,activo:true,cargo:"Bombero"}))
];
const revision={estado:"aprobada",aprobadaEn:"2026-10-14T16:00:00Z",noches:{[fecha]:noche}};
const asistencia={m1:"presente",o1:"presente",v1:"presente",v2:"presente",v3:"ausente"};
const validar=(overrides={})=>validarAcreditacion({
 fecha,noche,revision,asistencias:asistencia,ahoraLocal:"2026-10-16T06:30",
 actor:"t3",roster,...overrides
});
test("dotación: firma cambia al reemplazar OBAC o maquinista",()=>{
 const base=firmaDotacion(noche);
 assert.ok(base);
 assert.notEqual(firmaDotacion({...noche,obac:"r1"}),base);
 assert.notEqual(firmaDotacion({...noche,maq:"r1"}),base);
});
test("T3: no acredita asistencia por nómina sin marcar",()=>{
 assert.equal(validar({asistencias:{...asistencia,v2:undefined}}),"asistencia_incompleta");
});
test("T3: reemplazante de nómina puede figurar como adicional presente",()=>{
 assert.equal(validar({adicionales:[{id:"r1",motivo:"Reemplazo autorizado por T3"}],
  asistencias:{...asistencia,r1:"presente"}}),null);
});
test("PENDIENTE funcional: externo fuera de nómina sigue bloqueado",()=>{
 assert.equal(validar({adicionales:[{id:"externo",motivo:"Conductor de otra compañía autorizado"}],
  asistencias:{...asistencia,externo:"presente"}}),"rezagado_no_en_nomina");
});
test("guardia reforzada: ausencia sigue siendo ausencia, no presente",()=>{
 const res=resumenEfectivo({asistentes:["m1","o1","v1","v2"],ausentes:["v3"],excusas:{}});
 assert.deepEqual(res.faltantes,["v3"]);
});
test("excusa: no equivale a asistencia",()=>{
 assert.equal(validar({excusas:{v3:"Imposibilidad informada"}}),null);
 const res=resumenEfectivo({asistentes:["m1","o1","v1","v2"],ausentes:["v3"],excusas:{v3:"Imposibilidad informada"}});
 assert.deepEqual(res.excusados,["v3"]);assert.ok(!res.presentes.includes("v3"));
});
test("acreditación antigua se invalida si cambia rol en dotación",()=>{
 const ac={fecha,estado:"acreditada",revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche),
  asistencias:asistencia,asistentes:["m1","o1","v1","v2"],ausentes:["v3"]};
 assert.equal(registroVigente(ac,revision),true);
 assert.equal(registroVigente(ac,{...revision,noches:{[fecha]:{...noche,maq:"r1"}}}),false);
});
test("duplicados de rezagados se rechazan",()=>{
 assert.equal(validarComplementos(["m1"],[{id:"r1",motivo:"Reemplazo autorizado"},{id:"r1",motivo:"Segundo reemplazo"}],{}, {r1:"presente"},roster),"rezagado_duplicado");
});
test("sólo T3 activo puede acreditar",()=>{
 assert.equal(validar({actor:"v1"}),"solo_teniente_tercero");
});
test("no se acredita antes de terminar la noche",()=>{
 assert.equal(validar({ahoraLocal:"2026-10-15T23:00"}),"noche_no_finalizada");
});

test("informe del Capitán solo con cierre y ratificación coherentes",()=>{
 const foto="sha256-foto-ejemplo";
 const cierre={estado:"enviado",fotoClave:"foto-demo",fotoSHA256:foto,enviadoEn:"2026-10-16T06:10:00Z",revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche)};
 const acreditacion={fecha,estado:"acreditada",revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche),asistencias:asistencia,asistentes:["m1","o1","v1","v2"],ausentes:["v3"],cierreLibroFotoSHA256:foto,cierreLibroEn:cierre.enviadoEn};
 assert.equal(informeRatificado({acreditacion,revision,noche,cierre}),true);
 assert.equal(informeRatificado({acreditacion,revision,noche,cierre:{...cierre,fotoSHA256:"foto-diferente"}}),false);
 assert.equal(informeRatificado({acreditacion,revision,noche:{...noche,obac:"r1"},cierre}),false);
 assert.equal(informeRatificado({acreditacion,revision:{...revision,noches:{[fecha]:{...noche,maq:"r1"}}},noche:{...noche,maq:"r1"},cierre}),false);
});
