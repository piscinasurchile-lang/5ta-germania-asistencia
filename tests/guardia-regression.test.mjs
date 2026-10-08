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
  const dateGuard = section.indexOf("n<planSolicitado.inicio||n>planSolicitado.fin");
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
  const guard = section.indexOf('planSolicitado.estado!=="abierta"||planSolicitado.fin<todayISO()');
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(guard >= 0 && save > guard);
});

test("guardia: unknown roster identities are rejected before saving", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const guard = section.indexOf('!ROSTER.some(x=>String(x.id)===identidadSolicitada)');
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(guard >= 0 && save > guard);
});

test("guardia: operational role must match roster eligibility", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes('rolSolicitado==="oficial"&&!gnEsOficial(actual)'));
  assert.ok(section.includes('rolSolicitado==="maquinista"&&!gnEsMaquinista(actual)'));
  assert.ok(section.indexOf("La función seleccionada no corresponde") < section.indexOf("await gnGuardarRolSemanal("));
});

test("guardia: central weekly status is refreshed before assigning a role", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const refresh = section.indexOf("const planesVigentes=await gnPlanes()");
  const save = section.indexOf("await gnGuardarRolSemanal(");
  assert.ok(refresh >= 0 && refresh < save);
  assert.ok(section.includes('p.fin===planSolicitado.fin&&p.estado==="abierta"&&p.fin>=todayISO()'));
});

test("guardia: repeated save taps are blocked while request is pending", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes("if(botonGuardar?.disabled) return"));
  assert.ok(section.includes("if(botonGuardar) botonGuardar.disabled=true"));
  assert.ok(section.includes("finally { if(botonGuardar) botonGuardar.disabled=false; }"));
});

test("guardia: failed pre-save checks report an error and restore save button", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes('catch (error) {\n    console.error("Guardia: error de validación o conexión"'));
  assert.ok(section.includes("No se pudo validar la asignación con el servidor"));
  assert.ok(section.includes("finally { if(botonGuardar) botonGuardar.disabled=false; }"));
});

test("guardia: async save uses a snapshot of selected role and period", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  assert.ok(section.includes("const rolSolicitado=GN_ROL_ACTIVO"));
  assert.ok(section.includes("const planSolicitado={...GN_ROL_PLAN}"));
  assert.ok(section.includes("await gnGuardarRolSemanal(rolSolicitado,planSolicitado,identidadSolicitada,noches)"));
  assert.ok(section.includes("await gnTransferirDesdeVoluntario(planSolicitado,identidadSolicitada,noches)"));
});

test("guardia: all asynchronous pre-save checks use captured role and period", () => {
  const section = app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const afterSnapshot = section.split("const identidadSolicitada=String(who);")[1];
  assert.ok(afterSnapshot);
  assert.equal(afterSnapshot.includes("GN_ROL_PLAN"), false);
  assert.equal(afterSnapshot.includes("GN_ROL_ACTIVO"), false);
  assert.ok(afterSnapshot.includes("gnConflictosSemana(planSolicitado,identidadSolicitada,noches,rolSolicitado)"));
});

test("guardia: save and validation use captured volunteer identity", () => {
  const section=app.split('on("gnRolGuardar","click",async()=>{')[1].split('on("miVoluntario","change"')[0];
  const afterSnapshot=section.split("const identidadSolicitada=String(who);")[1];
  assert.ok(afterSnapshot);
  assert.ok(afterSnapshot.includes("gnGuardarRolSemanal(rolSolicitado,planSolicitado,identidadSolicitada,noches)"));
  assert.ok(afterSnapshot.includes("gnTransferirDesdeVoluntario(planSolicitado,identidadSolicitada,noches)"));
  assert.ok(!afterSnapshot.includes("planSolicitado,who,noches"));
});

test("guardia: role and transfer writes require confirmed central persistence", () => {
  assert.ok(app.includes('if(guardado!==true) throw new Error("Guardia: la asignación de función no fue confirmada'));
  assert.ok(app.includes('if(guardado!==true) throw new Error("Guardia: la transferencia de noches no fue confirmada'));
});

test("guardia: malformed volunteer registration is not silently treated as transferred", () => {
  const transfer=app.split("async function gnTransferirDesdeVoluntario(")[1].split("let GN_ROL_SEL")[0];
  assert.ok(transfer.includes('if(!Array.isArray(vol)) throw new Error("Guardia: inscripción de voluntario inválida'));
});

test("guardia: malformed weekly role documents are rejected before overwriting", () => {
  const save=app.split("async function gnGuardarRolSemanal(")[1].split("async function gnConflictosSemana")[0];
  assert.ok(save.includes('!Array.isArray(actual.historial)'));
  assert.ok(save.includes('Array.isArray(actual.personas)'));
  assert.ok(save.indexOf("registro semanal inválido")<save.indexOf("const guardado=await sSet(key,actual)"));
});

test("guardia: existing role document must match selected week and role", () => {
  const save=app.split("async function gnGuardarRolSemanal(")[1].split("async function gnConflictosSemana")[0];
  assert.ok(save.includes("actual.inicio!==p.inicio||actual.fin!==p.fin||actual.rol!==rol"));
  assert.ok(save.indexOf("registro semanal corresponde a otra semana")<save.indexOf("const guardado=await sSet(key,actual)"));
});
