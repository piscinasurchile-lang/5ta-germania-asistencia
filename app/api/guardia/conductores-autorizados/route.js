import { neon } from "@neondatabase/serverless";
import { NOMINA_2026 } from "../../../../lib/quinta-data";
import { buscarOficial2026 } from "../../../../lib/oficialidad-2026";
export const runtime="nodejs";export const dynamic="force-dynamic";
const vc=v=>/^\d{1,6}$/.test(v||"");const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
function origin(r){const o=r.headers.get("origin");if(!o)return false;try{return new URL(o).host===r.headers.get("host")}catch{return false}}
async function schema(sql){await sql`CREATE TABLE IF NOT EXISTS guardia_conductores_autorizados(codigo varchar(6) PRIMARY KEY,nombre text NOT NULL,agregado_por varchar(6) NOT NULL,creado_en timestamptz NOT NULL DEFAULT now())`}

export async function GET(){
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  try{await schema(sql);const x=await sql`SELECT codigo::text,nombre,agregado_por::text,creado_en FROM guardia_conductores_autorizados ORDER BY nombre`;
  return Response.json({conductores:x},{headers:{"Cache-Control":"no-store"}})}catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}

export async function POST(r){
  if(!origin(r))return Response.json({error:"forbidden_origin"},{status:403});
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  let b;try{b=await r.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
  const codigo=String(b.codigo||""),autor=String(b.agregadoPor||"");
  if(!vc(codigo)||!vc(autor))return Response.json({error:"invalid_data"},{status:400});
  const of=buscarOficial2026(autor),nombre=NOMINA_2026[codigo];
  if(!of)return Response.json({error:"official_not_authorized"},{status:403});
  if(!nombre)return Response.json({error:"not_in_roster"},{status:409});
  try{await schema(sql);
    await sql`INSERT INTO guardia_conductores_autorizados(codigo,nombre,agregado_por) VALUES(${codigo},${nombre},${of.codigo}) ON CONFLICT(codigo) DO UPDATE SET nombre=EXCLUDED.nombre,agregado_por=EXCLUDED.agregado_por`;
    return Response.json({ok:true,codigo,nombre})
  }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}

export async function DELETE(r){
  if(!origin(r))return Response.json({error:"forbidden_origin"},{status:403});
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  const u=new URL(r.url);const codigo=u.searchParams.get("codigo"),autor=u.searchParams.get("agregadoPor");
  if(!vc(codigo)||!vc(autor))return Response.json({error:"invalid_data"},{status:400});
  const of=buscarOficial2026(autor);if(!of)return Response.json({error:"official_not_authorized"},{status:403});
  try{await schema(sql);await sql`DELETE FROM guardia_conductores_autorizados WHERE codigo=${codigo}`;return Response.json({ok:true})}
  catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}
