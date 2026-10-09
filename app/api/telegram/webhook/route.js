import { armarAlerta, coincide, enviarNtfy, extraerMensaje, parsearPalabras, secretoValido } from "../../../../lib/alerta-telegram.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/telegram/webhook
   Telegram llama aquí por cada mensaje nuevo del grupo donde está el bot.
   Variables (Vercel): TELEGRAM_WEBHOOK_SECRET, NTFY_TOPIC (obligatorias);
   TELEGRAM_CHAT_ID, ALERTA_PALABRAS, NTFY_SERVER, NTFY_TOKEN, ALERTA_INCLUIR_TEXTO (opcionales).
   Respuestas: 401 secreto inválido · 503 sin configurar · 200 ignorado/enviado · 502 ntfy falló (Telegram reintenta). */
export async function POST(request) {
  const secreto = process.env.TELEGRAM_WEBHOOK_SECRET;
  const topic = process.env.NTFY_TOPIC;
  if (!secreto || !topic) return Response.json({ ok: false, error: "no_configurado" }, { status: 503 });

  if (!secretoValido(request.headers.get("x-telegram-bot-api-secret-token"), secreto)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return Response.json({ ok: true, ignorado: "json_invalido" });
  }

  const msg = extraerMensaje(update);
  if (!msg) return Response.json({ ok: true, ignorado: "sin_mensaje" });

  const chatPermitido = (process.env.TELEGRAM_CHAT_ID || "").trim();
  if (chatPermitido && msg.chatId !== chatPermitido) return Response.json({ ok: true, ignorado: "otro_chat" });

  const decision = coincide(msg.texto, parsearPalabras(process.env.ALERTA_PALABRAS));
  if (!decision.alerta) return Response.json({ ok: true, ignorado: "sin_coincidencia" });

  try {
    await enviarNtfy(
      armarAlerta({
        texto: msg.texto,
        chatTitulo: msg.chatTitulo,
        tieneAdjunto: msg.tieneAdjunto,
        topic,
        incluirTexto: process.env.ALERTA_INCLUIR_TEXTO !== "0"
      }),
      { servidor: process.env.NTFY_SERVER || "https://ntfy.sh", token: process.env.NTFY_TOKEN || "" }
    );
    return Response.json({ ok: true, alerta: true, motivo: decision.motivo });
  } catch (error) {
    console.error("alerta ntfy falló", error);
    return Response.json({ ok: false, error: "ntfy" }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({ ok: true, ruta: "telegram-webhook" }, { headers: { "Cache-Control": "no-store" } });
}
