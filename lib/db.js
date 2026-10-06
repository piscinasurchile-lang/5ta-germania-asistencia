import { neon } from "@neondatabase/serverless";

/* Acceso común a la base central (Neon). Un solo lugar para el cliente SQL y
   para la preparación del esquema, que se verifica una vez por instancia. */

export function sqlClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export const validKey = (key) => typeof key === "string" && /^[a-zA-Z0-9:_-]{1,100}$/.test(key);
export const reservedKey = (key) => key.startsWith("security:");

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

/* Esquema base (ya existente). Si falla, se vuelve a intentar en la siguiente solicitud. */
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
      await sql`CREATE INDEX IF NOT EXISTS app_state_updated_at_idx ON app_state(updated_at DESC)`;
    })().catch((error) => { schemaListo = null; throw error; });
  }
  return schemaListo;
}

/* Historial de versiones y función de comprobación para guardados atómicos.
   - app_state_hist guarda la versión ANTERIOR de cada registro cada vez que se
     modifica o elimina (menos los de auditoría de uso), para poder recuperarla.
   - app_assert hace fallar (y deshacer) toda una transacción si una condición
     no se cumple. */
let extrasListos = null;
export function ensureExtras(sql) {
  if (!extrasListos) {
    extrasListos = sql.transaction((txn) => [
      txn`CREATE TABLE IF NOT EXISTS app_state_hist (
            id bigserial PRIMARY KEY,
            key text NOT NULL,
            value jsonb,
            op char(1) NOT NULL,
            version_at timestamptz,
            replaced_at timestamptz NOT NULL DEFAULT now()
          )`,
      txn`CREATE INDEX IF NOT EXISTS app_state_hist_key_idx ON app_state_hist(key, id DESC)`,
      txn`CREATE OR REPLACE FUNCTION app_assert(ok boolean, msg text) RETURNS void AS $fn$
          BEGIN
            IF NOT ok THEN RAISE EXCEPTION '%', msg USING ERRCODE = 'P0001'; END IF;
          END $fn$ LANGUAGE plpgsql`,
      txn`CREATE OR REPLACE FUNCTION app_state_hist_fn() RETURNS trigger AS $fn$
          BEGIN
            IF OLD.key LIKE 'germania:%' OR OLD.key LIKE 'svborrador:%' OR OLD.key LIKE '\\_\\_%' THEN
              IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
              RETURN NEW;
            END IF;
            IF pg_column_size(OLD.value) < 300000 THEN
              IF TG_OP = 'DELETE' THEN
                INSERT INTO app_state_hist(key, value, op, version_at) VALUES (OLD.key, OLD.value, 'D', OLD.updated_at);
              ELSIF OLD.value IS DISTINCT FROM NEW.value THEN
                INSERT INTO app_state_hist(key, value, op, version_at) VALUES (OLD.key, OLD.value, 'U', OLD.updated_at);
              END IF;
            END IF;
            IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
            RETURN NEW;
          END $fn$ LANGUAGE plpgsql`,
      txn`DO $do$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'app_state_hist_trg' AND NOT tgisinternal) THEN
              CREATE TRIGGER app_state_hist_trg AFTER UPDATE OR DELETE ON app_state
                FOR EACH ROW EXECUTE FUNCTION app_state_hist_fn();
            END IF;
          END $do$`,
    ]).catch((error) => { extrasListos = null; throw error; });
  }
  return extrasListos;
}
