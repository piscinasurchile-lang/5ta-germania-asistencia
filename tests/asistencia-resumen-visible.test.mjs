import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("../public/legacy/germania-resumen-asistencia.js",import.meta.url),"utf8");
const loader=readFileSync(new URL("../public/legacy/germania-actualizar.js",import.meta.url),"utf8");

function modulo(){
  const window={};
  const listeners={};
  const document={readyState:"loading",addEventListener:(name,fn)=>{listeners[name]=fn}};
  vm.runInNewContext(source,{window,document,console});
  return {contar:window.GermaniaResumenAsistencia.contar,listeners};
}
test("resume integrantes activos y desglosa ausentes y justificados",()=>{
  const {contar}=modulo();
  const roster=[
    {id:"a",activo:true},{id:"b",activo:true},{id:"c",activo:true},
    {id:"d",activo:true},{id:"baja",activo:false}
  ];
  const c=contar(roster,{a:"presente",b:"presente",c:"justificado",d:"ausente",baja:"presente"});
  assert.equal(c.total,4);
  assert.equal(c.presente,2);
  assert.equal(c.ausente,1);
  assert.equal(c.justificado,1);
  assert.equal(c.noPresentes,2);
  assert.equal(c.porcentaje,50);
  assert.equal(c.presente+c.ausente+c.justificado,c.total);
});
test("sin lista la asistencia es 0 %, no NaN",()=>{
  const c=modulo().contar([],{});
  assert.equal(c.total,0);
  assert.equal(c.porcentaje,0);
});
test("sin marcar se cuenta ausente, igual que el formulario actual",()=>{
  const c=modulo().contar([{id:"a"},{id:"b"},{id:"c"}],{a:"presente"});
  assert.equal(c.total,3);
  assert.equal(c.ausente,2);
  assert.equal(c.noPresentes,2);
  assert.equal(c.porcentaje,33);
});
test("el resumen se actualiza por clicks, cambios de fecha y carga de datos",()=>{
  assert.match(source,/tbody\.addEventListener\("click"/);
  assert.match(source,/marcarTodosBtn/);
  assert.match(source,/MutationObserver\(actualizar\)/);
  assert.match(source,/tabla\.insertAdjacentElement\("afterend",seccion\)/);
  assert.match(loader,/germania-resumen-asistencia\.js\?v=20261014a/);
});
test("no duplica resumen al guardar ni modifica datos operativos",()=>{
  assert.match(source,/resumenAnterior\.hidden=true/);
  assert.match(source,/No presentes = ausentes \+ justificados/);
  assert.doesNotMatch(source,/fetch\(|localStorage|POST|PATCH|DELETE|\.value\s*=/);
});
