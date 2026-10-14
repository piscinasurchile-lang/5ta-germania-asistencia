import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
const odd=readFileSync(new URL("../app/odd-maestras/page.js",import.meta.url),"utf8");
const start=js.indexOf("function gnHistorialSemana("),stop=js.indexOf("async function gnHistorialLeerPrefijo(",start);
assert.ok(start>=0&&stop>start,"funciones de semana deben estar accesibles");
const gnAdd=(iso,n)=>{const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const helpers=new Function("gnAdd",js.slice(start,stop)+"\nreturn {gnHistorialSemana,gnHistorialEtiqueta};")(gnAdd);

test("selector usa semanas exactas miércoles a martes; 8-14 de octubre no corresponde a la semana actual",()=>{
 assert.equal(helpers.gnHistorialSemana("2026-10-14"),"2026-10-14");
 assert.equal(helpers.gnHistorialSemana("2026-10-20"),"2026-10-14");
 assert.equal(helpers.gnHistorialSemana("2026-10-21"),"2026-10-21");
 assert.equal(helpers.gnHistorialSemana("2026-10-08"),"2026-10-07");
 assert.equal(gnAdd(helpers.gnHistorialSemana("2026-10-14"),6),"2026-10-20");
 assert.match(helpers.gnHistorialEtiqueta("2026-10-14"),/14 al 20 de octubre de 2026/);
});
test("no inventa fechas ni mezcla semanas al cruzar mes y año",()=>{
 assert.equal(helpers.gnHistorialSemana("2027-01-01"),"2026-12-30");
 assert.equal(gnAdd(helpers.gnHistorialSemana("2027-01-01"),6),"2027-01-05");
 assert.equal(helpers.gnHistorialSemana("2026-02-30"),"");
 assert.equal(helpers.gnHistorialSemana(""),"");
});
test("pantalla conserva tabla, oficiales, estadísticas y añade selector y botones compactos",()=>{
 for(const id of ["gnTablaSemanal","gnTablaActualizar","gnTablaPdf","gnOddMaestras",
 "gnHistorialSelect","gnHistorialVer","gnHistorialPdf","gnHistorialOdd",
 "gnHistorialDetalle","gnResumen","gnLista","gnPdfEstad","gnInfo","btnOficialesGuardia"])
 assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/Informes adicionales y estadísticas/);
 assert.match(html,/class="btn small secondary" type="button" id="gnHistorialPdf"/);
});
test("historial de siete noches es solo lectura y PDF no acredita asistencia",()=>{
 const inicio=js.indexOf("async function gnHistorialDatos("),fin=js.indexOf("on(\"gnOddMaestras\",",inicio);
 const bloque=js.slice(inicio,fin);
 assert.match(bloque,/return dias\.map\(fecha=>/);
 assert.match(bloque,/gnHistorialLeerPrefijo\(prefijo\)/);
 assert.match(bloque,/gnHistorialPdfHeader\(doc/);
 assert.match(bloque,/[Nn]o certifica asistencia efectiva ni acreditación/);
 assert.doesNotMatch(bloque,/\bsSet\s*\(|\bgnSavePlan\s*\(|\bsetGuardia\s*\(/);
 assert.match(js,/document\.getElementById\("gnHasta"\)\.value=gnAdd\(semana,6\)/);
});
test("Generar ODD recibe el miércoles seleccionado y no sobrescribe datos de la guardia",()=>{
 assert.match(js,/odd-maestras\?tipo=guardia&inicio=/);
 assert.match(odd,/setGuardDate\(ini\)/);
 assert.match(odd,/fechasSemanaGuardia\(ini\)/);
});
