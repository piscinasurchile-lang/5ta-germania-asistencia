import test from "node:test";
import assert from "node:assert/strict";
import { redactRoster, preserveMedical, getMedical, applyMedical } from "../lib/medical-access.js";

test("public roster does not expose medical information or mutate original", () => {
  const input = [{id:"1",nombre:"Prueba",grupoSanguineo:"O+",alergias:"penicilina",medicacionHabitual:"X"}];
  const publicRoster = redactRoster(input);
  assert.deepEqual(publicRoster,[{id:"1",nombre:"Prueba"}]);
  assert.equal(input[0].alergias,"penicilina");
});
test("public roster save cannot erase or overwrite existing medical information", () => {
  const original=[{id:"1",nombre:"Anterior",alergias:"latex",grupoSanguineo:"A+"}];
  const incoming=[{id:"1",nombre:"Nuevo",alergias:"intruso",grupoSanguineo:"B-"}];
  assert.deepEqual(preserveMedical(original,incoming),[{id:"1",nombre:"Nuevo",alergias:"latex",grupoSanguineo:"A+"}]);
});
test("new records cannot smuggle medical fields via public roster", () => {
  assert.deepEqual(preserveMedical([],[{id:"2",nombre:"Nuevo",alergias:"intruso"}]),[{id:"2",nombre:"Nuevo"}]);
});
test("medical fields are explicitly selected and validated", () => {
  const old={id:"1",alergias:"latex"};
  const result=applyMedical(old,{alergias:"penicilina",nombre:"no permitido"});
  assert.equal(result.alergias,"penicilina");
  assert.equal(result.nombre,undefined);
  assert.deepEqual(getMedical(result).alergias,"penicilina");
  assert.throws(()=>applyMedical(old,{alergias:42}),/invalid_medical_field/);
});
