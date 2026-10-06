import { sqlClient, ensureSchema, ensureExtras, validKey, reservedKey } from "../../../lib/db.js";

export const runtime = "nodejs";

/* Versiones anteriores de un registro (las más recientes primero).
   GET /api/state-history?key=parte:2026-10-02__emergencia-b-5__1900&limit=20 */
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const key = params.get("key");
  const limit = Math.min(Math.max(parseInt(params.get("limit") || "20", 10) || 20, 1), 50);
  if (!validKey(key) || reservedKey(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });
  try {
    await ensureSchema(sql);
    await ensureExtras(sql);
    const rows = await sql`SELECT id, op, version_at, replaced_at, value FROM app_state_hist WHERE key = ${key} ORDER BY id DESC LIMIT ${limit}`;
    return Response.json({ versions: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state-history GET failed", error);
    return Response.json({ error: "database_error", versions: [] }, { status: 500 });
  }
}
