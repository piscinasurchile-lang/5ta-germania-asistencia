import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {esOficialGuardia,puedeVerLibro,vistoCapitanValido,semanaVigente} from "../lib/guardia-libro.js";

const js=readFileSync(new URL("../public/legacy/germania-cierre-libro.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../app/api/guardia/libro/route.js",import.meta.url),"utf8");
const visto=readFileSync(new URL("../app/api/guardia/visto/route.js",import.meta.url),"utf8");
const noche={obac:"francisco",maq:"conductor",vol:["v1","v2","v3"]};
test("oficiales de Germania pueden consultar fotos solo tras ratificación T3",()=>{
 for(const cargo of ["Capitán","Teniente 1","Teniente 2","Teniente 3","Ayudante","Director","Secretario","Tesorero","Tesorero General","Jefe de Máquinas"]){
  assert.equal(esOficialGuardia(cargo),true,cargo);
  const persona={id:"oficial",cargo,activo:true};
  assert.equal(puedeVerLibro(persona,noche,false),cargo==="Teniente 3",cargo+" no ratificado");
  assert.equal(puedeVerLibro(persona,noche,true),true,cargo+" ratificado");
 }
 for(const cargo of ["Voluntario","Voluntaria","Conductor","Postulante","Aspirante"]){
  assert.equal(esOficialGuardia(cargo),false,cargo);
  assert.equal(puedeVerLibro({id:"otro",cargo,activo:true},noche,true),false,cargo);
 }
 assert.equal(puedeVerLibro({id:"francisco",cargo:"Voluntario",activo:true},noche,false),true);
 assert.equal(puedeVerLibro({id:"t3",cargo:"Teniente 3",activo:false},noche,true),false);
});
test("Visto está ligado a la ratificación exacta, se reabre ante una corrección",()=>{
 const acreditacion={acreditadoEn:"2026-10-15T12:00:00.000Z"};
 assert.equal(vistoCapitanValido({estado:"visto",ratificacionEn:acreditacion.acreditadoEn},acreditacion),true);
 assert.equal(vistoCapitanValido({estado:"visto",ratificacionEn:acreditacion.acreditadoEn},{acreditadoEn:"2026-10-15T14:00:00.000Z"}),false);
 assert.equal(vistoCapitanValido({estado:"pendiente",ratificacionEn:acreditacion.acreditadoEn},acreditacion),false);
 assert.equal(vistoCapitanValido(null,acreditacion),false);
});
test("semana miércoles a martes; avisos semanales no borran historial",()=>{
 assert.equal(semanaVigente("2026-10-14","2026-10-20"),true);
 assert.equal(semanaVigente("2026-10-14","2026-10-21"),false);
 assert.equal(semanaVigente("2026-10-20","2026-10-14"),true);
 assert.match(js,/semanaDe\(x\.fecha\)===semanaActual/);
 assert.match(js,/historial=1&anio=/);
 assert.match(js,/data-lgn-visto/);
 assert.match(js,/Guardias ratificadas/);
 assert.match(js,/Dar visto bueno · Capitán/);
 assert.match(js,/lgnAnioControl/);
});
test("consulta por año y fotos ratificadas, filtro server-side para los demás oficiales",()=>{
 assert.match(api,/if\(historico&&!\(esOficial\|\|esAdmin\)\)return error\("solo_oficiales",403\)/);
 assert.match(api,/esOficial&&r\.acreditacionVigente/);
 assert.match(api,/vistoCapitanValido/);
 assert.match(api,/WHERE g\.value->>'estado'='aprobada'/);
 assert.match(visto,/if\(!actor\|\|!cargoCapitan\(actor\.cargo\)\)return error\("solo_capitan",403\)/);
 assert.match(visto,/if\(!noche\|\|!informeRatificado/);
 assert.match(visto,/readState\(sql,"guardia-visto-capitan:"\+fecha\)/);
 assert.doesNotMatch(visto,/"guardia-acreditacion:"\+fecha,registro/);
});
