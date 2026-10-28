// Next.js resuelve importaciones sin extensión; Node no. Este gancho imita ese comportamiento solo en las pruebas.
export async function resolve(specifier, context, next) {
  if (specifier === "@neondatabase/serverless") return { url: new URL("./neon-pglite.mjs", import.meta.url).href, shortCircuit: true };
  try { return await next(specifier, context); }
  catch (e) {
    if (e?.code === "ERR_MODULE_NOT_FOUND" && /^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
      for (const ext of [".js", ".mjs"]) { try { return await next(specifier + ext, context); } catch {} }
    }
    throw e;
  }
}
