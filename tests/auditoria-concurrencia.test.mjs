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
