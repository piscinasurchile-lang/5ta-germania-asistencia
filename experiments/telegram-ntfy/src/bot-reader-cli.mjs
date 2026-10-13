/**
 * Comando del lector experimental. NO USAR todavía: requiere autorización explícita del titular.
 *
 * Qué hace: lee con getUpdates (único lector), pasa cada mensaje al relay y avisa a ntfy.
 * Qué NO hace: no llama a setWebhook ni a métodos de escritura, no integra Germania, no envía avisos periódicos.
 *
 * Doble protección: exige el argumento --autorizado-getupdates Y la variable AUTORIZO_GETUPDATES=SI_LO_AUTORIZO.
 * Sin ambos termina antes de llamar a Telegram.
 */
import { crearAlmacen, RUTA_ESTADO_POR_DEFECTO } from './estado-lector.mjs';
import { crearLector } from './bot-reader.mjs';
import { crearRelayBot } from './bot-relay.mjs';

function salir(codigo, texto) {
  console.error(texto);
  process.exit(codigo);
}

if (!process.argv.includes('--autorizado-getupdates') || process.env.AUTORIZO_GETUPDATES !== 'SI_LO_AUTORIZO') {
  salir(2, [
    'Lector NO iniciado. No se llamó a Telegram.',
    'getUpdates consume actualizaciones del bot (Telegram olvida las ya confirmadas), incluso con DRY_RUN=1.',
    'Solo con autorización explícita: AUTORIZO_GETUPDATES=SI_LO_AUTORIZO y el argumento --autorizado-getupdates.'
  ].join('\n'));
}

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
const dry = process.env.DRY_RUN ?? '1';
const topic = process.env.NTFY_TOPIC?.trim();
const servidor = process.env.NTFY_SERVER?.trim() || 'https://ntfy.sh';
const rutaEstado = process.env.ESTADO_RUTA?.trim() || RUTA_ESTADO_POR_DEFECTO;

if (!token || !/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) salir(2, 'TELEGRAM_BOT_TOKEN ausente o con formato inválido (nunca compartirlo).');
if (!/^-\d+$/.test(chatId || '')) salir(2, 'TELEGRAM_CHAT_ID debe ser el ID numérico exacto del grupo, ya comprobado con npm run bot:check.');
if (!['0', '1'].includes(dry)) salir(2, 'DRY_RUN debe ser 1 (simulación, por defecto) o 0.');
const dryRun = dry === '1';
if (!dryRun && !topic) salir(2, 'Con DRY_RUN=0 se requiere NTFY_TOPIC de pruebas (germania-test- + 20 caracteres aleatorios).');

const lector = crearLector({
  token,
  almacen: crearAlmacen(rutaEstado),
  crearRelay: (ultimoIdInicial) => {
    try {
      return crearRelayBot({
        chatId, topic, dryRun, ultimoIdInicial,
        ntfy: { server: servidor, token: process.env.NTFY_TOKEN?.trim() || '' }
      });
    } catch (error) {
      salir(2, 'Configuración rechazada: ' + error.message);
    }
  },
  // Solo metadatos operativos: nunca el texto de los despachos, el token ni el tema.
  log: (evento, datos = {}) => console.log(JSON.stringify({ t: new Date().toISOString(), evento, ...datos }))
});

console.error(dryRun
  ? 'Modo simulación (DRY_RUN=1): no se publica en ntfy, pero SÍ se consumen actualizaciones en Telegram.'
  : 'Publicación en ntfy habilitada solo para el tema de pruebas; avisos rotulados NO EMERGENCIA REAL.');

const control = new AbortController();
for (const senal of ['SIGINT', 'SIGTERM']) process.on(senal, () => control.abort());

const resultado = await lector.ejecutar({ senal: control.signal });
console.error('Lector detenido:', resultado.motivo);
process.exit(resultado.ok ? 0 : resultado.motivo === 'webhook_presente' ? 3 : 1);
