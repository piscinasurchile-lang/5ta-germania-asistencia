/**
 * Diagnóstico de solo lectura del bot existente.
 * No modifica webhooks, no consume actualizaciones y no escribe en Telegram.
 * Ejecutar localmente con Node 20+: node --env-file=.env src/bot-check.mjs
 */
const expectedUsername = (process.env.TELEGRAM_BOT_USERNAME || 'Alerta5tavillarrica_bot').replace(/^@/, '');
const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
const expectedTitle = process.env.TELEGRAM_CHAT_TITLE?.trim() || 'Despachos Villarrica 2023';

if (!token) throw new Error('Falta TELEGRAM_BOT_TOKEN en el .env privado (nunca compartirlo)');
if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) throw new Error('Formato inválido de TELEGRAM_BOT_TOKEN');

async function api(method, params = {}) {
  const url = new URL('https://api.telegram.org/bot' + token + '/' + method);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const response = await fetch(url, {signal: AbortSignal.timeout(10000), redirect: 'error'});
  if (!response.ok) throw new Error(method + ': HTTP ' + response.status);
  const result = await response.json();
  if (!result.ok) throw new Error(method + ': Telegram rechazó la consulta, código ' + (result.error_code || 'desconocido'));
  return result.result;
}

const me = await api('getMe');
if (me.username?.toLowerCase() !== expectedUsername.toLowerCase()) {
  throw new Error('Token de otro bot: se esperaba @' + expectedUsername + ', se recibió @' + (me.username || 'desconocido'));
}
console.log('Identidad comprobada: @' + me.username);
console.log('Lectura general de grupos según Telegram:', me.can_read_all_group_messages ? 'habilitada' : 'no indicada / privacidad activa');
console.log('Importante: el permiso de leer publicaciones de otros bots debe verificarse en BotFather y con una prueba real.');

const webhook = await api('getWebhookInfo');
console.log('Webhook ya configurado:', Boolean(webhook.url) ? 'sí (NO se modificará)' : 'no');
console.log('Actualizaciones pendientes en Telegram:', Number(webhook.pending_update_count || 0));
console.log('Tipos de actualizaciones configuradas:', (webhook.allowed_updates || []).join(', ') || 'sin filtro declarado');
console.log('Error reciente de entrega:', webhook.last_error_date ? 'sí: revisar servicio receptor' : 'no informado');
if (webhook.url) {
  console.log('No se ejecutará getUpdates, pues podría interferir con el receptor del bot.');
} else {
  console.log('No se ejecutará getUpdates: consumiría actualizaciones y podría interferir con otro lector.');
}

if (!chatId) {
  console.log('Grupo todavía no comprobado: falta TELEGRAM_CHAT_ID real en .env.');
  console.log('El título por sí solo no identifica de forma inequívoca un grupo.');
  process.exit(0);
}
if (!/^-?\d+$/.test(chatId)) throw new Error('TELEGRAM_CHAT_ID debe ser numérico');
const chat = await api('getChat', {chat_id: chatId});
console.log('ID de grupo consultado:', String(chat.id));
console.log('Título obtenido:', chat.title || '(sin título)');
if (String(chat.title || '').trim().toLocaleLowerCase('es') !== expectedTitle.toLocaleLowerCase('es')) {
  throw new Error('Este ID NO coincide con el título Despachos Villarrica 2023; conexión detenida');
}
const membership = await api('getChatMember', {chat_id: chatId, user_id: me.id});
console.log('Estado del bot dentro del grupo:', membership.status);
if (!['member', 'administrator', 'creator'].includes(membership.status)) {
  throw new Error('No se confirmó membresía activa del bot en el grupo');
}
console.log('Diagnóstico de acceso al grupo correcto. Falta comprobar recepción real de publicaciones.');
