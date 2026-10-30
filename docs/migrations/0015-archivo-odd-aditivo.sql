-- Referencia versionada de la migración aditiva aplicada por prepararArchivoODD.
-- No requiere cambiar DATABASE_URL ni ejecutar cambios manuales en producción.
CREATE TABLE IF NOT EXISTS germania_odd_archivo (
 numero text PRIMARY KEY, documento jsonb NOT NULL, creado_en timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS germania_odd_pdf (
 numero text PRIMARY KEY REFERENCES germania_odd_archivo(numero), data_url text NOT NULL, nombre text NOT NULL);
CREATE TABLE IF NOT EXISTS germania_odd_lecturas (
 numero text NOT NULL, persona_id text NOT NULL, leido_en timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(numero,persona_id));
CREATE TABLE IF NOT EXISTS germania_odd_sync (
 clave text PRIMARY KEY, valor jsonb NOT NULL, actualizado_en timestamptz NOT NULL DEFAULT now());
