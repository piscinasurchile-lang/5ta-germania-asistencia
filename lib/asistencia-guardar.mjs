import {createHash} from 'node:crypto';
import {readState,writeState,addToList} from './state-store.js';
const INDEX='partes:index:v1';
const fail=(message,conflicto=false)=>Object.assign(new Error(message),{conflicto,validacion:!conflicto});
export function validarAsistencia(body){
 const d=body?.datos;
 if(!body||typeof body.clave!=='string'||!/^\d{4}-\d{2}-\d{2}__[a-zA-Z0-9_-]+$/.test(body.clave||'')||body.clave.length>94||!Number.isInteger(body.version)||body.version<0||!/^[-a-zA-Z0-9_]{8,80}$/.test(body.operacion||''))throw fail('operacion_invalida');
 if(!d||!/^\d{4}-\d{2}-\d{2}$/.test(d.date||'')||!Number.isFinite(Date.parse(d.date+'T12:00:00Z'))||new Date(d.date+'T12:00:00Z').toISOString().slice(0,10)!==d.date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.hora||''))throw fail('fecha_hora_requeridas');
 for(const k of ['tipo','detalle','registradoPor'])if(typeof d[k]!=='string'||!d[k].trim()||d[k].length>1000)throw fail('campos_obligatorios');
 if(!Array.isArray(d.eligibleIds)||!d.eligibleIds.length||d.eligibleIds.length>500||d.eligibleIds.some(id=>typeof id!=='string'||!id)||new Set(d.eligibleIds).size!==d.eligibleIds.length)throw fail('nomina_invalida');
 if(!d.records||Array.isArray(d.records)||typeof d.records!=='object'||Object.keys(d.records).length!==d.eligibleIds.length||d.eligibleIds.some(id=>!Object.hasOwn(d.records,id)||!['presente','ausente','justificado'].includes(d.records[id])))throw fail('lista_incompleta');
 if(!d.eligibleIds.some(id=>d.records[id]==='presente'))throw fail('requiere_un_presente');
 return d;
}
export async function guardarAsistencia(client,body){
 const d=validarAsistencia(body),key='parte:'+body.clave;
 const hash=createHash('sha256').update(JSON.stringify({clave:body.clave,version:body.version,datos:d})).digest('hex');
 const sql=(strings,...values)=>{let text=strings[0];values.forEach((_,i)=>{text+='$'+(i+1)+strings[i+1];});return client.query(text,values).then(r=>r.rows);};
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('germania:asistencia:guardar'))");
  await client.query('SELECT key FROM app_state WHERE key=$1 FOR UPDATE',[key]);
  const actual=await readState(sql,key);
  if(actual.value?.asistenciaOperacion===body.operacion){
   if(actual.value.asistenciaOperacionHash!==hash)throw fail('operacion_reutilizada',true);
   await client.query('COMMIT');return {value:actual.value,version:actual.version,repetido:true};
  }
  if(actual.version!==body.version)throw fail('version_conflict',true);
  if(actual.value&&(actual.value.anulado||actual.value.origenAsistencia==='emergencia_b5'))throw fail('registro_requiere_modulo_origen');
  if(actual.value&&(d.date!==actual.value.date||d.tipo!==actual.value.tipo))throw fail('conservar_fecha_tipo');
  const roster=await readState(sql,'roster:v8');
  if(!Array.isArray(roster.value))throw fail('nomina_no_disponible');
  const esperados=actual.value?(actual.value.eligibleIds||Object.keys(actual.value.records||{})).map(String):roster.value.filter(p=>p.activo!==false).map(p=>String(p.id));
  if(esperados.length!==d.eligibleIds.length||esperados.some(id=>!d.eligibleIds.includes(id)))throw fail('nomina_cambio_revisar');
  let numero=actual.value?.numero??null,anio=actual.value?.anio||d.date.slice(0,4);
  if(!actual.value){
   const contador='correlativo:parte:'+anio;
   await client.query("INSERT INTO app_state(key,value,version) VALUES($1,'{\"actual\":0}'::jsonb,1) ON CONFLICT(key) DO NOTHING",[contador]);
   await client.query('SELECT key FROM app_state WHERE key=$1 FOR UPDATE',[contador]);
   const c=await readState(sql,contador);numero=Number(c.value?.actual||0)+1;
   if(!Number.isSafeInteger(numero)||numero<1)throw fail('correlativo_invalido');
   await writeState(sql,contador,{...c.value,actual:numero},{ifVersion:c.version});
  }
  const tipo=d.tipo.trim(),tl=tipo.toLowerCase();
  const origen=tl.includes('comandancia')?'comandancia_citacion':(tl.includes('anb')||tl.includes('curso'))?'curso_anb_citacion':'citacion_manual';
  const value={...actual.value,date:d.date,hora:d.hora,records:d.records,eligibleIds:d.eligibleIds,tipo,detalle:d.detalle.trim(),registradoPor:d.registradoPor.trim(),numero,anio,origenAsistencia:actual.value?.origenAsistencia||origen,generaAsistencia:true,asistenciaControlVersion:1,asistenciaOperacion:body.operacion,asistenciaOperacionHash:hash,creadoEn:actual.value?.creadoEn||new Date().toISOString(),modificadoEn:new Date().toISOString()};
  const r=await writeState(sql,key,value,{ifVersion:body.version});if(!r.ok)throw fail('version_conflict',true);
  const idx=await addToList(sql,INDEX,{clave:body.clave,date:value.date,tipo:value.tipo,creadoEn:value.creadoEn},{uniqueBy:'clave'});if(!idx.ok)throw fail('indice_invalido');
  await client.query('COMMIT');return {value,version:r.version,repetido:false};
 }catch(error){await client.query('ROLLBACK');throw error;}
}
