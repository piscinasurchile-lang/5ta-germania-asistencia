import { neon } from "@neondatabase/serverless";
import { clavesDisponibilidad, hoyChile, resumenDisponibilidad } from "../../../lib/disponibilidad.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET /api/resumen → {cuartel, disponibles, maquinistas, hora}
   Una sola consulta de solo lectura (para el widget de Android y pantallas con datos móviles):
   en vez de 17 lecturas, devuelve solo los tres números. No expone nombres ni datos personales. */
export async function GET() {
  if (!process.env.DATABASE_URL) return Response.json({ error: "database_not_configured" }, { status: 503 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const claves = ["roster:v8"].concat(clavesDisponibilidad(hoyChile()));
    const filas = await sql`SELECT key, value FROM app_state WHERE key = ANY(${claves}::text[])`;
    const porClave = {};
    filas.forEach((f) => { porClave[f.key] = f.value; });
    const { cuartel, disponibles, maquinistas } = resumenDisponibilidad(porClave["roster:v8"], Object.fromEntries(Object.entries(porClave).filter(([k]) => k !== "roster:v8")));
    return Response.json(
      { cuartel, disponibles, maquinistas, hora: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("resumen failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
