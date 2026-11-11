import {readState} from './state-store.js';
import {fechasSemana} from './guardia-maquinista.mjs';
import {puedeAprobarGuardia,firmaDotacion,registroVigente} from './guardia-acreditacion.js';
import {semanaTerminada,cumplimientoVisible,prepararActaRevision} from './guardia-revision-semanal.mjs';
import {informeRatificado} from './guardia-libro.js';

export async function consultarAprobacionSemana(sql,inicio,actorId){
 const fechas=fechasSemana(inicio);
 if(fechas.length!==7)throw Error('semana_invalida');
 const [nomina,revision,cierre]=await Promise.all([readState(sql,'roster:v8'),readState(sql,'guardia-revision:'+inicio),readState(sql,'guardia-cierre-semanal:'+inicio)]);
 const roster=Array.isArray(nomina.value)?nomina.value:[];
 if(!puedeAprobarGuardia(roster,actorId))throw Error('solo_oficiales_autorizados');
 if(revision.value?.estado!=='aprobada'||!fechas.every(f=>revision.value.noches?.[f]))throw Error('dotacion_no_aprobada');
 const actas={},libros={};
 await Promise.all(fechas.map(async f=>{[actas[f],libros[f]]=await Promise.all([readState(sql,'guardia-acreditacion:'+f),readState(sql,'guardia-libro:'+f)]);}));
 const visible=cumplimientoVisible(revision.value,actas);
 const noches=fechas.map(fecha=>{
  const noche=revision.value.noches[fecha],libro=libros[fecha],acta=actas[fecha],detalle=visible[fecha];
  const vinculada=informeRatificado({acreditacion:acta.value,revision:revision.value,noche,cierre:libro.value});
  const aprobada=registroVigente(acta.value,revision.value)&&detalle?.aprobada===true&&vinculada;
  const integrantes=detalle?.integrantes||[{id:String(noche.obac),funcion:'OBAC',estado:'presente'},{id:String(noche.maq),funcion:'Maquinista',estado:'presente'},...noche.vol.map(id=>({id:String(id),funcion:'Voluntario',estado:'presente'}))];
  const motivos=detalle?.motivos||{};
  let error=null;
  try{prepararActaRevision({noche,integrantes,motivos,roster});}catch(e){error=e.codigo||'revision_invalida';}
  const libroValido=libro.value?.estado==='enviado'&&libro.value.revisionAprobadaEn===revision.value.aprobadaEn&&libro.value.dotacionFirma===firmaDotacion(noche);
  if(!aprobada&&!libroValido)error='libro_no_cerrado_o_desactualizado';
  if(acta.value&&!vinculada)error='aprobacion_desactualizada_revisar_dia';
  const nombre=id=>{const p=roster.find(p=>String(p.id)===String(id));return p?[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(' '):noche.apoyoExterno?.id===id?noche.apoyoExterno.nombre:'Sin identificar';};
  return {fecha,aprobada,fuente:detalle?'revision':'programacion',integrantes:integrantes.map(p=>({...p,nombre:nombre(p.id)})),motivos,error,
   libro:libroValido,tieneFoto:libroValido&&libro.value.sinFoto!==true&&!!libro.value.fotoClave,sinFoto:libro.value?.sinFoto===true,libroVersion:libro.version,acreditacionVersion:acta.version};
 });
 const terminada=semanaTerminada(inicio),cerrada=revision.value.cerrada===true||cierre.value?.estado==='cerrada';
 return {inicio,version:revision.version,nominaVersion:nomina.version,terminada,cerrada,noches,
  puedeAprobar:terminada&&!cerrada&&noches.every(n=>!n.error),pendientes:noches.filter(n=>!n.aprobada).length,
  versiones:Object.fromEntries(noches.map(n=>[n.fecha,{libro:n.libroVersion,acreditacion:n.acreditacionVersion}])),revision:revision.value,roster};
}

export async function aprobarSemanaConConexion(client,req,b,acreditar){
 const fechas=fechasSemana(b.inicio);
 if(fechas.length!==7||b.confirmado!==true||!Number.isInteger(b.version)||!Number.isInteger(b.nominaVersion)||!b.versiones)throw Error('datos_invalidos');
 const sql=(strings,...values)=>{let query=strings[0];values.forEach((_,i)=>{query+='$'+(i+1)+strings[i+1];});return client.query(query,values).then(r=>r.rows);};
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['guardia-aprobacion:'+b.inicio]);
  const keys=['roster:v8','guardia-revision:'+b.inicio,'guardia-cierre-semanal:'+b.inicio,'guardia-horarios:v1',...fechas.flatMap(f=>['guardia-libro:'+f,'guardia-acreditacion:'+f])].sort();
  await client.query('SELECT key FROM app_state WHERE key=ANY($1::text[]) ORDER BY key FOR UPDATE',[keys]);
  const contexto=await consultarAprobacionSemana(sql,b.inicio,String(b.actorId||''));
  if(!contexto.terminada)throw Error('semana_no_finalizada');
  if(contexto.cerrada)throw Error('semana_cerrada');
  if(contexto.version!==b.version||contexto.nominaVersion!==b.nominaVersion)throw Error('version_conflict');
  if(contexto.noches.every(n=>n.aprobada&&!n.error)){await client.query('COMMIT');return {ok:true,repetida:true,aprobadas:7};}
  for(const n of contexto.noches){
   const v=b.versiones[n.fecha];
   if(!v||v.libro!==n.libroVersion||v.acreditacion!==n.acreditacionVersion)throw Object.assign(Error('version_conflict'),{fecha:n.fecha});
   if(n.error)throw Object.assign(Error(n.error),{fecha:n.fecha});
  }
  const resultados=[];
  for(const n of contexto.noches){
   if(n.aprobada)continue;
   const acta=prepararActaRevision({noche:contexto.revision.noches[n.fecha],integrantes:n.integrantes,motivos:n.motivos,roster:contexto.roster});
   const respuesta=await acreditar({headers:req.headers,cookies:req.cookies,json:async()=>({fecha:n.fecha,actorId:b.actorId,ifVersion:n.acreditacionVersion,...acta,revisionSemanal:acta.detalle})},sql,false);
   const resultado=await respuesta.json();
   if(!respuesta.ok)throw Object.assign(Error(resultado.error||'aprobacion_fallida'),{fecha:n.fecha});
   resultados.push({fecha:n.fecha,...resultado});
  }
  await client.query('COMMIT');
  return {ok:true,aprobadas:7,nuevas:resultados.length,resultados};
 }catch(e){await client.query('ROLLBACK');throw e;}
}
