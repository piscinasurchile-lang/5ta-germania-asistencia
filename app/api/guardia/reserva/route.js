import {neon} from "@neondatabase/serverless";
import {ensureSchema, readState} from "../../../../lib/state-store.js";
import {evaluarInscripcion} from "../../../../lib/guardia-reglas.mjs";

export const runtime="nodejs";
const fechaValida=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||"") && !Number.isNaN(Date.parse(x+"T12:00:00Z"));
const sameOrigin=req=>{try{return new URL(req.headers.get("origin")).host===req.headers.get("host");}catch{return false;}};
const responder=(codigo,status=409)=>Response.json({ok:false,codigo},{status,headers:{"Cache-Control":"no-store"}});

/* Primera versión: un solo registro de ocupación por fecha, serializado por el UPSERT.
   IMPORTANTE: este endpoint NO es aún la inscripción institucional completa:
   requiere identidad autenticada, habilitación de conductor y revisión de períodos.
   Hasta integrar esos controles se bloquean todas las escrituras por defecto. */
export async function POST(request){
 if(!sameOrigin(request)) return responder("ORIGEN_INVALIDO",403);
 if(process.env.GUARDIA_RESERVAS_HABILITADAS!=="true") return responder("INTEGRACION_PENDIENTE",503);
 // No habilitar por configuración hasta implementar identidad verificada.
 return responder("IDENTIDAD_PENDIENTE",503);
}

export async function GET(request){
 const fecha=new URL(request.url).searchParams.get("fecha");
 if(!fechaValida(fecha)) return responder("FECHA_INVALIDA",400);
 if(!process.env.DATABASE_URL) return responder("SIN_BASE",503);
 try{
  const sql=neon(process.env.DATABASE_URL);
  await ensureSchema(sql);
  const state=await readState(sql,"guardia-conductor:"+fecha);
  return Response.json({fecha,ocupado:!!state.value},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia conductor read",e);return responder("ERROR_BASE",500);}
}
