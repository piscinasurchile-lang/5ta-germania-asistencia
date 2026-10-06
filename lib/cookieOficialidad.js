import crypto from "node:crypto";

/* Valida la cookie que entrega /api/auth/officiality cuando se ingresa la clave de Oficialidad.
   Es el mismo token que calcula esa ruta (HMAC con SESSION_SECRET u OFFICIALITY_PIN). */
const secreto = () => process.env.SESSION_SECRET || process.env.OFFICIALITY_PIN || "";
export function tokenOficialidad() {
  return crypto.createHmac("sha256", secreto()).update("5ta-germania-oficialidad").digest("hex");
}
export function cookieOficialidadValida(valor) {
  if (!secreto()) return false;
  const a = Buffer.from(String(valor || "")), b = Buffer.from(tokenOficialidad());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
