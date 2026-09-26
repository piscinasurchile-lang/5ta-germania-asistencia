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
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
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
  await sql`CREATE TABLE IF NOT EXISTS guardia_semanas (id bigserial PRIMARY KEY, fecha_inicio date NOT NULL, fecha_fin date NOT NULL, apertura timestamptz NOT NULL, cierre timestamptz NOT NULL, estado text NOT NULL DEFAULT 'abierta', creado_por varchar(6) NOT NULL, creado_en timestamptz NOT NULL DEFAULT now(), actualizado_en timestamptz NOT NULL DEFAULT now(), UNIQUE(fecha_inicio,fecha_fin))`;
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

    const propias = codigo
      ? rows.filter((row) => String(row.codigo) === codigo).map((row) => String(row.fecha).slice(0, 10))
      : [];

    const semanaRows = await sql`
      SELECT estado, apertura, cierre FROM guardia_semanas
      WHERE fecha_inicio = ${inicio}::date
      ORDER BY creado_en DESC LIMIT 1
    `;
    const w = semanaRows[0] || null;
    const now = Date.now();
    const abierta = !!w && w.estado === "abierta" && now >= new Date(w.apertura).getTime() && now <= new Date(w.cierre).getTime();
    const semana = w ? { estado: w.estado, apertura: w.apertura, cierre: w.cierre, abierta } : null;

    return Response.json({ dias, propias, semana }, { headers: { "Cache-Control": "no-store" } });
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
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const inicio = String(body.inicio || "");
  const fecha = String(body.fecha || "");
  const codigo = String(body.codigo || "");
  const nombre = String(body.nombre || "").trim();

  if (!validDate(inicio) || !validDate(fecha) || !validCode(codigo) || !nombre) {
    return Response.json({ error: "invalid_data" }, { status: 400 });
  }

  try {
    await ensureSchema(sql);
    const semana = await sql`SELECT estado, apertura, cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date AND fecha_fin>=${fecha}::date AND fecha_inicio<=${fecha}::date ORDER BY creado_en DESC LIMIT 1`;
    if (!semana.length) return Response.json({error:"registration_not_open"},{status:409});
    const w=semana[0], now=Date.now();
    if(w.estado!=="abierta"||now<new Date(w.apertura).getTime()||now>new Date(w.cierre).getTime()) return Response.json({error:"registration_closed"},{status:409});

    const lockKey = Number(`${inicio.replaceAll("-", "")}${fecha.replaceAll("-", "")}`.slice(-15));

    const result = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(${lockKey})`,
      sql`
        INSERT INTO guardia_inscripciones (semana_inicio, fecha, codigo, nombre)
        SELECT ${inicio}::date, ${fecha}::date, ${codigo}, ${nombre}
        WHERE
          NOT EXISTS (
            SELECT 1 FROM guardia_inscripciones
            WHERE semana_inicio = ${inicio}::date
              AND fecha = ${fecha}::date
              AND codigo = ${codigo}
          )
          AND (
            SELECT COUNT(*) FROM guardia_inscripciones
            WHERE semana_inicio = ${inicio}::date
              AND fecha = ${fecha}::date
          ) < ${MAX_GUARDIANES}
        ON CONFLICT (semana_inicio, fecha, codigo) DO NOTHING
        RETURNING id
      `,
      sql`
        SELECT
          COUNT(*)::int AS total,
          EXISTS(
            SELECT 1 FROM guardia_inscripciones
            WHERE semana_inicio = ${inicio}::date
              AND fecha = ${fecha}::date
              AND codigo = ${codigo}
          ) AS inscrito
        FROM guardia_inscripciones
        WHERE semana_inicio = ${inicio}::date
          AND fecha = ${fecha}::date
      `
    ]);

    const inserted = (result?.[1]?.length || 0) > 0;
    const estado = result?.[2]?.[0] || {};
    const total = Number(estado.total || 0);
    const inscrito = Boolean(estado.inscrito);

    if (inserted) {
      return Response.json({ ok: true, total }, { headers: { "Cache-Control": "no-store" } });
    }

    if (inscrito) {
      return Response.json({ ok: true, already: true, total }, { headers: { "Cache-Control": "no-store" } });
    }

    return Response.json({ error: "full", total }, { status: 409, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("guardia POST failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}


export async function DELETE(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  let body; try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const inicio=String(body.inicio||""), fecha=String(body.fecha||""), codigo=String(body.codigo||"");
  if(!validDate(inicio)||!validDate(fecha)||!validCode(codigo)) return Response.json({error:"invalid_data"},{status:400});
  try {
    await ensureSchema(sql);
    const semana = await sql`SELECT estado, apertura, cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date AND fecha_fin>=${fecha}::date AND fecha_inicio<=${fecha}::date ORDER BY creado_en DESC LIMIT 1`;
    if (!semana.length) return Response.json({error:"registration_not_open"},{status:409});
    const w=semana[0], now=Date.now();
    if(w.estado!=="abierta"||now<new Date(w.apertura).getTime()||now>new Date(w.cierre).getTime()) return Response.json({error:"registration_closed"},{status:409});
    await sql`DELETE FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND fecha=${fecha}::date AND codigo=${codigo}`;
    return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { console.error("guardia DELETE failed",error); return Response.json({error:"database_error"},{status:500}); }
}


export async function PUT(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  let body; try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const inicio=String(body.inicio||""), codigo=String(body.codigo||""), nombre=String(body.nombre||"").trim();
  const fechas=Array.isArray(body.fechas)?[...new Set(body.fechas.map(String))]:[];
  if(!validDate(inicio)||!validCode(codigo)||!nombre||fechas.some(f=>!validDate(f))||fechas.length>7) return Response.json({error:"invalid_data"},{status:400});
  try {
    await ensureSchema(sql);
    const semana=await sql`SELECT fecha_inicio::text,fecha_fin::text,estado,apertura,cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date ORDER BY creado_en DESC LIMIT 1`;
    if(!semana.length) return Response.json({error:"registration_not_open"},{status:409});
    const w=semana[0],now=Date.now(),fin=String(w.fecha_fin).slice(0,10);
    if(w.estado!=="abierta"||now<new Date(w.apertura).getTime()||now>new Date(w.cierre).getTime()) return Response.json({error:"registration_closed"},{status:409});
    if(fechas.some(f=>f<inicio||f>fin)) return Response.json({error:"invalid_date_for_week"},{status:400});
    const payload=JSON.stringify(fechas);
    const lockKey=Number(inicio.replaceAll("-",""));
    const result=await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(${lockKey})`,
      sql`WITH elegidas AS (SELECT value::date fecha FROM jsonb_array_elements_text(${payload}::jsonb)),
        cupos AS (
          SELECT e.fecha,COUNT(gi.id)::int ocupados
          FROM elegidas e LEFT JOIN guardia_inscripciones gi ON gi.fecha=e.fecha AND gi.codigo<>${codigo}
          GROUP BY e.fecha
        ),
        disponibles AS (
          SELECT COUNT(*)::int n FROM generate_series(${inicio}::date,${fin}::date,'1 day'::interval) d
          WHERE (SELECT COUNT(*) FROM guardia_inscripciones gi WHERE gi.fecha=d::date AND gi.codigo<>${codigo}) < ${MAX_GUARDIANES}
        ),
        valido AS (
          SELECT NOT EXISTS(SELECT 1 FROM cupos WHERE ocupados>=${MAX_GUARDIANES})
            AND (SELECT COUNT(*) FROM elegidas) >= LEAST(2,(SELECT n FROM disponibles)) ok
        ),
        borradas AS (
          DELETE FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND codigo=${codigo} AND (SELECT ok FROM valido) RETURNING id
        ),
        insertadas AS (
          INSERT INTO guardia_inscripciones(semana_inicio,fecha,codigo,nombre)
          SELECT ${inicio}::date,e.fecha,${codigo},${nombre} FROM elegidas e
          WHERE (SELECT ok FROM valido)
          ON CONFLICT(semana_inicio,fecha,codigo) DO NOTHING RETURNING id
        )
        SELECT (SELECT ok FROM valido) ok,(SELECT n FROM disponibles) disponibles,(SELECT COUNT(*)::int FROM insertadas) total`
    ]);
    const estado=result?.[1]?.[0]||{};
    if(!estado.ok) return Response.json({error:"selection_invalid_or_full",disponibles:Number(estado.disponibles||0)},{status:409});
    return Response.json({ok:true,total:Number(estado.total||0)},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { console.error("guardia PUT failed",error); return Response.json({error:"database_error"},{status:500}); }
}
