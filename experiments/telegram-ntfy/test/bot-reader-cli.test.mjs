import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const TOKEN_FALSO = '123456:TOKEN-FALSO_abc123';
const dirs = [];
after(async () => { for (const d of dirs) await rm(d, { recursive: true, force: true }); });

async function ejecutar({ args = [], env = {} } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'cli-lector-'));
  dirs.push(dir);
  const r = spawnSync(process.execPath, ['--import', './test/helpers/fake-telegram.mjs', 'src/bot-reader-cli.mjs', ...args], {
    cwd: raiz,
    encoding: 'utf8',
    env: { PATH: process.env.PATH, ESTADO_RUTA: join(dir, 'estado.json'), ...env }
  });
  const metodos = (r.stderr.match(/METHOD:(\w+)/g) || []).map((m) => m.slice(7));
  return { codigo: r.status, salida: r.stdout, error: r.stderr.replace(/METHOD:\w+\n/g, ''), metodos, dir };
}

const COMPLETO = { TELEGRAM_BOT_TOKEN: TOKEN_FALSO, TELEGRAM_CHAT_ID: '-1001234567890' };

test('sin argumento ni variable de autorización: termina sin llamar a Telegram', async () => {
  const r = await ejecutar({ env: COMPLETO });
  assert.equal(r.codigo, 2);
  assert.deepEqual(r.metodos, []);
  assert.match(r.error, /NO iniciado/);
});

test('con solo el argumento (sin la variable): no inicia', async () => {
  const r = await ejecutar({ args: ['--autorizado-getupdates'], env: COMPLETO });
  assert.equal(r.codigo, 2);
  assert.deepEqual(r.metodos, []);
});

test('con solo la variable (sin el argumento): no inicia', async () => {
  const r = await ejecutar({ env: { ...COMPLETO, AUTORIZO_GETUPDATES: 'SI_LO_AUTORIZO' } });
  assert.equal(r.codigo, 2);
  assert.deepEqual(r.metodos, []);
});

test('autorizado pero con configuración inválida: se rechaza antes de llamar a Telegram', async () => {
  const base = { args: ['--autorizado-getupdates'] };
  const auth = { AUTORIZO_GETUPDATES: 'SI_LO_AUTORIZO' };
  for (const [env, esperado] of [
    [{ ...auth, TELEGRAM_CHAT_ID: '-1001234567890' }, /TELEGRAM_BOT_TOKEN/],
    [{ ...auth, TELEGRAM_BOT_TOKEN: TOKEN_FALSO, TELEGRAM_CHAT_ID: 'Despachos Villarrica 2023' }, /TELEGRAM_CHAT_ID/],
    [{ ...auth, ...COMPLETO, DRY_RUN: 'si' }, /DRY_RUN/],
    [{ ...auth, ...COMPLETO, DRY_RUN: '0' }, /NTFY_TOPIC/]
  ]) {
    const r = await ejecutar({ ...base, env });
    assert.equal(r.codigo, 2, r.error);
    assert.match(r.error, esperado);
    assert.deepEqual(r.metodos, []);
  }
});

test('autorizado y con webhook presente: solo consulta getWebhookInfo, no lee ni crea estado', async () => {
  const r = await ejecutar({
    args: ['--autorizado-getupdates'],
    env: { ...COMPLETO, AUTORIZO_GETUPDATES: 'SI_LO_AUTORIZO', FAKE_SCENARIO: 'con-webhook' }
  });
  assert.equal(r.codigo, 3, r.error);
  assert.deepEqual(r.metodos, ['getWebhookInfo']);
  assert.match(r.error, /webhook_presente/);
  assert.deepEqual(await readdir(r.dir), []);
  for (const prohibido of ['TOKEN-FALSO', 'SECRETO-EN-RUTA']) {
    assert.ok(!r.salida.includes(prohibido) && !r.error.includes(prohibido));
  }
});
