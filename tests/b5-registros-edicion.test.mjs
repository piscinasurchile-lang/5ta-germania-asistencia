import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {aplicarCambioParteB5,claveDeParteB5} from "../app/api/b5/registros/route.js";

const base=()=>({
  b5OfflineId:"00000000-0000-4000-8000-000000000001",
  date:"2026-10-15",tipo:"Citación de Compañía",numero:6,anio:"2026",
  detalle:"Academia",registradoPor:"Teniente",
  records:{v1:"presente",v2:"ausente",v3:"justificado"},
  origenAsistencia:"citacion_manual",generaAsistencia:true
});
const momento="2026-10-15T23:00:00.000Z";

test("solamente apunta a partes B-5 identificados por fecha/tipo/id",()=>{
  assert.equal(claveDeParteB5({id:base().b5OfflineId,date:"2026-10-15",tipo:"Citación de Compañía"}),
    "parte:2026-10-15__citacion-de-compania");
  assert.equal(claveDeParteB5({id:"otro",date:"2026-10-15",tipo:"Citación de Compañía"}),null);
  assert.equal(claveDeParteB5({id:base().b5OfflineId,date:"2026-99-15",tipo:"Citación de Compañía"}),null);
});

test("corregir conserva número, clave de origen y registra estado anterior",()=>{
  const original=base();
  const nuevo=aplicarCambioParteB5(original,"corregir",{
    detalle:"Nueva academia",registradoPor:"Capitán",
    records:{v1:"ausente",v2:"presente",v3:"justificado"}
  },momento);
  assert.equal(nuevo.numero,6);
  assert.equal(nuevo.b5OfflineId,original.b5OfflineId);
  assert.equal(nuevo.records.v2,"presente");
  assert.equal(nuevo.historialB5[0].records.v1,"presente");
  assert.equal(original.records.v1,"presente");
  assert.equal(nuevo.historialB5.length,1);
});

test("rechaza agregar o quitar voluntarios y estados fuera del catálogo",()=>{
  assert.throws(()=>aplicarCambioParteB5(base(),"corregir",{
    detalle:"",registradoPor:"",records:{v1:"presente",v2:"ausente",v3:"ausente",v4:"presente"}
  },momento),/nomina_no_coincide/);
  assert.throws(()=>aplicarCambioParteB5(base(),"corregir",{
    detalle:"",registradoPor:"",records:{v1:"sí",v2:"ausente",v3:"presente"}
  },momento),/estados_invalidos/);
});

test("anular y restaurar no pierden lista ni trazabilidad",()=>{
  const anterior=base();
  const anulado=aplicarCambioParteB5(anterior,"anular",null,momento);
  assert.equal(anulado.anulado,true);
  assert.equal(anulado.generaAsistencia,false);
  assert.deepEqual(anulado.records,anterior.records);
  assert.equal(anulado.numero,anterior.numero);
  assert.throws(()=>aplicarCambioParteB5(anulado,"corregir",null,momento),/parte_anulado/);
  const restaurado=aplicarCambioParteB5(anulado,"restaurar",null,momento);
  assert.equal(restaurado.anulado,false);
  assert.equal(restaurado.generaAsistencia,true);
  assert.deepEqual(restaurado.records,anterior.records);
  assert.equal(restaurado.historialB5.length,2);
});

test("API exige autenticación oficial y versión; estadísticas excluyen anulados",()=>{
  const api=fs.readFileSync(new URL("../app/api/b5/registros/route.js",import.meta.url),"utf8");
  const legacy=fs.readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
  const ui=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
  assert.match(api,/if\(!oficialAutorizado\(request\)\)/);
  assert.match(api,/if\(!sameOrigin\(request\)\)/);
  assert.match(api,/if\(parte\.version!==body\.version\)/);
  assert.match(api,/ifVersion:parte\.version/);
  assert.match(api,/actual\.value\.b5OfflineId!==parametros\.id/);
  assert.match(legacy,/if\(pt\?\.anulado===true\) return \{cuenta:false/);
  assert.match(ui,/Registros de esta tablet/);
  assert.match(ui,/resumenParte/);
  assert.match(ui,/Guardar corrección/);
  assert.match(ui,/Restaurar parte/);
});
