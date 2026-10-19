import {neon} from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {oficialAutorizado} from "../../../../lib/guardia-acreditacion.js";
import {miercolesSemana,horaCivilChile,esAdministradorGuardia,esOficialGuardia} from "../../../../lib/guardia-libro.js";
import {resumenNoche,nochesPendientesSemana} from "../../../../lib/guardia-semana.js";
import {avisarOficiales} from "../../../../lib/guardia-avisos-oficiales.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const error=(code,status,extra={})=>Response.json({error:code,...extra},{status});
function origen(req){const o=req.headers.get("origin");if(!o)return false;try{return new URL(o).host===req.headers.get("host");}catch{return false;}}
const nombre=p=>[p?.nombre,p?.apellidoPaterno,p?.apellidoMaterno].filter(Boolean).join(" ").trim();
async function cargarSemana(sql,inicio){
 const revision=(await readState(sql,"guardia-revision:"+inicio)).value;
 if(revision?.estado!=="aprobada"||!revision.noches)return null;
 const fechas=Object.keys(revision.noches).sort(),ahora=horaCivilChile();
 const lecturas=await Promise.all(fechas.map(f=>Promise.all([
  readState(sql,"guardia-libro:"+f),readState(sql,"guardia-acreditacion:"+f),readState(sql,"guardia-incidencias:"+f)])));
 const resumenes=fechas.map((f,i)=>{
  const [lb,ac,inc]=lecturas[i];
  const r=resumenNoche({fecha:f,noche:revision.noches[f],libro:lb.value,acreditacion:ac.value,incidencias:inc.value?.items||[],revision,ahora});
  if(r.ratificacion)r.ratificacion.version=ac.version;
  return r;
 });
 return {revision,resumenes,versiones:Object.fromEntries(fechas.map((f,i)=>[f,lecturas[i][1].version]))};
}
export async function GET(req){
 const u=new URL(req.url),actorId=u.searchParams.get("actorId")||"",f=u.searchParams.get("semana")||"";
 const inicio=miercolesSemana(f);
 if(!inicio||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const roster=(await readState(sql,"roster:v8")).value;
  const actor=(Array.isArray(roster)?roster:[]).find(p=>String(p.id)===actorId&&p.activo!==false);
  if(!actor)return error("actor_no_en_nomina",403);
  if(!(oficialAutorizado(roster,actorId)||esAdministradorGuardia(actor)||esOficialGuardia(actor.cargo)))return error("solo_oficiales",403);
  const sem=await cargarSemana(sql,inicio);
  if(!sem)return Response.json({semana:inicio,aprobada:false,noches:[],pendientes:[],cierre:null},{headers:{"Cache-Control":"no-store"}});
  const cierre=await readState(sql,"guardia-cierre-semanal:"+inicio);
  const pendientes=nochesPendientesSemana(sem.resumenes);
  const vigente=!!cierre.value&&JSON.stringify(cierre.value.versiones)===JSON.stringify(sem.versiones);
  return Response.json({semana:inicio,aprobada:true,noches:sem.resumenes,pendientes,puedeCerrar:oficialAutorizado(roster,actorId)&&!pendientes.length,
    cierre:cierre.value,cierreVigente:vigente,cierreVersion:cierre.version,versiones:sem.versiones},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("cierre semanal GET",e);return error("database_error",500);}
}
export async function POST(req){
 if(!origen(req))return error("origen_no_permitido",403);
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let b;try{b=await req.json();}catch{return error("datos_invalidos",400);}
 const actorId=String(b?.actorId||""),inicio=miercolesSemana(String(b?.semana||""));
 if(!inicio||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const roster=(await readState(sql,"roster:v8")).value;
  if(!oficialAutorizado(roster,actorId))return error("solo_oficiales_autorizados",403);
  const actor=roster.find(p=>String(p.id)===actorId);
  const sem=await cargarSemana(sql,inicio);
  if(!sem)return error("semana_no_aprobada",409);
  const pendientes=nochesPendientesSemana(sem.resumenes);
  if(pendientes.length)return error("noches_pendientes",409,{pendientes});
  const cur=await readState(sql,"guardia-cierre-semanal:"+inicio);
  const mismas=cur.value&&JSON.stringify(cur.value.versiones)===JSON.stringify(sem.versiones);
  // Cierre repetido (o de otro oficial al mismo tiempo) sin cambios en las noches: es el mismo acto.
  if(mismas)return Response.json({ok:true,repetido:true,cierre:cur.value},{headers:{"Cache-Control":"no-store"}});
  const cierre={semana:inicio,estado:"cerrada",cerradaPorId:actorId,cerradaPorNombre:nombre(actor),cerradaPorCargo:String(actor.cargo||""),cerradaEn:new Date().toISOString(),
   observaciones:String(b?.observaciones||"").trim().slice(0,600),versiones:sem.versiones,
   resumen:sem.resumenes.map(r=>({fecha:r.fecha,estado:r.estado,programados:r.programada.total,presentes:r.ratificacion?.asistentes.length??0,ausentes:r.ratificacion?.ausentes.length??0,
     adicionales:r.ratificacion?.adicionales.length??0,obacEfectivoId:r.ratificacion?.obacEfectivoId??null,conductorEfectivoId:r.ratificacion?.conductorEfectivoId??null,
     ratificadoPor:r.ratificacion?.porNombre??null,cumplimiento:r.ratificacion?.cumplimiento??null,incidencias:r.incidencias.total,fotografia:r.libro.cerrado&&!r.libro.sinFoto})),
   reemplazaA:cur.value?{cerradaEn:cur.value.cerradaEn,cerradaPorNombre:cur.value.cerradaPorNombre}:null};
  const w=await writeState(sql,"guardia-cierre-semanal:"+inicio,cierre,{ifVersion:cur.version});
  if(!w.ok){
   const ya=await readState(sql,"guardia-cierre-semanal:"+inicio);
   if(ya.value&&JSON.stringify(ya.value.versiones)===JSON.stringify(sem.versiones))return Response.json({ok:true,repetido:true,cierre:ya.value});
   return error("version_conflict",409);
  }
  await avisarOficiales(sql,{clave:"sem:"+inicio+":"+w.version,tipo:"semana_cerrada",fecha:inicio,titulo:"Semana "+inicio+" cerrada por "+nombre(actor),porNombre:nombre(actor)});
  return Response.json({ok:true,cierre},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("cierre semanal POST",e);return error("database_error",500);}
}
