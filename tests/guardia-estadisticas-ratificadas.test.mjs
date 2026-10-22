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
test("estadísticas: acta real válida manda; sin acta válida la noche terminada cuenta con la dotación programada; una vez por noche",()=>{
 const f1="2026-10-14",f2="2026-10-15",f3="2026-10-16";
 const adic=Array.from({length:25},(_,i)=>({id:String(100+i),motivo:"Acudió a reforzar la guardia"}));
 const asis1={"4":"presente","3":"ausente","5":"presente","6":"presente",...Object.fromEntries(adic.map(a=>[a.id,"presente"]))};
 const a1=acta(f1,asis1,{adicionales:adic,excusas:{"3":"Enfermedad informada"},obacEfectivoId:"5",conductorEfectivoId:"4"});
 assert.equal(R.acreditacionVigente(a1,rev(f1),f1),true,"25 adicionales no invalidan el acta");
 // f2: acta con dotación cambiada después (no válida) → cuenta la dotación programada actual; f3: sin revisión
 const a2=acta(f2,{"4":"presente","3":"presente","5":"presente","6":"presente"});
 const r=E.calcularResumen({guardias:[{fechaIng:f1},{fechaIng:f1},{fechaIng:f2},{fechaIng:f3}],
   acreditaciones:{[f1]:{revision:rev(f1),acta:a1},[f2]:{revision:rev(f2,{...noche,maq:"6",vol:["5","4"]}),acta:a2}},rosterIds:ids,ahoraChile:"2026-10-21T10:00"});
 assert.equal(r.turnos,3,"una noche repetida cuenta una vez");
 assert.equal(r.por["5"].hechas,2,"noche 1 real + noche 2 automática");assert.equal(r.por["5"].obac,1,"OBAC efectivo acreditado");assert.equal(r.por["3"].obac,1,"en la noche 1 el OBAC programado ausente no suma; en la noche 2 (automática) sí");
 assert.equal(r.por["3"].excusadas,1);assert.equal(r.por["3"].falto,0);
 assert.equal(r.por["4"].maq,1);
 assert.equal(r.por["124"].adicionales,1);
 assert.equal(r.por["6"].hechas,2,"noche 1 real + noche 2 automática (dotación programada vigente)");
 assert.equal(r.pendientes,1,"solo la noche 3 (sin revisión aprobada) queda pendiente");
});

test("estadísticas: ya no se exige el cumplimiento final T3; un acta real válida de otro oficial cuenta",()=>{
 const f="2026-10-14",asis={"4":"presente","3":"ausente","5":"presente","6":"presente"};
 const porCapitan=acta(f,asis,{acreditadoPorCargo:"Capitán",cumplimientoFinal:null});
 assert.equal(R.acreditacionVigente(porCapitan,rev(f),f),false,"la regla histórica T3 sigue existiendo en acreditacionVigente");
 assert.equal(R.actaValida(porCapitan,rev(f),f),true);
 const r0=E.calcularResumen({guardias:[{fechaIng:f}],acreditaciones:{[f]:{revision:rev(f),acta:porCapitan}},rosterIds:ids,ahoraChile:"2026-10-21T10:00"});
 assert.equal(r0.por["5"].hechas,1);assert.equal(r0.por["3"].falto,1,"la ausencia anotada por el oficial se respeta");assert.equal(r0.pendientes,0);
 const legado=acta(f,asis);assert.equal(R.acreditacionVigente(legado,rev(f),f),true,"registro anterior al flujo creado por el T3");
});
test("noche terminada = cumplida: sin acta cuenta toda la dotación; en curso no; revisión sin aprobar no",()=>{
 const f="2026-10-14",n=noche;
 assert.equal(R.nocheTerminada(f,"2026-10-15T05:59"),false);assert.equal(R.nocheTerminada(f,"2026-10-15T06:00"),true);
 const a=R.actaEfectiva(null,rev(f),f,"2026-10-15T09:00");
 assert.deepEqual(a.asistentes.slice().sort(),["3","4","5","6"]);assert.deepEqual(a.ausentes,[]);
 assert.equal(a.obacEfectivoId,"3");assert.equal(a.conductorEfectivoId,"4");assert.equal(a.automatica,true);
 assert.equal(R.actaEfectiva(null,rev(f),f,"2026-10-15T05:00"),null,"noche en curso");
 assert.equal(R.actaEfectiva(null,{...rev(f),estado:"borrador"},f,"2026-10-15T09:00"),null,"revisión sin aprobar");
 const r=E.calcularResumen({guardias:[{fechaIng:f}],acreditaciones:{[f]:{revision:rev(f),acta:null}},rosterIds:ids,ahoraChile:"2026-10-15T09:00"});
 assert.equal(r.por["3"].hechas,1);assert.equal(r.por["3"].obac,1);assert.equal(r.por["4"].maq,1);assert.equal(r.pendientes,0);
 const sinCond=R.actaEfectiva(null,rev(f,{...n,maq:null}),f,"2026-10-15T09:00");
 assert.equal(sinCond.conductorEfectivoId,"","sin conductor queda marcado: no se inventa uno");
});
