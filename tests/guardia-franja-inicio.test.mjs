import test from "node:test";
import assert from "node:assert/strict";
import "../public/legacy/germania-guardia-franja.js";

const { semanaVisible, franjaAsignada } = globalThis.GermaniaGuardiaFranja;
const instante = x => new Date(x).getTime();

test("miércoles a las 04:59 Chile no muestra la nueva franja; a las 05:00 sí", () => {
  // Octubre en Chile: UTC−03
  assert.equal(semanaVisible(instante("2026-10-14T07:59:00Z")), null);
  assert.deepEqual(semanaVisible(instante("2026-10-14T08:00:00Z")),
    { inicio:"2026-10-14", finExclusivo:"2026-10-21" });
});

test("martes sigue en la misma semana y el siguiente miércoles a las 05:00 empieza la siguiente",()=>{
  assert.equal(semanaVisible(instante("2026-10-20T14:00:00Z")).inicio,"2026-10-14");
  assert.equal(semanaVisible(instante("2026-10-21T08:00:00Z")).inicio,"2026-10-21");
});

test("al cambiar a invierno respeta zona America/Santiago y no suma horas UTC como locales",()=>{
  // Junio Chile: UTC−04, miércoles 05:00 corresponde a 09:00Z.
  assert.equal(semanaVisible(instante("2027-06-16T08:59:00Z")),null);
  assert.equal(semanaVisible(instante("2027-06-16T09:00:00Z")).inicio,"2027-06-16");
});

test("solo días asignados, cargo por fecha, y nunca noches de otras semanas",()=>{
  const base=instante("2026-10-14T08:01:00Z"), fin=instante("2026-10-15T11:00:00Z");
  const noches=[
    {f:"2026-10-14",rol:"vol",finMs:fin},
    {f:"2026-10-16",rol:"obac",finMs:instante("2026-10-17T11:00:00Z")},
    {f:"2026-10-18",rol:"maq",finMs:instante("2026-10-19T11:00:00Z")},
    {f:"2026-10-21",rol:"vol",finMs:instante("2026-10-22T11:00:00Z")}
  ];
  assert.deepEqual(franjaAsignada(noches,base).map(x=>[x.f,x.rol]),
    [["2026-10-14","vol"],["2026-10-16","obac"],["2026-10-18","maq"]]);
});

test("una noche terminada se oculta SIN acreditar asistencia automáticamente",()=>{
  const fin=instante("2026-10-15T11:00:00Z");
  const noches=[{f:"2026-10-14",rol:"obac",finMs:fin}];
  assert.equal(franjaAsignada(noches,fin-1000).length,1);
  assert.equal(franjaAsignada(noches,fin).length,0);
  assert.equal("cuenta" in noches[0],false);
});

test("no se muestra un turno cedido que ya tiene reemplazo y se evita duplicar la fecha",()=>{
  const now=instante("2026-10-14T08:05:00Z"),fin=instante("2026-10-15T11:00:00Z");
  const asignaciones=[
    {f:"2026-10-14",rol:"vol",finMs:fin,aviso:{estado:"cubierto"}},
    {f:"2026-10-15",rol:"maq",finMs:fin+86400000},
    {f:"2026-10-15",rol:"maq",finMs:fin+86400000}
  ];
  assert.deepEqual(franjaAsignada(asignaciones,now).map(x=>x.f),["2026-10-15"]);
});
