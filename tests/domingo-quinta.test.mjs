import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validarInscripcion,validarVoluntarioId,domingoSiguiente,convocatoriaAbierta} from "../lib/domingo-quinta.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("domingo correspondiente en Chile",()=>{
 assert.equal(domingoSiguiente(new Date("2026-10-17T18:00:00Z")),"2026-10-18");
 assert.equal(domingoSiguiente(new Date("2026-10-14T12:00:00Z")),"2026-10-18");
});
test("validación de turnos y menú",()=>{
 assert.deepEqual(validarInscripcion({voluntarioId:"517",turnos:[3,1,3],comida:"si",ayuda:true}),{voluntarioId:"517",turnos:[1,3],comida:"si",ayuda:true});
 assert.equal(validarInscripcion({voluntarioId:"517",turnos:[4],comida:"si"}),null);
 assert.equal(validarInscripcion({voluntarioId:"",turnos:[],comida:"si"}),null);
});
test("script y ruta compilables",()=>{
 assert.doesNotThrow(()=>new Function(read("public/legacy/germania-domingo-quinta.js")));
 assert.match(read("app/api/domingo-quinta/route.js"),/writeState/);
});
test("pantalla individual integrada",()=>{
 assert.match(read("public/legacy/index.html"),/id="domingoQuinta"/);
 assert.match(read("public/legacy/index.html"),/germania-domingo-quinta.js/);
 assert.match(read("public/legacy/germania-domingo-quinta.js"),/miVoluntario/);
});

test("la encuesta abre el sábado 12:45 hora de Chile",()=>{
 assert.equal(convocatoriaAbierta(new Date("2026-10-17T15:44:00Z")),false);
 assert.equal(convocatoriaAbierta(new Date("2026-10-17T15:45:00Z")),true);
 assert.equal(convocatoriaAbierta(new Date("2026-10-18T15:00:00Z")),true);
 assert.equal(convocatoriaAbierta(new Date("2026-10-19T15:00:00Z")),false);
});
test("el servidor bloquea guardar fuera de horario",()=>{
 const api=read("app/api/domingo-quinta/route.js");
 assert.match(api,/if\(!convocatoriaAbierta\(\)\)/);
 assert.match(api,/inscripciones_cerradas/);
});

test("inscripciones en Neon con control de versiones",()=>{const api=read("app/api/domingo-quinta/route.js");assert.match(api,/readState/);assert.match(api,/writeState/);assert.match(api,/ifVersion:previo.version/);assert.match(api,/originOk/);});
test("UI permite guardar y recuperar por nombre",()=>{const ui=read("public/legacy/germania-domingo-quinta.js");assert.match(ui,/async function guardar/);assert.match(ui,/voluntarioId:selector.value/);assert.match(ui,/d.propia/);});

test("admite IDs reales alfanuméricos sin aceptar rutas",()=>{
 assert.equal(validarVoluntarioId("vol-123"),true);
 assert.equal(validarVoluntarioId("8f6e2f90-2ab0-4d2c-9f8a-39b124eea001"),true);
 assert.equal(validarVoluntarioId("../otro"),false);
 assert.equal(validarVoluntarioId(""),false);
 assert.equal(validarInscripcion({voluntarioId:"vol-123",turnos:[1],comida:"si",ayuda:true}).voluntarioId,"vol-123");
});

test("la lectura usa la misma validación de ID que el guardado",()=>{
 const api=read("app/api/domingo-quinta/route.js");
 assert.match(api,/id&&validarVoluntarioId\(id\)/);
 assert.doesNotMatch(api,/id&&\/\^\\d/);
});
test("la modificación usa clave única por fecha y voluntario",()=>{
 const api=read("app/api/domingo-quinta/route.js");
 assert.match(api,/const key=\(fecha,id\)/);
 assert.match(api,/ifVersion:previo.version/);
});
