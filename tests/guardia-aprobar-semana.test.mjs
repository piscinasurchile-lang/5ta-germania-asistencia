import {register} from 'node:module';register('./helpers/pglite-hooks.mjs',import.meta.url);
import test from 'node:test';import assert from 'node:assert/strict';
import {llamar,req} from './helpers/http.mjs';
process.env.DATABASE_URL='pglite://aprobar-semana';
const {neon,Pool}=await import('@neondatabase/serverless'),sql=neon('x');
const {ensureSchema,writeState,readState}=await import('../lib/state-store.js');
const {GET,POST}=await import('../app/api/guardia/aprobar-semana/route.js');
const {POST:diaria,acreditarConConexion}=await import('../app/api/guardia/acreditacion/route.js');
const {aprobarSemanaConConexion}=await import('../lib/guardia-aprobacion-semana.mjs');
const {fechasSemana}=await import('../lib/guardia-maquinista.mjs');
const {firmaDotacion}=await import('../lib/guardia-acreditacion.js');
await ensureSchema(sql);
const roster=[{id:'o',nombre:'Oficial',apellidoPaterno:'Prueba',cargo:'Capitán',activo:true},{id:'a',nombre:'Ayudante',apellidoPaterno:'Prueba',cargo:'Ayudante',activo:true},{id:'m',nombre:'Maquinista',apellidoPaterno:'Prueba',conductor:true,activo:true},...['v1','v2','v3'].map(id=>({id,nombre:id,apellidoPaterno:'Prueba',activo:true}))];
await writeState(sql,'roster:v8',roster);
const noche={obac:'o',maq:'m',vol:['v1','v2']};
async function fixture(inicio){
 const fechas=fechasSemana(inicio),r={inicio,estado:'aprobada',aprobadaEn:inicio+'T12:00:00Z',noches:Object.fromEntries(fechas.map(f=>[f,structuredClone(noche)]))};
 await writeState(sql,'guardia-revision:'+inicio,r);
 for(const f of fechas)await writeState(sql,'guardia-libro:'+f,{estado:'enviado',revisionAprobadaEn:r.aprobadaEn,dotacionFirma:firmaDotacion(noche),enviadoEn:f+'T12:00:00Z',fotoClave:'foto-'+f,fotoSHA256:'sha-'+f});
 return {fechas,r};
}
async function snapshot(inicio){const r=await llamar(GET,'/api/guardia/aprobar-semana?inicio='+inicio+'&actorId=o');assert.equal(r.status,200,JSON.stringify(r.json));return r.json;}
const body=s=>({inicio:s.inicio,actorId:'o',version:s.version,nominaVersion:s.nominaVersion,versiones:s.versiones,confirmado:true});
const contar=async fs=>Promise.all(fs.map(f=>readState(sql,'guardia-acreditacion:'+f)));
test('aprobación semanal conserva ajustes, no duplica noches ya aprobadas ni estadísticas al reintentar',async()=>{
 const inicio='2020-01-01',{fechas,r}=await fixture(inicio);
 const p=await llamar(diaria,'/api/guardia/acreditacion',{method:'POST',body:{fecha:fechas[0],actorId:'o',ifVersion:0,asistencias:{o:'presente',m:'presente',v1:'presente',v2:'presente'}}});assert.equal(p.status,200);
 const previa=await readState(sql,'guardia-acreditacion:'+fechas[0]);
 r.cumplimiento={[fechas[1]]:{fuenteAprobadaEn:r.aprobadaEn,fuenteFirma:firmaDotacion(noche),acreditacionVersionBase:0,integrantes:[{id:'o',funcion:'OBAC',estado:'presente'},{id:'m',funcion:'Maquinista',estado:'presente'},{id:'v1',funcion:'Voluntario',estado:'justificado'},{id:'v2',funcion:'Voluntario',estado:'presente'},{id:'v3',funcion:'Voluntario',estado:'presente',reemplaza:'v1'}],motivos:{v1:'Fuerza mayor informada',v3:'Reemplazo confirmado en libro'}}};
 await writeState(sql,'guardia-revision:'+inicio,r);
 const s=await snapshot(inicio);assert.equal(s.pendientes,6);assert.equal(s.noches[1].fuente,'revision');
 const aprobado=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(s)});assert.equal(aprobado.status,200,JSON.stringify(aprobado.json));assert.equal(aprobado.json.nuevas,6);
 assert.deepEqual(await readState(sql,'guardia-acreditacion:'+fechas[0]),previa);
 const actas=await contar(fechas);assert.ok(actas.every(x=>x.value.estado==='acreditada'));
 assert.equal(actas[1].value.asistencias.v1,'ausente');assert.equal(actas[1].value.excusas.v1,'Fuerza mayor informada');assert.equal(actas[1].value.revisionSemanal.reemplazos[0].personaId,'v3');
 assert.deepEqual((await readState(sql,'guardia-revision:'+inicio)).value.noches,r.noches);
 const repetida=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(s)});assert.equal(repetida.status,200);assert.equal(repetida.json.repetida,true);assert.deepEqual(await contar(fechas),actas);
});
test('un libro pendiente o modificado bloquea toda la operación antes de acreditar',async()=>{
 const inicio='2020-01-08',{fechas}=await fixture(inicio);const s=await snapshot(inicio);
 await writeState(sql,'guardia-libro:'+fechas[6],{estado:'borrador'});
 const r=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(s)});assert.equal(r.status,409);assert.equal(r.json.fecha,fechas[6]);assert.ok((await contar(fechas)).every(x=>x.version===0));
});
test('rollback revierte seis noches si falla la última acreditación canónica',async()=>{
 const inicio='2020-01-15',{fechas}=await fixture(inicio),s=await snapshot(inicio),pool=new Pool(),client=await pool.connect();
 let n=0;
 try{await assert.rejects(aprobarSemanaConConexion(client,req('/api/guardia/aprobar-semana',{method:'POST',body:body(s)}),body(s),async(...args)=>++n===7?Response.json({error:'fallo_simulado'},{status:409}):acreditarConConexion(...args)),/fallo_simulado/);}finally{client.release();await pool.end();}
 assert.equal(n,7);assert.ok((await contar(fechas)).every(x=>x.version===0));
});
test('exige confirmación explícita, rol autorizado y versiones vigentes',async()=>{
 const inicio='2020-01-22',{fechas}=await fixture(inicio),s=await snapshot(inicio);
 for(const b of [{...body(s),confirmado:false},{...body(s),version:s.version+1},{...body(s),actorId:'a'}]){
  const r=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:b});assert.ok([403,409].includes(r.status),JSON.stringify(r.json));
 }
 assert.ok((await contar(fechas)).every(x=>x.version===0));
});
test('no habilita ni acredita una semana futura',async()=>{
 const inicio='2099-01-07',{fechas}=await fixture(inicio),s=await snapshot(inicio);assert.equal(s.terminada,false);
 const r=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(s)});assert.equal(r.status,409);assert.equal(r.json.error,'semana_no_finalizada');assert.ok((await contar(fechas)).every(x=>x.version===0));
});
test('un libro reenviado invalida la aprobación anterior y exige revisión diaria',async()=>{
 const inicio='2020-01-29',{fechas}=await fixture(inicio),s=await snapshot(inicio);
 const aprobado=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(s)});assert.equal(aprobado.status,200);
 const libro=await readState(sql,'guardia-libro:'+fechas[0]);await writeState(sql,'guardia-libro:'+fechas[0],{...libro.value,enviadoEn:'2020-02-10T12:00:00Z',fotoSHA256:'foto-nueva'});
 const ahora=await snapshot(inicio);assert.equal(ahora.noches[0].aprobada,false);assert.equal(ahora.noches[0].error,'aprobacion_desactualizada_revisar_dia');
 const actas=await contar(fechas);const r=await llamar(POST,'/api/guardia/aprobar-semana',{method:'POST',body:body(ahora)});assert.equal(r.status,409);assert.deepEqual(await contar(fechas),actas);
});
test('el resumen de un cierre sin foto conserva constancia sin inventar un enlace de fotografía',async()=>{
 const inicio='2020-02-05',{fechas}=await fixture(inicio),libro=await readState(sql,'guardia-libro:'+fechas[0]);
 await writeState(sql,'guardia-libro:'+fechas[0],{...libro.value,sinFoto:true,fotoClave:null,fotoSHA256:null});
 const s=await snapshot(inicio);assert.equal(s.noches[0].libro,true);assert.equal(s.noches[0].tieneFoto,false);assert.equal(s.noches[0].sinFoto,true);
});
