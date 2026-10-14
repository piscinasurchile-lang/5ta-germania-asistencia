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
test("sin aprobación no se permite construir ODD oficial",()=>{
  const borrador={...revision(),estado:"borrador"};
  assert.throws(()=>proyectarSemanaODD(inicio,borrador,nomina),/aprobada/);
});
test("una noche sin registro impide crear anexo semanal falso",()=>{
  const r=revision();delete r.noches["2026-10-19"];
  assert.throws(()=>proyectarSemanaODD(inicio,r,nomina),/Falta la dotación/);
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
test("un integrante no reconocido queda marcado pendiente y no habilita emisión",()=>{
  const r=revision();r.noches["2026-10-18"].obac="inexistente";
  const filas=proyectarSemanaODD(inicio,r,nomina);
  assert.equal(filas[4].complete,false);
  assert.equal(filas[4].obac,"Sin identificar");
});
