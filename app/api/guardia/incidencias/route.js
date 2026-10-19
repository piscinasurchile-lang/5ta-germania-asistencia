import {neon} from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import {ensureSchema,readState} from "../../../../lib/state-store.js";
import {oficialAutorizado,integrantesNoche} from "../../../../lib/guardia-acreditacion.js";
import {miercolesSemana,esAdministradorGuardia} from "../../../../lib/guardia-libro.js";
import {TIPOS_INCIDENCIA,TIPOS_CRITICOS,validarIncidencia,agregarIncidencia,resolverIncidencia} from "../../../../lib/guardia-incidencias.js";
import {avisarOficiales} from "../../../../lib/guardia-avisos-oficiales.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const error=(code,status)=>Response.json({error:code},{status});
function origen(req){const o=req.headers.get("origin");if(!o)return false;try{return new URL(o).host===req.headers.get("host");}catch{return false;}}
const nombre=p=>[p?.nombre,p?.apellidoPaterno,p?.apellidoMaterno].filter(Boolean).join(" ").trim();
async function contexto(sql,fecha,actorId){
 const roster=(await readState(sql,"roster:v8")).value;
 const actor=(Array.isArray(roster)?roster:[]).find(p=>String(p.id)===String(actorId)&&p.activo!==false);
 const rev=(await readState(sql,"guardia-revision:"+miercolesSemana(fecha))).value;
 const noche=rev?.estado==="aprobada"?rev.noches?.[fecha]:null;
 return {roster,actor,noche,oficial:!!actor&&oficialAutorizado(roster,actorId),
   integrante:!!actor&&!!noche&&integrantesNoche(noche).includes(String(actorId))};
}
export async function GET(req){
 const u=new URL(req.url),fecha=u.searchParams.get("fecha")||"",actorId=u.searchParams.get("actorId")||"";
 if(!miercolesSemana(fecha)||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const c=await contexto(sql,fecha,actorId);
  if(!c.actor)return error("actor_no_en_nomina",403);
  if(!(c.oficial||c.integrante||esAdministradorGuardia(c.actor)))return error("no_autorizado",403);
  const cur=await readState(sql,"guardia-incidencias:"+fecha);
  return Response.json({fecha,items:cur.value?.items||[],tipos:TIPOS_INCIDENCIA,version:cur.version},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("incidencias GET",e);return error("database_error",500);}
}
export async function POST(req){
 if(!origen(req))return error("origen_no_permitido",403);
 let b;try{b=await req.json();}catch{return error("datos_invalidos",400);}
 const fecha=String(b?.fecha||""),actorId=String(b?.actorId||""),accion=String(b?.accion||"registrar");
 if(!miercolesSemana(fecha)||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const c=await contexto(sql,fecha,actorId);
  if(!c.actor)return error("actor_no_en_nomina",403);
  if(!c.noche)return error("noche_no_aprobada",409);
  const ahora=new Date().toISOString();
  if(accion==="resolver"){
   const sesion=exigirSesionOficial(req);if(sesion)return sesion;
   if(!c.oficial)return error("solo_oficiales_autorizados",403);
   const resolucion=String(b?.resolucion||"").trim();
   if(resolucion.length<3||resolucion.length>600)return error("resolucion_requerida",400);
   if(!/^[A-Za-z0-9_-]{6,64}$/.test(String(b?.id||"")))return error("id_invalido",400);
   const r=await resolverIncidencia(sql,fecha,String(b.id),{resolucion,resueltaPorId:actorId,resueltaPorNombre:nombre(c.actor),resueltaEn:ahora});
   return r.ok?Response.json(r):error(r.error,r.error==="incidencia_no_existe"?404:409);
  }
  if(!(c.oficial||c.integrante))return error("no_autorizado",403);
  const err=validarIncidencia(b);
  if(err)return error(err,400);
  const item={id:String(b.id),tipo:b.tipo,personaId:b.personaId?String(b.personaId):null,detalle:String(b.detalle).trim(),
    horaSuceso:/^\d{2}:\d{2}$/.test(String(b.hora||""))?String(b.hora):null,estado:"abierta",automatica:false,
    registradaPorId:actorId,registradaPorNombre:nombre(c.actor),en:ahora};
  const r=await agregarIncidencia(sql,fecha,item);
  if(!r.ok)return error(r.error,409);
  if(!r.repetida&&TIPOS_CRITICOS.has(item.tipo))
   await avisarOficiales(sql,{clave:"inc:"+fecha+":"+item.id,tipo:"incidencia_critica",fecha,titulo:"Incidencia crítica · "+TIPOS_INCIDENCIA[item.tipo]+" · "+fecha,porNombre:item.registradaPorNombre});
  return Response.json({ok:true,repetida:r.repetida,incidencia:r.incidencia});
 }catch(e){console.error("incidencias POST",e);return error("database_error",500);}
}
