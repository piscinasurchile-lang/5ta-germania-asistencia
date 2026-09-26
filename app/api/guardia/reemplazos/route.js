import { neon } from "@neondatabase/serverless";
import { NOMINA_2026 } from "../../../../lib/quinta-data";
import { buscarOficial2026 } from "../../../../lib/oficialidad-2026";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const validCode = (v) => /^\d{1,6}$/.test(v || "");
const db = () => process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

async function schema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS guardia_reemplazos (
      id bigserial PRIMARY KEY,
      fecha date NOT NULL,
      codigo_original varchar(6) NOT NULL,
      nombre_original text NOT NULL,
      codigo_reemplazo varchar(6) NOT NULL,
      nombre_reemplazo text NOT NULL,
      motivo text NOT NULL DEFAULT '',
      autorizado_por varchar(6) NOT NULL,
      creado_en timestamptz NOT NULL DEFAULT now(),
      actualizado_en timestamptz NOT NULL DEFAULT now(),
      UNIQUE(fecha,codigo_original)
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
    const rows = await sql`
      SELECT codigo_original::text, nombre_original, codigo_reemplazo::text,
             nombre_reemplazo, motivo, autorizado_por::text, creado_en, actualizado_en
      FROM guardia_reemplazos WHERE fecha=${fecha}::date ORDER BY creado_en ASC
    `;
    return Response.json({ fecha, reemplazos: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("guardia reemplazos GET", e);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const sql = db();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const fecha = String(body.fecha || "");
  const original = String(body.codigoOriginal || "").trim();
  const reemplazo = String(body.codigoReemplazo || "").trim();
  const autorizadoPor = String(body.autorizadoPor || "").trim();
  const motivo = String(body.motivo || "").trim().slice(0, 500);

  if (!validDate(fecha) || !validCode(original) || !validCode(reemplazo) || !validCode(autorizadoPor) || original === reemplazo)
    return Response.json({ error: "invalid_data" }, { status: 400 });

  const oficial = buscarOficial2026(autorizadoPor);
  const nombreReemplazo = NOMINA_2026[reemplazo];
  if (!oficial) return Response.json({ error: "official_not_authorized" }, { status: 403 });
  if (!nombreReemplazo) return Response.json({ error: "replacement_not_in_roster" }, { status: 409 });

  try {
    await schema(sql);
    const inscrito = await sql`
      SELECT nombre FROM guardia_inscripciones
      WHERE fecha=${fecha}::date AND codigo=${original}
      ORDER BY creado_en ASC LIMIT 1
    `;
    if (!inscrito.length) return Response.json({ error: "original_not_registered" }, { status: 409 });

    const yaInscrito = await sql`
      SELECT 1 FROM guardia_inscripciones
      WHERE fecha=${fecha}::date AND codigo=${reemplazo} LIMIT 1
    `;
    if (yaInscrito.length) return Response.json({ error: "replacement_already_registered" }, { status: 409 });

    const ocupaReemplazo = await sql`
      SELECT 1 FROM guardia_reemplazos
      WHERE fecha=${fecha}::date AND codigo_reemplazo=${reemplazo} AND codigo_original<>${original} LIMIT 1
    `;
    if (ocupaReemplazo.length) return Response.json({ error: "replacement_already_used" }, { status: 409 });

    await sql`
      INSERT INTO guardia_reemplazos(fecha,codigo_original,nombre_original,codigo_reemplazo,nombre_reemplazo,motivo,autorizado_por)
      VALUES(${fecha}::date,${original},${inscrito[0].nombre},${reemplazo},${nombreReemplazo},${motivo},${oficial.codigo})
      ON CONFLICT(fecha,codigo_original) DO UPDATE SET
        codigo_reemplazo=EXCLUDED.codigo_reemplazo,
        nombre_reemplazo=EXCLUDED.nombre_reemplazo,
        motivo=EXCLUDED.motivo,
        autorizado_por=EXCLUDED.autorizado_por,
        actualizado_en=now()
    `;
    return Response.json({ ok:true, original:{codigo:original,nombre:inscrito[0].nombre}, reemplazo:{codigo:reemplazo,nombre:nombreReemplazo}, autorizadoPor:oficial });
  } catch (e) {
    console.error("guardia reemplazos POST", e);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
