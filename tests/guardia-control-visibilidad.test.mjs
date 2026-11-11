import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('public/legacy/germania-cierre-libro.js','utf8');
const inicio=source.slice(source.indexOf('const $=id=>'),source.indexOf('function claveBorradorObac'));
const oficial=source.slice(source.indexOf('function pintarOficial(){'),source.indexOf(' const terminadas=items.filter',source.indexOf('function pintarOficial(){')))+'\n}';
function fixture(){
 const nodos=Object.fromEntries(['lgnMandoHome','lgnObacHome','lgnAdminHome','lgnAdminPanel','lgnRatif','btnAdminGuardia','btnOficialesAcreditar'].map(id=>[id,{innerHTML:'contenido de oficial anterior',hidden:false,querySelector:()=>null}]));nodos.miVoluntario={value:'oficial'};
 const ctx={document:{getElementById:id=>nodos[id]||null},ROSTER:[{id:'oficial',cargo:'Teniente Tercero'},{id:'voluntario',cargo:'Voluntario'}],console:{warn(){}},Date,Intl,fetch:async()=>{throw Error('Sin conexión');},window:{}};
 vm.createContext(ctx);vm.runInContext(inicio,ctx);
 vm.runInContext('function pintarOBAC(){};function pintarOficial(){};function pintarControlAdmin(){};function semanaDe(){return "2026-11-11"};actual="oficial";t3=true;oficial=true;items=[{fecha:"2026-10-18"}];',ctx);
 return {ctx,nodos,run:code=>vm.runInContext(code,ctx)};
}
test('cambiar a voluntario limpia al instante las tarjetas del oficial incluso sin red',async()=>{
 const c=fixture();c.nodos.miVoluntario.value='voluntario';const p=c.run('cargar(true)');
 assert.equal(c.nodos.lgnMandoHome.innerHTML,'');assert.equal(c.nodos.lgnAdminPanel.hidden,true);assert.equal(c.nodos.lgnRatif.hidden,true);assert.equal(c.run('t3||capitan||admin||oficial'),false);assert.equal(c.run('items.length'),0);
 await p;assert.equal(c.nodos.lgnMandoHome.innerHTML,'');
});
test('una respuesta tardía del oficial no restaura su tarjeta en la vista de voluntario y consulta la nueva identidad',async()=>{
 const c=fixture(),pedidos=[];let resolver;
 c.ctx.fetch=url=>{pedidos.push(url);if(pedidos.length===1)return new Promise(r=>{resolver=r;});return Promise.resolve({ok:true,json:async()=>({items:[],puedeRatificar:false,esCapitan:false,esAdmin:false,esOficial:false})});};
 const antiguo=c.run('cargar(true)');c.nodos.miVoluntario.value='voluntario';await c.run('cargar(true)');assert.equal(c.nodos.lgnMandoHome.innerHTML,'');
 resolver({ok:true,json:async()=>({items:[{fecha:'2026-10-18'}],puedeRatificar:true,esOficial:true})});await antiguo;await new Promise(r=>setImmediate(r));
 assert.equal(pedidos.length,2);assert.match(pedidos[1],/actorId=voluntario/);assert.equal(c.run('actual'),'voluntario');assert.equal(c.run('t3||oficial'),false);assert.equal(c.run('items.length'),0);assert.equal(c.nodos.lgnMandoHome.innerHTML,'');
});
test('cambiar identidad sale de la edición anterior; actualizar la misma identidad conserva su formulario',async()=>{
 const c=fixture();let consultas=0;c.ctx.fetch=async()=>{consultas++;throw Error('Sin red');};
 c.run('editando=true');await c.run('cargar(true)');assert.equal(consultas,0);assert.equal(c.run('editando'),true);
 c.nodos.miVoluntario.value='voluntario';await c.run('cargar(true)');assert.equal(consultas,1);assert.equal(c.run('editando'),false);assert.equal(c.nodos.lgnMandoHome.innerHTML,'');
});
test('pintar un resultado sin mando limpia también el resumen previo de Inicio',()=>{
 const c=fixture();let llamadas=0;c.ctx.pintarResumenMando=()=>{llamadas++;c.nodos.lgnMandoHome.innerHTML='';};c.run('t3=false;capitan=false;');c.run(oficial);c.run('pintarOficial()');assert.equal(llamadas,1);assert.equal(c.nodos.lgnMandoHome.innerHTML,'');assert.equal(c.nodos.lgnRatif.hidden,true);
});
