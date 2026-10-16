import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {prepararPartePDF,crearArchivoPartePDF} from "../lib/b5-parte-pdf.mjs";

const item={id:"x1",tipo:"lista",estado:"sincronizado",numero:6,
  datos:{date:"2026-10-15",tipo:"Academia",records:{a:"presente",b:"ausente",c:"justificado"}}};
const nomina=[
  {id:"a",nombre:"Ana",apellidoPaterno:"González",apellidoMaterno:"Jerez",cargo:"Voluntaria",clave:"45"},
  {id:"b",nombre:"Luis",apellidoPaterno:"Pérez",cargo:"Voluntario",clave:"504"},
  {id:"c",nombre:"María",apellidoPaterno:"López",cargo:"Voluntaria",clave:"503"}
];
const datos={...item.datos,detalle:"Capacitación",registradoPor:"Teniente B-5"};

test("PDF oficial conserva correlativo asignado y sólo muestra presentes",()=>{
  const p=prepararPartePDF(item,datos,nomina);
  assert.equal(p.numero,"006/2026");
  assert.equal(p.fecha,"15-10-2026");
  assert.equal(p.total,1);
  assert.equal(p.presentes[0].nombre,"Ana González Jerez");
  assert.equal(p.presentes[0].clave,"45");
  assert.equal(p.presentes.find(x=>x.nombre.includes("Luis")),undefined);
  assert.equal(p.presentes.find(x=>x.nombre.includes("María")),undefined);
});
test("rechaza emitir documentos oficiales para pendientes y anulados",()=>{
  assert.throws(()=>prepararPartePDF({...item,estado:"pendiente"},datos,nomina),/sincronizado/);
  assert.throws(()=>prepararPartePDF(item,{...datos,anulado:true},nomina),/anulado/);
});
test("no inventa voluntarios presentes si todos están ausentes",()=>{
  const p=prepararPartePDF(item,{...datos,records:{a:"ausente",b:"ausente",c:"justificado"}},nomina);
  assert.equal(p.total,0);
  assert.deepEqual(p.presentes,[]);
});
test("jsPDF genera documento completo con membrete y filas",async()=>{
  const p=prepararPartePDF(item,datos,nomina);
  const {blob,nombre}=await crearArchivoPartePDF(p);
  assert.equal(blob.type,"application/pdf");
  assert.ok(blob.size>1500);
  assert.match(nombre,/006-2026/);
});
test("la captura exige confirmación antes de guardar o corregir",()=>{
  const source=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
  assert.match(source,/onClick=\{solicitarGuardar\}/);
  assert.match(source,/onClick=\{solicitarCorreccion\}/);
  assert.match(source,/role="dialog" aria-modal="true"/);
  assert.match(source,/Sí, estoy seguro · Guardar/);
  assert.match(source,/No, revisar de nuevo/);
  assert.match(source,/setConfirmacion\(\{modo:"nuevo"/);
  assert.match(source,/setConfirmacion\(\{modo:"correccion"/);
  assert.match(source,/onClick=\{\(\)=>compartirParte\(x,"pdf"\)\}/);
  assert.match(source,/onClick=\{\(\)=>compartirParte\(x,"whatsapp"\)\}/);
});
