import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const leer=(p)=>readFileSync(new URL(p,import.meta.url),"utf8");
const app=leer("../public/legacy/app.js");
const css=leer("../public/legacy/germania-inicio.css");
const html=leer("../public/legacy/index.html");
const cierre=leer("../public/legacy/germania-cierre-libro.js");

test("Inicio presenta número, título completo y PDF de cada ODD dentro de un único panel",()=>{
  const start=app.indexOf("async function renderAvisosOdd(forzar)");
  const end=app.indexOf("function mostrarToastOdd(",start);
  assert.ok(start>0&&end>start);
  const renderer=app.slice(start,end);
  assert.match(renderer,/odd-home-panel/);
  assert.match(renderer,/odd-home-lista/);
  assert.match(renderer,/odd-home-numero/);
  assert.match(renderer,/odd-home-titulo/);
  assert.match(renderer,/odd-home-subtitulo/);
  assert.match(renderer,/a\.numero/);
  assert.match(renderer,/a\.titulo/);
  assert.match(renderer,/a\.pdf\?"PDF disponible"/);
  assert.match(renderer,/lista\.slice\(0,3\)/);
  assert.match(renderer,/Ver todas/);
  assert.match(renderer,/data-aviso-odd/);
  assert.doesNotMatch(renderer,/white-space:nowrap|text-overflow:ellipsis/);
  assert.match(css,/\.odd-home-titulo\{/);
  assert.match(css,/overflow-wrap:anywhere/);
  assert.match(css,/color:#fff/);
  assert.match(css,/\.odd-home-lista\{display:grid/);
});

test("nuevas ODD siguen abriéndose con el modal y PDF existente",()=>{
  assert.match(app,/function abrirDetalleOdd\(id\)/);
  assert.match(app,/marcarAvisoVisto\(id\)/);
  assert.match(app,/if\(pdf\) pdf\.onclick=\(\)=>abrirPdfAviso\(a\.pdf\)/);
  assert.match(app,/function abrirPdfAviso\(clave\)/);
  const match=app.match(/const AVISOS_ODD_KEY="odd-avisos:v1"/);
  assert.ok(match);
});

test("resúmenes de guardia se compactan solo en Inicio; los controles operativos siguen intactos",()=>{
  assert.match(css,/#panel-germania #lgnAdminHome \.lgn-control-totales\{/);
  assert.match(css,/#panel-germania #lgnAdminHome #lgnAdminAbrir\{/);
  assert.match(css,/#panel-germania #inicioNovedades\.home-alert\{/);
  assert.match(css,/#panel-germania \.home-tiles \.tile\{/);
  assert.match(cierre,/function pintarControlAdmin\(\)/);
  assert.match(cierre,/function abrirPanelMando\(\)/);
  assert.match(cierre,/function pintarOBAC\(\)/);
  assert.match(html,/germania-inicio\.css\?v=20261015oddcompact1/);
  assert.doesNotMatch(css,/#panel-guardia\b|#panel-control-guardia-diaria\b|#panel-b5\b/);
});

test("los archivos JavaScript originales y el CSS mantienen sintaxis válida",()=>{
  assert.doesNotThrow(()=>new vm.Script(app));
  assert.doesNotThrow(()=>new vm.Script(cierre));
  assert.ok(!css.includes("<script"));
});
