import { neon } from "@neondatabase/serverless";
import { ensureSchema, readState } from "../../../../lib/state-store.js";
import { validarReservaMaquinista, fechasSemana } from "../../../../lib/guardia-maquinista.mjs";

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
      `WITH control AS (
        SELECT
          NOT EXISTS (
            SELECT 1 FROM app_state s
            WHERE s.key LIKE $1 AND s.key <> $2
              AND EXISTS (
                SELECT 1 FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END
                ) AS x(v)
                WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
              )
          ) AS sin_otro,
          NOT EXISTS (
            SELECT 1 FROM app_state s
            WHERE s.key = $4
              AND EXISTS (
                SELECT 1 FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END
                ) AS x(v)
                WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
              )
          ) AS sin_vol
      ),
      reserva AS (
        INSERT INTO app_state(key,value,updated_at,version)
        SELECT $5, jsonb_build_object('id',$6::text,'semana',$7::text,'fecha',$3::text,'en',now()),now(),1
        FROM control WHERE sin_otro AND sin_vol
        ON CONFLICT(key) DO NOTHING RETURNING key
      ),
      inscripcion AS (
        INSERT INTO app_state(key,value,updated_at,version)
        SELECT $2,jsonb_build_array(jsonb_build_object('f',$3::text,'t',now())),now(),1
        FROM reserva
        ON CONFLICT(key) DO UPDATE SET
          value = CASE WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(app_state.value)='array' THEN app_state.value ELSE '[]'::jsonb END
            ) AS x(v)
            WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
          ) THEN app_state.value
          ELSE (CASE WHEN jsonb_typeof(app_state.value)='array' THEN app_state.value ELSE '[]'::jsonb END) || EXCLUDED.value END,
          updated_at=now(),version=app_state.version+1
        RETURNING key
      )
      SELECT EXISTS(SELECT 1 FROM reserva) AS reservada,
        EXISTS(SELECT 1 FROM inscripcion) AS guardada,
        (SELECT sin_otro FROM control) AS sin_otro,
        (SELECT sin_vol FROM control) AS sin_vol`,
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
