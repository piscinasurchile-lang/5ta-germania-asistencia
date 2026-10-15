import test from "node:test";
import assert from "node:assert/strict";
import { fechaValida, inicioSemana, diaSiguiente, fotoTipo, esTercero, esCapitan, persona } from "../lib/guardia-libro.js";

test("fecha de guardia y semana miércoles",()=>{
  assert.equal(fechaValida("2026-10-14"),true);
  assert.equal(fechaValida("texto"),false);
  assert.equal(inicioSemana("2026-10-20"),"2026-10-14");
  assert.equal(diaSiguiente("2026-10-14"),"2026-10-15");
});
test("reconoce al Teniente Tercero y Capitán",()=>{
  assert.equal(esTercero({cargo:"Teniente Tercero"}),true);
  assert.equal(esTercero({cargo:"Capitán"}),false);
  assert.equal(esCapitan({cargo:"Capitán"}),true);
  assert.equal(persona([{id:7,activo:true},{id:8,activo:false}],7)?.id,7);
  assert.equal(persona([{id:8,activo:false}],8),undefined);
});
test("solo admite foto JPEG o WebP",()=>{
  assert.equal(fotoTipo(Buffer.from([255,216,255,1,2,3])),"image/jpeg");
  assert.equal(fotoTipo(Buffer.from("RIFF1234WEBP","ascii")),"image/webp");
  assert.equal(fotoTipo(Buffer.from("GIF89a","ascii")),null);
});
