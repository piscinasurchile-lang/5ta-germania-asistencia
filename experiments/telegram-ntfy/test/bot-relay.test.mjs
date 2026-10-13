import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRelayBot } from '../src/bot-relay.mjs';
import { publicarEnNtfy } from '../src/alerta.mjs';

const now = Date.UTC(2026, 9, 13, 10);
const chatId = '-1001234567890';
const topic = 'germania-test-012345678901234567890123';
const update = (texto = 'B-5 10-0-1\nDirección: Los Canelos 123', overrides = {}) => ({
  update_id: 1,
  message: { message_id: 10, date: now / 1000 - 30,
    chat: { id: chatId, type: 'supergroup' }, text: texto, ...overrides }
});
const relay = (options = {}) => crearRelayBot({ chatId, now: () => now, ...options });

test('configuración incompleta o canal de producción no se acepta', () => {
  assert.throws(() => crearRelayBot(), /CHAT_ID/);
  assert.throws(() => relay({ dryRun: '0' }), /booleano/);
  assert.throws(() => relay({ dryRun: false, topic: 'produccion' }), /pruebas/);
});
test('por defecto solo simula sin llamadas externas', async () => {
  const r = relay({ publicar: () => { throw new Error('No debe publicar'); } });
  assert.equal((await r.recibir(update())).entrega, 'simulada_sin_envio');
});
test('Bot API pasa por filtro operativo y transporte ntfy con datos sintéticos', async () => {
  const requests = [];
  const r = relay({ dryRun: false, topic, ntfy: { fetchImpl: async (url, init) => {
    requests.push({ url, init }); return { ok: true };
  } } });
  assert.equal((await r.recibir(update())).entrega, 'aceptada_por_ntfy');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://ntfy.sh/');
  assert.equal(requests[0].init.method, 'POST');
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.topic, topic);
  assert.equal(body.priority, 5);
  assert.match(body.message, /NO ACUDIR/);
  assert.match(body.message, /Los Canelos 123/);
});
test('otros chats, ediciones, privados y avisos antiguos no publican', async () => {
  let count = 0;
  for (const u of [update('B5 10-2', { chat: { id: '-10099', type: 'supergroup' } }),
    { edited_message: update().message }, update('B5 10-2', { chat: { id: chatId, type: 'private' } }),
    update('B5 10-2', { date: now / 1000 - 900 })]) {
    await relay({ dryRun: false, topic, publicar: async () => { count++; } }).recibir(u);
  }
  assert.equal(count, 0);
});
test('estados y especialidades excluidas se bloquean; refuerzos se conservan', async () => {
  for (const text of ['B5 6-3', 'B5 6-7', 'B5 6-9', 'B5 6-6', 'B5 12-10',
    'B5 10-4-1', 'B5 10-3-3', 'Llamado general cancelado']) {
    assert.notEqual((await relay().recibir(update(text))).estado, 'alerta');
  }
  for (const text of ['B5 sin maquinista', 'B5 falta de voluntarios', 'Llamado general']) {
    assert.equal((await relay().recibir(update(text))).estado, 'alerta');
  }
});
test('duplicados concurrentes se publican una sola vez', async () => {
  let count = 0;
  const r = relay({ dryRun: false, topic, publicar: async () => { count++; } });
  const results = await Promise.all([r.recibir(update()), r.recibir(update())]);
  assert.equal(count, 1);
  assert.equal(results[1].estado, 'duplicado');
});
test('un error de ntfy permite reintentar y no rompe la cola', async () => {
  let count = 0;
  const r = relay({ dryRun: false, topic, publicar: async () => {
    if (++count === 1) throw new Error('ntfy HTTP 503');
  } });
  await assert.rejects(r.recibir(update()), /503/);
  assert.equal((await r.recibir(update())).entrega, 'aceptada_por_ntfy');
  assert.equal((await r.recibir(update())).estado, 'duplicado');
  assert.equal(count, 2);
});
test('transporte rechaza HTTP inseguro y respuesta ntfy fallida', async () => {
  const aviso = { topic, message: 'SIMULACIÓN. NO ACUDIR.' };
  await assert.rejects(publicarEnNtfy(aviso, { server: 'http://ntfy.sh' }), /HTTPS/);
  await assert.rejects(publicarEnNtfy(aviso, { fetchImpl: async () => ({ ok: false, status: 503 }) }), /503/);
});
