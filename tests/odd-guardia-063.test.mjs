import test from "node:test";
import assert from "node:assert/strict";
import {validarODDGuardia} from "../lib/odd-guardia-063-validacion.mjs";

const start="2026-10-14";
function semana(){
 return Array.from({length:7},(_,i)=>{
  const d=new Date(start+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+i);
  return {date:d.toISOString().slice(0,10),registrado:true,complete:true,
   estadoRevision:"aprobada",obac:"OBAC Test",driver:"Conductor Test",
   people:[{name:"Voluntario Uno"},{name:"Voluntario Dos"},{name:"Voluntario Tres"}]};
 });
}
const datos=()=>({semana:semana(),year:2026,number:"063",issueDate:"2026-10-14",oddAnterior:"060/2026"});
test("ODD 063: validar semana completa de siete noches consecutivas",()=>{
 assert.deepEqual(validarODDGuardia(datos()),{inicio:"2026-10-14",fin:"2026-10-20"});
});
test("No emite si falta OBAC, conductor o dotación mínima",()=>{
 for(const field of ["obac","driver","people"]){
  const d=datos();if(field==="people")d.semana[4].people=[];else d.semana[4][field]="Sin asignar";
  assert.throws(()=>validarODDGuardia(d),/incompleta/);
 }
});
test("No emite guardia sin aprobación o duplicada",()=>{
 const d=datos();d.semana[0].estadoRevision="borrador";
 assert.throws(()=>validarODDGuardia(d),/incompleta/);
 const e=datos();e.semana[0].people[0].name=e.semana[0].obac;
 assert.throws(()=>validarODDGuardia(e),/duplicada/);
});
test("No emite con fecha o correlativo inválidos",()=>{
 const d=datos();d.number="ABC";assert.throws(()=>validarODDGuardia(d),/Numeración/);
 const e=datos();e.issueDate="2026-99-14";assert.throws(()=>validarODDGuardia(e),/Fecha/);
});
test("No emite con noches de otra semana",()=>{
 const d=datos();d.semana[3].date="2026-10-25";
 assert.throws(()=>validarODDGuardia(d),/Semana/);
});


test("ODD admite siete noches con2 voluntarios, OBAC y conductor; rechaza1",()=>{
 const d=datos();d.semana.forEach(n=>n.people=n.people.slice(0,2));
 assert.deepEqual(validarODDGuardia(d),{inicio:"2026-10-14",fin:"2026-10-20"});
 d.semana[2].people=d.semana[2].people.slice(0,1);assert.throws(()=>validarODDGuardia(d),/incompleta/);
});
