import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync('public/legacy/germania-guardia-aviso.js','utf8');
function fixture(avisos){
 let eliminado=false;const botones=[];
 const host={innerHTML:'',remove(){eliminado=true;},querySelectorAll(){if(!this.innerHTML.includes('data-gn-aus-fecha'))return [];const b={dataset:{gnAusFecha:'2026-11-11'}};botones.push(b);return [b];}};
 const sel={value:'ayudante',addEventListener(){}},ref={parentNode:{}},nodos={miVoluntario:sel,avisosAusenciaOfi:host,misNochesInicio:ref};
 const destinos=[];const ctx={Date,Intl,document:{body:{getAttribute:()=> '0'},getElementById:id=>nodos[id]||null,createElement:()=>({}),head:{appendChild(){}},readyState:'loading',addEventListener(){}},window:{addEventListener(){},gnAbrirDiaGuardia:f=>destinos.push(f)},ROSTER:[{id:'ayudante',cargo:'Ayudante',nombre:'Ayudante',activo:true}],setInterval(){},setTimeout(){},fetch:async()=>({ok:true,json:async()=>({items:avisos.map(value=>({value}))})}),instanteChile:()=>Date.now()+3600000,gnAdd:f=>f};
 vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,host,botones,destinos,eliminado:()=>eliminado};
}
test('Ayudante ve un pendiente y Revisar día, sin Asignar reemplazo ni autoridad nueva',async()=>{
 const c=fixture([{f:'2026-11-11',id:'pablo',rol:'vol',estado:'abierto',por:'Pablo',en:'2026-11-11T19:00:00Z'}]);await c.ctx.window.GermaniaAvisoAusencia.refrescar();assert.match(c.host.innerHTML,/Revisar día/);assert.doesNotMatch(c.host.innerHTML,/Asignar reemplazo/);c.botones[0].onclick();assert.deepEqual(c.destinos,['2026-11-11']);
});
test('el mismo aviso resuelto no mantiene URGENTE ni falta reemplazo en la vista del Ayudante',async()=>{
 const c=fixture([{f:'2026-11-11',id:'pablo',rol:'vol',estado:'cubierto',reemplazoId:'ludwig',urgente:true}]);await c.ctx.window.GermaniaAvisoAusencia.refrescar();assert.equal(c.eliminado(),true);assert.equal(c.botones.length,0);
});
