import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import '../public/legacy/germania-fechas.js';const F=globalThis.GermaniaFechas;
test('22:45 en Santiago no cambia de fecha al convertir desde UTC',()=>{
 assert.equal(F.fechaChile('2026-10-30T01:45:00Z'),'2026-10-29');assert.equal(F.fechaChile('2026-07-30T02:45:00Z'),'2026-07-29');
 assert.equal(F.sumarDias(F.fechaChile('2026-10-30T01:45:00Z'),1),'2026-10-30');
});
test('días civiles sobreviven al cambio de horario, mes, año y año bisiesto',()=>{
 for(const [f,n,e] of [['2026-09-05',1,'2026-09-06'],['2026-09-06',-3,'2026-09-03'],['2026-12-31',1,'2027-01-01'],['2028-02-28',1,'2028-02-29']])assert.equal(F.sumarDias(f,n),e);
 assert.throws(()=>F.sumarDias('2026-02-30',1));
});
test('misma fecha de compañía con aparato en UTC, Santiago y Tokio',()=>{
 for(const TZ of ['UTC','America/Santiago','Asia/Tokyo']){
  const code="require('./public/legacy/germania-fechas.js');process.stdout.write(globalThis.GermaniaFechas.fechaChile('2026-10-30T01:45:00Z'));";
  assert.equal(execFileSync(process.execPath,['-e',code],{cwd:process.cwd(),env:{...process.env,TZ},encoding:'utf8'}),'2026-10-29');
 }
});
