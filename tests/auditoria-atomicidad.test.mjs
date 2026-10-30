import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {ensureSchema,resetSchemaCache,writeState,readState,listHistory} from '../lib/state-store.js';
import {guardarCambiosAtomicos} from '../lib/guardia-transaccion.mjs';
async function base(){const db=new PGlite();const sql=(s,...v)=>{let q=s[0];v.forEach((_,i)=>q+='$'+(i+1)+s[i+1]);return db.query(q,v).then(r=>r.rows);};resetSchemaCache();await ensureSchema(sql);return {db,sql};}
const plan='guardia-plan:2026-11-04',idx='guardia-plan:index';
test('un conflicto del índice no deja el plan anulado ni agrega historial',async()=>{
 const {db,sql}=await base();try{await writeState(sql,plan,{estado:'abierta'});await writeState(sql,idx,['2026-11-04']);await writeState(sql,idx,['2026-11-04','2026-11-11']);
 await assert.rejects(guardarCambiosAtomicos(db,[{op:'set',key:plan,value:{estado:'anulada'},ifVersion:1},{op:'set',key:idx,value:[],ifVersion:1}]),e=>e.conflicto);
 assert.equal((await readState(sql,plan)).value.estado,'abierta');assert.deepEqual((await readState(sql,idx)).value,['2026-11-04','2026-11-11']);assert.equal((await listHistory(sql,plan)).length,0);
 }finally{await db.close();}
});
test('fallo durante la segunda escritura revierte la primera y su historial',async()=>{
 const {db,sql}=await base();try{await writeState(sql,plan,{estado:'abierta'});await writeState(sql,idx,['2026-11-04']);
 await assert.rejects(guardarCambiosAtomicos(db,[{op:'set',key:plan,value:{estado:'anulada'},ifVersion:1},{op:'set',key:idx,value:[1n],ifVersion:1}]));
 assert.equal((await readState(sql,plan)).value.estado,'abierta');assert.equal((await readState(sql,plan)).version,1);assert.equal((await listHistory(sql,plan)).length,0);
 }finally{await db.close();}
});
test('guarda documento e índice juntos y rechaza versión positiva de clave inexistente',async()=>{
 const {db,sql}=await base();try{
 await assert.rejects(guardarCambiosAtomicos(db,[{op:'set',key:plan,value:{estado:'abierta'},ifVersion:2}]),e=>e.conflicto);
 await guardarCambiosAtomicos(db,[{op:'set',key:plan,value:{estado:'abierta'},ifVersion:0},{op:'add',key:idx,item:'2026-11-04',sort:'asc'}]);
 assert.equal((await readState(sql,plan)).value.estado,'abierta');assert.deepEqual((await readState(sql,idx)).value,['2026-11-04']);
 }finally{await db.close();}
});
