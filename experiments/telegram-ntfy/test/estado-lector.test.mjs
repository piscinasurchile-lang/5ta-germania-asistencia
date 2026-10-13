import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as fsReal from 'node:fs/promises';
import { crearAlmacen } from '../src/estado-lector.mjs';

const dirs = [];
async function dirTemporal() {
  const d = await mkdtemp(join(tmpdir(), 'estado-lector-'));
  dirs.push(d);
  return d;
}
after(async () => { for (const d of dirs) await rm(d, { recursive: true, force: true }); });

const estado = (offset, ultimoMessageId) => ({ version: 1, offset, ultimoMessageId, actualizado: '2026-10-13T10:00:00.000Z' });

test('sin archivo: estado nuevo', async () => {
  const dir = await dirTemporal();
  const { estado: e, origen } = await crearAlmacen(join(dir, 'estado.json')).cargar();
  assert.equal(origen, 'nuevo');
  assert.deepEqual(e, { version: 1, offset: null, ultimoMessageId: 0, actualizado: null });
});

test('guardar y cargar conserva el estado, sin temporales y con permisos privados', async () => {
  const dir = await dirTemporal();
  const ruta = join(dir, 'estado.json');
  const almacen = crearAlmacen(ruta);
  await almacen.guardar(estado(42, 17));
  const { estado: e, origen } = await almacen.cargar();
  assert.equal(origen, 'archivo');
  assert.equal(e.offset, 42);
  assert.equal(e.ultimoMessageId, 17);
  assert.deepEqual(await readdir(dir), ['estado.json']);
  if (process.platform !== 'win32') assert.equal((await stat(ruta)).mode & 0o777, 0o600);
});

test('un corte durante la escritura deja intacto el estado anterior y sin basura', async () => {
  const dir = await dirTemporal();
  const ruta = join(dir, 'estado.json');
  await crearAlmacen(ruta).guardar(estado(10, 5));
  const fallaAlRenombrar = { ...fsReal, rename: async () => { throw new Error('corte simulado'); } };
  await assert.rejects(() => crearAlmacen(ruta, { fs: fallaAlRenombrar }).guardar(estado(11, 6)), /corte simulado/);
  assert.equal(JSON.parse(await readFile(ruta, 'utf8')).offset, 10);
  assert.deepEqual(await readdir(dir), ['estado.json']);
});

test('archivo corrupto: se aparta una copia y se parte como primer arranque', async () => {
  const dir = await dirTemporal();
  const ruta = join(dir, 'estado.json');
  await writeFile(ruta, '{"version":1,"offset":');
  const { estado: e, origen, copia } = await crearAlmacen(ruta, { ahora: () => 123 }).cargar();
  assert.equal(origen, 'corrupto');
  assert.equal(e.offset, null);
  assert.equal(copia, ruta + '.corrupto-123');
  assert.deepEqual((await readdir(dir)).sort(), ['estado.json.corrupto-123']);
});

test('contenido con forma válida de JSON pero inválido se trata como corrupto', async () => {
  const dir = await dirTemporal();
  const ruta = join(dir, 'estado.json');
  await writeFile(ruta, JSON.stringify({ version: 1, offset: -5, ultimoMessageId: 0 }));
  assert.equal((await crearAlmacen(ruta).cargar()).origen, 'corrupto');
});

test('no se guarda un estado inválido (offset negativo o no numérico)', async () => {
  const dir = await dirTemporal();
  const almacen = crearAlmacen(join(dir, 'estado.json'));
  await assert.rejects(() => almacen.guardar(estado(-1, 0)), /inválido/);
  await assert.rejects(() => almacen.guardar(estado('7', 0)), /inválido/);
  assert.deepEqual(await readdir(dir), []);
});
