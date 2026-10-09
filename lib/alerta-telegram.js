/* Alerta de emergencias desde Telegram → ntfy (módulo puro, sin acceso a la base de datos).
   Flujo: Telegram (webhook) → app/api/telegram/webhook/route.js → este módulo → ntfy (prioridad 5, urgente).
   No toca Neon, sesiones, roles ni ODD. */

import { timingSafeEqual } from "node:crypto";

/* Minúsculas y sin tildes, para que "Quinta", "QUINTA" y "quíntá" coincidan igual. */
export function normalizar(texto) {
  return String(texto == null ? "" : texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/* "5ta, Quinta, B-5" → ["5ta","quinta","b-5"] */
export function parsearPalabras(valor) {
  return String(valor == null ? "" : valor)
    .split(",")
    .map((p) => normalizar(p).trim())
    .filter(Boolean);
}

/* Sin palabras clave configuradas = se alerta TODO mensaje (el error seguro en una emergencia es avisar de más, no de menos). */
export function coincide(texto, palabras) {
  if (!palabras || palabras.length === 0) return { alerta: true, motivo: "sin-filtro" };
  const t = normalizar(texto);
  const hallada = palabras.find((p) => t.includes(p));
  return hallada ? { alerta: true, motivo: hallada } : { alerta: false, motivo: null };
}

/* Comparación en tiempo constante del secreto que Telegram envía en la cabecera X-Telegram-Bot-Api-Secret-Token. */
export function secretoValido(recibido, esperado) {
  if (!esperado || !recibido) return false;
  const a = Buffer.from(String(recibido));
  const b = Buffer.from(String(esperado));
  return a.length === b.length && timingSafeEqual(a, b);
}

/* Extrae lo útil de un update de Telegram. Solo mensajes nuevos de grupo/canal (no ediciones, no chats privados). */
export function extraerMensaje(update) {
  if (!update || typeof update !== "object") return null;
  const m = update.message || update.channel_post;
  if (!m) return null;
  const texto = m.text || m.caption || "";
  const chat = m.chat || {};
  return {
    chatId: String(chat.id == null ? "" : chat.id),
    chatTitulo: chat.title || "",
    texto: String(texto),
    tieneAdjunto: Boolean(m.photo || m.document || m.voice || m.audio || m.video || m.location),
    esBot: Boolean(m.from && m.from.is_bot),
    messageId: m.message_id
  };
}

/* Mensaje para ntfy (publicación JSON en la raíz del servidor). Prioridad 5 = urgente. */
export function armarAlerta({ texto, chatTitulo, tieneAdjunto, topic, incluirTexto = true, maxChars = 300 }) {
  let cuerpo = "";
  if (incluirTexto && texto) {
    cuerpo = texto.length > maxChars ? texto.slice(0, maxChars - 1) + "…" : texto;
  } else if (tieneAdjunto) {
    cuerpo = "Mensaje con adjunto. Abre Telegram para verlo.";
  } else {
    cuerpo = "Nuevo mensaje en el grupo de emergencias. Abre Telegram para verlo.";
  }
  return {
    topic,
    title: "🚨 EMERGENCIA" + (chatTitulo ? " · " + chatTitulo : ""),
    message: cuerpo,
    priority: 5,
    tags: ["rotating_light"]
  };
}

export async function enviarNtfy(alerta, { servidor = "https://ntfy.sh", token = "", timeoutMs = 5000, fetchImpl = fetch } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetchImpl(servidor.replace(/\/+$/, "") + "/", {
    method: "POST",
    headers,
    body: JSON.stringify(alerta),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error("ntfy respondió " + res.status);
  return true;
}
