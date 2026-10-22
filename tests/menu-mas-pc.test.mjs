import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../public/legacy/germania-menu-compacto.js",import.meta.url),"utf8");

test("PC/tablet: se oculta el ☰ del encabezado y la pestaña «Más» abre el mismo menú",()=>{
  assert.match(html,/@media\(min-width:701px\)\{\.g-sticky-shell \.masthead \.menu-toggle\{display:none!important\}\}/);
  assert.match(html,/<button type="button" class="tab-mas" id="tabMas" data-mas[^>]*>Más<\/button>/);
  assert.match(html,/@media\(max-width:700px\)\{\.tab-mas\{display:none!important\}\}/);
  // #menuToggle sigue en la página: «Más» (PC y celular) lo acciona por código.
  assert.match(html,/id="menuToggle"/);
  assert.match(js,/getElementById\("tabMas"\)[\s\S]*toggle\.click\(\)/);
});

test("«Más» no usa data-tab (no interfiere con __mostrarPestana) y el menú conserva sus accesos",()=>{
  const boton=html.match(/<button[^>]*id="tabMas"[^>]*>/)[0];
  assert.ok(!/data-tab/.test(boton));
  for(const d of ["estado","historial","panel"])assert.ok(html.includes('<button type="button" data-go="'+d+'"'),"Falta "+d);
  assert.ok(html.includes("data-ayuda-toggle"));
});
