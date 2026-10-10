import test from "node:test";
import assert from "node:assert/strict";
import { firmaDotacion } from "../lib/guardia-acreditacion.js";
import "../public/legacy/germania-guardia-reglas.js";
import "../public/legacy/germania-guardia-estadisticas.js";

const f="2026-10-14", aprobadoEn="2026-10-10T13:30:00Z";
const n={maq:"m1",obac:"o1",vol:["v1","v2"]};
const ids=["m1","o1","v1","v2","v3"];
const r={estado:"aprobada",aprobadaEn:aprobadoEn,noches:{[f]:n}};
const g={fechaIng:f,fechaSal:"2026-10-15",horaSal:"08:00",
  oficial:"o1",conductor:"m1",guardianes:[{id:"v1"},{id:"v2"}]};
const acta=(noche,asistentes,ausentes=[])=>({
  fecha:f,estado:"acreditada",revisionAprobadaEn:aprobadoEn,dotacionFirma:firmaDotacion(noche),
  asistentes,ausentes,asistencias:Object.fromEntries([
    ...asistentes.map(id=>[id,"presente"]),...ausentes.map(id=>[id,"ausente"])
  ])
});
function resumen({guardia=g,rev=r,actaReal=null,ahora="2026-10-15T09:00"}={}){
  return globalThis.GermaniaGuardiaEstadisticas.calcularResumen({
    guardias:[guardia],acreditaciones:{[f]:{acta:actaReal,revision:rev}},
    rosterIds:ids,ahoraChile:ahora
  });
}
test("inscritos / dotación aprobada / noche vencida no generan cumplimiento",()=>{
 const out=resumen();
 assert.equal(out.pendientes,1);
 assert.equal(out.asign,4);
 assert.deepEqual(ids.map(id=>out.por[id].hechas),[0,0,0,0,0]);
 assert.equal(out.por.o1.obac,0);
 assert.equal(out.por.m1.maq,0);
});
test("acreditación real suma a cada asistente exactamente una vez, incluyendo roles",()=>{
 const out=resumen({actaReal:acta(n,["m1","o1","v1"],["v2"])});
 assert.equal(out.pendientes,0);
 assert.deepEqual(ids.map(id=>out.por[id].hechas),[1,1,1,0,0]);
 assert.equal(out.por.o1.obac,1);
 assert.equal(out.por.m1.maq,1);
 assert.equal(out.por.v2.falto,1);
});
test("cambio posterior de voluntario invalida acreditación previa, sin borrar historial",()=>{
 const nuevo={...n,vol:["v1","v3"]};
 const nuevoR={...r,noches:{[f]:nuevo}};
 const actaVieja=acta(n,["m1","o1","v1","v2"]);
 const out=resumen({rev:nuevoR,actaReal:actaVieja});
 assert.equal(out.pendientes,1);
 assert.equal(out.por.v2.hechas,0);
 assert.equal(out.por.v3.hechas,0);
});
test("reemplazo acreditado: sale original y gana únicamente quien cubrió",()=>{
 const nuevo={...n,vol:["v1","v3"]};
 const nuevoR={...r,noches:{[f]:nuevo}};
 const cambio={...g,guardianes:[{id:"v1"},{id:"v2",reemplazo:"v3"}]};
 const ok=resumen({guardia:cambio,rev:nuevoR,actaReal:acta(nuevo,["m1","o1","v1","v3"])});
 assert.equal(ok.pendientes,0);
 assert.equal(ok.por.v2.ced,1);
 assert.equal(ok.por.v2.hechas,0);
 assert.equal(ok.por.v3.cubrio,1);
 assert.equal(ok.por.v3.hechas,1);
 assert.equal(ok.por.o1.hechas,1);
 assert.equal(ok.por.m1.hechas,1);
});
test("duplicados antiguos en guardianes no suman noches cumplidas extra",()=>{
 const dup={...g,guardianes:[{id:"v1"},{id:"v1"},{id:"v2",reemplazo:"v3"},{id:"v2",reemplazo:"v3"}]};
 const nuevo={...n,vol:["v1","v3"]};
 const result=resumen({guardia:dup,rev:{...r,noches:{[f]:nuevo}},
   actaReal:acta(nuevo,["m1","o1","v1","v3"])});
 assert.equal(result.por.v3.hechas,1);
 assert.equal(result.por.v3.cubrio,1);
 assert.equal(result.por.v2.ced,1);
 assert.equal(result.turnos,1);
});
test("antes del término del turno no figura como pendiente",()=>{
 assert.equal(resumen({ahora:"2026-10-14T23:30"}).pendientes,0);
});
