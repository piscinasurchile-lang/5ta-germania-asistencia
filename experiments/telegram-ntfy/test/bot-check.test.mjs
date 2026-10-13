import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hostnameSeguro } from '../src/webhook-host.mjs';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const TOKEN_FALSO = '123456:TOKEN-FALSO_abc123';
const METODOS_PERMITIDOS = new Set(['getMe', 'getWebhookInfo', 'getChat', 'getChatMember']);

function ejecutar(escenario, extra = {}) {
  const r = spawnSync(process.execPath, ['--import', './test/helpers/fake-telegram.mjs', 'src/bot-check.mjs'], {
    cwd: raiz,
    encoding: 'utf8',
    env: { PATH: process.env.PATH, TELEGRAM_BOT_TOKEN: TOKEN_FALSO, FAKE_SCENARIO: escenario, ...extra }
  });
  const metodos = (r.stderr.match(/METHOD:(\w+)/g) || []).map((m) => m.slice(7));
  return { codigo: r.status, salida: r.stdout, error: r.stderr.replace(/METHOD:\w+\n/g, ''), metodos };
}

test('hostnameSeguro devuelve solo el hostname', () => {
  assert.equal(hostnameSeguro('https://Receptor.Example.com:8443/api/x?token=ABC#frag'), 'receptor.example.com');
  assert.equal(hostnameSeguro('https://usuario:clave@host.example.com/ruta'), 'host.example.com');
  assert.equal(hostnameSeguro('https://[2001:db8::1]/ruta?x=1'), '[2001:db8::1]');
});

test('hostnameSeguro rechaza lo que no puede interpretar', () => {
  assert.equal(hostnameSeguro(''), null);
  assert.equal(hostnameSeguro(undefined), null);
  assert.equal(hostnameSeguro('no es una url'), null);
  assert.equal(hostnameSeguro('javascript:alert(1)'), null);
  assert.equal(hostnameSeguro('ftp://host.example.com/x'), null);
});

test('con webhook: imprime solo el hostname, nunca ruta, parámetros ni token', () => {
  const r = ejecutar('con-webhook');
  assert.equal(r.codigo, 0, r.error);
  assert.match(r.salida, /Webhook ya configurado: sí/);
  assert.match(r.salida, /solo hostname\): receptor-ejemplo\.example\.com\n/);
  for (const prohibido of ['SECRETO-EN-RUTA', '/api/telegram', 'k=v', '8443', TOKEN_FALSO, 'TOKEN-FALSO']) {
    assert.ok(!r.salida.includes(prohibido) && !r.error.includes(prohibido), 'no debe aparecer: ' + prohibido);
  }
  assert.match(r.salida, /Actualizaciones pendientes en Telegram: 3/);
});

test('sin webhook: informa que no hay y no imprime hostname', () => {
  const r = ejecutar('sin-webhook');
  assert.equal(r.codigo, 0, r.error);
  assert.match(r.salida, /Webhook ya configurado: no/);
  assert.ok(!r.salida.includes('solo hostname'));
  assert.match(r.salida, /Grupo todavía no comprobado/);
});

test('solo consulta métodos de lectura permitidos (nunca getUpdates ni métodos de escritura)', () => {
  for (const escenario of ['con-webhook', 'sin-webhook']) {
    const r = ejecutar(escenario, { TELEGRAM_CHAT_ID: '-1001234567890' });
    assert.ok(r.metodos.length > 0);
    for (const m of r.metodos) assert.ok(METODOS_PERMITIDOS.has(m), 'método no permitido: ' + m);
  }
});

test('el ID se comprueba con getChat: coincide', () => {
  const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: '-1001234567890' });
  assert.equal(r.codigo, 0, r.error);
  assert.match(r.salida, /ID devuelto por getChat: -1001234567890 \| tipo: supergroup/);
  assert.match(r.salida, /ID comprobado con getChat/);
  assert.match(r.salida, /Estado del bot dentro del grupo: member/);
});

test('el ID se comprueba con getChat: se detiene si Telegram devuelve otro ID', () => {
  const r = ejecutar('id-distinto', { TELEGRAM_CHAT_ID: '-1001234567890' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /otro ID|distinto/);
  assert.ok(!r.metodos.includes('getChatMember'));
});

test('el ID se comprueba con getChat: se detiene si el título no coincide', () => {
  const r = ejecutar('titulo-distinto', { TELEGRAM_CHAT_ID: '-1001234567890' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /NO coincide con el título/);
  assert.ok(!r.metodos.includes('getChatMember'));
});

test('un ID no numérico se rechaza antes de llamar a getChat', () => {
  const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: 'Despachos Villarrica 2023' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /numérico/);
  assert.ok(!r.metodos.includes('getChat'));
});
