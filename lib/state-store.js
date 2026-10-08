/* GERMANIA · almacén de estado central.
   Recibe `sql`, una función de plantilla etiquetada que devuelve un arreglo de filas
   (el contrato de @neondatabase/serverless). Así se puede probar con otra base.

   Protecciones (docs/ESPECIFICACION-REDISENO-Y-GUARDIA.md §5.2):
   P1 historial de lo que se sobrescribe, P2 control de versiones, P3 listas atómicas. */

/* Historial: un disparador de la base (app_state_keep_history) copia el valor anterior a
   app_state_history cada vez que cambia una clave que empieza con «guardia:», «guardia-»,
   «guardias:» o «guardias-». Al ir en la base, es exacto aun si dos personas guardan a la vez. */

let schemaListo = null;
export function ensureSchema(sql) {
  if (!schemaListo) {
    schemaListo = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS app_state (
          key text PRIMARY KEY,
          value jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE app_state ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1`;
      await sql`CREATE INDEX IF NOT EXISTS app_state_updated_at_idx ON app_state(updated_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS app_state_history (
          id bigserial PRIMARY KEY,
          key text NOT NULL,
          value jsonb NOT NULL,
          version integer NOT NULL,
          replaced_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS app_state_history_key_idx ON app_state_history(key, replaced_at DESC)`;
      await sql`
        CREATE OR REPLACE FUNCTION app_state_keep_history() RETURNS trigger AS $fn$
        BEGIN
          IF OLD.key ~ '^(guardia|guardias)[:-]' AND OLD.value IS DISTINCT FROM NEW.value THEN
            INSERT INTO app_state_history (key, value, version) VALUES (OLD.key, OLD.value, OLD.version);
          END IF;
          RETURN NEW;
        END
        $fn$ LANGUAGE plpgsql
      `;
      await sql`
        CREATE OR REPLACE TRIGGER app_state_keep_history_trg
        AFTER UPDATE ON app_state FOR EACH ROW EXECUTE FUNCTION app_state_keep_history()
      `;
    })().catch((error) => { schemaListo = null; throw error; });
  }
  return schemaListo;
}
/* Solo para pruebas. */
export function resetSchemaCache() { schemaListo = null; }

export async function readState(sql, key) {
  const rows = await sql`SELECT value, version, updated_at FROM app_state WHERE key = ${key} LIMIT 1`;
  const row = rows?.[0];
  if (!row) return { value: null, version: 0, updatedAt: null };
  return { value: row.value, version: Number(row.version), updatedAt: row.updated_at };
}

/* Escribe un valor completo.
   - ifVersion == null: sobrescribe (comportamiento anterior); el historial lo deja la base.
   - ifVersion = n: solo escribe si la versión actual sigue siendo n; si no, devuelve conflicto
     con el valor vigente y NO modifica nada (tampoco el historial). */
export async function writeState(sql, key, value, { ifVersion = null } = {}) {
  const json = JSON.stringify(value);
  const esperada = ifVersion === null || ifVersion === undefined ? null : Number(ifVersion);
  const rows = await sql`
    INSERT INTO app_state (key, value, updated_at, version)
    VALUES (${key}, ${json}::jsonb, now(), 1)
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now(), version = app_state.version + 1
      WHERE ${esperada}::int IS NULL OR app_state.version = ${esperada}::int
    RETURNING version
  `;
  const version = rows?.[0]?.version;
  if (version !== null && version !== undefined) return { ok: true, version: Number(version) };
  const actual = await readState(sql, key);
  return { ok: false, conflict: true, version: actual.version, value: actual.value };
}

/* Agrega un elemento a una lista guardada, en una sola sentencia (sin leer-modificar-escribir).
   - uniqueBy: nombre de campo; si ya hay un objeto con el mismo valor en ese campo, no se repite.
   - sort: "asc" ordena listas de valores simples (por ejemplo fechas ISO). */
export async function addToList(sql, key, item, { uniqueBy = null, sort = null } = {}) {
  if (uniqueBy !== null && !/^[A-Za-z0-9_]{1,40}$/.test(uniqueBy)) throw new Error("invalid_unique_by");
  const json = JSON.stringify(item);
  const ordenar = sort === "asc";
  const rows = await sql`
    INSERT INTO app_state (key, value, updated_at, version)
    VALUES (${key}, jsonb_build_array(${json}::jsonb), now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      value = CASE
        WHEN jsonb_typeof(app_state.value) <> 'array' THEN app_state.value
        WHEN ${uniqueBy}::text IS NOT NULL AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(app_state.value) e
          WHERE e ->> ${uniqueBy}::text = (${json}::jsonb) ->> ${uniqueBy}::text
        ) THEN app_state.value
        WHEN ${uniqueBy}::text IS NULL AND app_state.value @> jsonb_build_array(${json}::jsonb) THEN app_state.value
        WHEN ${ordenar}::boolean THEN (
          SELECT jsonb_agg(x ORDER BY x) FROM jsonb_array_elements(app_state.value || jsonb_build_array(${json}::jsonb)) x
        )
        ELSE app_state.value || jsonb_build_array(${json}::jsonb)
      END,
      updated_at = now(),
      version = app_state.version + 1
    RETURNING value, version
  `;
  const row = rows?.[0];
  if (!row || !Array.isArray(row.value)) return { ok: false, notAList: true };
  return { ok: true, value: row.value, version: Number(row.version) };
}

export async function listHistory(sql, key, limit = 20) {
  const n = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return await sql`
    SELECT id, version, replaced_at, value FROM app_state_history
    WHERE key = ${key} ORDER BY replaced_at DESC, id DESC LIMIT ${n}
  `;
}
