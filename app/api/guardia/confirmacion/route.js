import { neon } from "@neondatabase/serverless";
import { buscarOficial2026 } from "../../../../lib/oficialidad-2026";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const validCode = (v) => /^\d{1,6}$/.test(v || "");

function db() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
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
      UNIQUE(fecha,codigo)
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

    await sql`CREATE TABLE IF NOT EXISTS guardia_reemplazos(id bigserial PRIMARY KEY,fecha date NOT NULL,codigo_original varchar(6) NOT NULL,nombre_original text NOT NULL,codigo_reemplazo varchar(6) NOT NULL,nombre_reemplazo text NOT NULL,motivo text NOT NULL DEFAULT '',autorizado_por varchar(6) NOT NULL,creado_en timestamptz NOT NULL DEFAULT now(),actualizado_en timestamptz NOT NULL DEFAULT now(),UNIQUE(fecha,codigo_original))`;
    const inscritos = await sql`
      SELECT DISTINCT ON (gi.codigo)
        COALESCE(gr.codigo_reemplazo,gi.codigo)::text AS codigo,
        COALESCE(gr.nombre_reemplazo,gi.nombre) AS nombre,
        gi.codigo::text AS codigo_original,
        (gr.codigo_reemplazo IS NOT NULL) AS reemplazo,
        gi.creado_en
      FROM guardia_inscripciones gi
      LEFT JOIN guardia_reemplazos gr ON gr.fecha=gi.fecha AND gr.codigo_original=gi.codigo
      WHERE gi.fecha = ${fecha}::date
      ORDER BY gi.codigo, gi.creado_en ASC
    `;

    const confirmaciones = await sql`
      SELECT codigo::text AS codigo, cumplio, confirmado_por, confirmado_en
      FROM guardia_confirmaciones
      WHERE fecha = ${fecha}::date
    `;

    const porCodigo = Object.fromEntries(
      confirmaciones.map((x) => [String(x.codigo), x])
    );

    return Response.json(
      {
        fecha,
        total: inscritos.length,
        voluntarios: inscritos.map((v) => ({
          codigo: String(v.codigo),
          nombre: v.nombre,
          codigoOriginal: String(v.codigo_original),
          reemplazo: Boolean(v.reemplazo),
          confirmacion: porCodigo[String(v.codigo)] || null,
        })),
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("guardia confirmacion GET", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });

  const sql = db();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const fecha = String(body.fecha || "");
  const codigo = String(body.codigo || "");
  const confirmadoPor = String(body.confirmadoPor || "");
  const cumplio = body.cumplio;

  if (!validDate(fecha) || !validCode(codigo) || !validCode(confirmadoPor) || typeof cumplio !== "boolean") {
    return Response.json({ error: "invalid_data" }, { status: 400 });
  }

  const oficial = buscarOficial2026(confirmadoPor);
  if (!oficial) return Response.json({ error: "official_not_authorized" }, { status: 403 });

  try {
    await schema(sql);

    await sql`CREATE TABLE IF NOT EXISTS guardia_reemplazos(id bigserial PRIMARY KEY,fecha date NOT NULL,codigo_original varchar(6) NOT NULL,nombre_original text NOT NULL,codigo_reemplazo varchar(6) NOT NULL,nombre_reemplazo text NOT NULL,motivo text NOT NULL DEFAULT '',autorizado_por varchar(6) NOT NULL,creado_en timestamptz NOT NULL DEFAULT now(),actualizado_en timestamptz NOT NULL DEFAULT now(),UNIQUE(fecha,codigo_original))`;
    const inscrito = await sql`
      SELECT COALESCE(gr.codigo_reemplazo,gi.codigo)::text AS codigo,
             COALESCE(gr.nombre_reemplazo,gi.nombre) AS nombre
      FROM guardia_inscripciones gi
      LEFT JOIN guardia_reemplazos gr ON gr.fecha=gi.fecha AND gr.codigo_original=gi.codigo
      WHERE gi.fecha=${fecha}::date AND COALESCE(gr.codigo_reemplazo,gi.codigo)=${codigo}
      ORDER BY gi.creado_en ASC LIMIT 1
    `;
    if (!inscrito.length) return Response.json({ error: "not_registered" }, { status: 409 });
    const nombreReal = inscrito[0].nombre;

    await sql`
      INSERT INTO guardia_confirmaciones(fecha,codigo,nombre,cumplio,confirmado_por)
      VALUES(${fecha}::date,${codigo},${nombreReal},${cumplio},${oficial.codigo})
      ON CONFLICT(fecha,codigo)
      DO UPDATE SET
        nombre=EXCLUDED.nombre,
        cumplio=EXCLUDED.cumplio,
        confirmado_por=EXCLUDED.confirmado_por,
        confirmado_en=now()
    `;

    return Response.json(
      {
        ok: true,
        voluntario: { codigo, nombre: nombreReal, cumplio },
        confirmadoPor: { codigo: oficial.codigo, nombre: oficial.nombre, cargo: oficial.cargo },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("guardia confirmacion POST", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
