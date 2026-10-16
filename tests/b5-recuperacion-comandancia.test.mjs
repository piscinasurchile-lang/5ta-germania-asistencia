import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  construirRecuperacionComandancia,resumenRecuperacion,
  CLAVE_COMANDANCIA_15,CLAVE_INDICE_COMANDANCIA_15
} from "../lib/b5-recuperar-comandancia.mjs";

const ids=Array.from({length:28},(_,i)=>"id"+String(i+1));
const original=()=>({date:"2026-10-15",tipo:"Citación de Compañía",numero:6,anio:"2026",
  anulado:true,generaAsistencia:false,b5OfflineId:"00000000-0000-4000-8000-000000000006",
  origenAsistencia:"citacion_manual",records:Object.fromEntries(ids.map(id=>[id,"ausente"])),
  historialB5:[{accion:"anular",fecha:"2026-10-16T00:06:43Z"}]});
const fuente=()=>({id:"00000000-0000-4000-8000-000000000010",date:"2026-10-15",
  tipo:"Citación de Compañía",detalle:"Citación de Comandancia",
  registradoPor:"Oficial B-5",
  records:Object.fromEntries(ids.map((id,i)=>[id,i<10?"presente":i<17?"ausente":"justificado"]))});

test("la recuperación conserva N.º 6 y los 28 estados reales en Comandancia",()=>{
  const anterior=original(),local=fuente();
  const r=construirRecuperacionComandancia(anterior,local,"2026-10-16T11:00:00.000Z");
  assert.equal(r.numero,6);
  assert.equal(r.tipo,"Citación de Comandancia");
  assert.equal(r.origenAsistencia,"comandancia_citacion");
  assert.equal(r.anulado,false);
  assert.equal(r.generaAsistencia,true);
  assert.equal(r.b5RecuperadoDesdeId,local.id);
  assert.equal(r.b5OfflineId,anterior.b5OfflineId);
  assert.deepEqual(resumenRecuperacion(r.records),{presentes:10,ausentes:7,justificados:11,total:28});
  assert.equal(r.historialB5.length,2);
  assert.equal(r.historialB5[1].accion,"recuperar_citacion_comandancia");
  assert.deepEqual(anterior.records,Object.fromEntries(ids.map(id=>[id,"ausente"])));
});
test("rechaza cualquier cambio de integrantes o de cantidades",()=>{
  const mala=fuente();delete mala.records.id1;
  assert.throws(()=>construirRecuperacionComandancia(original(),mala,new Date().toISOString()),/nomina_no_coincide/);
  const alterada=fuente();alterada.records.id1="ausente";
  assert.throws(()=>construirRecuperacionComandancia(original(),alterada,new Date().toISOString()),/totales_no_coinciden/);
});
test("nunca vuelve a restaurar un parte ya recuperado u otro parte",()=>{
  assert.throws(()=>construirRecuperacionComandancia({...original(),numero:7},fuente(),new Date().toISOString()),/parte_oficial_no_coincide/);
  assert.throws(()=>construirRecuperacionComandancia({...original(),anulado:false},fuente(),new Date().toISOString()),/parte_oficial_no_coincide/);
  assert.throws(()=>construirRecuperacionComandancia({...original(),b5RecuperadoDesdeId:"otro"},fuente(),new Date().toISOString()),/recuperacion_previa/);
  assert.equal(CLAVE_COMANDANCIA_15,"parte:2026-10-15__citacion-de-compania");
  assert.equal(CLAVE_INDICE_COMANDANCIA_15,"2026-10-15__citacion-de-compania");
});
test("ruta requiere sesión oficial, tablet B-5 y actualización de índice con CAS",()=>{
  const api=fs.readFileSync(new URL("../app/api/b5/recuperar-comandancia/route.js",import.meta.url),"utf8");
  const ui=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
  const consulta=fs.readFileSync(new URL("../app/api/b5/registros/route.js",import.meta.url),"utf8");
  assert.match(api,/if\(!oficialAutorizado\(request\)\)/);
  assert.match(api,/if\(!sameOrigin\(request\)\)/);
  assert.match(api,/if\(actual.version!==body.version\)/);
  assert.match(api,/construirRecuperacionComandancia/);
  assert.match(api,/indice_actualizado AS/);
  assert.match(api,/AND version=\$\{actual.version\}/);
  assert.match(consulta,/actual.value.b5RecuperadoDesdeId!==parametros.id/);
  assert.match(ui,/Recuperar citación de Comandancia · N.º 6/);
  assert.match(ui,/Sí, recuperar parte N.º 6/);
  assert.match(ui,/10 presentes, 7 ausentes y 11 justificados/);
});
