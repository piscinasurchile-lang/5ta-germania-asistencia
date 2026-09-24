import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: false, app: "5ta-germania-asistencia", database: false }, { status: 503 });
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`SELECT 1 AS ok`;
    return Response.json({ ok: true, app: "5ta-germania-asistencia", database: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("health database check failed", error);
    return Response.json({ ok: false, app: "5ta-germania-asistencia", database: false }, { status: 503 });
  }
}
