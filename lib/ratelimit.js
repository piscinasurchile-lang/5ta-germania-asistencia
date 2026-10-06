import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

/* Límite de intentos fallidos por dispositivo/IP (se guarda en la base, en claves reservadas "security:").
   5 fallos seguidos bloquean 15 minutos. Sin base configurada, no limita (no deja a nadie fuera). */
const MAX_FALLOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

export function huella(request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "desconocida";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
const clave = (ambito, request) => `security:rl:${ambito}:${huella(request)}`;
const sqlOrNull = () => (process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null);

async function leer(sql, key) {
  const rows = await sql`SELECT value FROM app_state WHERE key = ${key} LIMIT 1`;
  return rows?.[0]?.value || null;
}
async function escribir(sql, key, value) {
  await sql`INSERT INTO app_state (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

/* Devuelve { bloqueado, esperaSeg } */
export async function estado(ambito, request, ahora = Date.now()) {
  const sql = sqlOrNull(); if (!sql) return { bloqueado: false, esperaSeg: 0 };
  try {
    const r = await leer(sql, clave(ambito, request));
    if (r && r.n >= MAX_FALLOS && ahora - r.desde < VENTANA_MS) return { bloqueado: true, esperaSeg: Math.ceil((VENTANA_MS - (ahora - r.desde)) / 1000) };
  } catch (e) { console.error("ratelimit lectura", e); }
  return { bloqueado: false, esperaSeg: 0 };
}
export async function registrarFallo(ambito, request, ahora = Date.now()) {
  const sql = sqlOrNull(); if (!sql) return;
  try {
    const k = clave(ambito, request); const r = await leer(sql, k);
    const vigente = r && ahora - r.desde < VENTANA_MS;
    await escribir(sql, k, { n: vigente ? r.n + 1 : 1, desde: vigente ? r.desde : ahora });
  } catch (e) { console.error("ratelimit escritura", e); }
}
export async function limpiar(ambito, request) {
  const sql = sqlOrNull(); if (!sql) return;
  try { await sql`DELETE FROM app_state WHERE key = ${clave(ambito, request)}`; } catch (e) { console.error("ratelimit limpieza", e); }
}
