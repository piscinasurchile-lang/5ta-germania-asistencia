import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
test("el PDF de la Hoja de servicio solo trae la hora; sin llegada, control, kilometrajes ni horómetro",()=>{
  const i=app.indexOf('"HOJA DE SERVICIO · UNIDAD B-5"'),pdf=app.slice(i,i+1500);
  assert.ok(i>0);
  assert.match(pdf,/head:\[\["Hora"\]\]/);
  assert.match(pdf,/body:\[\[g\("svHoraSalida"\)\]\]/);
  assert.doesNotMatch(pdf,/Hora llegada|Hora control|Km salida|Km llegada|Horómetro|svKm|svHorometro|svHoraLlegada|svHoraControl/);
});
