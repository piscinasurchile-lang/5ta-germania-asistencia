import {register} from 'node:module';register('./helpers/pglite-hooks.mjs',import.meta.url);
process.env.DATABASE_URL='pglite://avisos-dotacion';
import test from 'node:test';import assert from 'node:assert/strict';
import {avisoSegunDotacion} from '../lib/guardia-aviso-resuelto.mjs';
import {llamar} from './helpers/http.mjs';
const {GET}=await import('../app/api/guardia/avisos/route.js');
const {neon}=await import('@neondatabase/serverless');const sql=neon('x');
const {ensureSchema,writeState,readState}=await import('../lib/state-store.js');await ensureSchema(sql);
const fecha='2026-11-11',antes={obac:'o',maq:'m',vol:['pablo','v1','v2']},despues={obac:'o',maq:'m',vol:['ludwig','v1','v2']};
const aviso={id:'pablo',f:fecha,rol:'vol',estado:'abierto',urgente:true,motivo:'Motivo privado',en:'2026-11-11T22:15:55.151Z'};
function revision(){return {estado:'aprobada',aprobadaEn:'2026-11-11T22:17:38.325Z',aprobadaPorId:'t3',aprobadaPor:'Teniente',noches:{[fecha]:structuredClone(despues)},cambios:[{id:'c1',en:'2026-11-11T22:13:45.650Z',porId:'admin',antes:{[fecha]:structuredClone(antes)},despues:{[fecha]:structuredClone(despues)}}]};}
test('reconoce cambio anterior al aviso y a la aprobación, sin modificar originales ni acreditar asistencia',()=>{
 const a=structuredClone(aviso),r=revision(),resultado=avisoSegunDotacion(a,r);
 assert.equal(resultado.estado,'cubierto');assert.equal(resultado.reemplazoId,'ludwig');assert.equal(resultado.resueltoPorId,'t3');assert.equal(resultado.cambioId,'c1');assert.equal(resultado.estadoOriginal,'abierto');assert.equal(resultado.motivo,aviso.motivo);assert.deepEqual(a,aviso);assert.equal(r.noches[fecha].vol.includes('pablo'),false);assert.equal(resultado.acreditacion,undefined);
});
test('reconoce también un aviso previo al cambio; conserva resoluciones explícitas',()=>{
 assert.equal(avisoSegunDotacion({...aviso,en:'2026-11-11T20:00:00Z'},revision()).estado,'cubierto');
 const manual={...aviso,estado:'cubierto',reemplazoId:'otro',resueltoPorId:'capitan'};assert.equal(avisoSegunDotacion(manual,revision()),manual);
});
test('no silencia el aviso por mínimo completo, retirada sin reemplazo o cambios múltiples',()=>{
 for(const modificar of [r=>{r.cambios=[];},r=>{r.cambios[0].despues[fecha].vol=['v1','v2'];},r=>{r.cambios[0].despues[fecha].vol=['ludwig','otro','v1'];}]){const r=revision();modificar(r);assert.equal(avisoSegunDotacion(aviso,r),aviso);}
});
test('no usa borradores, cambios posteriores a publicación, otra función ni un reemplazo que ya salió',()=>{
 for(const modificar of [r=>r.estado='borrador',r=>r.aprobadaEn='2026-11-11T21:00:00Z',r=>r.noches[fecha].vol=['v1','v2'],r=>r.noches[fecha].obac='ludwig',r=>r.noches[fecha].vol.push('pablo')]){const r=revision();modificar(r);assert.equal(avisoSegunDotacion(aviso,r),aviso);}
});
test('la última retirada ambigua no se sustituye por una relación anterior',()=>{
 const r=revision();r.cambios.push({en:'2026-11-11T22:16:00Z',antes:{[fecha]:antes},despues:{[fecha]:{obac:'o',maq:'m',vol:['ludwig','otro','v1']}}});assert.equal(avisoSegunDotacion(aviso,r),aviso);
});
test('API única entrega el mismo resuelto a Mi espacio, T3, administrador y Ayudante; no escribe en Neon',async()=>{
 const roster=[{id:'pablo',cargo:'Voluntario'},{id:'ludwig',cargo:'Voluntario'},{id:'v1',cargo:'Voluntario'},{id:'t3',cargo:'Teniente Tercero'},{id:'ayudante',cargo:'Ayudante'},{id:'admin',cargo:'Voluntario',clave:'517'}];
 await writeState(sql,'roster:v8',roster);await writeState(sql,'guardia-revision:'+fecha,revision());await writeState(sql,'guardia-aviso:'+fecha+':pablo',aviso);
 const original=await readState(sql,'guardia-aviso:'+fecha+':pablo');
 for(const actor of ['pablo','ludwig','t3','ayudante','admin']){const r=await llamar(GET,'/api/guardia/avisos?actorId='+actor);assert.equal(r.status,200);assert.equal(r.json.items[0].value.estado,'cubierto');assert.equal(r.json.items[0].value.reemplazoId,'ludwig');assert.equal(r.json.items[0].value.motivo,actor==='ludwig'?undefined:aviso.motivo);}
 const ajeno=await llamar(GET,'/api/guardia/avisos?actorId=v1');assert.deepEqual(ajeno.json.items,[]);
 assert.deepEqual(await readState(sql,'guardia-aviso:'+fecha+':pablo'),original);assert.equal((await readState(sql,'guardia-revision:'+fecha)).version,1);assert.equal((await readState(sql,'guardia-acreditacion:'+fecha)).version,0);
});
test('Ayudante recibe pendientes sin un reemplazo demostrado; actor inválido o inactivo no accede',async()=>{
 await writeState(sql,'guardia-aviso:'+fecha+':v1',{...aviso,id:'v1'});const r=await llamar(GET,'/api/guardia/avisos?actorId=ayudante');assert.equal(r.json.items.find(x=>x.value.id==='v1').value.estado,'abierto');
 assert.equal((await llamar(GET,'/api/guardia/avisos')).status,400);assert.equal((await llamar(GET,'/api/guardia/avisos?actorId=ajeno')).status,403);
 await writeState(sql,'roster:v8',[{id:'inactivo',cargo:'Ayudante',activo:false}]);assert.equal((await llamar(GET,'/api/guardia/avisos?actorId=inactivo')).status,403);
});
