import { neon } from "@neondatabase/serverless";
export const runtime="nodejs";export const dynamic="force-dynamic";
const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
function nombreCompleto(p){ return [p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "); }

// La lista de conductores autorizados no se administra aparte: se deriva
// directo del flag "Conductor" (COND) que ya existe en la Nomina del
// sistema principal (Pasar Lista), para no duplicar el dato en dos lugares.
export async function GET(){
  const sql=db();if(!sql)return Response.json({error:"database_not_configured"},{status:503});
  try{
    const rows=await sql`SELECT value FROM app_state WHERE key='roster:v8' LIMIT 1`;
    const roster=rows[0]?.value||[];
    const conductores=roster
      .filter(p=>p.conductor===true && p.activo!==false)
      .map(p=>({codigo:String(p.clave),nombre:nombreCompleto(p)}))
      .sort((a,b)=>a.nombre.localeCompare(b.nombre,"es"));
    return Response.json({conductores},{headers:{"Cache-Control":"no-store"}});
  }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}
