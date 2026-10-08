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

test("guardia: OBAC precedence cannot be read or overwritten anonymously", () => {
  const get = api.split("export async function GET")[1].split("export async function PUT")[0];
  const put = api.split("export async function PUT")[1];
  assert.ok(get.includes('key.startsWith("precedencia:")'));
  assert.ok(put.includes('key.startsWith("precedencia:")'));
});

test("guardia: partial transfer cannot display a completed success", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes('catch (transferError)'));
  assert.ok(section.includes('msg.textContent="La función se guardó, pero falta conciliar'));
  assert.ok(section.includes('GN_INS_CACHE=null;\n      return;'));
});

test("guardia: operational conflicts are checked again before saving", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const first = section.indexOf("const noches=");
  const recheck = section.indexOf("const conflictosActuales=await gnConflictosSemana(");
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(first >= 0 && recheck > first && save > recheck);
  assert.ok(section.includes("La asignación cambió mientras editabas"));
});

test("guardia: empty operational assignment is rejected before any write", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const emptyGuard = section.indexOf('if(!noches.length)');
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(emptyGuard >= 0 && save > emptyGuard);
  assert.ok(section.includes("Selecciona al menos una noche"));
});

test("guardia: dates outside the selected weekly period are rejected", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const dateGuard = section.indexOf("n<GN_ROL_PLAN.inicio||n>GN_ROL_PLAN.fin");
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(dateGuard >= 0 && save > dateGuard);
  assert.ok(section.includes("Hay fechas fuera de la semana de guardia"));
});

test("guardia: ISO date validator accepts real nights and rejects malformed dates", () => {
  const match = app.match(/if\(noches\.some\(n=>!\/(.+?)\/\.test\(n\)/);
  assert.ok(match, "weekly date regex exists");
  const validator = new RegExp(match[1]);
  assert.equal(validator.test("2026-10-07"), true);
  assert.equal(validator.test("07-10-2026"), false);
  assert.equal(validator.test("2026-10-7"), false);
});

test("guardia: closed or expired weekly plans are rejected before saving", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const guard = section.indexOf('GN_ROL_PLAN.estado!=="abierta"||GN_ROL_PLAN.fin<todayISO()');
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(guard >= 0 && save > guard);
});

test("guardia: unknown roster identities are rejected before saving", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const guard = section.indexOf('!ROSTER.some(x=>String(x.id)===String(who))');
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(guard >= 0 && save > guard);
});

test("guardia: operational role must match roster eligibility", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes('GN_ROL_ACTIVO==="oficial"&&!gnEsOficial(actual)'));
  assert.ok(section.includes('GN_ROL_ACTIVO==="maquinista"&&!gnEsMaquinista(actual)'));
  assert.ok(section.indexOf("La función seleccionada no corresponde") < section.indexOf("await gnGuardarRolSemanal("));
});

test("guardia: central weekly status is refreshed before assigning a role", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const refresh = section.indexOf("const planesVigentes=await gnPlanes()");
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(refresh >= 0 && refresh < save);
  assert.ok(section.includes('p.estado==="abierta"&&p.fin>=todayISO()'));
});
