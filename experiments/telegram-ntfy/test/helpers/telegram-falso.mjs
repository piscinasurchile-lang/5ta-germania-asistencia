/* Telegram simulado en memoria para probar el lector sin red. Imita la semántica documentada de getUpdates:
   pedir con offset N confirma (olvida) las actualizaciones con update_id < N; sin offset no confirma nada. */
export function crearTelegramFalso({ updates = [], webhookUrl = '' } = {}) {
  const cola = [...updates];
  const llamadas = []; // { metodo, params }
  const guion = [];    // respuestas forzadas: { metodo?, tipo: 'red' } | { metodo?, status, body }

  const fetchImpl = async (entrada) => {
    const url = new URL(String(entrada));
    const metodo = url.pathname.split('/').pop();
    const params = Object.fromEntries(url.searchParams);
    llamadas.push({ metodo, params });

    const i = guion.findIndex((g) => !g.metodo || g.metodo === metodo);
    if (i >= 0) {
      const [forzada] = guion.splice(i, 1);
      // El mensaje del error simulado incluye la URL (con el token) para probar que el lector no la propaga.
      if (forzada.tipo === 'red') throw new TypeError('fetch failed: ' + url.href);
      return new Response(JSON.stringify(forzada.body), { status: forzada.status });
    }
    const ok = (result) => new Response(JSON.stringify({ ok: true, result }), { status: 200 });
    if (metodo === 'getWebhookInfo') return ok({ url: webhookUrl, pending_update_count: 0 });
    if (metodo === 'getUpdates') {
      if (params.offset !== undefined) {
        const offset = Number(params.offset);
        while (cola.length && cola[0].update_id < offset) cola.shift();
      }
      return ok(cola.slice(0, Number(params.limit ?? 100)));
    }
    return new Response(JSON.stringify({ ok: false, error_code: 404 }), { status: 404 });
  };

  return {
    fetchImpl, llamadas, guion, cola,
    agregar: (u) => cola.push(u),
    getUpdates: () => llamadas.filter((l) => l.metodo === 'getUpdates')
  };
}
