import {register} from 'node:module';register('./helpers/pglite-hooks.mjs',import.meta.url);
process.env.DATABASE_URL='pglite://auditoria';
import test from 'node:test';import assert from 'node:assert/strict';
import {llamar} from './helpers/http.mjs';
const {POST}=await import('../app/api/guardia/programacion/route.js');
const {neon}=await import('@neondatabase/serverless');const sql=neon('x');
const {ensureSchema,writeState,readState}=await import('../lib/state-store.js');await ensureSchema(sql);
await writeState(sql,'roster:v8',[{id:'t3',nombre:'Oficial',apellidoPaterno:'Prueba',cargo:'Teniente Tercero',activo:true},{id:'vol',cargo:'Bombero',activo:true}]);
const cambios=[{op:'set',key:'guardia-plan:2026-11-04',value:{estado:'abierta'},ifVersion:0},{op:'add',key:'guardia-plan:index',item:'2026-11-04'}];
test('ruta real acepta lote autorizado y devuelve conflicto sin cambios al repetir versión',async()=>{
 let r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:'t3',cambios}});assert.equal(r.status,200);
 r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:'t3',cambios}});assert.equal(r.status,409);assert.equal((await readState(sql,'guardia-plan:2026-11-04')).version,1);
});
test('rechaza actor no autorizado y claves ajenas a programación',async()=>{
 let r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:'vol',cambios}});assert.equal(r.status,403);
 r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:'t3',cambios:[{op:'set',key:'roster:v8',value:[],ifVersion:1}]}});assert.equal(r.status,400);
});
