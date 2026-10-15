/* Canal de ensayo COMPARTIDO de informaciones generales.
   Sin PIN por decisión del administrador durante pruebas.
   Aísla los mensajes de prueba de las novedades oficiales y NO publica mensajes privados.
   Este endpoint no autentica a una persona: el identificador seleccionado es autodeclarado.
   Requiere verificar límites y retirar este modo antes de usar comunicaciones operativas. */
import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,writeState,addToList} from "../../../../lib/state-store.js";
import {avisoEstaVigente,vencimientoAlPublicar} from "../../../../lib/informaciones-vigencia.mjs";
import {difundir,esEnvioGeneralActivo} from "../../../../lib/germania-webpush.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const KEY="informaciones-prueba:v1";
const LECTURAS="informaciones-prueba-lecturas:";
const LIMIT_PER_HOUR=12;
const MAX_RECORDS=100;
const CACHE={"Cache-Control":"no-store"};
const err=(code,status)=>Response.json({error:code},{status,headers:CACHE});
function sameOrigin(request){
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
}
function sqlClient(){return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null}
const uuid=id=>typeof id==="string"&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id);
function trialOfficer(person){
  if(!person||person.activo===false)return false;
  const cargo=String(person.cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return /capitan|teniente|ayudante|director|secretari|tesorer|jefe de maquinas/.test(cargo)
   ||String(person.clave||"")==="517";
}
function publicMessage(entry,reads){
  return {id:entry.id,texto:entry.texto,en:entry.en,vence:entry.vence,
    autor:entry.autor,destino:"compania",lecturas:Array.isArray(reads)?reads.map(r=>({voluntarioId:String(r.voluntarioId),en:r.en})):[]};
}
export async function GET(){
  const sql=sqlClient();if(!sql)return err("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const current=await readState(sql,KEY);
    const items=(Array.isArray(current.value)?current.value:[]).filter(x=>avisoEstaVigente(x))
      .slice(-30).reverse();
    const reads=await Promise.all(items.map(async n=>{
      const r=await readState(sql,LECTURAS+n.id);
      return r.value;
    }));
    return Response.json({items:items.map((n,i)=>publicMessage(n,reads[i])),modo:"prueba_compartida"},
      {headers:CACHE});
  }catch(e){console.error("informaciones prueba GET",e);return err("database_error",500)}
}
export async function POST(request){
  if(!sameOrigin(request))return err("forbidden_origin",403);
  let body;try{body=await request.json()}catch{return err("invalid_json",400)}
  if(body?.destino!=="compania")return err("canal_solo_compania",400);
  const texto=typeof body.texto==="string"?body.texto.trim():"";
  if(!texto||texto.length>500)return err("texto_invalido",400);
  const emisor=String(body?.emisorId||"");
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(emisor))return err("emisor_invalido",400);
  let vence;try{vence=vencimientoAlPublicar(Date.now(),body.vence)}catch(e){return err(e.message||"fecha_invalida",400)}
  if(Date.parse(vence)>Date.now()+30*24*60*60*1000+5000)return err("vigencia_maxima_30_dias",400);
  const sql=sqlClient();if(!sql)return err("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const roster=await readState(sql,"roster:v8");
    const p=Array.isArray(roster.value)?roster.value.find(m=>String(m.id)===emisor):null;
    if(!trialOfficer(p))return err("emisor_no_oficial",403);
    const now=Date.now(),item={id:crypto.randomUUID(),texto,autor:[p.nombre,p.apellidoPaterno].filter(Boolean).join(" ")||"Oficial",en:new Date(now).toISOString(),vence,destino:"compania",modo:"prueba"};
    for(let retry=0;retry<4;retry++){
      const v=await readState(sql,KEY);
      const list=Array.isArray(v.value)?v.value:[];
      const recientes=list.filter(n=>Date.parse(n?.en||"")>now-60*60*1000);
      if(recientes.length>=LIMIT_PER_HOUR)return err("limite_de_pruebas_alcanzado",429);
      const next=list.slice(-(MAX_RECORDS-1)).concat(item);
      const r=await writeState(sql,KEY,next,{ifVersion:v.version});
      if(r.ok){
        // Únicamente el aviso recién guardado puede generar Web Push.
        // No impedir guardar la información por un fallo del servicio push.
        if(esEnvioGeneralActivo())try{
          await difundir({tipo:"informacion",titulo:("Información: "+texto).slice(0,120),
            id:item.id,origen:new URL(request.url).origin});
        }catch(error){console.error("webpush informacion",error);}
        return Response.json({ok:true,id:item.id,modo:"prueba_compartida"},{headers:CACHE});
      }
    }
    return err("intenta_nuevamente",409);
  }catch(e){console.error("informaciones prueba POST",e);return err("database_error",500)}
}
export async function PATCH(request){
  if(!sameOrigin(request))return err("forbidden_origin",403);
  let body;try{body=await request.json()}catch{return err("invalid_json",400)}
  if(!uuid(body?.id))return err("id_invalido",400);
  const lector=String(body?.voluntarioId||"");
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(lector))return err("voluntario_invalido",400);
  const sql=sqlClient();if(!sql)return err("database_not_configured",503);
  try{
    await ensureSchema(sql);
    const [r,v]=await Promise.all([readState(sql,"roster:v8"),readState(sql,KEY)]);
    if(!Array.isArray(r.value)||!r.value.some(m=>String(m.id)===lector&&m.activo!==false))return err("voluntario_no_en_nomina",400);
    const item=Array.isArray(v.value)?v.value.find(n=>n?.id===body.id):null;
    if(!item||!avisoEstaVigente(item))return err("aviso_no_vigente",404);
    const result=await addToList(sql,LECTURAS+item.id,{voluntarioId:lector,en:new Date().toISOString()},{uniqueBy:"voluntarioId"});
    if(!result.ok)return err("no_se_pudo_confirmar",409);
    return Response.json({ok:true},{headers:CACHE});
  }catch(e){console.error("informaciones prueba PATCH",e);return err("database_error",500)}
}
