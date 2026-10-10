import test from "node:test";
import assert from "node:assert/strict";
import { nombreOficial } from "../app/api/guardia/acreditacion/route.js";
import { validarAcreditacion } from "../lib/guardia-acreditacion.js";
const roster=[
  {id:"t3",nombre:"Tomás",apellidoPaterno:"Lara",apellidoMaterno:"Soto",cargo:"Teniente 3",activo:true},
  {id:"c",nombre:"Fernando",apellidoPaterno:"Jerez",apellidoMaterno:"Pantoja",cargo:"Capitán",activo:true}
];
test("registra nombre completo del T3 tomado del roster, no texto del cliente",()=>{
  assert.equal(nombreOficial(roster,"t3"),"Tomás Lara Soto");
  assert.equal(nombreOficial(roster,"c"),"Fernando Jerez Pantoja");
  assert.equal(nombreOficial(roster,"no-existe"),null);
  assert.equal(nombreOficial([{...roster[0],activo:false}],"t3"),null);
  assert.equal(nombreOficial([{...roster[0],apellidoPaterno:""}],"t3"),null);
});
test("un nombre visible no concede el cargo de T3",()=>{
  const n={maq:"m",obac:"o",vol:["v1","v2"]};
  const rev={estado:"aprobada",aprobadaEn:"2026-10-14",noches:{"2026-10-14":n}};
  const p={fecha:"2026-10-14",noche:n,revision:rev,asistencias:{m:"presente",o:"presente",v1:"presente",v2:"ausente"},ahoraLocal:"2026-10-15T09:00",roster};
  assert.equal(validarAcreditacion({...p,actor:"c"}),"solo_teniente_tercero");
  assert.equal(validarAcreditacion({...p,actor:"t3"}),null);
});
