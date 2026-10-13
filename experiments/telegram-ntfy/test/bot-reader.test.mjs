import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crearLector } from '../src/bot-reader.mjs';
import { crearAlmacen } from '../src/estado-lector.mjs';
import { crearRelayBot } from '../src/bot-relay.mjs';
import { crearTelegramFalso } from './helpers/telegram-falso.mjs';

const TOKEN = '123456:TOKEN-FALSO_abc123';
const chatId = '-1001234567890';
const topic = 'germania-test-012345678901234567890123';
const AHORA = Date.UTC(2026, 9, 13, 10);
const dirs = [];
after(async () => { for (const d of dirs) await rm(d, { recursive: true, force: true }); });

const T1 = 'B-5 10-0-1\nDirección: Los Canelos 123';
const T2 = 'B-5 10-0-1\nDirección: Los Canelos 456';
const upd = (id, msgId, texto = T1, extra = {}) => ({
  update_id: id,
  message: { message_id: msgId, date: AHORA / 1000 - 30, chat: { id: chatId, type: 'supergroup' }, text: texto, ...extra }
});

async function montar({ updates = [], webhookUrl = '', tg, ruta, almacen, reloj = { t: AHORA }, ...opciones } = {}) {
  if (!ruta) { const d = await mkdtemp(join(tmpdir(), 'lector-')); dirs.push(d); ruta = join(d, 'estado.json'); }
  tg ??= crearTelegramFalso({ updates, webhookUrl });
  almacen ??= crearAlmacen(ruta);
  const publicados = [];
  const intentos = [];
  const sleeps = [];
  const registros = [];
  const ctrl = { fallar: () => false };
  const publicar = async (aviso) => {
    intentos.push(aviso);
    if (ctrl.fallar(aviso)) throw new Error('ntfy HTTP 503');
    publicados.push(aviso);
  };
  const lector = crearLector({
    token: TOKEN,
    almacen,
    fetchImpl: tg.fetchImpl,
    sleep: async (ms) => { sleeps.push(ms); },
    log: (evento, datos) => registros.push({ evento, ...datos }),
    ahora: () => reloj.t,
    azar: () => 0.5,
    maxReintentosEntrega: 3,
    crearRelay: (ultimoIdInicial) => crearRelayBot({ chatId, topic, dryRun: false, publicar, now: () => reloj.t, ultimoIdInicial }),
    ...opciones
  });
  return { lector, tg, almacen, ruta, publicados, intentos, sleeps, registros, ctrl, reloj };
}

const enDireccion = (aviso, n) => aviso.message.includes('Canelos ' + n);

test('primer arranque: revisa webhook, pide sin offset, entrega y guarda el offset', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  assert.deepEqual(await m.lector.iniciar(), { ok: true });
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 1, procesadas: 1 });
  assert.equal(m.publicados.length, 1);
  assert.ok(enDireccion(m.publicados[0], 123));
  const { estado } = await m.almacen.cargar();
  assert.equal(estado.offset, 2);
  assert.equal(estado.ultimoMessageId, 10);
  assert.deepEqual(m.tg.llamadas.map((l) => l.metodo), ['getWebhookInfo', 'getUpdates']);
  assert.equal(m.tg.getUpdates()[0].params.offset, undefined);
});

test('el segundo ciclo pide con el offset guardado, lo que confirma lo anterior', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  await m.lector.iniciar();
  await m.lector.ciclo();
  m.tg.agregar(upd(2, 11, T2));
  await m.lector.ciclo();
  assert.equal(m.tg.getUpdates()[1].params.offset, '2');
  assert.equal(m.publicados.length, 2);
  assert.ok(enDireccion(m.publicados[1], 456));
  assert.deepEqual(m.tg.cola.map((u) => u.update_id), [2]); // el 1 quedó confirmado; el 2 se confirmará en la siguiente consulta
});

test('solo usa getWebhookInfo y getUpdates; parámetros limitados; sin offset negativo ni allowed_updates', async () => {
  const m = await montar({ updates: [upd(1, 10), upd(2, 11, T2)] });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 3 }), { ok: true, motivo: 'detenido' });
  const metodos = new Set(m.tg.llamadas.map((l) => l.metodo));
  assert.deepEqual([...metodos].sort(), ['getUpdates', 'getWebhookInfo']);
  for (const { metodo, params } of m.tg.llamadas) {
    if (metodo !== 'getUpdates') continue;
    for (const clave of Object.keys(params)) assert.ok(['timeout', 'limit', 'offset'].includes(clave), 'parámetro no permitido: ' + clave);
    if (params.offset !== undefined) assert.ok(Number(params.offset) > 0);
  }
});

test('con webhook presente no llama a getUpdates ni crea estado (no interfiere con el receptor)', async () => {
  const m = await montar({ updates: [upd(1, 10)], webhookUrl: 'https://receptor.example.com/x' });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 1 }), { ok: false, motivo: 'webhook_presente' });
  assert.deepEqual(m.tg.llamadas.map((l) => l.metodo), ['getWebhookInfo']);
  assert.deepEqual(await readdir(join(m.ruta, '..')), []);
  assert.equal(m.publicados.length, 0);
});

test('reinicio: el lector nuevo retoma el offset y no reprocesa ni repite avisos', async () => {
  const A = await montar({ updates: [upd(1, 10), upd(2, 11, T2)] });
  await A.lector.iniciar();
  await A.lector.ciclo();
  assert.equal(A.publicados.length, 2);

  const B = await montar({ tg: A.tg, ruta: A.ruta }); // mismo archivo y mismo Telegram: "proceso nuevo"
  await B.lector.iniciar();
  assert.equal(B.lector.estado().offset, 3);
  assert.equal(B.lector.estado().ultimoMessageId, 11);
  assert.deepEqual(await B.lector.ciclo(), { recibidas: 0, procesadas: 0 });
  assert.equal(B.tg.getUpdates().at(-1).params.offset, '3');
  assert.equal(B.publicados.length, 0);
});

test('fallo de ntfy: no avanza, reintenta con espera creciente y no salta a mensajes posteriores', async () => {
  const m = await montar({ updates: [upd(1, 10), upd(2, 11, T2)] });
  let fallos = 2;
  m.ctrl.fallar = (aviso) => enDireccion(aviso, 123) && fallos-- > 0;
  await m.lector.iniciar();
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 2, procesadas: 2 });
  assert.deepEqual(m.sleeps, [1000, 2000]);
  assert.deepEqual(m.intentos.map((a) => (enDireccion(a, 123) ? '123' : '456')), ['123', '123', '123', '456']);
  assert.equal(m.publicados.length, 2);
  assert.equal((await m.almacen.cargar()).estado.offset, 3);
});

test('ntfy caído: se agotan los reintentos, el offset no avanza y al recuperarse se entrega', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.ctrl.fallar = () => true;
  await m.lector.iniciar();
  await assert.rejects(() => m.lector.ciclo(), (e) => e.name === 'ErrorBloqueado' && e.updateId === 1);
  assert.deepEqual(m.sleeps, [1000, 2000]);
  assert.equal(m.intentos.length, 3);
  assert.equal((await m.almacen.cargar()).origen, 'nuevo'); // nada confirmado

  m.ctrl.fallar = () => false;
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 1, procesadas: 1 });
  assert.equal(m.publicados.length, 1);
  assert.equal((await m.almacen.cargar()).estado.offset, 2);
});

test('en el bucle continuo, un bloqueo espera el máximo y reintenta la misma actualización', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  let fallos = 3;
  m.ctrl.fallar = () => fallos-- > 0;
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 1 }), { ok: true, motivo: 'detenido' });
  assert.deepEqual(m.sleeps, [1000, 2000, 60000]);
  assert.equal(m.publicados.length, 1);
});

test('tras una caída larga, un mensaje de más de 7 minutos ya no suena, pero el avance continúa', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.ctrl.fallar = () => true;
  await m.lector.iniciar();
  await assert.rejects(() => m.lector.ciclo(), /bloqueado/);
  m.ctrl.fallar = () => false;
  m.reloj.t += 8 * 60 * 1000;
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 1, procesadas: 1 });
  assert.equal(m.publicados.length, 0);
  const { estado } = await m.almacen.cargar();
  assert.equal(estado.offset, 2);
  assert.equal(estado.ultimoMessageId, 10);
});

test('corte entre la aceptación de ntfy y el guardado: entrega al menos una vez, nunca se pierde', async () => {
  const ruta = join(await mkdtemp(join(tmpdir(), 'lector-')), 'estado.json');
  dirs.push(join(ruta, '..'));
  const real = crearAlmacen(ruta);
  let falla = true;
  const almacenQueFalla = {
    cargar: () => real.cargar(),
    guardar: async (e) => { if (falla) { falla = false; throw new Error('corte simulado'); } return real.guardar(e); }
  };
  const A = await montar({ updates: [upd(1, 10)], ruta, almacen: almacenQueFalla });
  await A.lector.iniciar();
  await assert.rejects(() => A.lector.ciclo(), /corte simulado/);
  assert.equal(A.publicados.length, 1);
  assert.equal((await real.cargar()).origen, 'nuevo');

  const B = await montar({ tg: A.tg, ruta }); // reinicio
  await B.lector.iniciar();
  await B.lector.ciclo();
  assert.equal(B.publicados.length, 1); // repetido: el aviso no se perdió
  assert.equal(B.publicados[0].message, A.publicados[0].message);
  assert.equal((await real.cargar()).estado.offset, 2);
});

test('la deduplicación persistida evita repetir un mensaje ya avisado tras el reinicio', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lector-'));
  dirs.push(dir);
  const ruta = join(dir, 'estado.json');
  await writeFile(ruta, JSON.stringify({ version: 1, offset: 1, ultimoMessageId: 10, actualizado: null }));
  const m = await montar({ ruta, updates: [upd(1, 10)] });
  await m.lector.iniciar();
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 1, procesadas: 1 });
  assert.equal(m.publicados.length, 0);
  assert.equal((await m.almacen.cargar()).estado.offset, 2);
});

test('estado corrupto: se aparta y se parte de cero sin detener el servicio', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lector-'));
  dirs.push(dir);
  const ruta = join(dir, 'estado.json');
  await writeFile(ruta, 'basura{');
  const m = await montar({ ruta, updates: [upd(1, 10)] });
  assert.deepEqual(await m.lector.iniciar(), { ok: true });
  assert.equal(m.registros[0].origen, 'corrupto');
  await m.lector.ciclo();
  assert.equal(m.publicados.length, 1);
  assert.ok((await readdir(dir)).some((n) => n.startsWith('estado.json.corrupto-')));
});

test('límite de Telegram (429): espera exactamente lo indicado y continúa', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.tg.guion.push({ metodo: 'getUpdates', status: 429, body: { ok: false, error_code: 429, parameters: { retry_after: 7 } } });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 1 }), { ok: true, motivo: 'detenido' });
  assert.deepEqual(m.sleeps, [7000]);
  assert.equal(m.publicados.length, 1);
});

test('cortes de red y errores 5xx: espera creciente con tope, se reconecta y no filtra el token', async () => {
  const m = await montar({ updates: [upd(1, 10)], esperaMaxMs: 5000 });
  m.tg.guion.push(
    { metodo: 'getUpdates', tipo: 'red' },
    { metodo: 'getUpdates', status: 502, body: { ok: false, error_code: 502 } },
    { metodo: 'getUpdates', tipo: 'red' },
    { metodo: 'getUpdates', status: 500, body: { ok: false, error_code: 500 } }
  );
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 1 }), { ok: true, motivo: 'detenido' });
  assert.deepEqual(m.sleeps, [1000, 2000, 4000, 5000]);
  assert.equal(m.publicados.length, 1);
  const salida = JSON.stringify(m.registros);
  assert.ok(!salida.includes('TOKEN-FALSO') && !salida.includes('123456:'), 'el token no debe aparecer en los registros');
});

test('un error de red lanzado por el lector no contiene la URL ni el token', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  await m.lector.iniciar();
  m.tg.guion.push({ metodo: 'getUpdates', tipo: 'red' }); // el error simulado de fetch incluye la URL con el token
  await assert.rejects(() => m.lector.ciclo(), (e) => {
    assert.equal(e.name, 'ErrorTransitorio');
    for (const texto of [e.message, String(e.stack), JSON.stringify(e)]) {
      assert.ok(!texto.includes('TOKEN-FALSO') && !texto.includes('api.telegram.org'), 'filtra la URL o el token');
    }
    return true;
  });
});

test('falla transitoria en el arranque (getWebhookInfo): reintenta y luego sigue', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.tg.guion.push({ metodo: 'getWebhookInfo', tipo: 'red' });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 1 }), { ok: true, motivo: 'detenido' });
  assert.deepEqual(m.sleeps, [1000]);
  assert.equal(m.publicados.length, 1);
});

test('conflicto 409 (otro lector o webhook): se detiene al instante, sin reintentar ni competir', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.tg.guion.push({ metodo: 'getUpdates', status: 409, body: { ok: false, error_code: 409 } });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 5 }), { ok: false, motivo: 'conflicto' });
  assert.equal(m.tg.getUpdates().length, 1);
  assert.deepEqual(m.sleeps, []);
});

test('token inválido (401): se detiene sin reintentar', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  m.tg.guion.push({ metodo: 'getWebhookInfo', status: 401, body: { ok: false, error_code: 401 } });
  assert.deepEqual(await m.lector.ejecutar({ maxCiclos: 5 }), { ok: false, motivo: 'token_o_permiso' });
  assert.deepEqual(m.tg.llamadas.map((l) => l.metodo), ['getWebhookInfo']);
});

test('actualizaciones sin mensaje o de otro chat se consumen sin avisar', async () => {
  const m = await montar({
    updates: [
      { update_id: 5, my_chat_member: { chat: { id: chatId } } },
      upd(6, 20, T1, { chat: { id: '-100999', type: 'supergroup' } })
    ]
  });
  await m.lector.iniciar();
  assert.deepEqual(await m.lector.ciclo(), { recibidas: 2, procesadas: 2 });
  assert.equal(m.publicados.length, 0);
  assert.equal((await m.almacen.cargar()).estado.offset, 7);
});

test('las actualizaciones se procesan en orden aunque lleguen desordenadas', async () => {
  const m = await montar({ updates: [upd(2, 11, T2), upd(1, 10)] });
  await m.lector.iniciar();
  await m.lector.ciclo();
  assert.deepEqual(m.publicados.map((a) => (enDireccion(a, 123) ? 123 : 456)), [123, 456]);
});

test('los registros no contienen el texto de los despachos ni el token', async () => {
  const m = await montar({ updates: [upd(1, 10)] });
  await m.lector.ejecutar({ maxCiclos: 1 });
  const salida = JSON.stringify(m.registros);
  assert.ok(m.registros.length > 0);
  for (const prohibido of ['Canelos', 'TOKEN-FALSO', topic]) assert.ok(!salida.includes(prohibido), 'no debe aparecer: ' + prohibido);
});

test('configuración inválida se rechaza antes de cualquier llamada', () => {
  assert.throws(() => crearLector({ token: 'no-es-token', crearRelay: () => {}, almacen: {} }), /TELEGRAM_BOT_TOKEN/);
  assert.throws(() => crearLector({ token: TOKEN, almacen: {} }), /crearRelay/);
});
