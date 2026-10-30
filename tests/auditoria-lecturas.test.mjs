import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const roles=readFileSync(new URL('../public/legacy/germania-roles.js',import.meta.url),'utf8');const start=roles.indexOf('async function aprobarRevision(');const fn=roles.slice(start,roles.indexOf('\n/* ---------- Mis noches',start));
test('si falla una lectura entre las siete noches no se envía ninguna escritura',async()=>{
 let lecturas=0,escrituras=0;const RV={doc:{estado:'borrador'},ver:1};const cov=Array.from({length:7},(_,i)=>({f:'2026-11-'+String(4+i).padStart(2,'0'),completa:true,n:{vol:['v1','v2'],obac:'o',maq:'m'}}));
 const ctx={RV,esTenienteTercero:()=>true,clonar:o=>JSON.parse(JSON.stringify(o)),revCov:()=>cov,confirm:()=>true,$:()=>null,horaNoche:()=>'22:45',claveGuardia:f=>f+'__2245',sGetV:async()=>{if(++lecturas===3)throw Error('sin red');return {value:{novedades:'Conservar'},version:2};},gnAdd:f=>f,HORARIOS:{fin:'06:00'},GUARDIA_IDX:'guardias:index',gnGuardarAtomico:async()=>{escrituras++;},revCargar:async()=>{},panelRev:()=>{}};
 vm.createContext(ctx);vm.runInContext(fn,ctx);await ctx.aprobarRevision(null,{m:{id:'o'},p:{inicio:'2026-11-04'},noches:cov.map(c=>c.f)});assert.equal(escrituras,0);assert.equal(RV.err,true);
});
