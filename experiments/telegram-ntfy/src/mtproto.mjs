import { readFile, writeFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import input from 'input';
import { evaluarMensaje, avisoDeLaboratorio } from './relay-core.mjs';
import { publicarEnNtfy } from './alerta.mjs';

const comando = process.argv[2];
if (!['auth', 'chats', 'watch'].includes(comando)) throw new Error('Usar: node src/mtproto.mjs auth|chats|watch');
const id = Number(process.env.TELEGRAM_API_ID);
const hash = process.env.TELEGRAM_API_HASH?.trim();
if (!Number.isSafeInteger(id) || id <= 0 || !hash) throw new Error('Configura TELEGRAM_API_ID y TELEGRAM_API_HASH en el equipo privado');
const sesion = comando === 'auth' ? '' : (process.env.TELEGRAM_SESSION || await readFile('.telegram-session', 'utf8')).trim();
const client = new TelegramClient(new StringSession(sesion), id, hash, {connectionRetries: 5});

try {
  if (comando === 'auth') {
    await client.start({
      phoneNumber: async () => input.text('Número de Telegram, con +56: '),
      phoneCode: async () => input.text('Código recibido en Telegram: '),
      password: async () => input.password('Clave de dos pasos, si corresponde: '),
      onError: (e) => console.error('Error autenticando:', e.message)
    });
    await writeFile('.telegram-session', client.session.save(), {mode: 0o600, flag: 'wx'});
    console.log('Sesión privada almacenada en .telegram-session; nunca compartir.');
  } else {
    await client.connect();
    if (!(await client.getMe())) throw new Error('Sesión de Telegram no autorizada');
    if (comando === 'chats') {
      const titulo = process.env.TELEGRAM_CHAT_TITLE?.trim() || 'Despachos Villarrica 2023';
      let encontrados = 0;
      for await (const dialogo of client.iterDialogs({})) {
        if (String(dialogo.title || '').trim().toLocaleLowerCase('es') !== titulo.toLocaleLowerCase('es')) continue;
        console.log('Grupo autorizado:', dialogo.title, '| ID:', String(dialogo.id));
        encontrados++;
      }
      if (encontrados !== 1) {
        console.error('Se requiere una coincidencia exacta de título; encontradas:', encontrados);
        process.exitCode = 1;
      }
    } else {
      const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
      const topic = process.env.NTFY_TOPIC?.trim();
      const dryRun = process.env.DRY_RUN !== '0';
      if (!/^-[0-9]{5,}$/.test(chatId || '')) throw new Error('TELEGRAM_CHAT_ID debe ser el identificador negativo del grupo');
      if (!dryRun) avisoDeLaboratorio({estado: 'alerta', coincidencias:['TEST'], direccion: null}, topic);
      let grupo = null;
      for await (const d of client.iterDialogs({})) {
        if (String(d.id) === chatId) { grupo = d; break; }
      }
      if (!grupo) throw new Error('La cuenta no tiene acceso al grupo solicitado');
      const estadoArchivo = '.telegram-relay-state.json';
      let estado;
      try {
        estado = JSON.parse(await readFile(estadoArchivo, 'utf8'));
        if (estado.chatId !== chatId || !Number.isSafeInteger(estado.ultimoId) || estado.ultimoId < 0) {
          throw new Error('Estado inválido o de otro grupo; requiere intervención');
        }
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        const recientes = await client.getMessages(grupo.entity, {limit: 1});
        estado = {chatId, ultimoId: recientes.length ? Number(recientes[0].id) : 0};
        await persistirEstado();
        console.log('Se ignoró historial anterior al primer inicio; no se enviaron alarmas retrospectivas.');
      }

      async function persistirEstado() {
        const archivoTemporal = estadoArchivo + '.' + randomUUID() + '.tmp';
        await writeFile(archivoTemporal, JSON.stringify(estado), {mode: 0o600});
        await rename(archivoTemporal, estadoArchivo);
      }
      async function revisar() {
        for await (const m of client.iterMessages(grupo.entity, {minId: estado.ultimoId, reverse: true, limit: 100})) {
          const numero = Number(m.id);
          const evaluacion = evaluarMensaje({
            chatId, messageId: numero, texto: m.message || '', fecha: m.date
          }, chatId, estado.ultimoId);
          if (evaluacion.estado === 'requiere_revision') {
            console.warn('REVISAR, sin alarma: mensaje', numero, '| especialidad no asignada al B-5:', evaluacion.excluidas.join(', '));
          }
          if (evaluacion.estado === 'alerta') {
            if (dryRun) {
              console.log('SIMULACIÓN, mensaje', numero, '| motivo:', evaluacion.motivo, '| claves:', evaluacion.claves.join(', ') || 'sin código');
            } else {
              await publicarEnNtfy(avisoDeLaboratorio(evaluacion, topic), {
                server: process.env.NTFY_SERVER || 'https://ntfy.sh',
                token: process.env.NTFY_TOKEN || ''
              });
              console.log('Alerta identificada como prueba enviada; mensaje', numero);
            }
          }
          estado.ultimoId = numero;
          await persistirEstado();
        }
      }
      console.log('Conectado al grupo autorizado:', grupo.title, '| ntfy:', dryRun ? 'NO ENVÍA' : 'PRUEBA AISLADA');
      let cola = Promise.resolve();
      const encolar = () => { cola = cola.then(revisar).catch(e => console.error('Fallo de lectura o envío; se reintentará:', e.message)); };
      client.addEventHandler(e => { if (String(e.chatId) === chatId) encolar(); }, new NewMessage({}));
      encolar();
      const timer = setInterval(encolar, 12000);
      try {
        await new Promise(resolve => {
          process.once('SIGINT', resolve);
          process.once('SIGTERM', resolve);
        });
        await cola;
      } finally {
        clearInterval(timer);
      }
    }
  }
} finally {
  await client.disconnect();
}
