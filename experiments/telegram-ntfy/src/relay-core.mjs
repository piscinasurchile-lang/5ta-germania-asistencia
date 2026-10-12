import { normalizar } from './alerta.mjs';

/**
 * Claves de emergencia transcritas de CLAVES NUEVAS.pdf,
 * Cuerpo de Bomberos Villarrica, Departamento de Radiocomunicaciones.
 * Reconocer una clave NO equivale a despachar Germania.
 */
export const CLAVES_EMERGENCIA = Object.freeze({
  '10-0-0': 'Principio de incendio, inflamación de ductos',
  '10-0-1': 'Llamado estructural',
  '10-0-2': 'Llamado estructural de más de cuatro pisos',
  '10-0-3': 'Llamado estructural en lugar de gran afluencia',
  '10-0-4': 'Llamado estructural en depósito de combustibles',
  '10-1': 'Fuego en vehículo',
  '10-2': 'Quema de pastizales o basura',
  '10-3-1': 'Rescate de personas encerradas, atrapadas o lesionadas por caídas',
  '10-3-2': 'Rescate en altura',
  '10-3-3': 'Rescate en ríos, lagos o canales',
  '10-4-1': 'Rescate vehicular de vehículos menores',
  '10-4-2': 'Rescate vehicular de vehículos de gran envergadura',
  '10-4-3': 'Rescate vehicular de transporte de combustible',
  '10-5': 'Materiales peligrosos',
  '10-6': 'Emanación de gas',
  '10-7': 'Llamado eléctrico',
  '10-8': 'Llamado no clasificado',
  '10-9': 'Otros servicios',
  '10-10': 'Escombros',
  '10-11': 'Servicio aéreo',
  '10-12': 'Apoyar otros Cuerpos',
  '10-13': 'Atentado terrorista (explosión)',
  '10-14': 'Accidente aéreo',
  '10-15': 'Simulacro'
});

/**
 * Exclusiones confirmadas por la Quinta Compañía:
 * no tiene aún la especialidad 10-3-3 ni 10-4-1.
 * Un llamado general se evalúa independientemente.
 */
export const CLAVES_NO_ASIGNADAS_B5 = Object.freeze(['10-3-3', '10-4-1']);

// Aceptar separaciones usuales sin perder los segmentos finales: 10-0-1 no es 10-0.
export function extraerClavesEmergencia(texto) {
  const contenido = normalizar(texto).replace(/[\u2010-\u2015\u2212]/g, '-');
  const candidatas = contenido.match(/(?<![\d-])10\s*-\s*\d{1,2}(?:\s*-\s*\d{1,2})?(?![\d-])/g) || [];
  return [...new Set(candidatas
    .map(c => c.replace(/\s+/g, ''))
    .filter(c => Object.hasOwn(CLAVES_EMERGENCIA, c)))];
}

export function detectarUnidadB5(texto) {
  const contenido = normalizar(texto).replace(/[\u2010-\u2015\u2212]/g, '-');
  return /(?<![a-z0-9])b[\s-]*5(?![a-z0-9])/i.test(contenido);
}

export function extraerDireccion(texto) {
  const t = String(texto ?? '');
  const campo = t.match(/(?:^|[\r\n;])\s*(?:direcci[oó]n|ubicaci[oó]n|lugar|dir\.)\s*[:\-]\s*([^\r\n;]{4,150})/im);
  if (campo) return campo[1].trim().replace(/[.,;\s]+$/, '');
  const calle = t.match(/\b(?:a|en)\s+((?:calle|avenida|av\.|pasaje|camino|ruta)\s+[^\r\n.;]{4,100})/i);
  return calle ? calle[1].trim() : null;
}

export function clasificarMensajeOperativo(texto) {
  const t = normalizar(texto).replace(/[\u2010-\u2015\u2212]/g, '-');
  const claves = extraerClavesEmergencia(t);
  const b5 = detectarUnidadB5(t);
  const llamadoGeneral = /\bllamado\s+general\b/.test(t);
  const excluidas = claves.filter(c => CLAVES_NO_ASIGNADAS_B5.includes(c));

  const estadosRadiales = [...new Set(t.match(/(?<![\d-])(?:6\s*-\s*(?:3|7|8|9|10|16)|0\s*-\s*(?:8|9|10))(?![\d-])/g) || [])].map(c => c.replace(/\s+/g, ''));
  const comunicacionesLogisticas = [...new Set(t.match(/(?<![\d-])(?:6\s*-\s*6|12\s*-\s*10)(?![\d-])/g) || [])].map(c => c.replace(/\s+/g, ''));
  const hayOrden = /\b(?:se\s+despacha|despachar|despacho|despachando|se\s+activa|activacion|se\s+declara|concurrir|concurra|dirijase|acudir|salida\s+a|sale\s+a|se\s+dirige\s+a)\b/.test(t);
  const logisticaMaquinista = /\b(?:sin\s+maquinista|falta\s+(?:de\s+)?maquinista|solicit(?:a|ar|ando)\s+(?:un\s+)?maquinista|se\s+solicita\s+(?:un\s+)?conductor|sin\s+conductor)\b/.test(t);
  const relatoEstado = /\b(?:situacion\s+controlada|regresa|retorna|se\s+retira|en\s+cuartel|disponible|queda\s+disponible|en\s+servicio|sale\s+de\s+cuartel)\b/.test(t);
  const cancelacion = /\b(?:sin\s+efecto|cancelad[oa]s?|suspendid[oa]s?|no\s+despachar|no\s+sale|no\s+concurrir|falsa\s+alarma|se\s+deja\s+sin\s+efecto)\b/.test(t);
  const simulacro = claves.includes('10-15') || /\b(?:simulacro|simulacion|mensaje\s+de\s+prueba|no\s+es\s+emergencia\s+real)\b/.test(t);

  const base = {
    claves,
    tipos: claves.map(c => CLAVES_EMERGENCIA[c]),
    unidadB5: b5,
    llamadoGeneral,
    excluidas,
    estadosRadiales,
    comunicacionesLogisticas
  };

  // Nunca convertir cancelaciones, ejercicios o simulacros en alarmas.
  if (cancelacion) return {...base, estado: 'cancelacion'};
  if (simulacro) return {...base, estado: 'simulacro'};

  // Los estados 6-* y las comunicaciones 6-6 / 12-10 no son nuevos despachos.
  // Si conviven con una orden y un código de emergencia, requieren revisión humana.
  if (estadosRadiales.length || comunicacionesLogisticas.length || logisticaMaquinista || relatoEstado) {
    if (hayOrden && claves.length) return {...base, estado: 'requiere_revision'};
    return {...base, estado: (comunicacionesLogisticas.length || logisticaMaquinista) ? 'comunicacion_logistica' : 'estado_operativo'};
  }

  // Un llamado general vigente sí es una convocatoria independiente.
  if (llamadoGeneral) return {...base, estado: 'alerta', motivo: 'llamado general'};

  // Especialidades no asignadas, aun cuando mencionen B-5, no activan ntfy.
  if (excluidas.length) {
    return {...base, estado: b5 ? 'requiere_revision' : 'especialidad_no_asignada'};
  }
  if (!b5) return {...base, estado: 'sin_asignacion_b5'};

  // No basta con que aparezca B-5: hace falta una orden o una clave de emergencia completa.
  if (!hayOrden && !claves.length) return {...base, estado: 'mencion_sin_despacho'};
  return {...base, estado: 'alerta', motivo: 'B-5'};
}

export function evaluarMensaje({chatId, messageId, texto, fecha}, permitido, ultimoId, ahora = Date.now()) {
  if (String(chatId) !== String(permitido)) return {estado: 'otro_chat'};
  if (!Number.isSafeInteger(messageId) || messageId <= 0) return {estado: 'invalido'};
  if (messageId <= ultimoId) return {estado: 'duplicado'};
  const fechaMs = fecha instanceof Date ? fecha.getTime() : Number(fecha) * 1000;
  if (!Number.isFinite(fechaMs) || fechaMs <= 0 || fechaMs > ahora + 120000) return {estado: 'sin_fecha'};
  if (ahora - fechaMs > 420000) return {estado: 'antiguo'};
  const decision = clasificarMensajeOperativo(texto);
  return {...decision, direccion: extraerDireccion(texto)};
}

export function avisoDeLaboratorio(evaluacion, topic) {
  if (evaluacion?.estado !== 'alerta') throw new Error('No es una alerta');
  if (!/^germania-test-[a-zA-Z0-9_-]{20,}$/.test(topic || '')) {
    throw new Error('Se requiere un canal exclusivo de pruebas, con sufijo largo');
  }
  const etiquetas = [
    evaluacion.motivo,
    ...(evaluacion.claves || [])
  ].filter(Boolean);
  return {
    topic,
    title: 'PRUEBA GERMANIA - NO EMERGENCIA REAL',
    message: 'SIMULACIÓN. NO ACUDIR. Detectado: ' + etiquetas.join(', ') + '. ' +
      (evaluacion.direccion ? 'Dirección indicada: ' + evaluacion.direccion : 'Dirección no identificada.'),
    priority: 5,
    tags: ['test_tube']
  };
}
