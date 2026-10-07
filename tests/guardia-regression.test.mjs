import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../app/api/state/[key]/route.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../public/legacy/app.js", import.meta.url), "utf8");

test("guardia: protected records cannot be read anonymously", () => {
  const get = api.split("export async function GET")[1].split("export async function PUT")[0];
  for (const prefix of ["guardia-rol:", "guardia-obac-meta:", "guardia-revision:"]) {
    assert.ok(get.includes('key.startsWith("'+prefix+'")'), prefix);
  }
});
test("guardia: protected records cannot be written anonymously", () => {
  const put = api.split("export async function PUT")[1];
  for (const prefix of ["guardia-rol:", "guardia-obac-meta:", "guardia-revision:"]) {
    assert.ok(put.includes('key.startsWith("'+prefix+'")'), prefix);
  }
});
test("guardia: conductor/officer conflict is checked by night", () => {
  assert.ok(app.includes('if(asign.includes(n)) conflictos.push'));
  assert.ok(app.includes('esOficial&&esConductor?(selector?.value||"oficial")'));
});
test("guardia: OBAC invitation stops when target is reached", () => {
  assert.ok(app.includes("if(confirmados>=Number(meta.objetivo||6)) return null;"));
});

test("guardia: role assignment is saved before volunteer nights are removed", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const save = section.indexOf("await gnGuardarRolSemanal(");
  const transfer = section.indexOf("await gnTransferirDesdeVoluntario(");
  assert.ok(save >= 0 && transfer > save);
  assert.ok(section.includes("transferencia parcial"));
});
