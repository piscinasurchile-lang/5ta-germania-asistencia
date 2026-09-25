import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const MAX_GUARDIANES = 4;
const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const validCode = (v) => /^\d{1,6}$/.test(v || "");

function sqlClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS guardia_inscripciones (
      id bigserial PRIMARY KEY,
      semana_inicio date NOT NULL,
      fecha date NOT NULL,
      codigo varchar(6) NOT NULL,
      nombre text NOT NULL,
      creado_en timestamptz NOT NULL DEFAULT now(),
      UNIQUE (semana_inicio, fecha, codigo)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS guardia_inscripciones_semana_idx ON guardia_inscripciones(semana_inicio, fecha)`;
}

export async function GET(request) {
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const codigo = searchParams.get("codigo") || "";
  if (!validDate(inicio)) return Response.json({ error: "invalid_start" }, { status: 400 });
  if (codigo && !validCode(codigo)) return Response.json({ error: "invalid_code" }, { status: 400 });
  try {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT fecha::text AS fecha, codigo, nombre
      FROM guardia_inscripciones
      WHERE semana_inicio = ${inicio}::date
      ORDER BY fecha, creado_en
    `;
    const dias = {};
    for (const row of rows) {
      const fecha = String(row.fecha).slice(0, 10);
      if (!dias[fecha]) dias[fecha] = [];
      dias[fecha].push({ codigo: row.codigo, nombre: row.nombre });
    }
    const propias = codigo ? rows.filter(r => String(r.codigo) === codigo).map(r => String(r.fecha).slice(0,10)) : [];
    return Response.json({ dias, propias }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("guardia GET failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const inicio = String(body.inicio || "");
  const fecha = String(body.fecha || "");
  const codigo = String(body.codigo || "");
  const nombre = String(body.nombre || "").trim();
  if (!validDate(inicio) || !validDate(fecha) || !validCode(codigo) || !nombre) return Response.json({ error: "invalid_data" }, { status: 400 });
  try {
    await ensureSchema(sql);
    const lockKey = Number(fecha.replaceAll("-", ""));
    const rows = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(${lockKey})`,
      sql`SELECT COUNT(*)::int AS total FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND fecha=${fecha}::date`,
      sql`SELECT EXISTS(SELECT 1 FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND fecha=${fecha}::date AND codigo=${codigo}) AS existe`
    ]);
    const total = Number(rows?.[1]?.[0]?.total || 0);
    const existe = Boolean(rows?.[2]?.[0]?.existe);
    if (existe) return Response.json({ ok: true, already: true, total });
    if (total >= MAX_GUARDIANES) return Response.json({ error: "full", total }, { status: 409 });
    await sql`
      INSERT INTO guardia_inscripciones (semana_inicio, fecha, codigo, nombre)
      VALUES (${inicio}::date, ${fecha}::date, ${codigo}, ${nombre})
      ON CONFLICT (semana_inicio, fecha, codigo) DO NOTHING
    `;
    const count = await sql`SELECT COUNT(*)::int AS total FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND fecha=${fecha}::date`;
    return Response.json({ ok: true, total: Number(count?.[0]?.total || 0) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("guardia POST failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
