import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../public/legacy/germania-cierre-libro.js",import.meta.url),"utf8");
const i=src.indexOf("function htmlEditorNoche");
const editor=src.slice(i,src.indexOf("const ERRORES_RATIF",i));
test("editor de noche: reemplazar, no llegó o justificar con marca, sin texto de motivo",()=>{
  for(const t of ["Asistió","No llegó","Justificado","Reemplazado por…"])assert.ok(editor.includes(t),t);
  assert.ok(!/type="text"|prompt\(|externo|rezagad/i.test(editor));
});
test("guardado limpio: justificar = marca automática; reemplazo del conductor exige reemplazante y fija el efectivo",()=>{
  const g=src.slice(src.indexOf("async function guardarNocheLimpia"),src.indexOf("async function ratificar"));
  assert.ok(g.includes('excusas[id]="Justificado"'));
  assert.ok(g.includes("conductorEfectivoId=condEf")&&g.includes("obacEfectivoId=obacEf"));
  assert.ok(!/prompt\(/.test(g));
});
