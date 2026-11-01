import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const app=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
const panel=html.slice(html.indexOf('id="panel-servicio"'),html.indexOf('<h2>Lugar del servicio</h2>'));
const visible=panel.slice(0,panel.indexOf("Campos retirados"));
test("la tarjeta ya no muestra título ni texto de la Hoja de servicio",()=>{
  assert.doesNotMatch(visible,/Hoja de servicio · Unidad B-5/);
  assert.doesNotMatch(visible,/Se llena solo cuando el carro sale/);
});
test("quedan visibles solo Fecha, Tipo de actividad (con agregar) y Hora",()=>{
  for(const id of ["svFecha","svTipoAct","svTipoActNuevo","svTipoActAgregarBtn","svHoraSalida"])assert.match(visible,new RegExp('id="'+id+'"'));
  assert.match(visible,/<label for="svHoraSalida">Hora<\/label>/);
  for(const id of ["svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada","svHorometro"])assert.doesNotMatch(visible,new RegExp('id="'+id+'"'));
});
test("los campos retirados siguen en el documento, ocultos, porque app.js los lee",()=>{
  const oculto=panel.slice(panel.indexOf("Campos retirados"));
  assert.match(oculto,/style="display:none;"/);
  for(const id of ["svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada","svHorometro"])assert.match(oculto,new RegExp('id="'+id+'"'));
});
test("todos los campos de SV_CAMPOS existen en el documento",()=>{
  const lista=app.match(/const SV_CAMPOS=\[([\s\S]*?)\];/)[1].match(/"(sv\w+)"/g).map(x=>x.slice(1,-1));
  for(const id of lista)assert.match(html,new RegExp('id="'+id+'"'),id);
});
test("la ficha de combustible condicional se conserva",()=>assert.match(visible,/id="svFichaCombustible"/));
