/* GERMANIA · escritura conjunta de registros e índices.
 * No crea tablas ni modifica los formatos vigentes. Una sola sentencia SQL
 * garantiza que el registro y su entrada de índice se confirmen o reviertan juntos.
 * Solo se admite para las tres familias ya utilizadas por la interfaz operativa.
 */
import { readState } from "./state-store.js";

function fechaValida(f) {
  return typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f);
}

export function indexedRecordSpec(key, value) {
  if (typeof key !== "string" || !value || typeof value !== "object" || Array.isArray(value)) return null;
  if (key.startsWith("parte:")) {
    const clave = key.slice("parte:".length);
    if (!fechaValida(value.date) || !clave.startsWith(value.date + "__") || typeof value.tipo !== "string") return null;
    return { indexKey: "partes:index:v1", item: { clave, date: value.date, tipo: value.tipo } };
  }
  if (key.startsWith("guardia:")) {
    const clave = key.slice("guardia:".length);
    if (!fechaValida(value.fechaIng) || !clave.startsWith(value.fechaIng + "__")) return null;
    return { indexKey: "guardias:index", item: { clave, fecha: value.fechaIng } };
  }
  if (key.startsWith("servicio:")) {
    if (!fechaValida(value.svFecha) || !key.startsWith("servicio:" + value.svFecha + "__") || typeof value.svTipoAct !== "string") return null;
    return { indexKey: "servicio:index:v1", item: { clave: key, fecha: value.svFecha, tipo: value.svTipoAct } };
  }
  return null;
}

export async function writeIndexedState(sql, key, value, { ifVersion = null } = {}) {
  const spec = indexedRecordSpec(key, value);
  if (!spec) throw new Error("invalid_indexed_record");
  const data = JSON.stringify(value);
  const item = JSON.stringify(spec.item);
  const expected = ifVersion === null || ifVersion === undefined ? null : Number(ifVersion);

  // El INSERT del índice depende del RETURNING del registro: si hay conflicto
  // de versión, no modifica ninguna de las dos claves. Si el índice no es un
  // arreglo, jsonb_array_elements falla y PostgreSQL revierte TODA la sentencia.
  // El ON CONFLICT del índice agrega atómicamente y no pierde inserciones
  // simultáneas de partes, guardias u hojas de servicio distintos.
  const rows = await sql`WITH registro AS (
    INSERT INTO app_state (key, value, updated_at, version)
    SELECT ${key}, ${data}::jsonb, now(), 1
    WHERE ${expected}::int IS NULL
       OR ${expected}::int = 0
       OR EXISTS (SELECT 1 FROM app_state WHERE key = ${key} AND version = ${expected}::int)
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now(), version = app_state.version + 1
      WHERE ${expected}::int IS NULL OR app_state.version = ${expected}::int
    RETURNING version
  ), indice AS (
    INSERT INTO app_state (key, value, updated_at, version)
    SELECT ${spec.indexKey}, jsonb_build_array(${item}::jsonb), now(), 1 FROM registro
    ON CONFLICT (key) DO UPDATE
      SET value = CASE
          WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements(app_state.value) elemento
            WHERE elemento ->> 'clave' = ${spec.item.clave}
          ) THEN app_state.value
          ELSE app_state.value || jsonb_build_array(${item}::jsonb)
        END,
        updated_at = now(), version = app_state.version + 1
    RETURNING version
  )
  SELECT (SELECT version FROM registro) AS record_version,
         (SELECT version FROM indice) AS index_version`;

  const version = rows?.[0]?.record_version;
  const indexVersion = rows?.[0]?.index_version;
  if (version === null || version === undefined) {
    const current = await readState(sql, key);
    return { ok: false, conflict: true, version: current.version, value: current.value };
  }
  if (indexVersion === null || indexVersion === undefined) throw new Error("index_write_failed");
  return { ok: true, version: Number(version) };
}
