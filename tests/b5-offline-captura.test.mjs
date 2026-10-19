import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {PGlite} from "@electric-sql/pglite";
import {ensureSchema,resetSchemaCache,readState,writeState} from "../lib/state-store.js";
import {integrarBorradorB5,validarBorrador,ConflictoB5} from "../lib/b5-offline-server.mjs";

async function base(){
  const db=new PGlite();
  const sql=(parts,...args)=>{
    let t=parts[0];args.forEach((_,i)=>{t+="$"+(i+1)+parts[i+1];});
    return db.query(t,args).then(r=>r.rows);
  };
  resetSchemaCache();
  await ensureSchema(sql);
  await writeState(sql,"roster:v8",[
    {id:"v1",nombre:"Ana",activo:true},
    {id:"v2",nombre:"Luis",activo:true}
  ]);
  await writeState(sql,"tipos:v2",["Citación de Compañía","Emergencia B-5"]);
  return {db,sql};
}
const asistencia=(id="00000000-0000-4000-8000-000000000001")=>({
  id,tipo:"lista",datos:{date:"2026-10-14",tipo:"Citación de Compañía",
    registradoPor:"Oficial B-5",detalle:"Prueba desconectada",records:{v1:"presente",v2:"ausente"}}
});
const servicio=(id="00000000-0000-4000-8000-000000000002")=>({
  id,tipo:"servicio",datos:{svFecha:"2026-10-14",svTipoAct:"Emergencia",svHoraSalida:"18:15",
    svConductor:"Maquinista B-5",svUnidadCargo:"OBAC B-5",svSector:"Villarrica",
    svHoraEmergencia:"18:10",svHoraLista:"19:45",svClave:"10-01",svTipoEmergencia:"Incendio estructural",registrarAsistencia:true,
    records:{v1:"si",v2:"no"}}
});

test("asistencia B-5 offline se integra en partes y se asigna número en Neon",async()=>{
 const {sql}=await base();
 const r=await integrarBorradorB5(sql,asistencia());
 assert.equal(r.confirmado,true);
 assert.equal(r.numero,1);
 const pt=(await readState(sql,r.clave)).value;
 assert.equal(pt.records.v1,"presente");
 assert.deepEqual(pt.eligibleIds,["v1","v2"]);
 const idx=(await readState(sql,"partes:index:v1")).value;
 assert.equal(idx.length,1);
 assert.equal(idx[0].clave,r.clave.slice(6));
});

test("reintento con mismo identificador NO repite parte, índice ni correlativo",async()=>{
 const {sql}=await base();
 const b=asistencia();
 await integrarBorradorB5(sql,b);
 const segundo=await integrarBorradorB5(sql,b);
 assert.equal(segundo.numero,1);
 assert.equal((await readState(sql,"partes:index:v1")).value.length,1);
 assert.equal((await readState(sql,"correlativo:parte:2026")).value.actual,1);
});

test("nunca sobrescribe un registro remoto anterior con la misma fecha y tipo",async()=>{
 const {sql}=await base();
 await integrarBorradorB5(sql,asistencia());
 const diferente=asistencia("00000000-0000-4000-8000-000000000003");
 diferente.datos.records.v1="ausente";
 diferente.datos.records.v2="presente";
 await assert.rejects(()=>integrarBorradorB5(sql,diferente),ConflictoB5);
 assert.equal((await readState(sql,"parte:2026-10-14__citacion-de-compania")).value.records.v1,"presente");
});

test("hoja B-5 crea su índice y asistencia asociada con igual número, sin duplicarse",async()=>{
 const {sql}=await base();
 const item=servicio();
 const a=await integrarBorradorB5(sql,item);
 assert.equal(a.numero,1);
 assert.equal(a.confirmado,true);
 assert.equal((await readState(sql,"servicio:index:v1")).value.length,1);
 const idx=(await readState(sql,"partes:index:v1")).value;
 assert.equal(idx.length,1);
 const parte=(await readState(sql,"parte:"+idx[0].clave)).value;
 assert.equal(parte.numero,1);
 assert.equal(parte.origenAsistencia,"emergencia_b5");
 assert.deepEqual(parte.eligibleIds,["v1"]);
 const b=await integrarBorradorB5(sql,item);
 assert.equal(b.numero,1);
 assert.equal((await readState(sql,"servicio:index:v1")).value.length,1);
 assert.equal((await readState(sql,"partes:index:v1")).value.length,1);
});

test("el envío no acepta asistentes ajenos a la nómina actual",async()=>{
 const {sql}=await base();
 const b=asistencia();
 b.datos.records={v1:"presente",otro:"ausente"};
 await assert.rejects(()=>integrarBorradorB5(sql,b),ConflictoB5);
 assert.equal((await readState(sql,"partes:index:v1")).value,null);
});

test("rechaza datos incompletos o estados de asistencia falsos",()=>{
 assert.throws(()=>validarBorrador({}),/inválido/);
 const x=asistencia();x.datos.records.v1="fuera";
 assert.throws(()=>validarBorrador(x),/inválido/);
 const s=servicio();s.datos.svHoraSalida="25:99";
 assert.throws(()=>validarBorrador(s),/inválida/);
});

test("el modo PWA offline existe exclusivamente bajo /b5 y nunca cachea /api",()=>{
 const sw=fs.readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
 const b5=fs.readFileSync(new URL("../app/b5/page.js",import.meta.url),"utf8");
 const forma=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
 const api=fs.readFileSync(new URL("../app/api/b5/offline/route.js",import.meta.url),"utf8");
 assert.match(sw,/B5_PAGES=\["\/b5","\/b5\/captura"\]/);
 assert.match(sw,/url\.pathname\.startsWith\("\/api\/"\)\)return/);
 assert.match(b5,/SIN CONEXIÓN · Tomando datos en esta tablet/);
 assert.match(b5,/\/b5\/captura\?tipo=/);
 assert.match(forma,/Revisar antes de guardar/);
 assert.match(forma,/sincronizarBorradores/);
 assert.match(api,/buscarDispositivo\(registro,token\)/);
 assert.match(api,/origen_no_permitido/);
});

test("bloquea asistencias sin ningún presente",()=>{
 const item=asistencia();item.datos.records={v1:"ausente",v2:"ausente"};
 assert.throws(()=>validarBorrador(item),/al menos un voluntario presente/);
});
test("bloquea emergencias sin dirección o sin concurrentes",()=>{
 const item=servicio();delete item.datos.svSector;
 assert.throws(()=>validarBorrador(item),/Emergencia incompleta/);
 item.datos.svCalle="Calle Central";item.datos.records={v1:"no",v2:"no"};
 assert.throws(()=>validarBorrador(item),/Emergencia incompleta/);
 item.datos.records.v1="si";
 assert.equal(validarBorrador(item),true);
});


test("B5: un borrador inválido se aparta para revisión sin detener los siguientes",()=>{
 const fuente=fs.readFileSync(new URL("../lib/b5-offline-browser.js",import.meta.url),"utf8");
 assert.match(fuente,/response\.status===409\|\|response\.status===400\|\|response\.status===422/);
 assert.match(fuente,/item\.estado="revision"/);
 assert.match(fuente,/await cambiarBorrador\(item\);revision\+\+;onUpdate\(\);continue;/);
});

test("B5: fecha actual en formulario vacío sin alterar una captura con marcas",()=>{
 const fuente=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
 assert.match(fuente,/const conMarcas=edit&&Object\.values\(edit\.records\|\|\{\}\)/);
 assert.match(fuente,/const conDatos=edit&&Object\.entries\(edit\)/);
 assert.match(fuente,/const formulario=edit&&\(conMarcas\|\|conDatos\)\?edit:blanco\(tipo\)/);
 assert.match(fuente,/setForm\(formulario\)/);
});

test("B5: advierte antes de guardar una fecha distinta al día actual",()=>{
 const fuente=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
 assert.match(fuente,/fechaCaptura!==fechaLocal\(\)&&!window\.confirm/);
 assert.match(fuente,/La sincronización no cambiará esta fecha/);
});

test("B5: el nuevo formato exige exactamente los dos horarios de emergencia",()=>{
 const b=servicio();delete b.datos.svHoraEmergencia;
 assert.throws(()=>validarBorrador(b),/hora de emergencia/);
 b.datos.svHoraEmergencia="18:10";delete b.datos.svHoraLista;
 assert.throws(()=>validarBorrador(b),/hora de lista/);
 b.datos.svHoraLista="19:45";delete b.datos.svClave;
 assert.throws(()=>validarBorrador(b),/clave/);
 b.datos.svClave="10-01";
 assert.equal(validarBorrador(b),true);
});
test("B5: el PDF conserva los datos antiguos sin inventar horas",async()=>{
 const {prepararEmergenciaPDF}=await import("../lib/b5-parte-pdf.mjs");
 const b=servicio();
 delete b.datos.svHoraEmergencia;delete b.datos.svHoraLista;
 const pdf=prepararEmergenciaPDF({...b,estado:"sincronizado",numero:3},b.datos,[{id:"v1",nombre:"Ana"}]);
 assert.equal(pdf.horaEmergencia,"Sin registrar");
 assert.equal(pdf.horaLista,"Sin registrar");
 assert.deepEqual(pdf.concurrentes,["Ana"]);
});
test("B5: el código de captura conserva datos locales y el servidor usa hora de emergencia",()=>{
 const frontend=fs.readFileSync(new URL("../app/b5/captura/page.js",import.meta.url),"utf8");
 const backend=fs.readFileSync(new URL("../lib/b5-offline-server.mjs",import.meta.url),"utf8");
 assert.match(frontend,/guardarEdicion\(tipo,form\)/);
 assert.match(frontend,/guardarBorrador\(tipo,datos\)/);
 assert.match(backend,/tipo==="Emergencia"\?d\.svHoraEmergencia:d\.svHoraSalida/);
});


test("contadores separados: asistencia, emergencia y servicio carro",async()=>{
 const {sql}=await base();
 const a=await integrarBorradorB5(sql,asistencia());
 const e=await integrarBorradorB5(sql,servicio());
 assert.equal(a.numero,1);
 assert.equal(e.numero,1);
 assert.equal((await readState(sql,"correlativo:emergencia:2026")).value.actual,1);
 assert.equal((await readState(sql,"correlativo:parte:2026")).value.actual,2);
 const carro=servicio("00000000-0000-4000-8000-000000000090");
 carro.datos.svTipoAct="Mantención";
 carro.datos.svHoraSalida="21:00";
 carro.datos.registrarAsistencia=false;
 const s=await integrarBorradorB5(sql,carro);
 assert.equal(s.numero,1);
 assert.equal((await readState(sql,"correlativo:servicio:2026")).value.actual,1);
 assert.equal((await integrarBorradorB5(sql,carro)).numero,1);
});
test("la nueva serie de emergencia comienza después del último servicio histórico",async()=>{
 const {sql}=await base();
 await writeState(sql,"correlativo:servicio:2026",{actual:27});
 const e=await integrarBorradorB5(sql,servicio());
 assert.equal(e.numero,28);
 assert.equal((await readState(sql,"correlativo:emergencia:2026")).value.actual,28);
});
