import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {ensureSchema,resetSchemaCache,readState,writeState} from '../lib/state-store.js';
import {validarAsistencia,guardarAsistencia} from '../lib/asistencia-guardar.mjs';
const entrada=(suffix='uno')=>({clave:'2026-10-30__asistencia--'+suffix,version:0,operacion:'operacion-'+suffix,datos:{date:'2026-10-30',hora:'20:00',tipo:'Academia',detalle:'Extricación',registradoPor:'Responsable prueba',records:{a:'presente',b:'ausente'},eligibleIds:['a','b']}});
test('validación rechaza vacíos, sin presentes, lista incompleta y fechas inexistentes',()=>{
 const b=entrada();assert.equal(validarAsistencia(b).hora,'20:00');
 for(const campo of ['date','hora','tipo','detalle','registradoPor']){const x=structuredClone(b);x.datos[campo]='';assert.throws(()=>validarAsistencia(x),campo);}
 for(const date of ['2026-02-30','2026-13-01','2026-00-01']){const x=structuredClone(b);x.datos.date=date;assert.throws(()=>validarAsistencia(x));}
 const x=structuredClone(b);delete x.datos.records.b;assert.throws(()=>validarAsistencia(x),/lista_incompleta/);
 x.datos.records={a:'ausente',b:'justificado'};assert.throws(()=>validarAsistencia(x),/requiere_un_presente/);
 x.datos.records={a:'presente',b:'sin-marcar'};assert.throws(()=>validarAsistencia(x),/lista_incompleta/);
});
test('guardado transaccional, reintentos y correcciones sobre PostgreSQL aislado',async t=>{
 const db=new PGlite();const client={query:(text,values)=>db.query(text,values)};
 const sql=(strings,...values)=>{let text=strings[0];values.forEach((_,i)=>{text+='$'+(i+1)+strings[i+1];});return db.query(text,values).then(r=>r.rows);};
 resetSchemaCache();await ensureSchema(sql);await writeState(sql,'roster:v8',[{id:'a'},{id:'b'}]);
 try{
  await t.test('guarda parte, número e índice y el reintento devuelve el mismo número',async()=>{
   const b=entrada();const r=await guardarAsistencia(client,b);assert.equal(r.value.numero,1);
   const copia=await guardarAsistencia(client,b);assert.equal(copia.repetido,true);assert.equal(copia.value.numero,1);assert.equal(copia.version,r.version);
   assert.equal((await readState(sql,'partes:index:v1')).value.length,1);assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,1);
   const distinto=entrada('dos');const segundo=await guardarAsistencia(client,distinto);assert.equal(segundo.value.numero,2);assert.equal((await readState(sql,'partes:index:v1')).value.length,2);
  });
  await t.test('corrección conserva número y metadatos; versión vieja no pisa cambios',async()=>{
   const r=await readState(sql,'parte:'+entrada().clave);const b=entrada();b.version=r.version;b.operacion='correccion-uno';b.datos.detalle='Detalle corregido';
   const corrected=await guardarAsistencia(client,b);assert.equal(corrected.value.numero,1);assert.equal(corrected.value.detalle,'Detalle corregido');
   const stale=structuredClone(b);stale.operacion='correccion-vieja';stale.datos.detalle='No debe guardarse';await assert.rejects(()=>guardarAsistencia(client,stale),/version_conflict/);
   assert.equal((await readState(sql,'parte:'+b.clave)).value.detalle,'Detalle corregido');assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,2);
  });
  await t.test('fallo después de escribir el parte revierte también el correlativo',async()=>{
   const failing={query:(text,values)=>{if(text.includes('jsonb_build_array'))throw Error('fallo_indice');return client.query(text,values);}};
   await assert.rejects(()=>guardarAsistencia(failing,entrada('fallo')),/fallo_indice/);
   assert.equal((await readState(sql,'parte:'+entrada('fallo').clave)).value,null);assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,2);assert.equal((await readState(sql,'partes:index:v1')).value.length,2);
  });
  await t.test('nómina cambiada detiene guardado antes del correlativo',async()=>{
   await writeState(sql,'roster:v8',[{id:'a'},{id:'b'},{id:'c'}]);await assert.rejects(()=>guardarAsistencia(client,entrada('nomina')),/nomina_cambio/);
   assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,2);await writeState(sql,'roster:v8',[{id:'a'},{id:'b'}]);
  });
  await t.test('operación reutilizada con otros datos y B-5 no se sobrescriben',async()=>{
   const b=entrada('identidad');await guardarAsistencia(client,b);b.datos.detalle='Otro';await assert.rejects(()=>guardarAsistencia(client,b),/operacion_reutilizada/);
   const ex=entrada('b5');await writeState(sql,'parte:'+ex.clave,{...ex.datos,origenAsistencia:'emergencia_b5',numero:99,anio:'2026'});ex.version=1;await assert.rejects(()=>guardarAsistencia(client,ex),/registro_requiere_modulo/);
  });
  await t.test('corrección histórica conserva metadatos y no incorpora nuevos voluntarios',async()=>{
   const ex=entrada('historico');await writeState(sql,'parte:'+ex.clave,{...ex.datos,numero:42,anio:'2026',importId:'original-2026',importado:true});
   await writeState(sql,'roster:v8',[{id:'a'},{id:'b'},{id:'c'}]);ex.version=1;ex.datos.detalle='Corrección histórica';const r=await guardarAsistencia(client,ex);assert.equal(r.value.numero,42);assert.equal(r.value.importId,'original-2026');assert.deepEqual(r.value.eligibleIds,['a','b']);
  });
 }finally{await db.close();}
});
