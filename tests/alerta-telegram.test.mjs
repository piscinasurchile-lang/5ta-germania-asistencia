import test from "node:test";
import assert from "node:assert/strict";
import {
  armarAlerta, coincide, enviarNtfy, extraerMensaje, normalizar, parsearPalabras, secretoValido
} from "../lib/alerta-telegram.js";

test("normalizar quita tildes y mayúsculas", () => {
  assert.equal(normalizar("QUÍNTA Compañía"), "quinta compania");
});

test("parsearPalabras separa por coma y descarta vacíos", () => {
  assert.deepEqual(parsearPalabras(" 5ta, Quinta ,, B-5 "), ["5ta", "quinta", "b-5"]);
  assert.deepEqual(parsearPalabras(""), []);
  assert.deepEqual(parsearPalabras(undefined), []);
});

test("coincide: con filtro solo alerta si hay palabra", () => {
  const p = parsearPalabras("5ta,quinta");
  assert.equal(coincide("Despacho: Quinta Compañía, incendio", p).alerta, true);
  assert.equal(coincide("Despacho: 2da y 3ra", p).alerta, false);
});

test("coincide: sin palabras clave alerta todo (falla hacia avisar de más)", () => {
  assert.deepEqual(coincide("cualquier cosa", []), { alerta: true, motivo: "sin-filtro" });
});

test("secretoValido exige igualdad exacta y rechaza vacíos", () => {
  assert.equal(secretoValido("abc123", "abc123"), true);
  assert.equal(secretoValido("abc124", "abc123"), false);
  assert.equal(secretoValido("abc", "abc123"), false);
  assert.equal(secretoValido("", "abc123"), false);
  assert.equal(secretoValido("abc123", ""), false);
  assert.equal(secretoValido(null, "abc123"), false);
});

test("extraerMensaje lee grupos y canales; ignora ediciones y basura", () => {
  const g = extraerMensaje({ message: { message_id: 7, text: "hola", chat: { id: -1001, title: "Emergencias Villarrica" }, from: { is_bot: false } } });
  assert.equal(g.chatId, "-1001");
  assert.equal(g.chatTitulo, "Emergencias Villarrica");
  assert.equal(g.texto, "hola");
  const c = extraerMensaje({ channel_post: { text: "x", chat: { id: -1002, title: "Canal" } } });
  assert.equal(c.chatId, "-1002");
  const foto = extraerMensaje({ message: { photo: [{}], caption: "mira", chat: { id: 1 } } });
  assert.equal(foto.texto, "mira");
  assert.equal(foto.tieneAdjunto, true);
  assert.equal(extraerMensaje({ edited_message: { text: "x", chat: { id: 1 } } }), null);
  assert.equal(extraerMensaje(null), null);
});

test("armarAlerta: prioridad 5, recorta texto largo y respeta incluirTexto=false", () => {
  const larga = "a".repeat(500);
  const a = armarAlerta({ texto: larga, chatTitulo: "Emergencias", topic: "t" });
  assert.equal(a.priority, 5);
  assert.equal(a.topic, "t");
  assert.ok(a.message.length <= 300);
  assert.ok(a.title.includes("EMERGENCIA"));
  const sin = armarAlerta({ texto: "Calle Secreta 123", topic: "t", incluirTexto: false });
  assert.ok(!sin.message.includes("Secreta"));
});

test("enviarNtfy publica JSON en la raíz, con token opcional, y falla si ntfy falla", async () => {
  let llamada;
  const ok = async (url, init) => { llamada = { url, init }; return { ok: true, status: 200 }; };
  await enviarNtfy({ topic: "t", message: "m", priority: 5 }, { servidor: "https://ntfy.example/", token: "tk", fetchImpl: ok });
  assert.equal(llamada.url, "https://ntfy.example/");
  assert.equal(llamada.init.method, "POST");
  assert.equal(llamada.init.headers.Authorization, "Bearer tk");
  assert.equal(JSON.parse(llamada.init.body).priority, 5);
  const mal = async () => ({ ok: false, status: 503 });
  await assert.rejects(() => enviarNtfy({ topic: "t", message: "m" }, { fetchImpl: mal }), /503/);
});
