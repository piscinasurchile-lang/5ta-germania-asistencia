import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const leer = ruta => readFileSync(new URL(ruta, import.meta.url), "utf8");
const cliente = leer("../public/legacy/germania-push-bienvenida.js");
const html = leer("../public/legacy/index.html");
const css = leer("../public/legacy/germania-inicio.css");

test("la invitación vive en Inicio y no interrumpe el B-5", () => {
  assert.doesNotThrow(() => new vm.Script(cliente));
  assert.match(html, /id="g-push-bienvenida"[^>]*hidden/);
  assert.match(html, /id="g-push-autorizar"/);
  assert.match(html, /germania-push-bienvenida.js/);
  assert.match(css, /g-push-bienvenida\[hidden\]/);
  assert.match(cliente, /b5dest/);
  assert.match(cliente, /Notification\.requestPermission\(\)/);
  assert.match(cliente, /fetch\("\/api\/push\/suscripcion"/);
  assert.doesNotMatch(cliente, /push\/prueba/);
});

function iniciar({permiso = "default", bloqueado = false} = {}) {
  const ids = Object.fromEntries(["g-push-bienvenida", "g-push-autorizar", "g-push-estado"]
    .map(id => [id, {hidden: true, disabled: false, textContent: "", listeners: {},
      addEventListener(event, fn) { this.listeners[event] = fn; }}]));
  const acceso = {hidden: false};
  const tarjeta = ids["g-push-bienvenida"];
  const boton = ids["g-push-autorizar"];
  const push = {toJSON: () => ({
    endpoint: "https://fcm.googleapis.com/fcm/send/fake",
    keys: {auth: "sample", p256dh: "sample"}
  })};
  const registro = {pushManager: {
    getSubscription: async () => null,
    subscribe: async () => push
  }};
  const llamadas = {get: 0, post: 0, permiso: 0, registro: 0};
  const notification = {
    permission: permiso,
    requestPermission: async () => {
      llamadas.permiso += 1;
      notification.permission = "granted";
      return "granted";
    }
  };
  const clave = Buffer.concat([Buffer.from([4]), Buffer.alloc(64)]).toString("base64url");
  const entorno = {
    document: {
      getElementById: id => ids[id],
      querySelector: () => acceso
    },
    window: {
      parent: {location: {search: bloqueado ? "?b5dest=lista" : ""}},
      Notification: notification,
      PushManager: function PushManager() {},
      isSecureContext: true
    },
    navigator: {serviceWorker: {
      ready: Promise.resolve(registro),
      register: async () => {llamadas.registro += 1; return registro;}
    }},
    Notification: notification,
    localStorage: {getItem: () => null},
    URLSearchParams, Uint8Array, Error, JSON,
    atob: value => Buffer.from(value, "base64").toString("binary"),
    fetch: async (url, options = {}) => {
      if (url !== "/api/push/suscripcion") throw Error("ruta inesperada");
      if (options.method === "POST") {
        llamadas.post += 1;
        return {ok: true, json: async () => ({ok: true})};
      }
      llamadas.get += 1;
      return {ok: true, json: async () => ({disponible: true, publicKey: clave})};
    }
  };
  vm.runInNewContext(cliente, entorno);
  return {ids, acceso, tarjeta, boton, llamadas, notification};
}

const terminar = () => new Promise(resolve => setTimeout(resolve, 0));

test("primer ingreso solicita permiso solo tras un toque y luego elimina la ficha", async () => {
  const app = iniciar();
  await terminar();
  assert.equal(app.tarjeta.hidden, false);
  assert.equal(app.llamadas.permiso, 0);
  assert.equal(app.llamadas.post, 0);
  await app.boton.listeners.click();
  assert.equal(app.llamadas.permiso, 1);
  assert.equal(app.llamadas.post, 1);
  assert.equal(app.tarjeta.hidden, true);
  assert.equal(app.acceso.hidden, true);
});

test("con permiso previo registra automáticamente y nunca solicita permiso otra vez", async () => {
  const app = iniciar({permiso: "granted"});
  await terminar();
  assert.equal(app.llamadas.post, 1);
  assert.equal(app.llamadas.permiso, 0);
  assert.equal(app.tarjeta.hidden, true);
});

test("en tablet B-5 no intenta suscribir ni interrumpe el panel", async () => {
  const app = iniciar({bloqueado: true});
  await terminar();
  assert.equal(app.llamadas.get, 0);
  assert.equal(app.llamadas.post, 0);
  assert.equal(app.tarjeta.hidden, true);
});
