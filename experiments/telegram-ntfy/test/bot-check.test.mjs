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
  const chatIds = Object.fromEntries((r.stderr.match(/CHATID:\w+=\S+/g) || []).map((m) => m.slice(7).split('=')));
  return { codigo: r.status, salida: r.stdout, error: r.stderr.replace(/METHOD:\w+\n/g, '').replace(/CHATID:\S+\n/g, ''), metodos, chatIds };
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

test('@usuario: se resuelve con getChat, muestra el ID numérico y consulta la membresía con ese ID', () => {
  const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
  assert.equal(r.codigo, 0, r.error);
  assert.equal(r.chatIds.getChat, '@DespaVillarrica');
  assert.equal(r.chatIds.getChatMember, '-1001234567890');
  assert.match(r.salida, /ID devuelto por getChat: -1001234567890 \| tipo: supergroup/);
  assert.match(r.salida, /@usuario resuelto por getChat: @DespaVillarrica/);
  assert.match(r.salida, /ID numérico a usar después como TELEGRAM_CHAT_ID.*: -1001234567890/);
  assert.match(r.salida, /Estado del bot dentro del grupo: member/);
});

test('@usuario: solo métodos de lectura y nunca el token en la salida', () => {
  for (const escenario of ['sin-webhook', 'con-webhook']) {
    const r = ejecutar(escenario, { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
    for (const m of r.metodos) assert.ok(METODOS_PERMITIDOS.has(m), 'método no permitido: ' + m);
    assert.ok(!r.salida.includes('TOKEN-FALSO') && !r.error.includes('TOKEN-FALSO'));
  }
});

test('@usuario: mayúsculas distintas del @usuario no rompen la comprobación', () => {
  const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: '@despavillarrica' });
  assert.equal(r.codigo, 0, r.error);
});

test('@usuario: se detiene si el título no coincide (no consulta membresía)', () => {
  const r = ejecutar('titulo-distinto', { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /NO coincide con el título/);
  assert.ok(!r.metodos.includes('getChatMember'));
});

test('@usuario: se detiene si getChat devuelve otro @usuario o ninguno', () => {
  for (const escenario of ['username-distinto', 'sin-username']) {
    const r = ejecutar(escenario, { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
    assert.notEqual(r.codigo, 0, escenario);
    assert.match(r.error, /@usuario distinto/);
    assert.ok(!r.metodos.includes('getChatMember'));
  }
});

test('@usuario: si getChat no encuentra el chat, termina con HTTP 400 y sin getChatMember', () => {
  const r = ejecutar('chat-no-encontrado', { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /getChat: HTTP 400/);
  assert.ok(!r.metodos.includes('getChatMember'));
});

test('@usuario: si el bot no es miembro, falla aunque getChat funcione', () => {
  const r = ejecutar('no-miembro', { TELEGRAM_CHAT_ID: '@DespaVillarrica' });
  assert.notEqual(r.codigo, 0);
  assert.match(r.error, /No se confirmó membresía/);
});

test('formatos inválidos de @usuario se rechazan antes de llamar a getChat', () => {
  for (const id of ['@', '@ab', '@1abc', '@con espacio', 'DespaVillarrica', '@a-b-c-d']) {
    const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: id });
    assert.notEqual(r.codigo, 0, id);
    assert.match(r.error, /numérico/);
    assert.ok(!r.metodos.includes('getChat'), id);
  }
});

test('ID numérico: sigue consultándose con el mismo ID en getChat y getChatMember', () => {
  const r = ejecutar('sin-webhook', { TELEGRAM_CHAT_ID: '-1001234567890' });
  assert.equal(r.chatIds.getChat, '-1001234567890');
  assert.equal(r.chatIds.getChatMember, '-1001234567890');
  assert.ok(!r.salida.includes('@usuario resuelto'));
});
