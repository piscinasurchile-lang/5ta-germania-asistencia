import {neon} from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {cargoAutorizadoGuardia,cumplimientoFinalT3,firmaContenido} from "../../../../lib/guardia-acreditacion.js";
import {miercolesSemana,informeRatificado} from "../../../../lib/guardia-libro.js";
import {avisarOficiales} from "../../../../lib/guardia-avisos-oficiales.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const error=(code,status,extra={})=>Response.json({error:code,...extra},{status});
function origen(req){const o=req.headers.get("origin");if(!o)return false;try{return new URL(o).host===req.headers.get("host");}catch{return false;}}
/** Segundo paso: un oficial autorizado acredita el cumplimiento final de una noche ya ratificada por cualquier oficial. */
export async function POST(req){
 if(!origen(req))return error("origen_no_permitido",403);
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let b;try{b=await req.json();}catch{return error("datos_invalidos",400);}
 const fecha=String(b?.fecha||""),actorId=String(b?.actorId||""),inicio=miercolesSemana(fecha);
 if(!inicio||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const [rr,rev,lb,ac]=await Promise.all([readState(sql,"roster:v8"),readState(sql,"guardia-revision:"+inicio),
    readState(sql,"guardia-libro:"+fecha),readState(sql,"guardia-acreditacion:"+fecha)]);
  const roster=Array.isArray(rr.value)?rr.value:[];
  const actor=roster.find(p=>String(p.id)===actorId&&p.activo!==false);
  if(!actor||!cargoAutorizadoGuardia(actor.cargo))return error("solo_oficiales_autorizados",403);
  const noche=rev.value?.noches?.[fecha];
  if(!noche||!informeRatificado({acreditacion:ac.value,revision:rev.value,noche,cierre:lb.value}))return error("noche_no_ratificada",409);
  if(cumplimientoFinalT3(ac.value))return Response.json({ok:true,repetida:true,version:ac.version},{headers:{"Cache-Control":"no-store"}});
  // La versión que vio el oficial debe ser la vigente: si otro oficial corrigió mientras tanto, debe revisar de nuevo.
  if(Number.isInteger(b?.ifVersion)&&b.ifVersion!==ac.version)return error("version_conflict",409,{version:ac.version});
  const nombre=[actor.nombre,actor.apellidoPaterno,actor.apellidoMaterno].filter(Boolean).join(" ").trim();
  const firma=firmaContenido({asistencias:ac.value.asistencias,adicionales:ac.value.adicionales,excusas:ac.value.excusas,
    obac:ac.value.obacEfectivoId??noche.obac,cond:ac.value.conductorEfectivoId??noche.maq});
  const nuevo={...ac.value,cumplimientoFinal:{estado:"acreditado",porId:actorId,porNombre:nombre,porCargo:String(actor.cargo||""),en:new Date().toISOString(),firma}};
  const w=await writeState(sql,"guardia-acreditacion:"+fecha,nuevo,{ifVersion:ac.version});
  if(w.conflict){
   const ya=await readState(sql,"guardia-acreditacion:"+fecha);
   if(cumplimientoFinalT3(ya.value))return Response.json({ok:true,repetida:true,version:ya.version});
   return error("version_conflict",409,{version:ya.version});
  }
  await avisarOficiales(sql,{clave:"fin:"+fecha+":"+w.version,tipo:"acreditada_oficial",fecha,titulo: "Cumplimiento acreditado por oficial · "+fecha+" · "+nombre,porNombre:nombre});
  return Response.json({ok:true,version:w.version,porNombre:nombre},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia acreditar final",e);return error("database_error",500);}
}
