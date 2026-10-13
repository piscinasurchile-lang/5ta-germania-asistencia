import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('public/legacy/germania-roles.js','utf8');
function setup(fail=false){
 const writes=[]; const member={id:517};
 const context={miembro:()=>member,novReadPending:{},novVisible:[{id:'aviso1'}],novReadKey:id=>'novedad-lecturas:'+id,sAddToList:async(...args)=>{writes.push(args);if(fail)throw Error('offline');},renderNovedades:async()=>{},Date};
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('async function confirmarLectura('),source.indexOf('async function publicarNovedad(')),context);
 return {context,writes,member};
}
test('confirma el aviso con identidad y fecha usando agregado atómico único',async()=>{
 const {context,writes}=setup();const button={};await context.confirmarLectura('aviso1',button);
 assert.equal(writes[0][0],'novedad-lecturas:aviso1');assert.equal(writes[0][1].voluntarioId,'517');assert.equal(writes[0][2].uniqueBy,'voluntarioId');assert.ok(Date.parse(writes[0][1].en));assert.equal(button.textContent,'✓ Lectura confirmada');
});
test('fallo de guardado permite reintento sin confirmar falsamente',async()=>{
 const {context}=setup(true);const button={};await context.confirmarLectura('aviso1',button);assert.equal(button.disabled,false);assert.equal(button.textContent,'Reintentar confirmar lectura');assert.equal(context.novReadPending.aviso1,undefined);
});
test('sin identidad o con aviso ausente no escribe',async()=>{
 const {context,writes}=setup();await context.confirmarLectura('otro',{});context.miembro=()=>null;await context.confirmarLectura('aviso1',{});assert.equal(writes.length,0);
});
test('doble pulsación mientras guarda produce una sola escritura',async()=>{
 const {context,writes}=setup();await Promise.all([context.confirmarLectura('aviso1',{}),context.confirmarLectura('aviso1',{})]);assert.equal(writes.length,1);
});
