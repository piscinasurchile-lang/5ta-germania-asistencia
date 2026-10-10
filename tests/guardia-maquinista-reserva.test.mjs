import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { fechasSemana, fechaISOValida, validarReservaMaquinista, fechaEnRegistro, idVoluntarioValido } from "../lib/guardia-maquinista.mjs";
import { RESERVA_TITULAR_SQL } from "../lib/guardia-reserva-titular-sql.mjs";

const inicio = "2026-10-14", fecha = "2026-10-14";
const plan = { inicio, estado: "abierta", confirmado: true, cierre: "2026-10-13T22:00:00.000Z" };
const conductor = { id: "101", activo: true, conductor: true };
const now = Date.parse("2026-10-12T15:00:00Z");
const evaluar = (extras = {}) => validarReservaMaquinista({ inicio, fecha, personaId: "101", plan, miembro: conductor, ahora: now, ...extras });

test("permite UUID reales de la nómina para reserva titular y conserva códigos antiguos", () => {
  const id="a6f61713-4b31-467e-8e94-b541eed60f11";
  assert.equal(idVoluntarioValido(id),true);
  assert.equal(idVoluntarioValido("101"),true);
  assert.equal(idVoluntarioValido("id_incorrecto"),false);
  const caso=evaluar({personaId:id,miembro:{...conductor,id}});
  assert.equal(caso.ok,true);
});

test("período válido: miércoles a martes (siete noches)", () => {
  assert.deepEqual(fechasSemana(inicio), [
    "2026-10-14","2026-10-15","2026-10-16","2026-10-17",
    "2026-10-18","2026-10-19","2026-10-20"
  ]);
  assert.deepEqual(fechasSemana("2026-10-15"), []);
  assert.equal(fechaISOValida("2026-02-30"), false);
  assert.equal(evaluar().ok, true);
  assert.equal(evaluar({fecha:"2026-10-21"}).codigo,"FECHA_FUERA_DE_SEMANA");
});
test("rechaza semana inexistente, cerrada o pasada", () => {
  assert.equal(evaluar({plan:null}).codigo,"INSCRIPCION_CERRADA");
  assert.equal(evaluar({plan:{...plan,estado:"cerrada"}}).codigo,"INSCRIPCION_CERRADA");
  assert.equal(evaluar({plan:{...plan,confirmado:false}}).codigo,"INSCRIPCION_CERRADA");
  assert.equal(evaluar({ahora:Date.parse(plan.cierre)}).codigo,"INSCRIPCION_CERRADA");
});
test("solo maquinista activo habilitado del roster", () => {
  assert.equal(evaluar({miembro:{...conductor,conductor:false}}).codigo,"MAQUINISTA_NO_HABILITADO");
  assert.equal(evaluar({miembro:{...conductor,activo:false}}).codigo,"MAQUINISTA_NO_HABILITADO");
  assert.equal(evaluar({miembro:{...conductor,id:"102"}}).codigo,"MAQUINISTA_NO_HABILITADO");
});
test("comprende formatos históricos string y {f,t}", () => {
  assert.equal(fechaEnRegistro(["2026-10-14"],fecha),true);
  assert.equal(fechaEnRegistro([{f:fecha,t:"2026-10-12T12:00:00Z"}],fecha),true);
  assert.equal(fechaEnRegistro([{f:"2026-10-15"}],fecha),false);
});

async function base() {
  const db = new PGlite();
  await db.exec("CREATE TABLE app_state (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), version integer NOT NULL DEFAULT 1)");
  return db;
}
async function reservar(db, id, dia=fecha) {
  const rows = await db.query(RESERVA_TITULAR_SQL, [
    "guardia-maq:"+inicio+":%",
    "guardia-maq:"+inicio+":"+id,
    dia,
    "guardia-inscripcion:"+inicio+":"+id,
    "guardia-conductor:"+dia,
    id, inicio,
  ]);
  return rows.rows[0];
}
async function estado(db, key) {
  const result = await db.query("SELECT value FROM app_state WHERE key = $1",[key]);
  return result.rows[0]?.value ?? null;
}
test("dos conductores compiten por el mismo día: uno solo gana", async () => {
  const db = await base();
  try {
    const [a,b]=await Promise.all([reservar(db,"101"),reservar(db,"102")]);
    assert.equal([a,b].filter(x=>x.reservada&&x.guardada).length,1);
    const slot=await estado(db,"guardia-conductor:"+fecha);
    assert.ok(["101","102"].includes(slot.id));
    const inscrito=await estado(db,"guardia-maq:"+inicio+":"+slot.id);
    assert.equal(inscrito.length,1);
    const perdedor=slot.id==="101"?"102":"101";
    assert.equal(await estado(db,"guardia-maq:"+inicio+":"+perdedor),null);
    const repetida=await reservar(db,perdedor);
    assert.equal(repetida.reservada,false);
  } finally { await db.close(); }
});
test("el mismo maquinista puede ganar varias noches sin perder la primera", async () => {
  const db=await base();
  try {
    const [a,b]=await Promise.all([reservar(db,"101","2026-10-14"),reservar(db,"101","2026-10-15")]);
    assert.equal(a.reservada,true);assert.equal(b.reservada,true);
    const registro=await estado(db,"guardia-maq:"+inicio+":101");
    assert.deepEqual(new Set(registro.map(x=>x.f)),new Set(["2026-10-14","2026-10-15"]));
  } finally { await db.close(); }
});
test("registro anterior de otro titular bloquea sin sobrescribir historia", async () => {
  const db=await base();
  try {
    await db.query("INSERT INTO app_state(key,value) VALUES ($1,$2::jsonb)",
      ["guardia-maq:"+inicio+":102",JSON.stringify([{f:fecha,t:"2026-10-12T12:00:00Z"}])]);
    const r=await reservar(db,"101");
    assert.equal(r.reservada,false);
    assert.equal(await estado(db,"guardia-conductor:"+fecha),null);
    assert.equal((await estado(db,"guardia-maq:"+inicio+":102")).length,1);
  } finally { await db.close(); }
});
test("voluntario ya inscrito esa noche no puede reservar como maquinista", async () => {
  const db=await base();
  try {
    await db.query("INSERT INTO app_state(key,value) VALUES ($1,$2::jsonb)",
      ["guardia-inscripcion:"+inicio+":101",JSON.stringify([fecha,"2026-10-15"])]);
    const r=await reservar(db,"101");
    assert.equal(r.reservada,false);
    assert.equal(r.sin_vol,false);
    assert.equal(await estado(db,"guardia-conductor:"+fecha),null);
  } finally { await db.close(); }
});
