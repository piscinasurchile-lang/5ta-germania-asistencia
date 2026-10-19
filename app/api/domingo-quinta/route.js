import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState,writeState} from "../../../lib/state-store.js";
import {convocatoriaAbierta,domingoSiguiente,validarInscripcion,validarVoluntarioId} from "../../../lib/domingo-quinta.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const key=(fecha,id)=>"domingo-quinta:"+fecha+":"+id;
function originOk(req){try{return new URL(req.headers.get("origin")).host===req.headers.get("host")}catch{return false}}
async function db(){if(!process.env.DATABASE_URL)throw Error("database_not_configured");const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);return sql}
export async function GET(req){
 const fecha=domingoSiguiente(),abierta=convocatoriaAbierta();
 if(!abierta)return Response.json({domingo:fecha,abierta:false},{headers});
 try{
  const sql=await db(),prefix="domingo-quinta:"+fecha+":%";
  const rows=await sql`SELECT value FROM app_state WHERE key LIKE ${prefix} LIMIT 200`;
  const inscritos=rows.map(r=>r.value).filter(v=>v&&Array.isArray(v.turnos));
  const id=new URL(req.url).searchParams.get("voluntarioId");
  const propia=id&&validarVoluntarioId(id)?(inscritos.find(v=>v.voluntarioId===id)||null):null;
  return Response.json({domingo:fecha,abierta:true,resumen:{turnos:[1,2,3].map(n=>inscritos.filter(v=>v.turnos.includes(n)).length),comida:inscritos.filter(v=>v.comida==="si").length},inscritos:inscritos.map(v=>({voluntarioId:v.voluntarioId,turnos:v.turnos,comida:v.comida,ayuda:v.ayuda})),propia},{headers});
 }catch(e){console.error("domingo GET",e);return Response.json({error:"database_error"},{status:503,headers})}
}
export async function POST(req){
 if(!originOk(req))return Response.json({error:"forbidden_origin"},{status:403,headers});
 if(!convocatoriaAbierta())return Response.json({error:"inscripciones_cerradas"},{status:409,headers});
 const body=await req.json().catch(()=>null),value=validarInscripcion(body);
 if(!value)return Response.json({error:"datos_invalidos"},{status:400,headers});
 try{
  const sql=await db(),fecha=domingoSiguiente(),k=key(fecha,value.voluntarioId);
  const previo=await readState(sql,k);
  const r=await writeState(sql,k,{...value,updatedAt:new Date().toISOString()},{ifVersion:previo.version});
  if(!r.ok)return Response.json({error:"conflicto_reintentar"},{status:409,headers});
  return Response.json({ok:true,domingo:fecha,version:r.version},{headers});
 }catch(e){console.error("domingo POST",e);return Response.json({error:"database_error"},{status:503,headers})}
}
