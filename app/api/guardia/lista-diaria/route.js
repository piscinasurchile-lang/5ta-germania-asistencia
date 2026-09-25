import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");

function db() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

export async function GET(request) {
  const sql = db();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  const fecha = new URL(request.url).searchParams.get("fecha");
  if (!validDate(fecha)) return Response.json({ error: "invalid_date" }, { status: 400 });

  try {
    const filas = await sql`
      SELECT DISTINCT ON (gi.codigo)
        gi.codigo::text AS codigo,
        gi.nombre,
        gi.creado_en AS inscrito_en,
        gc.cumplio,
        gc.confirmado_por::text AS confirmado_por,
        gc.confirmado_en
      FROM guardia_inscripciones gi
      LEFT JOIN guardia_confirmaciones gc
        ON gc.fecha = gi.fecha AND gc.codigo = gi.codigo
      WHERE gi.fecha = ${fecha}::date
      ORDER BY gi.codigo, gi.creado_en ASC
    `;

    return Response.json(
      {
        fecha,
        total: filas.length,
        completa: filas.length === 4,
        pendientesObac: filas.filter((v) => v.cumplio === null).length,
        voluntarios: filas.map((v, index) => ({
          posicion: index + 1,
          codigo: String(v.codigo),
          nombre: v.nombre,
          inscritoEn: v.inscrito_en,
          obac: v.cumplio === null ? "pendiente" : v.cumplio ? "cumplio" : "no_cumplio",
          confirmadoPor: v.confirmado_por ? String(v.confirmado_por) : null,
          confirmadoEn: v.confirmado_en || null,
        })),
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("guardia lista diaria GET", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
