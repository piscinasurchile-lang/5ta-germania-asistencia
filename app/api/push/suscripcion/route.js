import {baseDatos,configuracion,validarSuscripcion,asegurarSuscripciones,origenCoincide,esPruebaActiva} from "../../../../lib/germania-webpush.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const cache={"Cache-Control":"no-store"};
const error=(code,status)=>Response.json({error:code},{status,headers:cache});
export async function GET(){
  const config=configuracion();
  return Response.json({disponible:!!config,pruebaDisponible:esPruebaActiva(),
    publicKey:config?.publicKey||null},{headers:cache});
}
export async function POST(request){
  if(!origenCoincide(request))return error("origen_invalido",403);
  const config=configuracion(),sql=baseDatos();
  if(!config||!sql)return error("push_no_configurado",503);
  let sub;
  try{sub=validarSuscripcion(await request.json())}catch(e){return error(e.message||"suscripcion_invalida",400)}
  const origen=new URL(request.url).origin;
  try{
    await asegurarSuscripciones(sql);
    await sql`INSERT INTO germania_push_suscripciones
      (endpoint_hash,endpoint,p256dh,auth,vapid_public,origen,invalida)
      VALUES (${sub.endpointHash},${sub.endpoint},${sub.p256dh},${sub.auth},${config.publicKey},${origen},false)
      ON CONFLICT (endpoint_hash) DO UPDATE SET
      endpoint=EXCLUDED.endpoint,p256dh=EXCLUDED.p256dh,auth=EXCLUDED.auth,
      vapid_public=EXCLUDED.vapid_public,origen=EXCLUDED.origen,
      actualizado_en=now(),invalida=false`;
    return Response.json({ok:true},{headers:cache});
  }catch(e){console.error("push registro",e);return error("error_registro_push",500)}
}
export async function DELETE(request){
  if(!origenCoincide(request))return error("origen_invalido",403);
  const sql=baseDatos();if(!sql)return error("push_no_configurado",503);
  let sub;try{sub=validarSuscripcion(await request.json())}catch(e){return error(e.message||"suscripcion_invalida",400)}
  try{
    await asegurarSuscripciones(sql);
    await sql`DELETE FROM germania_push_suscripciones
      WHERE endpoint_hash=${sub.endpointHash} AND auth=${sub.auth}`;
    return Response.json({ok:true},{headers:cache});
  }catch(e){console.error("push baja",e);return error("error_baja_push",500)}
}
