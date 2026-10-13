/**
 * Devuelve SOLO el hostname de la URL de un webhook (sin protocolo, puerto, credenciales, ruta ni parámetros).
 * La ruta o los parámetros de un webhook pueden contener secretos, por lo que nunca se imprimen.
 * Devuelve null si la URL no se puede interpretar o el host tiene un formato inesperado.
 */
export function hostnameSeguro(valor) {
  let url;
  try {
    url = new URL(String(valor ?? ''));
  } catch {
    return null;
  }
  if (!['https:', 'http:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  const nombre = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/;
  const ipv6 = /^\[[0-9a-f:.]+\]$/;
  return nombre.test(host) || ipv6.test(host) ? host : null;
}
