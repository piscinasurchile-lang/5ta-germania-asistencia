import { detectarDespacho } from './alerta.mjs';

export function extraerDireccion(texto) {
  const t = String(texto ?? '');
  const campo = t.match(/(?:^|[\r\n;])\s*(?:direcci[oó]n|ubicaci[oó]n|lugar|dir\.)\s*[:\-]\s*([^\r\n;]{4,150})/im);
  if (campo) return campo[1].trim().replace(/[.,;\s]+$/, '');
  const calle = t.match(/\b(?:a|en)\s+((?:calle|avenida|av\.|pasaje|camino|ruta)\s+[^\r\n.;]{4,100})/i);
  return calle ? calle[1].trim() : null;
}

export function evaluarMensaje({chatId, messageId, texto, fecha}, permitido, ultimoId, ahora = Date.now()) {
  if (String(chatId) !== String(permitido)) return {estado: 'otro_chat'};
  if (!Number.isSafeInteger(messageId) || messageId <= 0) return {estado: 'invalido'};
  if (messageId <= ultimoId) return {estado: 'duplicado'};
  const fechaMs = fecha instanceof Date ? fecha.getTime() : Number(fecha) * 1000;
  if (!Number.isFinite(fechaMs) || fechaMs <= 0 || fechaMs > ahora + 120000) return {estado: 'sin_fecha'};
  if (ahora - fechaMs > 420000) return {estado: 'antiguo'};
  const coincidencias = detectarDespacho(texto);
  return coincidencias.length ? {estado: 'alerta', coincidencias, direccion: extraerDireccion(texto)} : {estado: 'sin_despacho'};
}

export function avisoDeLaboratorio(evaluacion, topic) {
  if (evaluacion?.estado !== 'alerta') throw new Error('No es una alerta');
  if (!/^germania-test-[a-zA-Z0-9_-]{20,}$/.test(topic || '')) {
    throw new Error('Se requiere un canal exclusivo de pruebas, con sufijo largo');
  }
  return {
    topic,
    title: 'PRUEBA GERMANIA - NO EMERGENCIA REAL',
    message: 'SIMULACIÓN. NO ACUDIR. Detectado: ' + evaluacion.coincidencias.join(', ') + '. ' +
      (evaluacion.direccion ? 'Dirección indicada: ' + evaluacion.direccion : 'Dirección no identificada.'),
    priority: 5,
    tags: ['test_tube']
  };
}
