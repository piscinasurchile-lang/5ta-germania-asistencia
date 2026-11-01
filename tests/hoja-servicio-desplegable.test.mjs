import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
const i=html.indexOf('id="panel-servicio"'),panel=html.slice(i,html.indexOf("<h2>Lugar del servicio</h2>"));
test("la tarjeta de fecha, tipo y hora es desplegable y parte abierta",()=>{
  assert.match(panel,/<details class="sv-desplegable" open>\s*<summary><h2>Hoja de servicio<\/h2><\/summary>/);
  assert.equal((panel.match(/<details/g)||[]).length,1);
  assert.equal((panel.match(/<\/details>/g)||[]).length,1);
});
test("los campos viven dentro del desplegable, incluidos los ocultos que lee app.js",()=>{
  const dentro=panel.slice(panel.indexOf("<details"),panel.indexOf("</details>"));
  for(const id of ["svFecha","svTipoAct","svTipoActNuevo","svTipoActAgregarBtn","svHoraSalida","svFichaCombustible","svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada","svHorometro"])assert.match(dentro,new RegExp('id="'+id+'"'),id);
});
