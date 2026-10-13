/* Sustituye fetch por un Telegram simulado (sin red). Se carga con: node --import ./test/helpers/fake-telegram.mjs ...
   Escenario por variable FAKE_SCENARIO. Cada método consultado se anota en stderr como "METHOD:<nombre>". */
const escenario = process.env.FAKE_SCENARIO || 'sin-webhook';
const CHAT_ID = -1001234567890;

globalThis.fetch = async (input) => {
  const url = new URL(String(input));
  const metodo = url.pathname.split('/').pop();
  process.stderr.write('METHOD:' + metodo + '\n');
  const ok = (result) => new Response(JSON.stringify({ ok: true, result }), { status: 200 });
  switch (metodo) {
    case 'getMe':
      return ok({ id: 777, is_bot: true, username: 'Alerta5taVillarrica_bot', can_read_all_group_messages: true });
    case 'getWebhookInfo':
      return ok(escenario === 'con-webhook'
        ? { url: 'https://Receptor-Ejemplo.example.com:8443/api/telegram/webhook?secret=SECRETO-EN-RUTA&k=v', pending_update_count: 3, last_error_date: 1760000000, last_error_message: 'Wrong response from the webhook: 503 Service Unavailable', allowed_updates: ['message'] }
        : { url: '', pending_update_count: 0 });
    case 'getChat':
      return ok({
        id: escenario === 'id-distinto' ? -1009999999999 : CHAT_ID,
        type: 'supergroup',
        title: escenario === 'titulo-distinto' ? 'Otro Grupo' : 'Despachos Villarrica 2023'
      });
    case 'getChatMember':
      return ok({ status: 'member', user: { id: 777 } });
    default:
      return new Response(JSON.stringify({ ok: false, error_code: 404 }), { status: 404 });
  }
};
