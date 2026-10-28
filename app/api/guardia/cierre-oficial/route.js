import {neon} from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {firmaDotacion,oficialAutorizado} from "../../../../lib/guardia-acreditacion.js";
import {miercolesSemana,horaCivilChile,nocheFinalizada} from "../../../../lib/guardia-libro.js";
import {agregarIncidencia} from "../../../../lib/guardia-incidencias.js";
import {avisarOficiales} from "../../../../lib/guardia-avisos-oficiales.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const error=(code,status)=>Response.json({error:code},{status});
function origen(req){const o=req.headers.get("origin");if(!o)return false;try{return new URL(o).host===req.headers.get("host");}catch{return false;}}
const nombre=p=>[p?.nombre,p?.apellidoPaterno,p?.apellidoMaterno].filter(Boolean).join(" ").trim();
/** Cierre excepcional del libro por un oficial autorizado, SIN fotografía (OBAC ausente, fotografía perdida, falla del teléfono).
 *  Queda marcado `sinFoto`: es un registro cerrado; aún debe aprobarlo un oficial. Reintentos del mismo oficial no duplican. */
export async function POST(req){
 if(!origen(req))return error("origen_no_permitido",403);
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let b;try{b=await req.json();}catch{return error("datos_invalidos",400);}
 const fecha=String(b?.fecha||""),actorId=String(b?.actorId||""),motivo=String(b?.motivo||"").trim(),novedades=String(b?.novedades||"").trim();
 if(!miercolesSemana(fecha)||!actorId)return error("datos_invalidos",400);
 if(motivo.length<8||motivo.length>400)return error("motivo_requerido",400);
 if(!novedades||novedades.length>1800)return error("novedades_requeridas",400);
 if(!process.env.DATABASE_URL)return error("database_not_configured",503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const roster=(await readState(sql,"roster:v8")).value;
  if(!oficialAutorizado(roster,actorId))return error("solo_oficiales_autorizados",403);
  const actor=roster.find(p=>String(p.id)===actorId);
  const rev=(await readState(sql,"guardia-revision:"+miercolesSemana(fecha))).value;
  const noche=rev?.estado==="aprobada"?rev.noches?.[fecha]:null;
  const firma=firmaDotacion(noche);
  if(!noche||!firma)return error("dotacion_incompleta",409);
  if(!nocheFinalizada(fecha,horaCivilChile()))return error("noche_no_finalizada",409);
  const cur=await readState(sql,"guardia-libro:"+fecha);
  if(cur.value){
   if(cur.value.sinFoto===true&&cur.value.cierrePorOficial?.id===actorId&&cur.value.motivoSinFoto===motivo)return Response.json({ok:true,repetido:true,fecha},{headers:{"Cache-Control":"no-store"}});
   return error("libro_ya_cerrado",409);
  }
  const meta={fecha,estado:"enviado",sinFoto:true,motivoSinFoto:motivo,obacId:String(noche.obac),obacNombre:nombre(roster.find(p=>String(p.id)===String(noche.obac))),
   novedades,fotoClave:null,fotoMime:null,fotoBytes:0,fotoSHA256:null,revisionAprobadaEn:rev.aprobadaEn,dotacionFirma:firma,
   enviadoEn:new Date().toISOString(),cierrePorOficial:{id:actorId,nombre:nombre(actor),cargo:String(actor.cargo||"")},
   destinatarios:["oficiales_autorizados"],informeCapitan:"despues_de_ratificacion"};
  const w=await writeState(sql,"guardia-libro:"+fecha,meta,{ifVersion:0});
  if(!w.ok){
   const ya=(await readState(sql,"guardia-libro:"+fecha)).value;
   if(ya?.sinFoto===true&&ya.cierrePorOficial?.id===actorId&&ya.motivoSinFoto===motivo)return Response.json({ok:true,repetido:true,fecha},{headers:{"Cache-Control":"no-store"}});
   return error("libro_ya_cerrado",409);
  }
  await agregarIncidencia(sql,fecha,{id:"auto-foto-"+fecha,tipo:"foto_faltante",personaId:null,detalle:"Cierre sin fotografía por "+nombre(actor)+": "+motivo,
    estado:"abierta",automatica:true,registradaPorId:actorId,registradaPorNombre:nombre(actor),en:meta.enviadoEn});
  await avisarOficiales(sql,{clave:"libro:"+fecha,tipo:"libro_entregado",fecha,titulo:"Libro cerrado por "+nombre(actor)+" sin fotografía · "+fecha+" · pendiente de aprobación",porNombre:nombre(actor)});
  return Response.json({ok:true,fecha},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("cierre oficial",e);return error("database_error",500);}
}
