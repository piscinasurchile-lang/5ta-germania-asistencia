import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validarInscripcion,domingoSiguiente,convocatoriaAbierta} from "../lib/domingo-quinta.mjs";
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
 assert.match(read("app/api/domingo-quinta/route.js"),/ON CONFLICT/);
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
 assert.match(api,/Inscripciones cerradas/);
});

test("no se permiten inscripciones anónimas mientras se valida identidad",()=>{
 const api=read("app/api/domingo-quinta/route.js");
 assert.match(api,/Inscripción suspendida hasta validar identidad/);
 const ui=read("public/legacy/germania-domingo-quinta.js");
 assert.match(ui,/id="dq-guardar" disabled/);
 assert.doesNotMatch(ui,/async function guardar\(/);
 assert.match(ui,/const mi=null/);
});

test("no se simula notificación roja individual sin registro de lectura",()=>{
 const ui=read("public/legacy/germania-domingo-quinta.js");
 assert.match(ui,/const pending=false/);
 assert.match(ui,/id="dq-guardar" disabled/);
});
