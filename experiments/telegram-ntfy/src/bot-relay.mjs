import { evaluarMensaje, avisoDeLaboratorio } from './relay-core.mjs';
import { publicarEnNtfy } from './alerta.mjs';

/** Adaptador experimental. Recibe updates ya entregados; nunca llama a Telegram. */
export function crearRelayBot({ chatId, topic, dryRun = true, publicar = publicarEnNtfy, ntfy = {}, now = Date.now } = {}) {
  if (!/^-\d+$/.test(String(chatId || ''))) throw new Error('Se requiere TELEGRAM_CHAT_ID de grupo exacto');
  if (typeof dryRun !== 'boolean') throw new Error('dryRun debe ser booleano');
  if (!dryRun) avisoDeLaboratorio({ estado: 'alerta' }, topic);
  let ultimoId = 0;
  let cola = Promise.resolve();

  async function procesar(update) {
    const mensaje = update?.message ?? update?.channel_post;
    if (!mensaje || !['group', 'supergroup', 'channel'].includes(mensaje.chat?.type)) {
      return { estado: 'sin_mensaje' };
    }
    const evaluacion = evaluarMensaje({
      chatId: mensaje.chat.id,
      messageId: mensaje.message_id,
      texto: mensaje.text ?? mensaje.caption ?? '',
      fecha: mensaje.date
    }, chatId, ultimoId, now());
    if (['otro_chat', 'invalido', 'duplicado', 'sin_fecha'].includes(evaluacion.estado)) return evaluacion;
    if (evaluacion.estado !== 'alerta') {
      ultimoId = mensaje.message_id;
      return evaluacion;
    }
    if (!dryRun) {
      // Confirmar el ID solo después de que ntfy acepte el aviso permite reintentar.
      await publicar(avisoDeLaboratorio(evaluacion, topic), ntfy);
    }
    ultimoId = mensaje.message_id;
    return { ...evaluacion, entrega: dryRun ? 'simulada_sin_envio' : 'aceptada_por_ntfy' };
  }

  return {
    recibir(update) {
      // Serializar evita que dos entregas simultáneas publiquen el mismo mensaje.
      const resultado = cola.then(() => procesar(update));
      cola = resultado.catch(() => {});
      return resultado;
    }
  };
}
