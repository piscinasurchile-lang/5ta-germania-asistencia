import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = rel => readFileSync(new URL(rel,import.meta.url),"utf8");
const html = read("../public/legacy/index.html");
const roles = read("../public/legacy/germania-roles.js");
const css = read("../public/legacy/germania-inicio.css");

test("pantalla aprobada conserva nombre, foto y estado del voluntario",()=>{
  for(const id of ["miFoto","miNombre","miCargo","miEstadoChip","miVoluntario"])
    assert.ok(html.includes('id="'+id+'"'),id);
});

test("banner no es permanente y al confirmar desaparece",()=>{
  assert.match(roles,/function pintarInicioRoles\(\)/);
  assert.match(roles,/if\(conf&&\(conf\.confirmadaEn\|\|conf\.cumple\|\|conf\.justificacion\)\)/);
  assert.match(roles,/box\.innerHTML=""; GR\.eligiendo=false; return;/);
  assert.match(roles,/D\.abierto/);
  assert.match(roles,/panelVol\(vol,D\)/);
});

test("franja usa guardias aprobadas, fecha local y cargo real; no inventa asistentes",()=>{
  assert.match(roles,/misNochesDatos\(String\(m\.id\),forzar\)/);
  assert.match(roles,/GermaniaGuardiaFranja\.franjaAsignada\(entradas,Date\.now\(\)\)/);
  assert.match(roles,/finMs:finNoche\(e\.f\)/);
  assert.match(roles,/ROL_NOCHE\[e\.rol\]/);
  const inicio=roles.indexOf("async function misNochesInicio(");
  const fin=roles.indexOf("async function misNochesCumplidas(");
  assert.doesNotMatch(roles.slice(inicio,fin),/cuenta\s*=/);
});

test("guardias deja de ser botón permanente; oficiales conserva acceso de mando",()=>{
  assert.ok(!html.includes('data-nav="guardia"'));
  assert.ok(!html.includes('data-go="guardia">Guardias'));
  assert.ok(!html.includes('data-go="guardia"><span class="tile-ico"'));
  assert.match(html,/id="btnOficialesGuardia"/);
  assert.match(html,/class="card solo-oficiales solo-mando"/);
  assert.match(roles,/if\(!esMando\(miembro\(\)\)\) return;/);
});

test("seis tarjetas de inicio tienen sus rutas y novedades conserva su contenido",()=>{
  for(const txt of ["Asistencia","Emergencia B-5","Disponibilidad","Estadística","Oficiales","Novedades"])
    assert.ok(html.includes("<strong>"+txt+"</strong>"),txt);
  assert.match(html,/id="inicioNovedades"/);
  assert.match(html,/id="novedadesLista"/);
  assert.match(roles,/data-home-novedades/);
});

test("estilos visuales solo se aplican a Inicio o a barra inferior",()=>{
  assert.match(html,/germania-inicio\.css\?v=20261010b/);
  assert.match(html,/germania-guardia-franja\.js\?v=20261010a/);
  assert.match(css,/#panel-germania \.home-tiles/);
  assert.match(css,/#panel-germania \.gn-franja/);
  assert.match(css,/#panel-germania \.gn-inicio-inscripcion/);
});

test("resumen de disponibilidad usa cifras compactas centradas sobre la etiqueta",()=>{
  assert.match(css,/#panel-germania #dispResumen\\{[\\s\\S]*?grid-template-columns:repeat\\(3,minmax\\(0,1fr\\)\\)/);
  assert.match(css,/#panel-germania #dispResumen \\.summary-item\\{[\\s\\S]*?align-items:center;[\\s\\S]*?text-align:center;/);
  assert.match(css,/#panel-germania #dispResumen \\.summary-item \\.big\\{[\\s\\S]*?21px/);
  assert.match(css,/#panel-germania #dispResumen \\.summary-item \\.lbl\\{[\\s\\S]*?text-align:center;/);
  assert.match(html,/id="dispResumen"/);
});
