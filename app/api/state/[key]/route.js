import { sqlClient, ensureSchema, ensureExtras, validKey, reservedKey, sameOrigin } from "../../../../lib/db.js";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { key } = await params;
  if (!validKey(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reservedKey(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  try {
    await ensureSchema(sql);
    const rows = await sql`SELECT value FROM app_state WHERE key = ${key} LIMIT 1`;
    return Response.json({ value: rows?.[0]?.value ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state GET failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const { key } = await params;
  if (!validKey(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reservedKey(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  if (!Object.prototype.hasOwnProperty.call(body, "value")) return Response.json({ error: "missing_value" }, { status: 400 });

  try {
    await ensureSchema(sql);
    /* El historial de versiones es un respaldo adicional: si no se puede
       preparar, el guardado normal continúa igual. */
    await ensureExtras(sql).catch((error) => console.error("historial no disponible", error));
    const value = JSON.stringify(body.value);
    await sql`
      INSERT INTO app_state (key, value, updated_at)
      VALUES (${key}, ${value}::jsonb, now())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state PUT failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
