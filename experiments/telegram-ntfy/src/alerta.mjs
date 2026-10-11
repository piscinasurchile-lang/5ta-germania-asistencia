import { timingSafeEqual } from 'node:crypto';

/** Prueba independiente; no modifica Germania ni publica mensajes al ejecutarse. */
export function normalizar(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function secretoValido(recibido, esperado) {
  if (!recibido || !esperado) return false;
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function extraerMensaje(update) {
  if (!update || typeof update !== 'object') return null;
  const msg = update.message ?? update.channel_post;
  if (!msg || !msg.chat || !Number.isSafeInteger(Number(msg.chat.id))) return null;
  const text = msg.text ?? msg.caption ?? '';
  return {
    chatId: String(msg.chat.id),
    chatTitulo: String(msg.chat.title ?? ''),
    messageId: msg.message_id,
    texto: String(text)
  };
}

const REGLAS = [
  { nombre: 'llamado general', regex: /\bllamado\s+general\b/ },
  { nombre: 'B-5', regex: /\bb[\s-]?5\b/ },
  { nombre: '10-0', regex: /\b10[\s-]?0\b/ }
];

export function detectarDespacho(texto) {
  const t = normalizar(texto);
  return REGLAS.filter(({ regex }) => regex.test(t)).map(({ nombre }) => nombre);
}

export function procesarUpdate(update, chatIdPermitido) {
  if (!chatIdPermitido || !String(chatIdPermitido).trim()) {
    throw new Error('TELEGRAM_CHAT_ID es obligatorio para evitar alertas de otros grupos');
  }
  const msg = extraerMensaje(update);
  if (!msg) return { procesable: false, motivo: 'sin_mensaje' };
  if (msg.chatId !== String(chatIdPermitido).trim()) {
    return { procesable: false, motivo: 'chat_no_autorizado' };
  }
  const coincidencias = detectarDespacho(msg.texto);
  if (coincidencias.length === 0) return { procesable: false, motivo: 'sin_despacho' };
  return { procesable: true, mensaje: msg, coincidencias };
}

export function armarAvisoPrueba(decision, topic) {
  if (!decision?.procesable || !topic || !/^[a-zA-Z0-9_-]{12,}$/.test(topic)) {
    throw new Error('Se requiere un despacho válido y un tema de pruebas privado (mín. 12 caracteres)');
  }
  return {
    topic,
    title: 'PRUEBA GERMANIA - NO EMERGENCIA REAL',
    message: `SIMULACIÓN. NO DESPACHAR. Detectado: ${decision.coincidencias.join(', ')}. ${decision.mensaje.texto.slice(0, 240)}`,
    priority: 5,
    tags: ['test_tube']
  };
}

/** Publica únicamente si se llama de forma explícita; jamás desde la importación o demo. */
export async function publicarEnNtfy(aviso, { server = 'https://ntfy.sh', token = '', fetchImpl = fetch } = {}) {
  const url = new URL(server);
  if (url.protocol !== 'https:') throw new Error('ntfy requiere HTTPS');
  if (!aviso?.topic || !aviso?.message) throw new Error('aviso incompleto');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchImpl(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(aviso),
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(`ntfy HTTP ${response.status}`);
  return { ok: true };
}
