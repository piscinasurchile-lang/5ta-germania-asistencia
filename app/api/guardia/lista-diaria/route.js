import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
const db = () => process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

async function replacementSchema(sql) {
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
    await replacementSchema(sql);
    await sql`CREATE TABLE IF NOT EXISTS guardia_conductores(id bigserial PRIMARY KEY,fecha date NOT NULL UNIQUE,codigo varchar(6) NOT NULL,nombre text NOT NULL,autorizado_por varchar(6) NOT NULL,actualizado_en timestamptz NOT NULL DEFAULT now())`;
    const filas = await sql`
      SELECT DISTINCT ON (gi.codigo)
        gi.codigo::text AS codigo,
        gi.nombre,
        gi.creado_en AS inscrito_en,
        gc.cumplio,
        gc.confirmado_por::text AS confirmado_por,
        gc.confirmado_en,
        gr.codigo_reemplazo::text AS codigo_reemplazo,
        gr.nombre_reemplazo,
        gr.motivo AS motivo_reemplazo,
        gr.autorizado_por::text AS reemplazo_autorizado_por,
        gr.actualizado_en AS reemplazo_actualizado_en
      FROM guardia_inscripciones gi
      LEFT JOIN guardia_confirmaciones gc
        ON gc.fecha = gi.fecha AND gc.codigo = COALESCE(gr.codigo_reemplazo,gi.codigo)
      LEFT JOIN guardia_reemplazos gr
        ON gr.fecha = gi.fecha AND gr.codigo_original = gi.codigo
      WHERE gi.fecha = ${fecha}::date
      ORDER BY gi.codigo, gi.creado_en ASC
    `;

    const conductores = await sql`SELECT codigo::text,nombre,autorizado_por::text,actualizado_en FROM guardia_conductores WHERE fecha=${fecha}::date LIMIT 1`;
    const voluntarios = filas.map((v, index) => ({
      posicion: index + 1,
      codigo: String(v.codigo),
      nombre: v.nombre,
      inscritoEn: v.inscrito_en,
      obac: v.cumplio === null ? "pendiente" : v.cumplio ? "cumplio" : "no_cumplio",
      confirmadoPor: v.confirmado_por ? String(v.confirmado_por) : null,
      confirmadoEn: v.confirmado_en || null,
      reemplazo: v.codigo_reemplazo ? {
        codigo: String(v.codigo_reemplazo),
        nombre: v.nombre_reemplazo,
        motivo: v.motivo_reemplazo || "",
        autorizadoPor: String(v.reemplazo_autorizado_por),
        actualizadoEn: v.reemplazo_actualizado_en,
      } : null,
      efectivo: v.codigo_reemplazo ? {
        codigo: String(v.codigo_reemplazo),
        nombre: v.nombre_reemplazo,
        esReemplazo: true,
      } : {
        codigo: String(v.codigo),
        nombre: v.nombre,
        esReemplazo: false,
      },
    }));

    return Response.json({
      fecha,
      total: voluntarios.length,
      completa: voluntarios.length === 4,
      conReemplazos: voluntarios.filter((v) => v.reemplazo).length,
      pendientesObac: voluntarios.filter((v) => v.obac === "pendiente").length,
      conductor: conductores[0] || null,
      voluntarios,
    }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (error) {
    console.error("guardia lista diaria GET", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
