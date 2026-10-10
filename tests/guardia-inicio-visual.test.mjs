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
  assert.match(html,/germania-inicio\.css\?v=20261010e/);
  assert.match(html,/germania-guardia-franja\.js\?v=20261010a/);
  assert.match(css,/#panel-germania \.home-tiles/);
  assert.match(css,/#panel-germania \.gn-franja/);
  assert.match(css,/#panel-germania \.gn-inicio-inscripcion/);
});

test("resumen de disponibilidad usa cifras compactas centradas sobre la etiqueta",()=>{
  const bloque=css.slice(css.indexOf("/* Resumen «Quién está hoy»"));
  assert.ok(bloque.includes("#panel-germania #dispResumen{"));
  assert.ok(bloque.includes("grid-template-columns:repeat(3,minmax(0,1fr))"));
  assert.ok(bloque.includes("align-items:center;"));
  assert.ok(bloque.includes("text-align:center;"));
  assert.ok(bloque.includes("font:600 21px/1.1"));
  assert.ok(bloque.includes("grid-template-columns:repeat(6,minmax(0,1fr))"));
  assert.ok(html.includes('id="dispResumen"'));
});

test("seis botones conservan rutas y muestran contornos coloreados propios, sin bucles",()=>{
  const colores={
    "tile-asistencia":"#3295ff",
    "tile-emergencia":"#ff3645",
    "tile-disponibilidad":"#28cf75",
    "tile-estadistica":"#b85af3",
    "tile-oficiales":"#ffcc00",
    "tile-novedades":"#91a7b7"
  };
  for(const [clase,color] of Object.entries(colores)){
    assert.ok(html.includes("tile "+clase),clase);
    const comienzo=css.indexOf("#panel-germania .home-tiles ."+clase+"{");
    assert.ok(comienzo>=0,clase);
    assert.ok(css.slice(comienzo,comienzo+135).includes(color),clase);
  }
  assert.match(css,/border-left-width:5px/);
  assert.match(css,/animation:germaniaTileEntrada \.45s ease-out both;/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.ok(!html.includes('data-nav="guardia"'));
});

test("orden de Inicio: Asistencia y Disponibilidad arriba; Emergencia y Estadística después",()=>{
  const inicio=html.indexOf('<div class="home-tiles" style="grid-column:1 / -1;">');
  const fin=html.indexOf('</div>',inicio);
  assert.ok(inicio>=0 && fin>inicio);
  const fragmento=html.slice(inicio,fin);
  const orden=[...fragmento.matchAll(/<button class="tile tile-([a-z]+)/g)].map(m=>m[1]);
  assert.deepEqual(orden,["asistencia","disponibilidad","emergencia","estadistica","oficiales","novedades"]);
});

test("tarjetas de Inicio ajustan títulos largos sin pisar la flecha en móviles",()=>{
  const bloque=css.slice(css.indexOf("/* Corrección móvil: ningún título"));
  assert.ok(bloque.includes("grid-template-columns:28px minmax(0,1fr) 12px"));
  assert.ok(bloque.includes("grid-template-columns:24px minmax(0,1fr) 10px"));
  assert.ok(bloque.includes("overflow-wrap:anywhere"));
  assert.ok(bloque.includes("#panel-germania .home-tiles .tile-arrow"));
  assert.ok(bloque.includes("@media (max-width:700px)"));
  assert.ok(bloque.includes("@media (max-width:360px)"));
});
