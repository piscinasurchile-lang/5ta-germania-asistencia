import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const valid = (key) => /^[a-zA-Z0-9:_-]{1,100}$/.test(key);

function sqlClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export async function GET(_request, { params }) {
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  try {
    const rows = await sql`SELECT value FROM app_state WHERE key = ${key} LIMIT 1`;
    return Response.json({ value: rows?.[0]?.value ?? null });
  } catch (error) {
    console.error("state GET failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!Object.prototype.hasOwnProperty.call(body, "value")) {
    return Response.json({ error: "missing_value" }, { status: 400 });
  }

  try {
    const value = JSON.stringify(body.value);
    await sql`
      INSERT INTO app_state (key, value, updated_at)
      VALUES (${key}, ${value}::jsonb, now())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("state PUT failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}
