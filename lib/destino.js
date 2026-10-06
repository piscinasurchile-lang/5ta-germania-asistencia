/* Solo se permite volver a rutas internas (evita redirecciones a otros sitios). */
export function destinoSeguro(v) {
  const s = String(v || "");
  return s.startsWith("/") && !s.startsWith("//") && !s.includes("\\") && !s.startsWith("/acceso") ? s : "/";
}
