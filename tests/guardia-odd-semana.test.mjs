import test from "node:test";
import assert from "node:assert/strict";
import {fechasSemanaGuardia,proyectarSemanaODD} from "../lib/guardia-odd-semana.mjs";

const nomina=[
  {id:"v1",clave:"101",nombre:"Ana",apellidoPaterno:"Müller"},
  {id:"v2",clave:"102",nombre:"Luis",apellidoPaterno:"Pérez"},
  {id:"obac",clave:"201",nombre:"Tomás",apellidoPaterno:"Lara"},
  {id:"maq",clave:"301",nombre:"Mario",apellidoPaterno:"Soto"},
];
const inicio="2026-10-14";
const revision=()=>{
  const noches=Object.fromEntries(fechasSemanaGuardia(inicio).map(f=>[f,{vol:["v1","v2"],obac:"obac",maq:"maq"}]));
  return {inicio,estado:"aprobada",noches};
};
test("la semana consta siempre de miércoles a martes: siete días exactos",()=>{
  const fechas=fechasSemanaGuardia(inicio);
  assert.equal(fechas.length,7);
  assert.deepEqual(fechas,["2026-10-14","2026-10-15","2026-10-16","2026-10-17","2026-10-18","2026-10-19","2026-10-20"]);
  assert.throws(()=>fechasSemanaGuardia("2026-10-15"),/miércoles/);
  assert.throws(()=>fechasSemanaGuardia("2026-02-30"),/válido|miércoles/);
});
test("anexo real incluye siete noches, OBAC, maquinista y dos voluntarios distintos",()=>{
  const filas=proyectarSemanaODD(inicio,revision(),nomina);
  assert.equal(filas.length,7);
  assert.equal(filas[0].obac,"Tomás Lara");
  assert.equal(filas[0].driver,"Mario Soto");
  assert.equal(filas[6].date,"2026-10-20");
  assert.deepEqual(filas[0].people.map(p=>p.name),["Ana Müller","Luis Pérez"]);
  assert.ok(filas.every(n=>n.complete));
});
test("semana incompleta no bloquea: se muestran siete noches y faltantes",()=>{
  const r=revision();
  delete r.noches["2026-10-19"];
  r.noches["2026-10-15"]={vol:["v1"],obac:null,maq:null};
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas.length,7);
  assert.equal(filas[5].date,"2026-10-19");
  assert.equal(filas[5].registrado,false);
  assert.equal(filas[5].obac,"Sin asignar");
  assert.equal(filas[5].driver,"Sin asignar");
  assert.equal(filas[5].faltantesVoluntarios,2);
  assert.ok(filas[5].faltan.includes("Sin registro de dotación"));
  assert.equal(filas[1].complete,false);
  assert.ok(filas[1].faltan.includes("Conductor sin asignar"));
  assert.ok(filas[1].faltan.includes("OBAC sin asignar"));
});
test("la semana en borrador también permite emitir con estado visible",()=>{
  const borrador={...revision(),estado:"borrador"};
  const filas=proyectarSemanaODD(inicio,borrador,nomina);
  assert.equal(filas.length,7);
  assert.equal(filas[0].estadoRevision,"borrador");
});
test("sin revisión la semana muestra siete noches sin inventar personal",()=>{
  const filas=proyectarSemanaODD(inicio,null,nomina);
  assert.equal(filas.length,7);
  assert.ok(filas.every(x=>!x.complete && x.estadoRevision==="sin revisión" && !x.registrado));
});
test("la revisión de otra semana no se puede mezclar con el período",()=>{
  assert.throws(()=>proyectarSemanaODD(inicio,{...revision(),inicio:"2026-10-21"},nomina),/otra semana/);
});
test("cuatro roles no pueden duplicar una misma persona",()=>{
  const r=revision();r.noches["2026-10-15"].maq="v1";
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas[1].complete,false);
});
test("apoyo externo aparece como conductor, sin incorporarlo a nómina",()=>{
  const r=revision();
  r.noches["2026-10-17"].maq="apoyo-cuerpo:david-briones";
  r.noches["2026-10-17"].apoyoExterno={id:"apoyo-cuerpo:david-briones",nombre:"David Briones"};
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas[3].driver,"David Briones");
  assert.equal(filas[3].complete,true);
  assert.equal(nomina.length,4);
});
test("integrante no reconocido queda marcado pendiente sin impedir la emisión",()=>{
  const r=revision();r.noches["2026-10-18"].obac="inexistente";
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas[4].complete,false);
  assert.equal(filas[4].obac,"Sin identificar");
});

test("la dotación vacía puede figurar sin inventar ocupantes",()=>{
  const r=revision();r.noches["2026-10-20"]={vol:[],obac:null,maq:null};
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas[6].total,0);
  assert.equal(filas[6].faltantesVoluntarios,2);
  assert.equal(filas[6].complete,false);
  assert.deepEqual(filas[6].people,[]);
});
