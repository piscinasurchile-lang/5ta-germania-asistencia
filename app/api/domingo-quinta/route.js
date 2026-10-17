import {neon} from "@neondatabase/serverless";
import {domingoSiguiente,convocatoriaAbierta,validarInscripcion} from "../../../lib/domingo-quinta.mjs";
export const runtime="nodejs";
const headers={"Cache-Control":"no-store"};
function originOk(request){try{return new URL(request.headers.get("origin")).host===request.headers.get("host")}catch{return false}}
async function db(){
 if(!process.env.DATABASE_URL)throw new Error("database_not_configured");
 const sql=neon(process.env.DATABASE_URL);
 await sql`CREATE TABLE IF NOT EXISTS domingo_quinta_inscripciones (
 domingo date NOT NULL,
 voluntario_id text NOT NULL,
 turnos jsonb NOT NULL DEFAULT '[]'::jsonb,
 comida text NOT NULL,
 ayuda boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (domingo, voluntario_id)
 )`;
 return sql;
}
export async function GET(request){
 try{
  const fecha=domingoSiguiente();
  if(!convocatoriaAbierta())return Response.json({domingo:fecha,abierta:false,inscritos:[]},{headers});
  const sql=await db();
  const rows=await sql`SELECT turnos,comida FROM domingo_quinta_inscripciones WHERE domingo=${fecha}::date`;
  const turnos=[1,2,3].map(n=>rows.filter(row=>Array.isArray(row.turnos)&&row.turnos.includes(n)).length);
  return Response.json({domingo:fecha,abierta:true,resumen:{turnos,comida:rows.filter(row=>row.comida==="si").length}},{headers});
 }catch(e){console.error("domingo GET",e);return Response.json({error:"No disponible"},{status:503,headers})}
}
export async function POST(request){
 if(!originOk(request))return Response.json({error:"Origen inválido"},{status:403,headers});
 if(!convocatoriaAbierta())return Response.json({error:"Inscripciones cerradas"},{status:409,headers});
 const payload=validarInscripcion(await request.json().catch(()=>null));
 if(!payload)return Response.json({error:"Datos inválidos"},{status:400,headers});
 try{
  const fecha=domingoSiguiente(),sql=await db();
  await sql`INSERT INTO domingo_quinta_inscripciones (domingo,voluntario_id,turnos,comida,ayuda)
   VALUES (${fecha}::date,${payload.voluntarioId},${JSON.stringify(payload.turnos)}::jsonb,${payload.comida},${payload.ayuda})
   ON CONFLICT (domingo,voluntario_id) DO UPDATE SET turnos=EXCLUDED.turnos,comida=EXCLUDED.comida,ayuda=EXCLUDED.ayuda,updated_at=now()`;
  return Response.json({ok:true,domingo:fecha},{headers});
 }catch(e){console.error("domingo POST",e);return Response.json({error:"No se pudo guardar"},{status:503,headers})}
}
