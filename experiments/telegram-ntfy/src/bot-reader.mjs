/**
 * Lector experimental del bot existente (solo lectura).
 * Métodos de la Bot API que usa: getWebhookInfo (una vez al arrancar) y getUpdates. Nada más.
 * Nunca llama a setWebhook, deleteWebhook ni a métodos que envíen mensajes, nunca usa offset negativo
 * y nunca envía allowed_updates (para no alterar la configuración del bot).
 *
 * ADVERTENCIA: getUpdates CONSUME actualizaciones: al pedir con un offset mayor, Telegram olvida las anteriores.
 * Aunque se publique en modo simulación (DRY_RUN), el avance del offset sigue ocurriendo.
 * Este módulo NO se ejecuta solo: lo usa bot-reader-cli.mjs, que exige una autorización explícita.
 *
 * Garantías (cubiertas con pruebas simuladas):
 *  - El offset solo avanza DESPUÉS de que el relay entregó la actualización (ntfy aceptó o el filtro la descartó).
 *  - Entrega "al menos una vez": ante un corte justo entre ntfy y el guardado en disco puede repetirse un aviso; nunca se pierde.
 *  - Si hay webhook, o si Telegram responde 409 (otro lector), se detiene sin reintentar para no interferir.
 */

export class ErrorFatal extends Error {
  constructor(motivo) { super('fatal: ' + motivo); this.name = 'ErrorFatal'; this.motivo = motivo; }
}
export class ErrorTransitorio extends Error {
  constructor(detalle, esperaMs) { super(detalle); this.name = 'ErrorTransitorio'; this.esperaMs = esperaMs; }
}
export class ErrorBloqueado extends Error {
  constructor(updateId) {
    super('bloqueado: no se pudo entregar la actualización ' + updateId + '; el avance se detiene');
    this.name = 'ErrorBloqueado'; this.updateId = updateId;
  }
}

export function crearLector({
  token,
  crearRelay,
  almacen,
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolver) => setTimeout(resolver, ms)),
  log = () => {},
  ahora = Date.now,
  azar = Math.random,
  timeoutSeg = 30,
  limite = 100,
  maxReintentosEntrega = 5,
  esperaBaseMs = 1000,
  esperaMaxMs = 60000
} = {}) {
  if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(String(token || ''))) throw new Error('Formato inválido de TELEGRAM_BOT_TOKEN');
  if (typeof crearRelay !== 'function') throw new Error('crearRelay requerido');
  if (!almacen) throw new Error('almacen requerido');

  let estado = null;
  let relay = null;

  /** Los errores nunca incluyen la URL (que contiene el token). */
  async function api(metodo, params = {}) {
    const url = new URL('https://api.telegram.org/bot' + token + '/' + metodo);
    for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, String(valor));
    let respuesta;
    try {
      respuesta = await fetchImpl(url, { signal: AbortSignal.timeout((timeoutSeg + 15) * 1000), redirect: 'error' });
    } catch {
      throw new ErrorTransitorio(metodo + ': sin conexión o tiempo de espera agotado');
    }
    let cuerpo = null;
    try { cuerpo = await respuesta.json(); } catch { /* cuerpo no JSON */ }
    if (respuesta.ok && cuerpo?.ok) return cuerpo.result;
    const codigo = Number(cuerpo?.error_code ?? respuesta.status);
    if (codigo === 409) throw new ErrorFatal('conflicto');
    if (codigo === 401 || codigo === 403 || codigo === 404) throw new ErrorFatal('token_o_permiso');
    if (codigo === 429) {
      const segundos = Math.max(1, Number(cuerpo?.parameters?.retry_after) || 1);
      throw new ErrorTransitorio(metodo + ': límite de Telegram', segundos * 1000);
    }
    if (codigo >= 500) throw new ErrorTransitorio(metodo + ': error del servidor de Telegram');
    throw new ErrorFatal('solicitud_rechazada');
  }

  const espera = (n) => {
    const base = Math.min(esperaMaxMs, esperaBaseMs * 2 ** (n - 1));
    return Math.min(esperaMaxMs, Math.round(base * (0.8 + 0.4 * azar())));
  };

  async function iniciar() {
    const { estado: cargado, origen } = await almacen.cargar();
    estado = cargado;
    log('estado_cargado', { origen, offset: estado.offset, ultimoMessageId: estado.ultimoMessageId });
    const webhook = await api('getWebhookInfo');
    if (webhook?.url) {
      log('webhook_presente_no_se_lee');
      return { ok: false, motivo: 'webhook_presente' };
    }
    relay = crearRelay(estado.ultimoMessageId);
    return { ok: true };
  }

  async function entregar(update) {
    for (let intento = 1; intento <= maxReintentosEntrega; intento++) {
      try {
        return await relay.recibir(update);
      } catch {
        if (intento === maxReintentosEntrega) throw new ErrorBloqueado(update.update_id);
        const ms = espera(intento);
        log('reintento_entrega', { update_id: update.update_id, intento, ms });
        await sleep(ms);
      }
    }
  }

  async function ciclo() {
    if (!relay) throw new Error('iniciar() debe completarse antes de ciclo()');
    const params = { timeout: timeoutSeg, limit: limite };
    if (estado.offset !== null) {
      if (!Number.isSafeInteger(estado.offset) || estado.offset <= 0) throw new ErrorFatal('offset_invalido');
      params.offset = estado.offset;
    }
    const recibidas = await api('getUpdates', params);
    if (!Array.isArray(recibidas)) throw new ErrorFatal('respuesta_invalida');
    const ordenadas = recibidas
      .filter((u) => Number.isSafeInteger(u?.update_id))
      .sort((a, b) => a.update_id - b.update_id);
    let procesadas = 0;
    for (const update of ordenadas) {
      const resultado = await entregar(update);
      const siguiente = {
        version: 1,
        offset: update.update_id + 1,
        ultimoMessageId: relay.ultimoId(),
        actualizado: new Date(ahora()).toISOString()
      };
      await almacen.guardar(siguiente); // si falla, el offset no avanza y la actualización se repetirá
      estado = siguiente;
      procesadas++;
      log('actualizacion_procesada', { update_id: update.update_id, estado: resultado?.estado, entrega: resultado?.entrega });
    }
    return { recibidas: recibidas.length, procesadas };
  }

  async function tratar(error, fallos) {
    if (error instanceof ErrorFatal) return { fin: { ok: false, motivo: error.motivo } };
    if (error instanceof ErrorBloqueado) {
      log('bloqueado', { update_id: error.updateId, esperaMs: esperaMaxMs });
      await sleep(esperaMaxMs);
      return {};
    }
    if (error instanceof ErrorTransitorio) {
      const ms = error.esperaMs ?? espera(fallos);
      log('reintento_telegram', { fallos, ms });
      await sleep(ms);
      return {};
    }
    throw error;
  }

  /** Bucle continuo. Termina por señal, por maxCiclos (pruebas) o por un error fatal. */
  async function ejecutar({ senal, maxCiclos = Infinity } = {}) {
    let fallos = 0;
    let ciclos = 0;
    while (!senal?.aborted && ciclos < maxCiclos) {
      try {
        if (!relay) {
          const inicio = await iniciar();
          if (!inicio.ok) return inicio;
        }
        await ciclo();
        ciclos++;
        fallos = 0;
      } catch (error) {
        fallos++;
        const { fin } = await tratar(error, fallos);
        if (fin) return fin;
      }
    }
    return { ok: true, motivo: 'detenido' };
  }

  return { iniciar, ciclo, ejecutar, estado: () => estado };
}
