// Llama a los manejadores reales de las rutas como lo haría el navegador (mismo origen).
export const HOST = "germania-staging.test";
export function req(path, { method = "GET", body, cookie } = {}) {
  const headers = { host: HOST, origin: "https://" + HOST };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return new Request("https://" + HOST + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}
export async function llamar(handler, path, opts, ctx) {
  const res = await handler(req(path, opts), ctx);
  let json = null; try { json = await res.clone().json(); } catch {}
  return { status: res.status, json, res };
}
