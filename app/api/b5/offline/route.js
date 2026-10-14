/* Solo recepción de borradores generados desde la Tablet B-5 registrada.
 * Nunca aceptamos escrituras si faltan conexión, firma de instalación o una fecha válida.
 * Una duplicación o conflicto requiere revisión y nunca sobrescribe registros existentes.
 */
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState} from "../../../../lib/state-store.js";
import {buscarDispositivo,REGISTRY_KEY,DEVICE_COOKIE,cookieValue,sameOrigin}
  from "../../../../lib/b5-dispositivo.mjs";
import {integrarBorradorB5,ConflictoB5,InvalidoB5} from "../../../../lib/b5-offline-server.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const fail=(error,status)=>Response.json({error},{status,headers});
export async function POST(request){
  if(!sameOrigin(request))return fail("origen_no_permitido",403);
  const token=cookieValue(request.headers,DEVICE_COOKIE);
  if(!token)return fail("tablet_no_registrada",403);
  if(!process.env.DATABASE_URL)return fail("base_no_disponible",503);
  const length=Number(request.headers.get("content-length")||"0");
  if(length>150_000)return fail("demasiados_datos",413);
  let item;
  try{item=await request.json();}catch{return fail("json_invalido",400);}
  try{
    const sql=neon(process.env.DATABASE_URL);
    await ensureSchema(sql);
    const registro=(await readState(sql,REGISTRY_KEY)).value;
    if(!buscarDispositivo(registro,token))return fail("tablet_no_registrada",403);
    const resultado=await integrarBorradorB5(sql,item);
    return Response.json(resultado,{headers});
  }catch(e){
    if(e instanceof ConflictoB5)return fail(e.message,409);
    if(e instanceof InvalidoB5)return fail(e.message,400);
    console.error("b5 offline sync failed",e);
    return fail("sincronizacion_pendiente",503);
  }
}
