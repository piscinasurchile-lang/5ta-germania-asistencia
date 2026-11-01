import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
test("fecha, tipo de actividad y hora son obligatorios y quedan marcados",()=>{
  assert.match(app,/const SV_OBLIGATORIOS=\[\["svFecha","la fecha"\],\["svTipoAct","el tipo de actividad"\],\["svHoraSalida","la hora"\]\];/);
  assert.match(app,/el\.required=true; el\.setAttribute\("aria-required","true"\)/);
});
test("guardar exige los tres campos antes de pedir confirmación, y otra vez al confirmar",()=>{
  const g=app.indexOf('on("svGuardarBtn","click"');
  const clic=app.slice(g,g+260);
  assert.ok(clic.indexOf("svExigirObligatorios()")>0&&clic.indexOf("svExigirObligatorios()")<clic.indexOf("mostrarConfirmarSv()"));
  const c=app.indexOf('document.getElementById("confirmarGuardarSvBtn").onclick');
  assert.match(app.slice(c,c+200),/if\(!svExigirObligatorios\(\)\) return;/);
});
test("ya no se guarda con hora vacía bajo la clave «sin-hora»",()=>{
  assert.match(app,/function svFaltantes\(\)/);
});
