import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const validCode = (v) => /^\d{1,6}$/.test(v || "");

function db() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

async function schema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS guardia_confirmaciones (
      id bigserial PRIMARY KEY,
      fecha date NOT NULL,
      codigo varchar(6) NOT NULL,
      nombre text NOT NULL,
      cumplio boolean NOT NULL,
      confirmado_por varchar(6) NOT NULL,
      confirmado_en timestamptz NOT NULL DEFAULT now(),
      UNIQUE(fecha, codigo)
    )
  `;
}

export async function GET(request) {
  const sql = db();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  const fecha = new URL(request.url).searchParams.get("fecha");
  if (!validDate(fecha)) return Response.json({ error: "invalid_date" }, { status: 400 });
  try {
    await schema(sql);
    const inscritos = await sql`
      SELECT codigo, nombre FROM guardia_inscripciones
      WHERE fecha=${fecha}::date ORDER BY creado_en
    `;
    const confirmaciones = await sql`
      SELECT codigo, cumplio, confirmado_por, confirmado_en
      FROM guardia_confirmaciones WHERE fecha=${fecha}::date
    `;
    const porCodigo = Object.fromEntries(confirmaciones.map(x => [String(x.codigo), x]));
    return Response.json({ fecha, voluntarios: inscritos.map(v => ({ codigo:String(v.codigo), nombre:v.nombre, confirmacion:porCodigo[String(v.codigo)] || null })) }, { headers:{"Cache-Control":"no-store"} });
  } catch (error) {
    console.error("guardia confirmacion GET", error);
    return Response.json({ error:"database_error" }, { status:500 });
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error:"forbidden_origin" }, { status:403 });
  const sql = db();
  if (!sql) return Response.json({ error:"database_not_configured" }, { status:503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error:"invalid_json" }, { status:400 }); }
  const fecha=String(body.fecha||"");
  const codigo=String(body.codigo||"");
  const nombre=String(body.nombre||"").trim();
  const confirmadoPor=String(body.confirmadoPor||"");
  const cumplio=body.cumplio;
  if(!validDate(fecha)||!validCode(codigo)||!nombre||!validCode(confirmadoPor)||typeof cumplio!=="boolean") return Response.json({error:"invalid_data"},{status:400});
  try {
    await schema(sql);
    const existe=await sql`SELECT EXISTS(SELECT 1 FROM guardia_inscripciones WHERE fecha=${fecha}::date AND codigo=${codigo}) AS ok`;
    if(!existe?.[0]?.ok) return Response.json({error:"not_registered"},{status:409});
    await sql`
      INSERT INTO guardia_confirmaciones(fecha,codigo,nombre,cumplio,confirmado_por)
      VALUES(${fecha}::date,${codigo},${nombre},${cumplio},${confirmadoPor})
      ON CONFLICT(fecha,codigo) DO UPDATE SET cumplio=EXCLUDED.cumplio, confirmado_por=EXCLUDED.confirmado_por, confirmado_en=now()
    `;
    return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  } catch(error){
    console.error("guardia confirmacion POST",error);
    return Response.json({error:"database_error"},{status:500});
  }
}
