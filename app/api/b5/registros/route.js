import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {buscarDispositivo,REGISTRY_KEY,DEVICE_COOKIE,cookieValue,sameOrigin}
  from "../../../../lib/b5-dispositivo.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"no-store"};
const STATUS=new Set(["presente","ausente","justificado"]);

function error(mensaje,status){
  return Response.json({ok:false,error:mensaje},{status,headers:HEADERS});
}
function oficialAutorizado(request){
  const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";
  const cookie=cookieValue(request.headers,"quinta_oficialidad");
  if(!secret||!cookie)return false;
  const esperado=crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
  const a=Buffer.from(cookie),b=Buffer.from(esperado);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
function slug(tipo){
  return tipo.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase();
}
export function claveDeParteB5({id,date,tipo}={}){
  if(typeof id!=="string"||!/^([0-9a-f-]{36}|b5-[0-9]+-[a-z0-9]+)$/.test(id))return null;
  if(typeof date!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date)
    ||Number.isNaN(Date.parse(date+"T12:00:00Z")))return null;
  if(typeof tipo!=="string"||!tipo.trim()||tipo.length>100)return null;
  return "parte:"+date+"__"+slug(tipo.trim());
}
export function aplicarCambioParteB5(actual,accion,cambios,fecha){
  if(!actual||!actual.records||typeof actual.records!=="object")throw new Error("parte_invalido");
  const datos={...actual};
  const antes={fecha,accion,records:actual.records,detalle:actual.detalle||"",
    registradoPor:actual.registradoPor||"",anulado:actual.anulado===true};
  if(accion==="corregir"){
    if(actual.anulado)throw new Error("parte_anulado");
    const records=cambios?.records;
    if(!records||typeof records!=="object"||Array.isArray(records))throw new Error("estados_invalidos");
    const originales=Object.keys(actual.records).sort(),propuestos=Object.keys(records).sort();
    if(originales.length!==propuestos.length || originales.some((id,i)=>id!==propuestos[i]))throw new Error("nomina_no_coincide");
    if(propuestos.some(id=>!STATUS.has(records[id])))throw new Error("estados_invalidos");
    if(typeof cambios.detalle!=="string"||cambios.detalle.length>4000 ||
       typeof cambios.registradoPor!=="string"||cambios.registradoPor.length>180)throw new Error("campos_invalidos");
    datos.records={...records};
    datos.detalle=cambios.detalle.trim();
    datos.registradoPor=cambios.registradoPor.trim();
  }else if(accion==="anular"){
    if(actual.anulado)throw new Error("ya_anulado");
    datos.anulado=true;
    datos.generaAsistencia=false;
  }else if(accion==="restaurar"){
    if(!actual.anulado)throw new Error("no_anulado");
    datos.anulado=false;
    datos.generaAsistencia=true;
  }else throw new Error("accion_no_permitida");
  datos.historialB5=[...(Array.isArray(actual.historialB5)?actual.historialB5:[]).slice(-19),antes];
  datos.ultimaRevisionB5=fecha;
  return datos;
}
async function obtenerContexto(request){
  if(!process.env.DATABASE_URL)return null;
  const token=cookieValue(request.headers,DEVICE_COOKIE);
  if(!token)return null;
  const sql=neon(process.env.DATABASE_URL);
  await ensureSchema(sql);
  const registro=(await readState(sql,REGISTRY_KEY)).value;
  if(!buscarDispositivo(registro,token))return null;
  return sql;
}
async function leerParte(sql,parametros){
  const clave=claveDeParteB5(parametros);
  if(!clave)return null;
  const actual=await readState(sql,clave);
  if(!actual.value || actual.value.b5OfflineId!==parametros.id)return null;
  return {clave,...actual};
}
export async function GET(request){
  const url=new URL(request.url);
  const parametros={id:url.searchParams.get("id"),date:url.searchParams.get("date"),tipo:url.searchParams.get("tipo")};
  if(!claveDeParteB5(parametros))return error("parametros_invalidos",400);
  try{
    const sql=await obtenerContexto(request);
    if(!sql)return error("tablet_no_registrada",403);
    const parte=await leerParte(sql,parametros);
    if(!parte)return error("parte_no_encontrado",404);
    return Response.json({ok:true,version:parte.version,
      datos:{date:parte.value.date,tipo:parte.value.tipo,detalle:parte.value.detalle||"",
        registradoPor:parte.value.registradoPor||"",records:parte.value.records,
        anulado:parte.value.anulado===true,numero:parte.value.numero}},{headers:HEADERS});
  }catch(e){
    console.error("B5 ver parte falló",e);
    return error("lectura_no_disponible",503);
  }
}
export async function PATCH(request){
  if(!sameOrigin(request))return error("origen_no_permitido",403);
  if(!oficialAutorizado(request))return error("oficialidad_requerida",403);
  let body;
  try{body=await request.json();}catch{return error("json_invalido",400);}
  if(!claveDeParteB5(body))return error("parametros_invalidos",400);
  if(!["corregir","anular","restaurar"].includes(body.accion))return error("accion_no_permitida",400);
  if(!Number.isInteger(body.version)||body.version<1)return error("version_invalida",400);
  try{
    const sql=await obtenerContexto(request);
    if(!sql)return error("tablet_no_registrada",403);
    const parte=await leerParte(sql,body);
    if(!parte)return error("parte_no_encontrado",404);
    if(parte.version!==body.version)return error("version_conflict",409);
    let siguiente;
    try{siguiente=aplicarCambioParteB5(parte.value,body.accion,body.cambios,new Date().toISOString());}
    catch(e){return error(e.message,409);}
    const guardado=await writeState(sql,parte.clave,siguiente,{ifVersion:parte.version});
    if(!guardado.ok)return error("version_conflict",409);
    return Response.json({ok:true,version:guardado.version,anulado:siguiente.anulado===true},{headers:HEADERS});
  }catch(e){
    console.error("B5 corrección/anulación falló",e);
    return error("guardado_no_disponible",503);
  }
}
