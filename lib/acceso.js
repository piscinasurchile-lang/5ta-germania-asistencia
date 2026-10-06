import crypto from "node:crypto";

/* Acceso con la clave de la Compañía.
   Mientras ACCESS_CODE no esté definido en Vercel, el filtro queda DESACTIVADO (la app funciona como siempre).
   Al definirlo, toda la app y la API exigen la clave una vez por dispositivo (cookie firmada, 180 días).
   Si se cambia ACCESS_CODE, todas las cookies anteriores dejan de valer. */

export const COOKIE_ACCESO = "quinta_acceso";
export const DURACION_ACCESO = 60 * 60 * 24 * 180;

export const codigoConfigurado = () => String(process.env.ACCESS_CODE || "").trim();
export const filtroActivo = () => codigoConfigurado().length > 0;
const secreto = () => process.env.SESSION_SECRET || process.env.OFFICIALITY_PIN || "";

export function igual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
/* El token depende del código: cambiar el código invalida todas las sesiones. */
export function tokenEsperado() {
  return crypto.createHmac("sha256", secreto()).update("5ta-germania-acceso:" + codigoConfigurado()).digest("hex");
}
export const cookieValida = (valor) => !!secreto() && igual(valor, tokenEsperado());

/* Lo que puede verse SIN clave: la pantalla de acceso y lo mínimo para instalar la app. */
const PUBLICAS = new Set(["/acceso", "/api/acceso", "/api/health", "/manifest.webmanifest", "/sw.js", "/robots.txt", "/version.json", "/favicon.ico"]);
const ICONOS = /^\/legacy\/(germania-(192|512|icon)\.(png|svg)|escudo-5ta-germania\.png)$/;
export function rutaPublica(pathname) {
  return PUBLICAS.has(pathname) || pathname.startsWith("/_next/") || ICONOS.test(pathname);
}
export { destinoSeguro } from "./destino.js";
