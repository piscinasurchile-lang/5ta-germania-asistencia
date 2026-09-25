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

    // OBAC usa exactamente la misma tabla persistente que /api/guardia/inscripcion.
    // No filtramos por semana_inicio porque la fecha identifica la noche real.
    const inscritos = await sql`
      SELECT DISTINCT ON (codigo)
        codigo::text AS codigo,
        nombre,
        creado_en
      FROM guardia_inscripciones
      WHERE fecha = ${fecha}::date
      ORDER BY codigo, creado_en ASC
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

    // El nombre no se acepta desde el navegador: se toma de la inscripción real.
    const inscrito = await sql`
      SELECT codigo::text AS codigo, nombre
      FROM guardia_inscripciones
      WHERE fecha = ${fecha}::date
        AND codigo = ${codigo}
      ORDER BY creado_en ASC
      LIMIT 1
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
