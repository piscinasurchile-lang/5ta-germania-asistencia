import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const modulo=readFileSync(new URL("../public/legacy/germania-estadistica-individual.js",import.meta.url),"utf8");
const index=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const app=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
const cierres=readFileSync(new URL("../public/legacy/germania-cierre-libro.js",import.meta.url),"utf8");

function preparar(){
 const window={};
 vm.runInNewContext(modulo,{window,console});
 return window.GermaniaEstadisticaIndividual;
}
const p={id:"517",nombre:"Christian",apellidoPaterno:"Vergara",apellidoMaterno:"Sandoval"};
const partes=[
 {date:"2026-10-10",tipo:"Citacion",detalle:"Junta",records:{"517":"presente"},origenAsistencia:"odd_5ta_citacion"},
 {date:"2026-10-12",tipo:"Llamado",detalle:"Incendio",records:{"517":"ausente"},origenAsistencia:"emergencia_b5"},
 {date:"2026-10-13",tipo:"Curso",records:{"517":"justificado"},origenAsistencia:"curso_anb_citacion"},
 {date:"2026-10-14",tipo:"Otro",records:{"517":"presente"},eligibleIds:["otro"],origenAsistencia:"citacion_manual"},
 {date:"2026-10-15",tipo:"Guardia",records:{"517":"presente"},origenAsistencia:"guardia"}
];
test("consulta individual usa solo obligaciones reales del voluntario",()=>{
 const res=preparar().recopilar(p,partes,()=>true,(pt,id)=>!pt.tipo.includes("Guardia")&&(!pt.eligibleIds||pt.eligibleIds.includes(id)),pt=>pt.origenAsistencia);
 assert.equal(res.obligaciones,3);
 assert.equal(res.presentes,1);
 assert.equal(res.ausentes,1);
 assert.equal(res.justificados,1);
 assert.ok(Math.abs(res.porcentaje-33.333333)<0.0001);
 assert.equal(res.filas[0].fecha,"2026-10-13");
});
test("sin obligaciones el porcentaje es cero, sin registros inventados",()=>{
 const res=preparar().recopilar(p,[],()=>true,()=>true,()=> "");
 assert.equal(res.obligaciones,0);
 assert.equal(res.porcentaje,0);
 assert.equal(res.filas.length,0);
});
test("tabla compacta separada de un único selector individual y PDF",()=>{
 assert.match(index,/id="pnPersonaSelect"/);
 assert.match(index,/id="pnPersonaPdf"/);
 assert.match(index,/id="pnInicio"[^>]*>Volver al inicio/);
 assert.match(index,/<th class="name-col">Apellido<\/th><th>Asist\.<\/th><th>Citac\.<\/th><th>%<\/th>/);
 assert.match(index,/germania-estadistica-individual\.js\?v=20261015a/);
 assert.doesNotMatch(app,/await detalleVoluntario/);
 assert.match(app,/GermaniaEstadisticaIndividual\?\.render/);
 assert.doesNotMatch(modulo,/\bfetch\s*\(|localStorage|sessionStorage|method:"POST"/);
});
test("control separado cuenta cierres OBAC y aprobaciones de oficiales (sin acreditación T3)",()=>{
 assert.match(cierres,/resumen\.cerradas\+\+/);
 assert.match(cierres,/resumen\.acreditadas\+\+/);
 assert.match(cierres,/Cierres OBAC recibidos/);
 assert.match(cierres,/"Aprobadas"/);
 assert.doesNotMatch(cierres,/Acreditadas T3|resumen\.finales/);
 assert.match(cierres,/window\.__mostrarPestana\("control-guardia-diaria"\)/);
});
