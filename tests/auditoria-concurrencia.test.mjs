import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../public/legacy/app.js',import.meta.url),'utf8');
function funcion(nombre){const start=src.indexOf('async function '+nombre+'(');return src.slice(start,src.indexOf('\n}',start)+2);}
test('un plazo abierto con versión antigua no sobrescribe una suspensión concurrente',async()=>{
 let documento={estado:'suspendida'},version=2,indice=0;
 const ctx={gnPlanKey:i=>'guardia-plan:'+i,GN_PLAN_INDEX:'guardia-plan:index',gnGuardarAtomico:async(cambios)=>{const c=cambios[0],v=c.value,o={ifVersion:c.ifVersion};if(o.ifVersion!==version){const e=new Error('conflicto');e.conflicto=true;throw e;}documento=v;version++;indice++;}};
 vm.createContext(ctx);vm.runInContext(funcion('gnSavePlan'),ctx);
 await assert.rejects(ctx.gnSavePlan({inicio:'2026-11-04',estado:'abierta',_version:1}),e=>e.conflicto);
 assert.equal(documento.estado,'suspendida');assert.equal(indice,0);
});
test('guardia rechaza un escritor sin versión antes de llamar al almacén',async()=>{
 let llamadas=0;const ctx={sSet:async()=>{llamadas++;},sAddToList:async()=>{},SVER:new Map(),GUARDIA_IDX:'guardias:index'};
 vm.createContext(ctx);vm.runInContext(funcion('setGuardia'),ctx);
 await assert.rejects(ctx.setGuardia('noche',{}),/cargar/);assert.equal(llamadas,0);
});
test('un refresco durante la aprobación no cambia la versión base del documento abierto',async()=>{
 const roles=readFileSync(new URL('../public/legacy/germania-roles.js',import.meta.url),'utf8');const start=roles.indexOf('async function aprobarRevision(');const fn=roles.slice(start,roles.indexOf('\n/* ---------- Mis noches',start));
 let lote;const RV={doc:{estado:'borrador'},ver:1};const ctx={RV,SVER:new Map([['guardia-revision:2026-11-04',3]]),esTenienteTercero:()=>true,esAdminGuardia:()=>false,clonar:o=>JSON.parse(JSON.stringify(o)),revCov:()=>[{f:'2026-11-04',completa:true,n:{vol:['v1','v2'],obac:'o',maq:'m'}}],confirm:()=>true,$:()=>null,horaNoche:()=>'22:45',claveGuardia:f=>f+'__2245',sGetV:async()=>{RV.ver=2;return {value:null,version:0};},gnAdd:f=>f,HORARIOS:{fin:'06:00'},corto:()=>'Oficial',revLog:()=>{},revKey:f=>'guardia-revision:'+f,GUARDIA_IDX:'guardias:index',gnGuardarAtomico:async c=>{lote=c;},panelRev:()=>{},revCargar:async()=>{}};
 vm.createContext(ctx);vm.runInContext(fn,ctx);await ctx.aprobarRevision(null,{m:{id:'o'},p:{inicio:'2026-11-04'},noches:['2026-11-04']});assert.equal(lote.find(c=>c.key==='guardia-revision:2026-11-04').ifVersion,1);
});
