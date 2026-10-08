import { neon } from "@neondatabase/serverless";
import { ensureSchema, listByPrefix } from "../../../lib/state-store.js";

export const runtime = "nodejs";

/* GET /api/state?prefix=guardia-inscripcion:2026-10-14:
   Lee en una sola consulta todas las claves de guardia de una semana (solo prefijos permitidos). */
export async function GET(request) {
  const prefix = new URL(request.url).searchParams.get("prefix") || "";
  if (!process.env.DATABASE_URL) return Response.json({ error: "database_not_configured" }, { status: 503 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    await ensureSchema(sql);
    const items = await listByPrefix(sql, prefix);
    return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && error.message === "invalid_prefix") return Response.json({ error: "invalid_prefix" }, { status: 400 });
    console.error("state list failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
