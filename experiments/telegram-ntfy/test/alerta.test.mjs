import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, secretoValido, extraerMensaje, detectarDespacho, procesarUpdate, armarAvisoPrueba, publicarEnNtfy } from '../src/alerta.mjs';

const CHAT = '-1001234567890';
const mensaje = (texto, id = CHAT) => ({ message: { message_id: 1, chat: { id: Number(id), title: 'Emergencias Villarrica 2022' }, text: texto } });

test('quita tildes', () => assert.equal(normalizar('QUÍNTA'), 'quinta'));
test('valida secreto exacto', () => {
  assert.equal(secretoValido('abc', 'abc'), true);
  assert.equal(secretoValido('abd', 'abc'), false);
  assert.equal(secretoValido('', 'abc'), false);
});
test('lee mensajes y canales, no ediciones', () => {
  assert.equal(extraerMensaje(mensaje('B-5')).texto, 'B-5');
  assert.equal(extraerMensaje({ channel_post: mensaje('10-0').message }).texto, '10-0');
  assert.equal(extraerMensaje({ edited_message: mensaje('B-5').message }), null);
});
test('detecta señales previstas', () => {
  assert.deepEqual(detectarDespacho('LLAMADO GENERAL B5 10-0'), ['llamado general', 'B-5']);
  assert.deepEqual(detectarDespacho('10-0-1 sin asignar unidad'), []);
  assert.deepEqual(detectarDespacho('otro grupo'), []);
});
test('rechaza grupo incorrecto y falta de configuración', () => {
  assert.equal(procesarUpdate(mensaje('B-5', '-100222'), CHAT).procesable, false);
  assert.throws(() => procesarUpdate(mensaje('B-5'), ''), /obligatorio/);
});
test('ignora mensajes no operativos', () => {
  assert.equal(procesarUpdate(mensaje('Buenos días'), CHAT).procesable, false);
});
test('aviso inequívocamente de prueba', () => {
  const aviso = armarAvisoPrueba(procesarUpdate(mensaje('B-5'), CHAT), 'tema_privado_prueba_2026');
  assert.equal(aviso.priority, 5);
  assert.match(aviso.title, /NO EMERGENCIA REAL/);
  assert.match(aviso.message, /NO DESPACHAR/);
});
test('ntfy se simula sin acceso a red', async () => {
  let data;
  const fake = async (url, options) => { data = { url, options }; return { ok: true, status: 200 }; };
  const aviso = armarAvisoPrueba(procesarUpdate(mensaje('B-5'), CHAT), 'tema_privado_prueba_2026');
  assert.deepEqual(await publicarEnNtfy(aviso, { fetchImpl: fake }), { ok: true });
  assert.equal(data.url, 'https://ntfy.sh/');
  assert.equal(JSON.parse(data.options.body).priority, 5);
});
test('rechaza ntfy sin HTTPS', async () => {
  await assert.rejects(() => publicarEnNtfy({ topic: 'x', message: 'x' }, { server: 'http://ntfy.sh' }), /HTTPS/);
});
