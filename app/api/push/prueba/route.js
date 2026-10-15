/* Prueba de extremo a extremo sólo hacia el teléfono que posee la suscripción;
   no publica ODD ni mensajes de prueba compartidos. */
import {baseDatos,configuracion,validarSuscripcion,asegurarSuscripciones,
  origenCoincide,enviarPush,esPruebaActiva} from "../../../../lib/germania-webpush.mjs";
export const runtime="nodejs";
const cache={"Cache-Control":"no-store"};
const error=(e,status)=>Response.json({error:e},{status,headers:cache});
export async function POST(request){
  if(!origenCoincide(request))return error("origen_invalido",403);
  if(!esPruebaActiva())return error("prueba_desactivada",403);
  const sql=baseDatos(),cfg=configuracion();
  if(!sql||!cfg)return error("push_no_configurado",503);
  let subscription;try{subscription=validarSuscripcion(await request.json())}
  catch(e){return error(e.message||"suscripcion_invalida",400)}
  try{
    await asegurarSuscripciones(sql);
    // Suscripción y clave de autenticación deben coincidir; máximo una prueba por minuto.
    const rows=await sql`UPDATE germania_push_suscripciones
      SET ultimo_test=now()
      WHERE endpoint_hash=${subscription.endpointHash} AND auth=${subscription.auth}
        AND vapid_public=${cfg.publicKey} AND origen=${new URL(request.url).origin}
        AND invalida=false AND (ultimo_test IS NULL OR ultimo_test<now()-interval '60 seconds')
      RETURNING endpoint,p256dh,auth,endpoint_hash`;
    if(!rows.length){
      const guardados=await sql`SELECT ultimo_test FROM germania_push_suscripciones
        WHERE endpoint_hash=${subscription.endpointHash} AND auth=${subscription.auth}
        AND vapid_public=${cfg.publicKey} AND origen=${new URL(request.url).origin} AND invalida=false
        LIMIT 1`;
      if(!guardados.length)return error("suscripcion_no_registrada",404);
      const fecha=Date.parse(guardados[0].ultimo_test||"");
      const espera=Number.isFinite(fecha)?Math.max(1,Math.ceil((fecha+60000-Date.now())/1000)):60;
      return Response.json({error:"esperar_entre_pruebas",reintentarEnSegundos:espera},{status:429,headers:cache});
    }
    const push=await enviarPush(rows[0],{
      tipo:"germania-informacion",clase:"prueba",
      titulo:"PRUEBA GERMANIA · No es emergencia",url:"/"},cfg);
    if(push.expirada){
      await sql`UPDATE germania_push_suscripciones SET invalida=true
        WHERE endpoint_hash=${subscription.endpointHash}`;
    }
    return Response.json({ok:push.ok,estado:push.status},{status:push.ok?200:502,headers:cache});
  }catch(e){console.error("push prueba",e);return error("fallo_envio_push",502)}
}
