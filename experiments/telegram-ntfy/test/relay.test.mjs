import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVES_EMERGENCIA,
  CLAVES_NO_ASIGNADAS_B5,
  extraerClavesEmergencia,
  detectarUnidadB5,
  extraerDireccion,
  clasificarMensajeOperativo,
  evaluarMensaje,
  avisoDeLaboratorio
} from '../src/relay-core.mjs';

const CHAT = '-1001234567890';
const ahora = Date.UTC(2026, 9, 11, 3, 0);
const msg = (texto, cambio = {}) => ({
  chatId: CHAT, messageId: 101, texto, fecha: new Date(ahora - 30_000), ...cambio
});

test('transcribe las 24 claves de emergencia del catálogo (10-0-0 a 10-15)', () => {
  assert.equal(Object.keys(CLAVES_EMERGENCIA).length, 24);
  assert.equal(CLAVES_EMERGENCIA['10-4-1'], 'Rescate vehicular de vehículos menores');
  assert.equal(CLAVES_EMERGENCIA['10-3-3'], 'Rescate en ríos, lagos o canales');
  assert.deepEqual([...CLAVES_NO_ASIGNADAS_B5].sort(), ['10-3-3', '10-4-1']);
});

test('reconoce códigos con variantes, pero no confunde 10-0 con 10-0-1', () => {
  assert.deepEqual(extraerClavesEmergencia('10-0-1, 10-3-3 y 10–4–1'), ['10-0-1', '10-3-3', '10-4-1']);
  assert.deepEqual(extraerClavesEmergencia('10-0'), []);
  assert.deepEqual(extraerClavesEmergencia('10-4-19'), []);
  assert.deepEqual(extraerClavesEmergencia('10-4-1 10-4-1'), ['10-4-1']);
});

test('reconoce las variantes de la unidad sin confundir unidades diferentes', () => {
  for (const t of ['B5', 'b-5', 'B 5', 'B–5', 'Se despacha el B-5']) {
    assert.equal(detectarUnidadB5(t), true);
  }
  for (const t of ['B-50', 'AB5', 'B-15', 'BX-5']) {
    assert.equal(detectarUnidadB5(t), false);
  }
});

test('extrae solo ubicaciones legibles', () => {
  assert.equal(extraerDireccion('10-0-1\nDirección: Los Canelos 123\nBomberos'), 'Los Canelos 123');
  assert.equal(extraerDireccion('B5 sale a calle Los Aromos 45.'), 'calle Los Aromos 45');
  assert.equal(extraerDireccion('Llamado general sin dirección'), null);
});

test('claves ajenas sin B-5 no generan alarma para Germania', () => {
  for (const t of ['10-0-1 incendio estructural', '10-2 pastizales', '10-5 materiales peligrosos', '10-0']) {
    assert.notEqual(clasificarMensajeOperativo(t).estado, 'alerta');
  }
});

test('10-3-3 y 10-4-1 son especialidades NO asignadas al B-5', () => {
  for (const clave of ['10-3-3', '10-4-1']) {
    assert.equal(clasificarMensajeOperativo(clave + ' en el lugar').estado, 'especialidad_no_asignada');
    assert.equal(clasificarMensajeOperativo('Se despacha B-5 a ' + clave).estado, 'requiere_revision');
    assert.notEqual(evaluarMensaje(msg(clave), CHAT, 100, ahora).estado, 'alerta');
  }
});

test('llamado general se evalúa independiente de las especialidades', () => {
  assert.equal(clasificarMensajeOperativo('LLAMADO GENERAL 10-4-1').estado, 'alerta');
  assert.equal(clasificarMensajeOperativo('LLAMADO GENERAL 10-3-3').motivo, 'llamado general');
  assert.equal(clasificarMensajeOperativo('B-5 10-4-1 llamado general').estado, 'alerta');
});

test('solo despachos B-5 con orden o emergencia completa generan alerta', () => {
  for (const t of ['Despachar B-5 10-0-1', 'B5 sale a 10-2', 'B–5 10-6', 'Se despacha B5 a Los Canelos 123', 'LLAMADO GENERAL 10-0-1']) {
    assert.equal(evaluarMensaje(msg(t), CHAT, 100, ahora).estado, 'alerta', t);
  }
});

test('menciones aisladas y prefijos incompletos no disparan alarma', () => {
  for (const t of ['B-5', 'B5 presente', '10-0 B5', 'B-5 en la lista', 'Resumen diario B5']) {
    assert.equal(clasificarMensajeOperativo(t).estado, 'mencion_sin_despacho', t);
  }
});

test('se bloquean claves de estado y mensajes logísticos sin despacho confirmado', () => {
  for (const t of ['B-5 6-3', 'B5 6-7', 'B-5 6-9', 'B5 6-6', 'B-5 12-10', 'Se solicita maquinista para B5', 'B5 sale de cuartel', 'LLAMADO GENERAL 6-7']) {
    assert.notEqual(clasificarMensajeOperativo(t).estado, 'alerta', t);
  }
  assert.equal(clasificarMensajeOperativo('B5 6-6').estado, 'comunicacion_logistica');
  assert.equal(clasificarMensajeOperativo('B-5 12-10').estado, 'comunicacion_logistica');
  assert.equal(clasificarMensajeOperativo('B5 6-9').estado, 'estado_operativo');
});

test('órdenes mezcladas con radioestado o solicitud de maquinista requieren revisión', () => {
  for (const t of ['Se despacha B5 10-0-1, 6-9', 'Despachar B5 10-2, 12-10', 'Se despacha B-5 a 10-0-1 sin maquinista']) {
    assert.equal(clasificarMensajeOperativo(t).estado, 'requiere_revision', t);
  }
});

test('cancelaciones y simulacros jamás son emergencia nueva', () => {
  for (const t of ['B-5 10-0-1 sin efecto', 'LLAMADO GENERAL cancelado', 'B5 se despacha a simulacro 10-15', 'Mensaje de prueba se despacha B5 10-2']) {
    assert.notEqual(clasificarMensajeOperativo(t).estado, 'alerta', t);
  }
});

test('estado radial, cancelación o retorno de B-5 no es despacho nuevo', () => {
  for (const t of ['B-5 6-3', 'B5 6-7 situación controlada', 'B5 6-9 se retira', 'B-5 disponible', 'B-5 falsa alarma', 'B-5 no despachar', 'B-5 0-10 regrese a su cuartel']) {
    assert.notEqual(evaluarMensaje(msg(t), CHAT, 100, ahora).estado, 'alerta');
  }
  assert.equal(clasificarMensajeOperativo('Llamado general cancelado').estado, 'cancelacion');
});

test('rechaza grupo distinto, duplicado, mensaje viejo y fecha ausente', () => {
  assert.equal(evaluarMensaje(msg('B-5', {chatId: '-100987'}), CHAT, 100, ahora).estado, 'otro_chat');
  assert.equal(evaluarMensaje(msg('B-5', {messageId: 100}), CHAT, 100, ahora).estado, 'duplicado');
  assert.equal(evaluarMensaje(msg('B-5', {fecha: new Date(ahora - 900000)}), CHAT, 100, ahora).estado, 'antiguo');
  assert.equal(evaluarMensaje(msg('B-5', {fecha: null}), CHAT, 100, ahora).estado, 'sin_fecha');
});

test('solo prepara avisos simulados para canal de pruebas', () => {
  const e = evaluarMensaje(msg('B-5 10-0-1\nDirección: Los Canelos 123'), CHAT, 100, ahora);
  const aviso = avisoDeLaboratorio(e, 'germania-test-e840d846cf769042ad5d4133');
  assert.equal(aviso.priority, 5);
  assert.match(aviso.title, /NO EMERGENCIA REAL/);
  assert.match(aviso.message, /NO ACUDIR/);
  assert.match(aviso.message, /Los Canelos 123/);
  assert.throws(() => avisoDeLaboratorio(e, 'germania-produccion'), /pruebas/);
  assert.throws(() => avisoDeLaboratorio({estado: 'requiere_revision'}, 'germania-test-e840d846cf769042ad5d4133'), /No es una alerta/);
});
