import crypto from "node:crypto";
/* Segundo factor para las acciones con autoridad (ratificar, acreditar, cerrar, resolver): además del actorId de la nómina,
 * exige la sesión de oficialidad (cookie httpOnly firmada que se obtiene con la clave de la oficialidad).
 * Se activa con GERMANIA_EXIGIR_SESION_OFICIAL=1. Apagado por defecto: no cambia el comportamiento actual. */
function valida(req){
  const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN;
  const got=req.cookies?.get("quinta_oficialidad")?.value||"";
  if(!secret||!got)return false;
  const esperado=crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
  const a=Buffer.from(got),b=Buffer.from(esperado);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
export function sesionOficialExigida(){return process.env.GERMANIA_EXIGIR_SESION_OFICIAL==="1";}
/** null si puede continuar; Response 403 si falta la sesión de oficialidad. */
export function exigirSesionOficial(req){
  if(!sesionOficialExigida()||valida(req))return null;
  return Response.json({error:"oficialidad_requerida"},{status:403,headers:{"Cache-Control":"no-store"}});
}
