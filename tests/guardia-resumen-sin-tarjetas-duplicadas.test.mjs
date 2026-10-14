import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const roles=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
const mainIndex=roles.indexOf("function panelInfo(pn,D){");
const endIndex=roles.indexOf("async function guardarHorario(D){",mainIndex);
assert.ok(mainIndex>=0 && endIndex>mainIndex,"Se debe conservar panelInfo");
const info=roles.slice(mainIndex,endIndex);

test("oculta solamente las tarjetas verdes de cada noche en resumen informativo",()=>{
 assert.doesNotMatch(info,/D\.cov\.map\(function\(c\)/);
 assert.doesNotMatch(info,/gr-nc-body|gr-nc-top/);
 assert.match(info,/Cobertura de la semana/);
 assert.match(info,/completas=D\.cov\.filter/);
});
test("mantiene estadísticas, historial de inscripciones y horarios editables",()=>{
 for(const texto of ["No se inscribieron:","Estadística de inscripción:",
 "Consultar historial de inscripciones","Horario de las noches","hrGuardar","guardarHorario(D)"])
 assert.ok(info.includes(texto),texto);
 assert.match(info,/historialInscripciones\(D\)/);
});
test("no altera la gestión de dotación ni las aprobaciones",()=>{
 for(const name of ["function revCargar(","async function revGuardar(","function propuesta(","function panelInfo("])
 assert.ok(roles.includes(name),name);
 assert.match(roles,/guardia-revision:/);
});
