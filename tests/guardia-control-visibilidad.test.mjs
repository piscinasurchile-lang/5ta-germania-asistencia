import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('public/legacy/germania-cierre-libro.js','utf8');
const inicio=source.slice(source.indexOf('const $=id=>'),source.indexOf('function claveBorradorObac'));
const oficial=source.slice(source.indexOf('function pintarOficial(){'),source.indexOf(' const terminadas=items.filter',source.indexOf('function pintarOficial(){')))+'\n}';
function fixture(){
 const nodos=Object.fromEntries(['lgnMandoHome','lgnObacHome','lgnAdminHome','lgnAdminPanel','lgnRatif','btnAdminGuardia','btnOficialesAcreditar'].map(id=>[id,{innerHTML:'contenido de oficial anterior',hidden:false,querySelector:()=>null,querySelectorAll:()=>[]}]));nodos.miVoluntario={value:'oficial'};
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
const helpers=source.slice(source.indexOf('function coordinaGuardiaInicio('),source.indexOf('function pintarResumenMando('));
const resumen=source.slice(source.indexOf('function pintarResumenMando('),source.indexOf('async function marcarVisto('));
test('el control de Inicio solo corresponde a T3 y Ayudante activos',()=>{
 const c=fixture();c.run(helpers);
 for(const cargo of ['Teniente Tercero','Teniente 3','Ayudante','Ayudante de Capitán']){c.ctx.persona={cargo,activo:true};assert.equal(c.run('coordinaGuardiaInicio(persona)'),true,cargo);}
 for(const cargo of ['Voluntario','Voluntaria','Capitán','Teniente Primero','Teniente Segundo','Director','Secretario']){c.ctx.persona={cargo,activo:true};assert.equal(c.run('coordinaGuardiaInicio(persona)'),false,cargo);}
 c.ctx.persona={cargo:'Teniente Tercero',activo:false};assert.equal(c.run('coordinaGuardiaInicio(persona)'),false);
});
test('el Ayudante consulta sin recibir botones de aprobación en el resumen',()=>{
 const c=fixture();c.ctx.ROSTER[0].cargo='Ayudante de Capitán';c.run(helpers);c.run(resumen);c.run('t3=false;oficial=true;items=[{acreditacionVigente:true}];pintarResumenMando();');
 assert.match(c.nodos.lgnMandoHome.innerHTML,/Consultar guardias/);assert.doesNotMatch(c.nodos.lgnMandoHome.innerHTML,/Revisar y aprobar|data-lgn-t3-noche/);
});
test('el T3 conserva las tareas operativas dentro del control',()=>{
 const c=fixture();c.run(helpers);c.run(resumen);c.run('items=[{fecha:"2026-10-18",finalizada:true,cierre:{},acreditacionVigente:false}];pintarResumenMando();');assert.match(c.nodos.lgnMandoHome.innerHTML,/Revisar y aprobar/);
});
test('el desplegable inicia cerrado, conserva su apertura y mantiene el botón original con su acción',()=>{
 function nodo(tag){return {tag,dataset:{},style:{},children:[],open:false,get firstChild(){return this.children[0]||null;},appendChild(x){if(x.parent)x.parent.children.splice(x.parent.children.indexOf(x),1);this.children.push(x);x.parent=this;},querySelectorAll:()=>[]};}
 const c=fixture();c.ctx.document.createElement=nodo;c.run(helpers);
 for(const abierto of [false,true]){const host=nodo('host'),boton=nodo('button');let acciones=0;boton.onclick=()=>acciones++;host.appendChild(boton);c.ctx.hostPrueba=host;c.ctx.abiertoPrueba=abierto;c.run('plegarResumenMando(hostPrueba,abiertoPrueba)');const details=host.firstChild;assert.equal(details.tag,'details');assert.equal(details.open,abierto);assert.equal(details.children[0].tag,'summary');assert.equal(details.children[1].firstChild,boton);details.children[1].firstChild.onclick();assert.equal(acciones,1);}
});

const controlAdmin=source.slice(source.indexOf('function pintarControlAdmin(){'),source.indexOf(' if(!panel)return;',source.indexOf('function pintarControlAdmin(){')))+'\n}';
test('el administrador usa su control existente plegado, sin una segunda tarjeta de mando',()=>{
 const c=fixture();c.ctx.ROSTER[0].cargo='Voluntario';c.ctx.ROSTER[0].clave='517';c.run(helpers);c.run(resumen);c.run(controlAdmin);let llamadas=0,abierto;
 c.ctx.plegarResumenMando=(host,estado)=>{llamadas++;abierto=estado;assert.equal(host,c.nodos.lgnAdminHome);};c.ctx.semanaVigente48=()=>true;
 c.run('admin=true;items=[];pintarResumenMando();pintarControlAdmin();');
 assert.equal(c.nodos.lgnMandoHome.innerHTML,'');assert.equal(llamadas,1);assert.equal(abierto,false);assert.match(c.nodos.lgnAdminHome.innerHTML,/Abrir consulta de guardias/);
});
test('el control del administrador conserva su apertura en actualizaciones',()=>{
 const c=fixture();c.run(controlAdmin);c.ctx.semanaVigente48=()=>true;c.nodos.lgnAdminHome.querySelector=()=>({open:true});let abierto;
 c.ctx.plegarResumenMando=(host,estado)=>{abierto=estado;};c.run('admin=true;items=[];pintarControlAdmin();');assert.equal(abierto,true);
});
