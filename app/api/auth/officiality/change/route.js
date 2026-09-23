import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

export const runtime = "nodejs";

function token(secret) {
  return crypto.createHmac("sha256", secret).update("5ta-germania-oficialidad").digest("hex");
}

export async function POST(request) {
  const bootstrap = process.env.OFFICIALITY_PIN;
  if (!bootstrap || !process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "auth_not_configured" }, { status: 503 });
  }

  const session = request.cookies.get("quinta_oficialidad")?.value;
  if (!session || session !== token(bootstrap)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { pin } = await request.json().catch(() => ({}));
  if (!/^\d{4,12}$/.test(String(pin || ""))) {
    return NextResponse.json({ ok: false, error: "invalid_pin" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO app_state (key, value)
    VALUES ('security:officiality_pin', ${JSON.stringify({ pin: String(pin) })}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;

  return NextResponse.json({ ok: true });
}
