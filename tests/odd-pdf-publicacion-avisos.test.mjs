import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('public/legacy/index.html');
const atajo=read('public/legacy/germania-odd-pdf-publicar.js');
const ui=read('public/legacy/germania-odd-archivo.js');
const api=read('app/api/odd-archivo/route.js');
const app=read('public/legacy/app.js');
test('ODD PDF conserva el botón existente de Oficiales y el aviso textual',()=>{
 const start=html.indexOf('id="informacionesPublicarCard"'),end=html.indexOf('id="buscadorPersona"',start);const card=html.slice(start,end);
 assert.ok(start>=0&&end>start);assert.match(card,/id="novedadAgregar"/);assert.match(card,/id="oddPdfPublicarBtn"/);
 assert.match(html,/<details class="card solo-oficiales" id="informacionesPublicarCard">/);
 assert.equal((html.match(/id="oddPdfPublicarBtn"/g)||[]).length,1);
});
test('subida usa publicación inmutable y revisión de la disposición; no permite reemplazar PDF',()=>{
 assert.doesNotThrow(()=>new vm.Script(atajo));assert.doesNotThrow(()=>new vm.Script(ui));
 assert.match(atajo,/GermaniaODD\.abrirPublicar/);assert.match(ui,/Obtener resumen del PDF/);assert.match(ui,/Qué dispone esta ODD/);
 assert.match(ui,/dejaSinEfecto/);assert.match(api,/validarPublicacion/);assert.match(api,/publicarConPDF/);
 assert.doesNotMatch(atajo,/Reemplazar su PDF|publicarAvisoOdd/);
 assert.match(app,/Los originales no se modifican/);assert.match(app,/publica una nueva que lo disponga/);
});
test('ODD se incorpora al archivo y al aviso por persona; PDF anterior sigue disponible',()=>{
 assert.match(api,/destinatarios:\['voluntarios'\]/);assert.match(ui,/archivo-odd|odd-archivo/);
 assert.match(ui,/api\(\{accion:'leer'/);assert.match(ui,/sinEfectoPor/);
 assert.match(app,/function abrirPdfAviso\(clave\)/);assert.match(ui,/abrirPdfAviso\(d\.pdf\)/);
});
