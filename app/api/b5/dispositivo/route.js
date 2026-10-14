/* Registro digital liviano de la instalación Tablet B-5.
 * Sin permisos operativos; NO valida que sea el equipo físico de la compañía.
 * La identidad se pierde si se eliminan las cookies de este navegador.
 */
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {REGISTRY_KEY,DEVICE_COOKIE,MARKER_COOKIE,nuevoDispositivo,
        buscarDispositivo,tokenValido,evaluarRegistro,cookieValue,sameOrigin,idPublico} from "../../../../lib/b5-dispositivo.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"no-store"};
const fail=(error,status)=>Response.json({error},{status,headers:HEADERS});

function sqlClient(){
  return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
}
function tokenRequest(request){
  const raw=cookieValue(request.headers,DEVICE_COOKIE);
  return tokenValido(raw)?raw:null;
}
function cookiesRegistro(response,token){
  response.headers.append("Set-Cookie",
    DEVICE_COOKIE+"="+token+"; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax");
  response.headers.append("Set-Cookie",
    MARKER_COOKIE+"=1; Path=/; Max-Age=31536000; Secure; SameSite=Lax");
  return response;
}
function okRegistro(id,token){
  const r=Response.json({registrado:true,dispositivo:"Tablet B-5",id:idPublico(id),
    identificacion:"instalacion_navegador",permisos:"sin_privilegios_adicionales"},
    {headers:HEADERS});
  return token?cookiesRegistro(r,token):r;
}

export async function GET(request){
  const token=tokenRequest(request);
  if(!token) return Response.json({registrado:false,motivo:"sin_registro"},{headers:HEADERS});
  const sql=sqlClient();
  if(!sql)return fail("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const {value}=await readState(sql,REGISTRY_KEY);
    const encontrado=buscarDispositivo(value,token);
    return encontrado?okRegistro(encontrado.id):Response.json(
      {registrado:false,motivo:"registro_no_encontrado"},{headers:HEADERS});
  }catch(e){
    console.error("b5 device GET",e);
    return fail("database_error",503);
  }
}

export async function POST(request){
  if(!sameOrigin(request))return fail("forbidden_origin",403);
  const sql=sqlClient();
  if(!sql)return fail("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const token=tokenRequest(request);
    for(let i=0;i<5;i++){
      const {value,version}=await readState(sql,REGISTRY_KEY);
      const registrados=Array.isArray(value)?value:[];
      // Repetir la operación en el mismo dispositivo nunca crea un registro nuevo.
      const existente=buscarDispositivo(registrados,token);
      if(existente)return okRegistro(existente.id,token);
      const error=evaluarRegistro(registrados,Date.now());
      if(error)return fail(error,429);
      const nuevo=nuevoDispositivo();
      const dato={id:nuevo.id,hash:nuevo.hash,registradoEn:new Date().toISOString(),
        nombre:"Tablet B-5",tipo:"instalacion_web"};
      const resultado=await writeState(sql,REGISTRY_KEY,[...registrados,dato],{ifVersion:version});
      if(resultado.ok)return okRegistro(nuevo.id,nuevo.token);
      if(!resultado.conflict)break;
    }
    return fail("conflicto_registro",409);
  }catch(e){
    console.error("b5 device POST",e);
    return fail("database_error",503);
  }
}
