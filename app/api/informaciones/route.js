import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,addToList,writeState} from "../../../lib/state-store.js";
import {avisoEstaVigente,vencimientoAlPublicar} from "../../../lib/informaciones-vigencia.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const KEY_PUBLICA="novedades:v1";
const KEY_OFICIALES="security:informaciones-oficiales:v1";

function isOfficial(request){
  const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN;
  const received=request.cookies?.get("quinta_oficialidad")?.value||"";
  if(!secret||!received)return false;
  const expected=crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
  const a=Buffer.from(received),b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
function sameOrigin(request){
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try{return new URL(origin).host===request.headers.get("host")}catch{return false}
}
function db(){return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null}
const noStore={"Cache-Control":"private, no-store"};
function error(message,status){return Response.json({error:message},{status,headers:noStore})}

export async function GET(request){
  if(!isOfficial(request))return error("acceso_oficial_requerido",403);
  const sql=db();
  if(!sql)return error("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const r=await readState(sql,KEY_OFICIALES);
    const ahora=Date.now();
    const items=(Array.isArray(r.value)?r.value:[]).filter(n=>avisoEstaVigente(n,ahora));
    return Response.json({items:items.slice(-100).reverse()},{headers:noStore});
  }catch(e){console.error("informaciones oficiales GET",e);return error("database_error",500)}
}
export async function POST(request){
  if(!sameOrigin(request))return error("forbidden_origin",403);
  if(!isOfficial(request))return error("acceso_oficial_requerido",403);
  let value;
  try{value=await request.json()}catch{return error("invalid_json",400)}
  const texto=typeof value?.texto==="string"?value.texto.trim():"";
  const destino=value?.destino;
  if(!texto||texto.length>2000)return error("texto_invalido",400);
  if(destino!=="compania"&&destino!=="oficiales")return error("destino_invalido",400);
  const ahora=Date.now();
  let vence;
  try{vence=vencimientoAlPublicar(ahora,value?.vence)}
  catch(e){return error(e.message||"fecha_hora_invalida",400)}
  const sql=db();
  if(!sql)return error("database_not_configured",503);
  const entry={id:crypto.randomUUID(),texto,en:new Date(ahora).toISOString(),vence,autor:"Oficialidad",destino};
  try{
    await ensureSchema(sql);
    const result=await addToList(sql,destino==="oficiales"?KEY_OFICIALES:KEY_PUBLICA,entry,{uniqueBy:"id"});
    if(!result.ok)return error("write_failed",500);
    return Response.json({ok:true,id:entry.id},{headers:noStore});
  }catch(e){console.error("informaciones POST",e);return error("database_error",500)}
}

/* Retiro manual con la misma protección que Publicar. No toca otros avisos ni confirma lecturas. */
export async function DELETE(request){
  if(!sameOrigin(request))return error("forbidden_origin",403);
  if(!isOfficial(request))return error("acceso_oficial_requerido",403);
  let value;
  try{value=await request.json()}catch{return error("invalid_json",400)}
  const id=value?.id;
  if(typeof id!=="string"||!/^[0-9a-f-]{30,50}$/i.test(id))return error("id_invalido",400);
  const sql=db();
  if(!sql)return error("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const original=await readState(sql,KEY_PUBLICA);
    const array=Array.isArray(original.value)?original.value:[];
    const filtered=array.filter(x=>x?.id!==id);
    if(filtered.length===array.length)return error("informacion_no_encontrada",404);
    const result=await writeState(sql,KEY_PUBLICA,filtered,{ifVersion:original.version});
    if(!result.ok)return error("version_conflict",409);
    return Response.json({ok:true},{headers:noStore});
  }catch(e){console.error("informaciones DELETE",e);return error("database_error",500)}
}
