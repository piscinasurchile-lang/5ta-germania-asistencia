import {register} from 'node:module';register('./helpers/pglite-hooks.mjs',import.meta.url);
import test from 'node:test';import assert from 'node:assert/strict';
import {llamar} from './helpers/http.mjs';
process.env.DATABASE_URL='pglite://revision-semanal';
const {GET,POST}=await import('../app/api/guardia/revision-semanal/route.js');
const {neon}=await import('@neondatabase/serverless'),sql=neon('x');
const {ensureSchema,writeState,readState}=await import('../lib/state-store.js');
const {fechasSemana}=await import('../lib/guardia-maquinista.mjs');
const {firmaDotacion}=await import('../lib/guardia-acreditacion.js');
const {semanaTerminada,prepararActaRevision}=await import('../lib/guardia-revision-semanal.mjs');
const {evaluarDotacionEfectiva}=await import('../lib/guardia-asistencia-efectiva.js');
await ensureSchema(sql);
const roster=[{id:'a',nombre:'Francisco',apellidoPaterno:'Vega',cargo:'Ayudante Capitán',activo:true},{id:'o',nombre:'Oficial',apellidoPaterno:'Prueba',cargo:'Capitán',activo:true},{id:'m',nombre:'Maquinista',conductor:true},{id:'m2',nombre:'Segundo',conductor:true},...['v1','v2','v3'].map(id=>({id,nombre:id,activo:true}))];
await writeState(sql,'roster:v8',roster);
const inicio='2026-10-21',dias=fechasSemana(inicio),noche={obac:'o',maq:'m',vol:['v1','v2']};
const revision={inicio,estado:'aprobada',aprobadaEn:'2026-10-20T20:00:00Z',noches:Object.fromEntries(dias.map(f=>[f,structuredClone(noche)]))};
await writeState(sql,'guardia-revision:'+inicio,revision);
for(const fecha of dias)await writeState(sql,'guardia-libro:'+fecha,{estado:'enviado',revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche),enviadoEn:'2026-10-29T12:00:00Z',fotoClave:'foto-'+fecha,fotoSHA256:'conservar'});
const miembros=()=>[{id:'o',funcion:'OBAC',estado:'presente'},{id:'m',funcion:'Maquinista',estado:'presente'},{id:'v1',funcion:'Voluntario',estado:'justificado'},{id:'v2',funcion:'Voluntario',estado:'presente'},{id:'v3',funcion:'Voluntario',estado:'presente',reemplaza:'v1'}];
const body=(fecha,version,actorId='a')=>({inicio,fecha,version,actorId,accion:'guardar-borrador',acreditacionVersion:0,integrantes:miembros(),motivos:{v1:'Justificación informada',v3:'Reemplazo por justificación'}});
async function get(actor='a'){return llamar(GET,'/api/guardia/revision-semanal?inicio='+inicio+'&actorId='+actor);}
test('revisión se habilita solamente al término del martes, a las 06:00 del miércoles',()=>{
 assert.equal(semanaTerminada('2026-11-04',new Date('2026-11-11T08:59:00Z')),false);
 assert.equal(semanaTerminada('2026-11-04',new Date('2026-11-11T09:00:00Z')),true);
});
test('el Ayudante guarda siete revisiones independientes sin alterar aprobado ni libro ni acreditar',async()=>{
 let version=1;
 for(const fecha of dias){const r=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:body(fecha,version)});assert.equal(r.status,200,JSON.stringify(r.json));version=r.json.version;assert.equal((await readState(sql,'guardia-acreditacion:'+fecha)).version,0);assert.equal((await readState(sql,'guardia-libro:'+fecha)).value.fotoSHA256,'conservar');}
 assert.deepEqual((await readState(sql,'guardia-revision:'+inicio)).value.noches,revision.noches);
 const g=await get();assert.equal(g.json.puedeAprobar,false);assert.equal(Object.keys(g.json.cumplimiento).length,7);
 const r=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:{...body(dias[0],version),accion:'aprobar-cumplimiento'}});assert.equal(r.status,403);
});
test('Justificado y refuerzo requieren motivos y no inventan asistencia',()=>{
 assert.throws(()=>prepararActaRevision({noche,roster,integrantes:miembros()}),/motivo_justificacion/);
 assert.throws(()=>prepararActaRevision({noche,roster,integrantes:miembros(),motivos:{v1:'Justificado'}}),/motivo_adicional/);
 const b=body(dias[0],8),p=prepararActaRevision({noche,roster,integrantes:b.integrantes,motivos:b.motivos});assert.equal(p.asistencias.v1,'ausente');assert.equal(p.excusas.v1,b.motivos.v1);assert.equal(p.detalle.reemplazos[0].personaId,'v3');
});
test('los oficiales acreditan las siete noches mediante el cierre de libro existente y conservan historia',async()=>{
 const ver=(await readState(sql,'guardia-revision:'+inicio)).version;
 for(const fecha of dias){const b={...body(fecha,ver,'o'),accion:'aprobar-cumplimiento'};
  const r=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:b});assert.equal(r.status,200,JSON.stringify(r.json));
  const act=(await readState(sql,'guardia-acreditacion:'+fecha)).value;assert.equal(act.estado,'acreditada');assert.equal(act.excusas.v1,b.motivos.v1);assert.equal(act.revisionSemanal.reemplazos[0].personaId,'v3');assert.equal(act.dotacionEfectiva.minimoCumplido,true);
 }
 const g=await get('o');assert.equal(g.json.puedeAprobar,true);assert.equal(g.json.cumplimiento[dias[0]].aprobada,true,'el borrador obsoleto no oculta la acreditación');
 const stale=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:body(dias[0],ver)});assert.equal(stale.status,409);
 const b={...body(dias[0],ver,'o'),accion:'aprobar-cumplimiento',acreditacionVersion:1};b.motivos.v1='Justificación corregida por oficial';
 const correction=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:b});assert.equal(correction.status,200,JSON.stringify(correction.json));assert.equal((await readState(sql,'guardia-acreditacion:'+dias[0])).value.historial.length,1);
 assert.deepEqual((await readState(sql,'guardia-revision:'+inicio)).value.noches,revision.noches);
});
test('rechaza actor voluntario, nueva acreditación sin libro y revisión antes de terminar semana',async()=>{
 assert.equal((await get('v1')).status,403);
 const ver=(await readState(sql,'guardia-revision:'+inicio)).version;
 await writeState(sql,'guardia-libro:'+dias[1],{estado:'borrador'});
 const b={...body(dias[1],ver,'o'),accion:'aprobar-cumplimiento',acreditacionVersion:1};assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:b})).json.error,'libro_no_cerrado_o_desactualizado');
 await writeState(sql,'guardia-revision:2099-11-04',{...revision,inicio:'2099-11-04',noches:{'2099-11-04':noche}});
 assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:{...body('2099-11-04',1),inicio:'2099-11-04'}})).json.error,'revision_no_disponible');
});
test('cambiar OBAC y maquinista cuenta como voluntarios a los titulares que permanecen presentes',()=>{
 assert.equal(evaluarDotacionEfectiva(noche,{o:'presente',m:'presente',v1:'presente',v2:'presente'},[],{obac:'v1',maq:'v2'}).voluntarios,2);
});
test('el Ayudante prepara una noche futura sin publicar ni alterar otra noche aprobada',async()=>{
 const ini='2099-11-04';await writeState(sql,'guardia-plan:'+ini,{inicio:ini,estado:'asignacion'});
 const antes=(await readState(sql,'guardia-revision:'+ini)).value;
 const r=await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:{inicio:ini,fecha:ini,version:1,actorId:'a',accion:'preparar',noche:{obac:'o',maq:'m2',vol:['v1','v3']}}});assert.equal(r.status,200,JSON.stringify(r.json));
 const actual=(await readState(sql,'guardia-revision:'+ini)).value;assert.deepEqual(actual.noches,antes.noches);assert.equal(actual.borradorNoches[ini].maq,'m2');assert.equal(actual.aprobadaEn,antes.aprobadaEn);
});
test('consulta fotográfica del Ayudante se limita a la semana terminada sin otorgar acceso al voluntario',async()=>{
 const libro=await import('../app/api/guardia/libro/route.js');
 await sql`CREATE TABLE IF NOT EXISTS document_assets(key text PRIMARY KEY,data bytea,active boolean DEFAULT true)`;
 await sql.query("INSERT INTO document_assets(key,data) VALUES($1,decode($2,'base64'))",['foto-'+dias[0],Buffer.from('foto ficticia').toString('base64')]);
 await writeState(sql,'guardia-acreditacion:'+dias[0],null);
 const path='/api/guardia/libro?foto=1&fecha='+dias[0];
 assert.equal((await llamar(libro.GET,path+'&actorId=a')).status,403);
 assert.equal((await llamar(libro.GET,path+'&actorId=a&revisionSemanal=1')).status,200);
 assert.equal((await llamar(libro.GET,path+'&actorId=v3&revisionSemanal=1')).status,403);
 assert.equal((await llamar(libro.GET,'/api/guardia/libro?foto=1&fecha=2099-11-04&actorId=a&revisionSemanal=1')).status,403);
});
test('rechaza versión de programación obsoleta y cambios después del cierre semanal',async()=>{
 const version=(await readState(sql,'guardia-revision:'+inicio)).version;
 const b={...body(dias[0],version,'o'),accion:'aprobar-cumplimiento',acreditacionVersion:2};
 assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:{...b,version:0}})).json.error,'version_conflict');
 await writeState(sql,'guardia-cierre-semanal:'+inicio,{estado:'cerrada'});
 assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:b})).json.error,'semana_cerrada');
});
test('el Ayudante conserva apoyo externo ya programado sin poder agregarlo a otra noche',async()=>{
 const inicio='2099-11-11',apoyo='apoyo-cuerpo:david-briones',n={obac:'o',maq:apoyo,vol:['v1','v2'],apoyoExterno:{id:apoyo}};
 await writeState(sql,'guardia-plan:'+inicio,{estado:'asignacion'});await writeState(sql,'guardia-revision:'+inicio,{inicio,estado:'borrador',noches:{[inicio]:n}});
 const b={inicio,fecha:inicio,actorId:'a',accion:'preparar',version:1,noche:{...n,vol:['v1','v3']}};
 assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:b})).status,200);
 const r=(await readState(sql,'guardia-revision:'+inicio)).value;assert.equal(r.borradorNoches[inicio].apoyoExterno.id,apoyo);
 assert.equal((await llamar(POST,'/api/guardia/revision-semanal',{method:'POST',body:{...b,version:2,fecha:'2099-11-12'}})).status,409);
});
