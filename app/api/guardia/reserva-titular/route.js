import { neon } from "@neondatabase/serverless";
import { ensureSchema, readState } from "../../../../lib/state-store.js";
import { validarReservaMaquinista, fechasSemana } from "../../../../lib/guardia-maquinista.mjs";
import { RESERVA_TITULAR_SQL } from "../../../../lib/guardia-reserva-titular-sql.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const codigo = id => /^\d{1,8}$/.test(String(id || ""));
const db = () => process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
function mismoOrigen(r) {
  const origin = r.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === r.headers.get("host"); } catch { return false; }
}
function respuesta(codigo, status = 409) {
  return Response.json({ ok: false, codigo }, { status, headers: { "Cache-Control": "no-store" } });
}
async function contexto(sql, inicio, id) {
  const [plan, roster] = await Promise.all([
    readState(sql, "guardia-plan:" + inicio),
    readState(sql, "roster:v8"),
  ]);
  return { plan: plan.value, miembro: Array.isArray(roster.value)
    ? roster.value.find(x => String(x.id) === id) || null : null };
}

/**
 * Único titular por noche, sin tabla paralela: la clave guardia-conductor:fecha
 * se inserta una sola vez. La misma sentencia registra la noche en
 * guardia-maq:semana:persona, de modo que se escribe todo o nada.
 * La autenticación del voluntario requiere revisión separada de seguridad.
 */
export async function POST(request) {
  if (!mismoOrigen(request)) return respuesta("ORIGEN_INVALIDO", 403);
  let body;
  try { body = await request.json(); } catch { return respuesta("DATOS_INVALIDOS", 400); }
  const inicio = String(body?.inicio || ""), fecha = String(body?.fecha || ""),
    id = String(body?.personaId || "");
  if (!codigo(id) || !fechasSemana(inicio).includes(fecha)) return respuesta("FECHA_O_VOLUNTARIO_INVALIDO", 400);
  const sql = db();
  if (!sql) return respuesta("SIN_BASE", 503);
  try {
    await ensureSchema(sql);
    const { plan, miembro } = await contexto(sql, inicio, id);
    const validacion = validarReservaMaquinista({ inicio, fecha, personaId: id, plan, miembro });
    if (!validacion.ok) return respuesta(validacion.codigo);

    const slot = "guardia-conductor:" + fecha;
    const personal = "guardia-maq:" + inicio + ":" + id;
    const otros = "guardia-maq:" + inicio + ":%";
    const voluntario = "guardia-inscripcion:" + inicio + ":" + id;
    const actual = await readState(sql, slot);
    if (actual.value) {
      return String(actual.value.id) === id
        ? Response.json({ ok: true, codigo: "YA_RESERVADO", fecha }, { headers: { "Cache-Control": "no-store" } })
        : respuesta("OCUPADO");
    }

    // UNIQUE(key) en app_state: dos reservas simultáneas tienen un solo ganador.
    // Los registros antiguos de otro maquinista también impiden reservar.
    const rows = await sql.query(
      RESERVA_TITULAR_SQL,
      [otros, personal, fecha, voluntario, slot, id, inicio]
    );
    const result = rows?.[0] || {};
    if (result.reservada && result.guardada) {
      return Response.json({ ok: true, codigo: "RESERVADA", fecha }, { headers: { "Cache-Control": "no-store" } });
    }
    return !result.sin_vol ? respuesta("YA_INSCRITO_COMO_VOLUNTARIO") : respuesta("OCUPADO");
  } catch (error) {
    console.error("Reserva atómica de maquinista", error);
    return respuesta("ERROR_DE_BASE", 500);
  }
}

/** Lectura del slot; las inscripciones antiguas cuentan como ocupadas. */
export async function GET(request) {
  const u = new URL(request.url);
  const inicio = String(u.searchParams.get("inicio") || "");
  const fecha = String(u.searchParams.get("fecha") || "");
  if (!fechasSemana(inicio).includes(fecha)) return respuesta("FECHA_INVALIDA", 400);
  const sql = db();
  if (!sql) return respuesta("SIN_BASE", 503);
  try {
    await ensureSchema(sql);
    const actual = await readState(sql, "guardia-conductor:" + fecha);
    if (actual.value) return Response.json({ fecha, ocupado: true }, { headers: { "Cache-Control": "no-store" } });
    const rows = await sql.query(
      `SELECT EXISTS(SELECT 1 FROM app_state s WHERE s.key LIKE $1 AND EXISTS(
        SELECT 1 FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END
        ) AS x(v)
        WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END)=$2
      )) AS ocupado`,
      ["guardia-maq:" + inicio + ":%", fecha]
    );
    return Response.json({ fecha, ocupado: !!rows?.[0]?.ocupado }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Consulta ocupación maquinista", error);
    return respuesta("ERROR_DE_BASE", 500);
  }
}
