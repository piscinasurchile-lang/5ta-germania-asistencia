import test from "node:test";
import assert from "node:assert/strict";
import "../public/legacy/germania-guardia-reglas.js";
import "../public/legacy/germania-guardia-estadisticas.js";
import {firmaDotacion} from "../lib/guardia-acreditacion.js";
const R=globalThis.GermaniaGuardiaReglas,E=globalThis.GermaniaGuardiaEstadisticas;
const noche={maq:"4",obac:"3",vol:["5","6"]};
const aprobadaEn="2026-10-13T10:00:00Z";
const rev=(f,n=noche)=>({estado:"aprobada",aprobadaEn,noches:{[f]:n}});
const ids=["1","3","4","5","6",...Array.from({length:25},(_,i)=>String(100+i))];
function acta(f,asis,extra={}){
 const pres=Object.keys(asis).filter(i=>asis[i]==="presente"),aus=Object.keys(asis).filter(i=>asis[i]==="ausente");
 return {fecha:f,estado:"acreditada",revisionAprobadaEn:aprobadaEn,dotacionFirma:firmaDotacion(noche),asistencias:asis,asistentes:pres,ausentes:aus,adicionales:[],excusas:{},...extra};
}
test("estadísticas: solo noches ratificadas y vigentes, una vez por noche, con OBAC/conductor efectivos y 25 adicionales",()=>{
 const f1="2026-10-14",f2="2026-10-15",f3="2026-10-16";
 const adic=Array.from({length:25},(_,i)=>({id:String(100+i),motivo:"Acudió a reforzar la guardia"}));
 const asis1={"4":"presente","3":"ausente","5":"presente","6":"presente",...Object.fromEntries(adic.map(a=>[a.id,"presente"]))};
 const a1=acta(f1,asis1,{adicionales:adic,excusas:{"3":"Enfermedad informada"},obacEfectivoId:"5",conductorEfectivoId:"4"});
 assert.equal(R.acreditacionVigente(a1,rev(f1),f1),true,"25 adicionales no invalidan el acta");
 // f2: acta con dotación cambiada después (no vigente) ; f3: sin acta
 const a2=acta(f2,{"4":"presente","3":"presente","5":"presente","6":"presente"});
 const r=E.calcularResumen({guardias:[{fechaIng:f1},{fechaIng:f1},{fechaIng:f2},{fechaIng:f3}],
   acreditaciones:{[f1]:{revision:rev(f1),acta:a1},[f2]:{revision:rev(f2,{...noche,maq:"6",vol:["5","4"]}),acta:a2}},rosterIds:ids,ahoraChile:"2026-10-21T10:00"});
 assert.equal(r.turnos,3,"una noche repetida cuenta una vez");
 assert.equal(r.por["5"].hechas,1);assert.equal(r.por["5"].obac,1,"OBAC efectivo acreditado");assert.equal(r.por["3"].obac,0,"el OBAC programado ausente no suma");
 assert.equal(r.por["3"].excusadas,1);assert.equal(r.por["3"].falto,0);
 assert.equal(r.por["4"].maq,1);
 assert.equal(r.por["124"].adicionales,1);
 assert.equal(r.por["6"].hechas,1,"solo la noche 1; la noche 2 no vigente no suma");
 assert.equal(r.pendientes,2,"noche 2 (acta no vigente) y noche 3 (sin acta) quedan pendientes");
});

test("estadísticas: una ratificación de otro oficial no cuenta hasta que el T3 acredita el cumplimiento final",()=>{
 const f="2026-10-14",asis={"4":"presente","3":"presente","5":"presente","6":"presente"};
 const porCapitan=acta(f,asis,{acreditadoPorCargo:"Capitán",cumplimientoFinal:null});
 assert.equal(R.acreditacionVigente(porCapitan,rev(f),f),false);
 const r0=E.calcularResumen({guardias:[{fechaIng:f}],acreditaciones:{[f]:{revision:rev(f),acta:porCapitan}},rosterIds:ids,ahoraChile:"2026-10-21T10:00"});
 assert.equal(r0.por["5"]?.hechas||0,0);assert.equal(r0.pendientes,1);
 const conT3=acta(f,asis,{acreditadoPorCargo:"Capitán",cumplimientoFinal:{estado:"acreditado",porId:"9"}});
 assert.equal(R.acreditacionVigente(conT3,rev(f),f),true);
 const r1=E.calcularResumen({guardias:[{fechaIng:f}],acreditaciones:{[f]:{revision:rev(f),acta:conT3}},rosterIds:ids,ahoraChile:"2026-10-21T10:00"});
 assert.equal(r1.por["5"].hechas,1);
 const legado=acta(f,asis);assert.equal(R.acreditacionVigente(legado,rev(f),f),true,"registro anterior al flujo creado por el T3");
});
