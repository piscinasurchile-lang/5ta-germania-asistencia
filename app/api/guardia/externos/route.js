import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,writeState} from "../../../../lib/state-store.js";
import {miercolesSemana,cargoT3,informeRatificado} from "../../../../lib/guardia-libro.js";
import {crearExterno} from "../../../../lib/guardia-externos.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const fail=(error,status)=>Response.json({error},{status});
function mismoOrigen(req){try{return new URL(req.headers.get("origin")).host===req.headers.get("host")}catch{return false}}
async function contexto(fecha,actorId){
 if(!process.env.DATABASE_URL)throw Error("no_database");
 const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
 const [r,rev]=await Promise.all([readState(sql,"roster:v8"),readState(sql,"guardia-revision:"+miercolesSemana(fecha))]);
 const actor=(r.value||[]).find(p=>String(p.id)===String(actorId)&&p.activo!==false);
 const aprobada=rev.value?.estado==="aprobada"&&!!rev.value?.noches?.[fecha];
 const acreditacion=await readState(sql,"guardia-acreditacion:"+fecha);
 const cierre=await readState(sql,"guardia-libro:"+fecha);
 const vigente=informeRatificado({acreditacion:acreditacion.value,revision:rev.value,noche:rev.value?.noches?.[fecha],cierre:cierre.value});
 const esCapitan=/^\s*capit[aá]n/i.test(String(actor?.cargo||""));
 return {sql,actor,aprobada,esCapitan,ratificada:vigente};
}
export async function GET(req){
 const u=new URL(req.url),fecha=u.searchParams.get("fecha")||"",actorId=u.searchParams.get("actorId")||"";
 if(!miercolesSemana(fecha)||!actorId)return fail("datos_invalidos",400);
 try{
  const {sql,actor,aprobada,esCapitan,ratificada}=await contexto(fecha,actorId);
  if(!actor||!aprobada||!(cargoT3(actor.cargo)||(esCapitan&&ratificada)))return fail("no_autorizado",403);
  const state=await readState(sql,"guardia-externos:"+fecha);
  return Response.json({items:state.value?.items||[],version:state.version},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia externos GET",e);return fail("database_error",500)}
}
export async function POST(req){
 if(!mismoOrigen(req))return fail("origen_no_permitido",403);
 let b;try{b=await req.json()}catch{return fail("datos_invalidos",400)}
 const fecha=String(b.fecha||""),actorId=String(b.actorId||"");
 if(!miercolesSemana(fecha)||!actorId||!Number.isInteger(b.ifVersion)||b.ifVersion<0)return fail("datos_invalidos",400);
 const nuevo=crearExterno(b.externo,actorId);
 if(nuevo.error)return fail(nuevo.error,400);
 try{
  const {sql,actor,aprobada}=await contexto(fecha,actorId);
  if(!actor||!cargoT3(actor.cargo)||!aprobada)return fail("no_autorizado",403);
  const key="guardia-externos:"+fecha,prev=await readState(sql,key);
  if(prev.version!==b.ifVersion)return fail("version_conflict",409);
  const items=prev.value?.items||[];
  if(items.length>=15)return fail("limite_externos",409);
  const saved=await writeState(sql,key,{fecha,items:[...items,nuevo.registro]},{ifVersion:b.ifVersion});
  if(saved.conflict)return fail("version_conflict",409);
  return Response.json({ok:true,version:saved.version,estado:"documentado_no_acreditado"});
 }catch(e){console.error("guardia externos POST",e);return fail("database_error",500)}
}
