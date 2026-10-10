import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { redactRoster, preserveMedical } from "../../../../lib/medical-access.js";
import { ensureSchema, readState, writeState, addToList, voluntariosQuitados } from "../../../../lib/state-store.js";

export const runtime = "nodejs";
function officialSession(request) {
  const secret = process.env.SESSION_SECRET || process.env.OFFICIALITY_PIN;
  const got = request.cookies?.get("quinta_oficialidad")?.value || "";
  if (!secret || !got) return false;
  const expected = crypto.createHmac("sha256", secret).update("5ta-germania-oficialidad").digest("hex");
  const a = Buffer.from(got), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a,b);
}


const valid = (key) => /^[a-zA-Z0-9:_-]{1,100}$/.test(key);
const reserved = (key) => key.startsWith("security:");

function sqlClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export async function GET(request, { params }) {
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reserved(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  try {
    await ensureSchema(sql);
    const estado = await readState(sql, key);
    return Response.json({ value: key === "roster:v8" && !officialSession(request) ? redactRoster(estado.value) : (estado.value ?? null), version: estado.version }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state GET failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

export async function PUT(request, { params }) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reserved(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });
  // El titular solo se reserva mediante la operación atómica por fecha.
  // PUT/PATCH no pueden eludir esta restricción.
  if (key.startsWith("guardia-maq:") || key.startsWith("guardia-conductor:"))
    return Response.json({ error: "usar_reserva_titular" }, { status: 409, headers: { "Cache-Control": "no-store" } });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  if (!Object.prototype.hasOwnProperty.call(body, "value")) return Response.json({ error: "missing_value" }, { status: 400 });

  const ifVersion = Object.prototype.hasOwnProperty.call(body, "ifVersion") && Number.isInteger(body.ifVersion) ? body.ifVersion : null;

  try {
    await ensureSchema(sql);
    let actual;
    if (key === "roster:v8") {
      actual = await readState(sql, key);
      const faltan = voluntariosQuitados(actual.value, body.value, body.permitirQuitar);
      if (faltan.length) {
        return Response.json({ error: "roster_quita_voluntarios", faltan }, { status: 409, headers: { "Cache-Control": "no-store" } });
      }
    }
    const safeValue = key === "roster:v8" && !officialSession(request) ? preserveMedical(actual.value, body.value) : body.value;
    const r = await writeState(sql, key, safeValue, { ifVersion });
    if (r.conflict) return Response.json({ error: "version_conflict", version: r.version, value: key === "roster:v8" && !officialSession(request) ? redactRoster(r.value) : r.value }, { status: 409, headers: { "Cache-Control": "no-store" } });
    return Response.json({ ok: true, version: r.version }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state PUT failed", error);
    return Response.json({ error: "database_error" }, { status: 500 });
  }
}

/* Agrega un elemento a una lista sin leerla antes: {"op":"addToList","item":…,"uniqueBy":"clave","sort":"asc"} */
export async function PATCH(request, { params }) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden_origin" }, { status: 403 });
  const { key } = await params;
  if (!valid(key)) return Response.json({ error: "invalid_key" }, { status: 400 });
  if (reserved(key)) return Response.json({ error: "forbidden_key" }, { status: 403 });
  // El titular solo se reserva mediante la operación atómica por fecha.
  // PUT/PATCH no pueden eludir esta restricción.
  if (key.startsWith("guardia-maq:") || key.startsWith("guardia-conductor:"))
    return Response.json({ error: "usar_reserva_titular" }, { status: 409, headers: { "Cache-Control": "no-store" } });

  const sql = sqlClient();
  if (!sql) return Response.json({ error: "database_not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
  if (body?.op !== "addToList" || !Object.prototype.hasOwnProperty.call(body, "item")) return Response.json({ error: "invalid_op" }, { status: 400 });
  const uniqueBy = typeof body.uniqueBy === "string" ? body.uniqueBy : null;
  const sort = body.sort === "asc" ? "asc" : null;

  try {
    await ensureSchema(sql);
    if (key === "roster:v8") return Response.json({ error: "roster_patch_forbidden" }, { status: 403 });
    const r = await addToList(sql, key, body.item, { uniqueBy, sort });
    if (!r.ok) return Response.json({ error: "not_a_list" }, { status: 409 });
    return Response.json({ ok: true, version: r.version, value: r.value }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("state PATCH failed", error);
    return Response.json({ error: error?.message === "invalid_unique_by" ? "invalid_unique_by" : "database_error" }, { status: error?.message === "invalid_unique_by" ? 400 : 500 });
  }
}
