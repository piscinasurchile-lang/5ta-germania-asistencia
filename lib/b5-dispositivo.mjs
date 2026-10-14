/* Identificación digital de instalación B-5 (no identifica hardware ni otorga permisos).
 * El secreto de la instalación solo vive en una cookie HttpOnly.
 * Este registro NO autoriza acciones de Oficiales ni reemplaza autenticación.
 */
import crypto from "node:crypto";

export const REGISTRY_KEY="security:b5-dispositivos:v1";
export const DEVICE_COOKIE="germania_b5_dispositivo";
export const MARKER_COOKIE="germania_b5_registrado";
export const DEVICE_LIMIT=12;
export const DAILY_LIMIT=3;

export function nuevoDispositivo(){
  const token=crypto.randomBytes(32).toString("hex");
  const id=crypto.randomUUID();
  return {id,token,hash:huellaToken(token)};
}
export function huellaToken(token){
  return crypto.createHash("sha256").update(token).digest("hex");
}
export function tokenValido(token){
  return typeof token==="string" && /^[a-f0-9]{64}$/.test(token);
}
export function idPublico(id){
  return String(id||"").slice(0,8).toUpperCase();
}
export function buscarDispositivo(registro,token){
  if(!tokenValido(token)||!Array.isArray(registro))return null;
  const hash=huellaToken(token);
  return registro.find(d=>d&&typeof d.hash==="string"&&
    d.hash.length===hash.length&&
    crypto.timingSafeEqual(Buffer.from(d.hash),Buffer.from(hash)))||null;
}
export function evaluarRegistro(registros, ahora){
  const existentes=Array.isArray(registros)?registros:[];
  if(existentes.length>=DEVICE_LIMIT)return "limite_dispositivos";
  const recientes=existentes.filter(d=>
    typeof d?.registradoEn==="string" && (ahora-Date.parse(d.registradoEn))>=0 &&
    (ahora-Date.parse(d.registradoEn))<86_400_000).length;
  if(recientes>=DAILY_LIMIT)return "limite_diario";
  return null;
}
export function cookieValue(headers,name){
  const raw=headers.get("cookie")||"";
  const entry=raw.split(";").map(s=>s.trim()).find(s=>s.startsWith(name+"="));
  return entry?entry.slice(name.length+1):null;
}
export function sameOrigin(request){
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try{return new URL(origin).origin===new URL(request.url).origin;}
  catch{return false;}
}
