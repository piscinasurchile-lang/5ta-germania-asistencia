import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const fuente=r=>readFileSync(new URL(r,import.meta.url),"utf8");
const html=fuente("../public/legacy/index.html");
const css=fuente("../public/legacy/germania-inicio.css");
const js=fuente("../public/legacy/germania-oficiales-menu.js");
const app=fuente("../public/legacy/app.js");
const inicio=html.indexOf('id="ofMenuAgrupado"');
const fin=html.indexOf('<!-- ODD legacy retirado',inicio);
const menu=html.slice(inicio,fin);

test("18 funciones preservadas en cuatro grupos, sin un menú infinito",()=>{
  assert.ok(inicio>0&&fin>inicio);
  const grupos=[...menu.matchAll(/<details class="of-grupo of-grupo-([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(grupos,["guardias","personas","material","administracion"]);
  const originales=[...menu.matchAll(/<button class="subtab(?: active)?"/g)];
  assert.equal(originales.length,18);
  const areas=[...menu.matchAll(/<div class="of-grupo-botones" aria-label="([^"]+)">([\s\S]*?)<\/div>/g)];
  assert.equal(areas.length,4);
  assert.deepEqual(areas.map(a=>[...a[2].matchAll(/<button class="subtab/g)].length),[4,8,2,4]);
});

test("mantiene los destinos, IDs de subpaneles y cargas bajo demanda existentes",()=>{
  for(const destino of ["oficialidad","precedencia","nomina","hoja","ingreso","cursos","eppPersonal","alertas","inventariob5","mantencionesb5","correlativos","tipos","importar","bajas"]){
    assert.ok(menu.includes('data-sub="'+destino+'"'),"Falta acceso "+destino);
    assert.ok(html.includes('id="sub-'+destino+'"'),"Falta subpanel "+destino);
  }
  for(const nav of ["'/odd-maestras'","'guardia'","'panel'","'historial'"])
    assert.ok(menu.includes(nav),"Falta navegación "+nav);
  assert.ok(app.includes('document.querySelectorAll(".subtab").forEach(s=>{'));
  assert.ok(app.includes('if(!s.dataset.sub) return;'));
  assert.ok(app.includes('if(s.dataset.sub==="nomina")'));
});

test("desplegables nativos inicialmente cerrados, máximo uno abierto",()=>{
  assert.ok(menu.includes('<details class="of-grupo'));
  assert.equal((menu.match(/<details /g)||[]).length,4);
  assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(menu));
  assert.match(js,/addEventListener\("toggle"/);
  assert.match(js,/otro!==grupo&&otro\.open/);
  assert.match(js,/otro\.open=false/);
});

test("estilos con cuatro contornos identificables, aislamiento y controles táctiles",()=>{
  for(const g of ["guardias","personas","material","administracion"])
    assert.ok(css.includes("#panel-config #configContenido .of-grupo-"+g)||g==="guardias","Falta estilo "+g);
  for(const color of ["#ffcc00","#3295ff","#ff3645","#b85af3"])assert.ok(css.includes(color),color);
  assert.match(css,/#panel-config #configContenido \.of-grupo-botones \.subtab/);
  assert.match(css,/min-height:48px/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html,/germania-oficiales-menu\.js\?v=20261010a/);
  assert.match(html,/germania-inicio\.css\?v=20261010d/);
});
