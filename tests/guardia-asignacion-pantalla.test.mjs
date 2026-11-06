import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {GET}=await import('../app/guardia/asignacion/route.js');
test('la ruta mantiene el prototipo aprobado y entrega solamente sus controles operativos',async()=>{
 const original=await readFile('prototypes/germania-revision-simplificada.html','utf8');
 const r=await GET(new Request('https://germania.example/guardia/asignacion?integrada=1'));
 const html=await r.text();assert.equal(r.status,200);
 for(const id of ['days','people','toggle','addPerson','add','done','save','week','publish'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const text of ['Vista de prueba · Mi espacio','id="viewer"','id="myspace"','id="reset"','Restablecer datos de prueba','localStorage'])assert.ok(!html.includes(text),text);
 assert.ok(html.includes('<body class="integrada">'));
 assert.ok(html.includes('germania-guardia-asignacion.js?v=20261106textos1'));
 assert.ok(original.includes('Restablecer datos de prueba'),'se conserva el archivo aprobado intacto');
});
