import {neon} from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {miercolesSemana,cargoCapitan,informeRatificado,vistoCapitanValido} from "../../../../lib/guardia-libro.js";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const error=(code,status)=>Response.json({error:code},{status});
function mismoOrigen(req){
 const o=req.headers.get("origin");if(!o)return false;
 try{return new URL(o).host===req.headers.get("host");}catch{return false;}
}
/** Único efecto de este botón: guardar acuse de lectura del Capitán, no acreditar asistencias. */
export async function POST(req){
 if(!mismoOrigen(req))return error("origen_no_permitido",403);
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let body;try{body=await req.json();}catch{return error("datos_invalidos",400);}
 const fecha=String(body?.fecha||""),actorId=String(body?.actorId||"");
 if(!miercolesSemana(fecha)||!actorId)return error("datos_invalidos",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);
  await ensureSchema(sql);
  const [nomina,revision,cierre,acreditacion,anterior]=await Promise.all([
   readState(sql,"roster:v8"),
   readState(sql,"guardia-revision:"+miercolesSemana(fecha)),
   readState(sql,"guardia-libro:"+fecha),
   readState(sql,"guardia-acreditacion:"+fecha),
   readState(sql,"guardia-visto-capitan:"+fecha)
  ]);
  const actor=(Array.isArray(nomina.value)?nomina.value:[]).find(m=>
   String(m.id)===actorId&&m.activo!==false);
  if(!actor||!cargoCapitan(actor.cargo))return error("solo_capitan",403);
  const noche=revision.value?.noches?.[fecha];
  if(!noche||!informeRatificado({acreditacion:acreditacion.value,
       revision:revision.value,noche,cierre:cierre.value}))return error("informe_no_ratificado",409);
  if(vistoCapitanValido(anterior.value,acreditacion.value))
   return Response.json({ok:true,yaVisto:true,fecha},{headers:{"Cache-Control":"no-store"}});
  const nombre=[actor.nombre,actor.apellidoPaterno,actor.apellidoMaterno].filter(Boolean).join(" ");
  const registro={fecha,estado:"visto",capitanId:String(actor.id),capitanNombre:nombre,
   vistoEn:new Date().toISOString(),ratificacionEn:acreditacion.value.acreditadoEn};
  const guardado=await writeState(sql,"guardia-visto-capitan:"+fecha,registro,{ifVersion:anterior.version});
  if(guardado.conflict)return error("version_conflict",409);
  return Response.json({ok:true,fecha,vistoEn:registro.vistoEn},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia visto capitan",e);return error("database_error",500);}
}
