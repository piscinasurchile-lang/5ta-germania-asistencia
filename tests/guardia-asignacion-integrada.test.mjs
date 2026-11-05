import {register} from 'node:module';register('./helpers/pglite-hooks.mjs',import.meta.url);
process.env.DATABASE_URL='pglite://asignacion-aprobada';
import test from 'node:test';import assert from 'node:assert/strict';
import {llamar} from './helpers/http.mjs';
await import('../public/legacy/germania-guardia-asignacion-datos.js');
const {POST}=await import('../app/api/guardia/programacion/route.js');
const {neon}=await import('@neondatabase/serverless');const sql=neon('x');
const {ensureSchema,writeState,readState}=await import('../lib/state-store.js');await ensureSchema(sql);
const roster=[{id:'admin',clave:'517',nombre:'Administrador prueba',activo:true},{id:'m',nombre:'Maquinista',conductor:true,activo:true},{id:'o',nombre:'OBAC',activo:true},{id:'v1',nombre:'Uno',activo:true},{id:'v2',nombre:'Dos',activo:true},{id:'v3',nombre:'Tres',activo:true}];
await writeState(sql,'roster:v8',roster);
let actor='admin';
await writeState(sql,'guardia-plan:2099-11-04',{inicio:'2099-11-04',estado:'asignacion'});
const fechas=inicio=>Array.from({length:7},(_,i)=>new Date(Date.parse(inicio+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
const n=()=>({obac:'o',maq:'m',vol:['v1','v2']});
const puente=globalThis.GermaniaAsignacionCrear({actorId:()=>actor,leer:(k,f)=>readState(sql,k).then(r=>({...r,value:r.value??f})),base:async inicio=>Object.fromEntries(fechas(inicio).map(f=>[f,n()])),actor:r=>r.find(p=>p.id===actor),horario:()=>({entrada:'22:45',salida:'06:00'}),hoy:()=> '2026-11-05',guardar:async cambios=>{const r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:actor,cambios}});if(r.status!==200)throw Error(r.json.error);return r.json;}});
const inicio='2099-11-04',dias=fechas(inicio);
test('carga nómina existente, guarda una noche y recupera la misma asignación',async()=>{
 let d=await puente.cargar(inicio);assert.equal(d.roster.length,6);assert.equal(d.version,0);
 const r=await puente.guardar({inicio,version:0,accion:'guardar',fecha:dias[0],noches:{[dias[0]]:n()}});assert.equal(r.version,1);
 d=await puente.cargar(inicio);assert.deepEqual(d.revision.borradorNoches[dias[0]],n());assert.deepEqual(d.revision.guardadas,[dias[0]]);
});
test('publica las siete noches por la API existente y conserva fotos y metadatos',async()=>{
 const foto={guardianes:[{id:'v1',estado:'cuartel',obs:'conservar'}],novedades:'conservar novedades',fotoClave:'foto-intacta',metadato:{conservar:true}};
 await writeState(sql,'guardia:'+dias[0]+'__2245',foto);
 let d=await puente.cargar(inicio);
 for(const f of dias.slice(1)){await puente.guardar({inicio,version:d.version,accion:'guardar',fecha:f,noches:{[f]:n()}});d=await puente.cargar(inicio);}
 await puente.guardar({inicio,version:d.version,accion:'aprobar',noches:d.revision.borradorNoches});
 d=await puente.cargar(inicio);assert.equal(d.revision.estado,'aprobada');assert.equal(d.revision.aprobadaPorId,'admin');
 const r=await readState(sql,'guardia:'+dias[0]+'__2245');assert.equal(r.value.fotoClave,foto.fotoClave);assert.equal(r.value.novedades,foto.novedades);assert.equal(r.value.guardianes[0].obs,'conservar');assert.deepEqual(r.value.metadato,foto.metadato);
 const idx=await readState(sql,'guardias:index');assert.equal(idx.value.filter(x=>dias.includes(x.fecha)).length,7);
});
test('reemplazo del sábado conserva otras seis noches y la publicación vigente',async()=>{
 const d=await puente.cargar(inicio),anterior=structuredClone(d.revision.noches),nuevo={obac:'v3',maq:'m',vol:['o','v2']};
 await puente.guardar({inicio,version:d.version,accion:'guardar',fecha:dias[3],noches:{[dias[3]]:nuevo}});
 const draft=await puente.cargar(inicio);assert.deepEqual(draft.revision.noches,anterior);
 for(const f of dias.filter(x=>x!==dias[3]))assert.deepEqual(draft.revision.borradorNoches[f],anterior[f]);
 await puente.guardar({inicio,version:draft.version,accion:'aprobar',noches:draft.revision.borradorNoches});
 assert.equal((await puente.cargar(inicio)).revision.noches[dias[3]].obac,'v3');
});
test('rechaza versiones obsoletas, fechas históricas y maquinista sin habilitación',async()=>{
 const d=await puente.cargar(inicio);await assert.rejects(puente.guardar({inicio,version:0,accion:'guardar',fecha:dias[0],noches:{[dias[0]]:n()}}),/Otra persona/);
 await assert.rejects(puente.guardar({inicio,version:d.version,accion:'guardar',fecha:dias[0],noches:{[dias[0]]:{obac:'o',maq:'v3',vol:['v1','v2']}}}),/habilitado/);
 await assert.rejects(puente.guardar({inicio:'2026-10-14',version:0,accion:'guardar',fecha:'2026-10-14',noches:{'2026-10-14':n()}}),/iniciadas/);
});
test('la API institucional mantiene el rechazo al actor no autorizado',async()=>{
 actor='v1';const d=await puente.cargar(inicio);
 await assert.rejects(puente.guardar({inicio,version:d.version,accion:'guardar',fecha:dias[0],noches:{[dias[0]]:n()}}),/oficial_requerido/);actor='admin';
 assert.equal((await puente.cargar(inicio)).version,d.version);
});
test('no sustituye la revisión vigente de semanas iniciadas ni prepara con inscripción abierta',async()=>{
 await assert.rejects(puente.cargar('2026-11-04'),/iniciadas/);
 await writeState(sql,'guardia-plan:2099-11-11',{inicio:'2099-11-11',estado:'abierta'});
 await assert.rejects(puente.cargar('2099-11-11'),/Cierra las inscripciones/);
 assert.equal((await readState(sql,'guardia-revision:2099-11-11')).version,0);
});
test('si cambia el actor durante las lecturas no se envía ninguna escritura',async()=>{
 actor='admin';let enviados=0;
 const cambiar=globalThis.GermaniaAsignacionCrear({actorId:()=>actor,leer:async(k,f)=>{const r=await readState(sql,k);if(k.startsWith('guardia:'))actor='v1';return {...r,value:r.value??f};},base:async i=>Object.fromEntries(fechas(i).map(f=>[f,n()])),actor:r=>r.find(p=>p.id===actor),horario:()=>({entrada:'22:45',salida:'06:00'}),hoy:()=> '2026-11-05',guardar:async()=>{enviados++;throw Error('No debe enviarse');}});
 const d=await cambiar.cargar(inicio);
 await assert.rejects(cambiar.guardar({inicio,version:d.version,accion:'aprobar',noches:d.revision.borradorNoches||d.revision.noches}),/Cambió el integrante/);
 assert.equal(enviados,0);assert.equal((await readState(sql,'guardia-revision:'+inicio)).version,d.version);actor='admin';
});
test('David usa el apoyo existente, solo T3 lo agrega y nunca ocupa rol de OBAC',async()=>{
 await import('../public/legacy/germania-apoyo-guardia.js');
 const actual=await readState(sql,'roster:v8');await writeState(sql,'roster:v8',[...actual.value,{id:'t3',nombre:'Tercero',cargo:'Teniente Tercero',activo:true}]);
 await writeState(sql,'guardia-plan:2099-11-11',{inicio:'2099-11-11',estado:'asignacion'});
 const apoyo=globalThis.GermaniaApoyoGuardia;
 const p=globalThis.GermaniaAsignacionCrear({actorId:()=>actor,leer:(k,f)=>readState(sql,k).then(r=>({...r,value:r.value??f})),base:async i=>Object.fromEntries(fechas(i).map(f=>[f,n()])),actor:r=>r.find(p=>p.id===actor),horario:()=>({entrada:'22:45',salida:'06:00'}),hoy:()=> '2026-11-05',apoyo:()=>apoyo.david,metadataApoyo:()=>apoyo.asignar({maq:null}).apoyoExterno,guardar:async cambios=>{const r=await llamar(POST,'/api/guardia/programacion',{method:'POST',body:{actorId:actor,cambios}});if(r.status!==200)throw Error(r.json.error);return r.json;}});
 const i='2099-11-11',noches={[i]:{obac:'o',maq:apoyo.david.id,vol:['v1','v2']}};
 actor='admin';await assert.rejects(p.guardar({inicio:i,version:0,accion:'guardar',fecha:i,noches}),/Solo el Teniente Tercero/);
 actor='t3';await assert.rejects(p.guardar({inicio:i,version:0,accion:'guardar',fecha:i,noches:{[i]:{obac:apoyo.david.id,maq:'m',vol:['v1','v2']}}}),/solo puede actuar como maquinista/);
 await p.guardar({inicio:i,version:0,accion:'guardar',fecha:i,noches});
 const d=await p.cargar(i);assert.equal(d.revision.borradorNoches[i].apoyoExterno.id,apoyo.david.id);assert.equal((await readState(sql,'roster:v8')).value.some(p=>p.id===apoyo.david.id),false);actor='admin';
});
test('captura al actor antes de la primera lectura asíncrona',async()=>{
 actor='admin';let enviados=0;
 const p=globalThis.GermaniaAsignacionCrear({actorId:()=>actor,leer:async(k,f)=>{const r=await readState(sql,k);if(k==='roster:v8')actor='v1';return {...r,value:r.value??f};},base:async i=>Object.fromEntries(fechas(i).map(f=>[f,n()])),actor:r=>r.find(p=>p.id===actor),horario:()=>({entrada:'22:45',salida:'06:00'}),hoy:()=> '2026-11-05',guardar:async()=>{enviados++;throw Error('No debe enviar');}});
 const version=(await readState(sql,'guardia-revision:'+inicio)).version;
 await assert.rejects(p.guardar({inicio,version,accion:'guardar',fecha:dias[0],noches:{[dias[0]]:n()}}),/Cambió el integrante/);
 assert.equal(enviados,0);assert.equal((await readState(sql,'guardia-revision:'+inicio)).version,version);actor='admin';
});
