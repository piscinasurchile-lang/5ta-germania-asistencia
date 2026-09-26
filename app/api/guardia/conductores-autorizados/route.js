import { neon } from "@neondatabase/serverless";
import { NOMINA_2026 } from "../../../../lib/quinta-data";
import { buscarOficial2026 } from "../../../../lib/oficialidad-2026";
export const runtime="nodejs";export const dynamic="force-dynamic";
const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
const vc=v=>/^\d{1,6}$/.test(v||"");
function origin(r){const o=r.headers.get("origin");if(!o)return false;try{return new URL(o).host===r.headers.get("host")}catch{return false}}
function nombreCompleto(p){ return [p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "); }

// La lista de conductores autorizados vive en la Nomina (flag "conductor"
// de roster:v8) — este endpoint lee y tambien puede aprobar/revocar ese
// mismo flag, para no tener dos fuentes de datos separadas.

export async function GET(){
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  try{
    const rows=await sql`SELECT value FROM app_state WHERE key='roster:v8' LIMIT 1`;
    const roster=rows[0]?.value||[];
    const conductores=roster
      .filter(p=>p.conductor===true && p.activo!==false)
      .map(p=>({codigo:String(p.clave),nombre:nombreCompleto(p)}))
      .sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
    const pendientes=roster
      .filter(p=>p.conductor!==true && p.activo!==false)
      .map(p=>({codigo:String(p.clave),nombre:nombreCompleto(p)}))
      .sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
    return Response.json({conductores,pendientes},{headers:{"Cache-Control":"no-store"}});
  }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}

export async function POST(r){
  if(!origin(r))return Response.json({error:"forbidden_origin"},{status:403});
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  let b;try{b=await r.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
  const codigo=String(b.codigo||""),autor=String(b.aprobadoPor||"");
  const activar=b.activar!==false; // true=aprobar como conductor, false=revocar
  if(!vc(codigo)||!vc(autor))return Response.json({error:"invalid_data"},{status:400});
  const of=buscarOficial2026(autor);
  if(!of)return Response.json({error:"official_not_authorized"},{status:403});
  if(!NOMINA_2026[codigo])return Response.json({error:"not_in_roster"},{status:409});
  try{
    const rows=await sql`SELECT value FROM app_state WHERE key='roster:v8' LIMIT 1`;
    const roster=rows[0]?.value||[];
    const i=roster.findIndex(p=>String(p.clave)===codigo);
    if(i<0)return Response.json({error:"not_in_roster"},{status:409});
    roster[i]={...roster[i],conductor:activar};
    await sql`UPDATE app_state SET value=${JSON.stringify(roster)}::jsonb WHERE key='roster:v8'`;
    return Response.json({ok:true,codigo,nombre:nombreCompleto(roster[i]),conductor:activar});
  }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}
