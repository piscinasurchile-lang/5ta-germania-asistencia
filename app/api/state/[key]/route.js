import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const valid = (key) => /^[a-zA-Z0-9:_-]{1,100}$/.test(key);
const reserved = (key) => key.startsWith("security:");

function sqlClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS app_state_updated_at_idx ON app_state(updated_at DESC)`;
}

export async function GET(_request, { params }) {
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reserved(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });

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
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reserved(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  if (!Object.prototype.hasOwnProperty.call(body, "value")) return Response.json({ error: "missing_value" }, { status: 400 });

  try {
    await ensureSchema(sql);
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
