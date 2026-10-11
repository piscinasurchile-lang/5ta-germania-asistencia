import test from 'node:test';
import assert from 'node:assert/strict';
import { extraerDireccion, evaluarMensaje, avisoDeLaboratorio } from '../src/relay-core.mjs';

const CHAT = '-1001234567890';
const ahora = Date.UTC(2026, 9, 11, 3, 0);
const msg = (texto, cambio = {}) => ({
  chatId: CHAT, messageId: 101, texto, fecha: new Date(ahora - 30000), ...cambio
});

test('dirección etiquetada y dirección con calle, sin inventar otras', () => {
  assert.equal(extraerDireccion('10-0\nDirección: Los Canelos 123\nBomberos'), 'Los Canelos 123');
  assert.equal(extraerDireccion('B5 sale a calle Los Aromos 45.'), 'calle Los Aromos 45');
  assert.equal(extraerDireccion('Llamado general sin dirección'), null);
});
test('tres señales de despacho', () => {
  for (const t of ['10-0', 'B-5', 'LLAMADO GENERAL']) {
    assert.equal(evaluarMensaje(msg(t), CHAT, 100, ahora).estado, 'alerta');
  }
});
test('filtra otro chat, duplicados, antigüedad, mensajes corrientes', () => {
  assert.equal(evaluarMensaje(msg('B-5', {chatId: '-100987'}), CHAT, 100, ahora).estado, 'otro_chat');
  assert.equal(evaluarMensaje(msg('B-5', {messageId: 100}), CHAT, 100, ahora).estado, 'duplicado');
  assert.equal(evaluarMensaje(msg('B-5', {fecha: new Date(ahora - 900000)}), CHAT, 100, ahora).estado, 'antiguo');
  assert.equal(evaluarMensaje(msg('Buenos días'), CHAT, 100, ahora).estado, 'sin_despacho');
});
test('solo prepara alerta de simulación para canal de pruebas', () => {
  const e = evaluarMensaje(msg('B-5\nDirección: Los Canelos 123'), CHAT, 100, ahora);
  const a = avisoDeLaboratorio(e, 'germania-test-e840d846cf769042ad5d4133');
  assert.equal(a.priority, 5);
  assert.match(a.title, /NO EMERGENCIA REAL/);
  assert.match(a.message, /NO ACUDIR/);
  assert.match(a.message, /Los Canelos 123/);
  assert.throws(() => avisoDeLaboratorio(e, 'germania-produccion'), /pruebas/);
});
