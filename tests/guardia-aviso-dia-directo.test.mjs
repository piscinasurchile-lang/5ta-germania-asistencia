import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const roles=await readFile('public/legacy/germania-roles.js','utf8');
const abrir=roles.slice(roles.indexOf('var abriendoDiaGuardia='),roles.indexOf('var botonGestion='));
function contexto(permitido=true){const llamadas=[];const ctx={Date,Number,GR:{},gnPlanDraft:{inicio:'2026-11-04'},gnElegirSemana:async inicio=>{ctx.gnPlanDraft={inicio};},gnTablaSemanaVisible:'',window:{gnPuedePrepararAsignacion:()=>permitido,gnAbrirAsignacion:(...args)=>llamadas.push(['dia',...args]),__mostrarPestana:(...args)=>{ctx.gnTablaSemanaVisible=ctx.gnPlanDraft.inicio;llamadas.push(['vista',...args]);}}};vm.createContext(ctx);vm.runInContext(abrir,ctx);return {ctx,llamadas};}
test('un aviso abre una sola vista y el día correcto de su semana, también al cruzar mes y año',async()=>{
 for(const [fecha,inicio] of [['2026-11-11','2026-11-11'],['2026-11-17','2026-11-11'],['2027-01-01','2026-12-30']]){
  const {ctx,llamadas}=contexto();assert.equal(await ctx.window.gnAbrirDiaGuardia(fecha),true);
  assert.deepEqual(llamadas,[['vista','guardia'],['dia',inicio,fecha]]);assert.equal(ctx.GR.semana,inicio);assert.equal(ctx.GR.buscada,true);assert.equal(ctx.gnTablaSemanaVisible,inicio);
 }
});
test('fechas inválidas o actor sin acceso no navegan ni cambian selección',async()=>{
 for(const fecha of ['2026-02-30','2026-11-11x','',null]){const {ctx,llamadas}=contexto();assert.equal(await ctx.window.gnAbrirDiaGuardia(fecha),false);assert.deepEqual(llamadas,[]);}
 const {ctx,llamadas}=contexto(false);assert.equal(await ctx.window.gnAbrirDiaGuardia('2026-11-11'),false);assert.deepEqual(llamadas,[]);
});

test('espera la selección del calendario y rechaza una segunda apertura simultánea',async()=>{
 const {ctx,llamadas}=contexto();let resolver;ctx.gnElegirSemana=inicio=>new Promise(r=>{resolver=()=>{ctx.gnPlanDraft={inicio};r();};});
 const primera=ctx.window.gnAbrirDiaGuardia('2026-11-13');assert.deepEqual(llamadas,[]);
 assert.equal(await ctx.window.gnAbrirDiaGuardia('2026-11-17'),false);resolver();assert.equal(await primera,true);
 assert.equal(ctx.gnTablaSemanaVisible,'2026-11-11');assert.equal(llamadas.at(-1)[2],'2026-11-13');
});
test('una lectura fallida del calendario no abre una semana distinta',async()=>{
 const {ctx,llamadas}=contexto();ctx.gnElegirSemana=async()=>{};
 assert.equal(await ctx.window.gnAbrirDiaGuardia('2026-11-13'),false);assert.deepEqual(llamadas,[]);
});
const entrada=await readFile('public/legacy/germania-guardia-asignacion-entrada.js','utf8');
function entradaContext(){
 const observadores=[];const handlers={};let cargas=0,seleccion=0,lista=false;
 const doc={defaultView:{location:{search:'?inicio=2026-11-04'}},body:{},getElementById:()=>({textContent:lista?'Dotación':'Cargando…'}),querySelector:s=>{const i=Number(s.match(/data-day="(\d)"/)[1]);if(s.includes('.active'))return seleccion===i?{}:null;return {click:()=>{if(lista)seleccion=i;},classList:{contains:()=>seleccion===i}};}};
 const frame={contentDocument:doc,contentWindow:{postMessage(){}},hidden:true,style:{},addEventListener:(k,f)=>{handlers[k]=f;},removeAttribute(){},get src(){return this._src;},set src(v){this._src=v;cargas++;}};
 const panel={style:{},open:false,addEventListener(){},scrollIntoView(){}};
 const els={gnAsignacionPanel:panel,gnAsignacionFrame:frame,gnGestionEstado:{}};
 class Observer{constructor(fn){this.fn=fn;observadores.push(this);}observe(){}disconnect(){}}
 const ctx={URLSearchParams,Date,Number,Math,gnTablaSemanaVisible:'',document:{getElementById:k=>els[k]||null},MutationObserver:Observer,location:{origin:'http://germania'},window:{gnPuedePrepararAsignacion:()=>true,addEventListener(){}}};vm.createContext(ctx);vm.runInContext(entrada,ctx);
 return {ctx,frame,doc,listo:()=>{lista=true;},seleccion:()=>seleccion,cargas:()=>cargas,load:()=>handlers.load(),mutar:()=>observadores.forEach(o=>o.fn())};
}
test('el selector externo espera el documento de la semana pedida y su carga antes de elegir el día',()=>{
 const c=entradaContext();c.listo();c.ctx.window.gnAbrirAsignacion('2026-11-11','2026-11-17');
 assert.equal(c.seleccion(),0,'no consume la petición sobre el documento anterior');
 c.doc.defaultView.location.search='?inicio=2026-11-11';c.load();assert.equal(c.seleccion(),6);
 const cargas=c.cargas();c.ctx.window.gnAbrirAsignacion('2026-11-11','2026-11-13');assert.equal(c.seleccion(),2);assert.equal(c.cargas(),cargas,'otro aviso de la misma semana no recarga el iframe');
});
test('la petición de día sobrevive a la carga asíncrona sin un temporizador de navegación',()=>{
 const c=entradaContext();c.ctx.window.gnAbrirAsignacion('2026-11-11','2026-11-13');c.doc.defaultView.location.search='?inicio=2026-11-11';c.load();assert.equal(c.seleccion(),0);
 c.listo();c.mutar();assert.equal(c.seleccion(),2);
});
