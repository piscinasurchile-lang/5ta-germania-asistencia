import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const ayuda=readFileSync(new URL("../public/legacy/germania-ayuda.js",import.meta.url),"utf8");
const app=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
test("la Hoja de servicio ya no tiene el botón «Marcar todos como no concurre»",()=>{
  assert.doesNotMatch(html,/svLimpiarBtn/);
  assert.doesNotMatch(html,/Marcar todos como no concurre/);
  assert.doesNotMatch(ayuda,/svLimpiarBtn/);
});
test("la lista de concurrencia y el guardado se conservan",()=>{
  assert.match(html,/<tbody id="svBody">/);
  assert.match(html,/id="svGuardarBtn"/);
});
test("app.js tolera que el botón no exista (no se edita app.js)",()=>{
  assert.match(app,/if\(lb\) lb\.disabled=svBloqueado/);
  assert.match(app,/function on\(id,evento,fn\)\{\s*const el=document\.getElementById\(id\);\s*if\(el\)/);
});
