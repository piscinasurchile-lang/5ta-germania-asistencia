import { sqlClient, ensureSchema, ensureExtras, validKey, reservedKey, sameOrigin } from "../../../lib/db.js";

export const runtime = "nodejs";

/* Lectura en bloque: muchas claves en una sola llamada.
   GET /api/state-batch?prefix=parte:        -> todos los registros con ese prefijo
   GET /api/state-batch?keys=a,b,c           -> solo esas claves (máx. 100) */
const PREFIJOS_LECTURA = ["parte:", "servicio:", "guardia:", "disponibilidad:", "correlativo:"];
const MAX_FILAS = 2000;

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const prefix = params.get("prefix");
  const keysParam = params.get("keys");
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let rows;
  try {
    await ensureSchema(sql);
    if (prefix) {
      if (!PREFIJOS_LECTURA.includes(prefix)) return Response.json({ error: "invalid_prefix" }, { status: 400 });
      rows = await sql`SELECT key, value FROM app_state WHERE left(key, length(${prefix}::text)) = ${prefix}::text ORDER BY key LIMIT ${MAX_FILAS}`;
    } else if (keysParam) {
      const keys = keysParam.split(",").filter(Boolean);
      if (!keys.length || keys.length > 100 || !keys.every((k) => validKey(k) && !reservedKey(k))) {
        return Response.json({ error: "invalid_keys" }, { status: 400 });
      }
      rows = await sql`SELECT key, value FROM app_state WHERE key = ANY(${keys}::text[])`;
    } else {
      return Response.json({ error: "missing_selector" }, { status: 400 });
    }
  } catch (error) {
    console.error("state-batch GET failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
  const items = {};
  for (const r of rows) items[r.key] = r.value;
  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

/* Escritura atómica: o se guardan TODAS las claves o no se guarda ninguna.
   Cuerpo: { writes: [{ key, value, expect? }] }
   Si una escritura trae "expect", solo se aplica cuando el valor actual de esa
   clave es exactamente ese (null = la clave no debe existir). Si alguien más la
   cambió, responde 409 y no se guarda nada. */
export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  const writes = body && body.writes;
  if (!Array.isArray(writes) || writes.length < 1 || writes.length > 25) return Response.json({ error: "invalid_writes" }, { status: 400 });
  const vistas = new Set();
  for (const w of writes) {
    if (!w || !validKey(w.key) || reservedKey(w.key) || !Object.prototype.hasOwnProperty.call(w, "value") || vistas.has(w.key)) {
      return Response.json({ error: "invalid_writes" }, { status: 400 });
    }
    vistas.add(w.key);
  }

  try {
    await ensureSchema(sql);
    await ensureExtras(sql);
  } catch (error) {
    console.error("state-batch esquema no disponible", error);
    return Response.json({ error: "database_error" }, { status: 503 });
  }

  try {
    await sql.transaction((txn) => [
      ...writes
        .filter((w) => Object.prototype.hasOwnProperty.call(w, "expect"))
        .map((w) => txn.query(
          "SELECT app_assert(COALESCE((SELECT value FROM app_state WHERE key = $1), 'null'::jsonb) = $2::jsonb, $3)",
          [w.key, JSON.stringify(w.expect === undefined ? null : w.expect), "conflicto:" + w.key]
        )),
      ...writes.map((w) => txn.query(
        "INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()",
        [w.key, JSON.stringify(w.value)]
      )),
    ], { isolationLevel: "Serializable" });
    return Response.json({ ok: true, guardadas: writes.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const msg = String((error && error.message) || "");
    const code = error && error.code;
    if (code === "40001") return Response.json({ error: "conflict", key: null }, { status: 409 });
    if (msg.includes("conflicto:")) {
      const key = msg.slice(msg.indexOf("conflicto:") + 10).trim();
      return Response.json({ error: "conflict", key }, { status: 409 });
    }
    console.error("state-batch POST failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
