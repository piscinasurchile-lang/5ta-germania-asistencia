import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "../public/legacy/germania-obac.js";

const calcular = globalThis.GermaniaObac.obacDeNoche;
const completo = r => r.voluntarios.length >= 2 && r.maquinistas.length === 1 && !!r.obac &&
  new Set([...r.voluntarios, ...r.maquinistas, r.obac]).size === r.voluntarios.length + r.maquinistas.length + 1;

test("la dotación mínima real en la interfaz es 2+1+1; mínimo personal 2 noches no cambia", () => {
  const src=readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
  assert.match(src,/GN_DOTACION_MIN=\{voluntarios:2,conductor:1,obac:1\}/);
  assert.match(src,/GN_NOCHES_MIN=2/);
});

test("cuatro personas distintas bastan: 2 voluntarios, 1 conductor, 1 OBAC por precedencia", () => {
  const r=calcular({inscritos:[
    {id:"capitan",maquinista:true},
    {id:"teniente3"},
    {id:"vol1"},{id:"vol2"},
  ],orden:["capitan","teniente3","vol1","vol2"]});
  assert.equal(r.obac,"teniente3");
  assert.deepEqual(r.maquinistas,["capitan"]);
  assert.deepEqual(r.voluntarios,["vol1","vol2"]);
  assert.equal(completo(r),true);
});

test("con solo un voluntario adicional no está completa", () => {
  const r=calcular({inscritos:[{id:"maq",maquinista:true},{id:"teniente3"},{id:"vol1"}],
    orden:["teniente3","vol1","maq"]});
  assert.equal(completo(r),false);
});

test("capitán como conductor de respaldo deja el OBAC al siguiente", () => {
  const r=calcular({inscritos:[
    {id:"capitan",habilitadoMaquinista:true},{id:"teniente3"},{id:"vol1"},{id:"vol2"}
  ],orden:["capitan","teniente3","vol1","vol2"]});
  assert.equal(r.maquinistaPorRespaldo,"capitan");
  assert.equal(r.obac,"teniente3");
  assert.equal(completo(r),true);
});

test("una persona no se cuenta dos veces si se repite accidentalmente", () => {
  const r=calcular({inscritos:[
    {id:"maq",maquinista:true},{id:"t3"},{id:"v1"},{id:"v1"}
  ],orden:["t3","v1","maq"]});
  assert.equal(completo(r),false);
});

test("si hay maquinista titular, otro conductor inscrito sigue en precedencia para OBAC", () => {
  const r=calcular({inscritos:[
    {id:"maqTitular",maquinista:true},
    {id:"capitan",habilitadoMaquinista:true},
    {id:"vol1"},{id:"vol2"}
  ],orden:["capitan","maqTitular","vol1","vol2"]});
  assert.deepEqual(r.maquinistas,["maqTitular"]);
  assert.equal(r.obac,"capitan");
  assert.deepEqual(r.voluntarios,["vol1","vol2"]);
  assert.equal(r.maquinistaPorRespaldo,null);
  assert.equal(completo(r),true);
});
