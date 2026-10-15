import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const html=read("../public/legacy/index.html");
const atajo=read("../public/legacy/germania-odd-pdf-publicar.js");
const app=read("../public/legacy/app.js");

test("ODD PDF se incorpora a Avisos de Oficiales sin quitar el aviso textual",()=>{
 const start=html.indexOf('id="informacionesPublicarCard"');
 const end=html.indexOf('id="buscadorPersona"',start);
 const card=html.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(card,/id="novedadAgregar"/);
 assert.match(card,/id="oddPdfPublicarBtn"/);
 assert.match(card,/Subir ODD PDF para todos/);
 assert.match(html,/germania-odd-pdf-publicar\.js\?v=20261015oddpdf1/);
 assert.ok(html.indexOf("germania-odd-pdf-publicar.js")>html.indexOf("app.js?v="));
});
test("formulario utiliza la misma publicación ODD, no el canal de pruebas",()=>{
 assert.doesNotThrow(()=>new vm.Script(atajo));
 assert.match(atajo,/await publicarAvisoOdd/);
 assert.match(atajo,/await cargarAvisosOdd/);
 assert.match(atajo,/puedeAdministrar\(yo\)/);
 assert.match(atajo,/archivo\.size>1536\*1024/);
 assert.match(atajo,/instanteChile\(hasta,"23:59"\)/);
 assert.match(atajo,/Reemplazar su PDF/);
 assert.doesNotMatch(atajo,/\/api\/informaciones\/prueba/);
 assert.doesNotMatch(atajo,/fetch\([^)]*,\s*\{\s*method:\s*["']POST/);
});
test("ODD publicada es visible a voluntarios y permite abrir el PDF existente",()=>{
 assert.match(app,/const AVISOS_ODD_KEY="odd-avisos:v1"/);
 assert.match(app,/destinatarios:\["voluntarios"\]/);
 assert.match(app,/visibleHasta/);
 assert.match(app,/async function renderAvisosOdd\(forzar\)/);
 assert.match(app,/function abrirPdfAviso\(clave\)/);
 assert.match(app,/if\(pdf\) pdf.onclick=\(\)=>abrirPdfAviso\(a\.pdf\)/);
 assert.match(atajo,/avisoGuardado\("ok"/);
});
