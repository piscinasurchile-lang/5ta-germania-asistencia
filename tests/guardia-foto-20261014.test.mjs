import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {PGlite} from "@electric-sql/pglite";
import {resetSchemaCache,ensureSchema,writeState,readState} from "../lib/state-store.js";
import {FOTO,SQL_STEPS,planParaNomina} from "../lib/guardia-foto-oct2026.mjs";

const DATA=[
["504","Francisco","Vega","Lara"],["505","Diego","Lozano","González"],
["525","Gustavo","Jerez","Pantoja"],["517","Christian","Vergara","Sandoval"],
["521","Rodolfo Ignacio","Maldonado","Avendaño"],["524","María Paz","Ortega","González"],
["Esthe","Esthefani","Opazo",""],["502","Matías","Corvalán","Garrido"],
["45","Fernando","Jerez","Pantoja"],["510","Ludwig","Von Plessing","Cea"],
["522","Manuel","Moller","Henríquez"],["Saida","Saida","Pollak","Donoso"],
["501","Tomás","Lara","Jeffs"],["503","Andrés","Herrera","Santander"],
["75","Karam","Puali","López"],["Felipe","Felipe","Carrillo","Ahumada"],
["523","Joaquín","Bustos","Guzmán"],["508","Pablo","Arellano","Graell"],
["9","Fernando","Ortega","Gutiérrez"],["507","Mathias","Von Leyser","Jux"],
["506","Susumu","Sugiura","Aguilar"]
];
const id=c=>c==="Esthe"?"b7df615b-42c2-46c1-8e34-0e642ddc7d29":"id-"+c;
const roster=()=>DATA.map(([code,nombre,apellidoPaterno,apellidoMaterno])=>({
 id:id(code),nombre,apellidoPaterno,apellidoMaterno,
 clave:/^\d+$/.test(code)?code:null,activo:true,cargo:"Voluntario",rut:""
}));
async function base(){
 const db=new PGlite();
 const sql=(parts,...args)=>{
   let t=parts[0];args.forEach((_,i)=>{t+="$"+(i+1)+parts[i+1]});
   return db.query(t,args).then(r=>r.rows);
 };
 resetSchemaCache();await ensureSchema(sql);
 for(let i=0;i<13;i++)await writeState(sql,"roster:v8",roster());
 for(const fecha of Object.keys(FOTO)){
   const inicial={fechaIng:fecha,horaIng:"22:45",fechaSal:"2026-10-21",horaSal:"06:00",
     oficial:id("504"),conductor:id("505"),guardianes:[
       {id:id("517"),estado:"cuartel"},{id:id("521"),estado:"cuartel"}],novedades:""};
   await writeState(sql,"guardia:"+fecha+"__2245",inicial);
 }
 const inicial={estado:"aprobada",base:{},noches:{},cambios:[]};
 for(let i=0;i<2;i++)await writeState(sql,"guardia-revision:2026-10-14",inicial);
 for(const p of DATA.slice(0,20))await writeState(sql,"guardia-inscripcion:2026-10-14:"+id(p[0]),["2026-10-14"]);
 return {db,sql};
}
async function ejecutar(db){
 await db.exec("BEGIN");
 try{
   for(const step of SQL_STEPS)await db.query(step);
   await db.exec("COMMIT");
 }catch(e){await db.exec("ROLLBACK");throw e;}
}
test("planilla de fotografía contiene 7 noches, 21 personas y 35 voluntarios",()=>{
 const d=planParaNomina(roster());
 assert.equal(d.length,7);
 assert.equal(d.reduce((n,x)=>n+x.voluntarios.length,0),35);
 assert.equal(new Set(d.flatMap(x=>[x.obac.id,x.conductor.id,...x.voluntarios.map(v=>v.id)])).size,21);
 assert.equal(d[3].obac.id,id("501"));
 assert.equal(d[3].voluntarios.length,6);
 assert.equal(d[0].voluntarios.at(-1).nombre,"Esthefani Noemí Ojeda Fuentes");
});
test("transacción completa cambia los siete días, revisión, 21 inscripciones y ficha",async()=>{
 const {db,sql}=await base();
 await ejecutar(db);
 for(const [fecha, [ob,maq,vol]] of Object.entries(FOTO)){
   const key="guardia:"+fecha+"__2245";
   const actual=await readState(sql,key);
   assert.equal(actual.version,2);
   assert.equal(actual.value.oficial,id(ob));
   assert.equal(actual.value.conductor,id(maq));
   assert.deepEqual(actual.value.guardianes.map(x=>x.id),vol.map(id));
   assert.equal(actual.value.horaIng,"22:45");
   assert.equal(actual.value.novedades,"");
 }
 const revision=await readState(sql,"guardia-revision:2026-10-14");
 assert.equal(revision.version,3);
 assert.equal(revision.value.estado,"aprobada");
 assert.equal(Object.keys(revision.value.noches).length,7);
 assert.equal(revision.value.cambios.at(-1).accion,"reemplazo_planilla_semanal");
 const lista=await readState(sql,"roster:v8");
 assert.equal(lista.version,14);
 const esthe=lista.value.find(p=>p.id===id("Esthe"));
 assert.equal(esthe.nombre,"Esthefani Noemí");
 assert.equal(esthe.apellidoPaterno,"Ojeda");
 assert.equal(esthe.apellidoMaterno,"Fuentes");
 assert.equal(esthe.rut,"22.532.509-K");
 const q=await db.query("SELECT key,value FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%'");
 assert.equal(q.rows.length,21);
 assert.ok(q.rows.every(x=>x.value.length>0));
 const pablo=q.rows.find(x=>x.key.endsWith(id("508")));
 assert.deepEqual(pablo.value,["2026-10-17"]);
 assert.equal((await db.query("SELECT count(*)::int AS n FROM app_state WHERE key LIKE 'guardia-acreditacion:%'")).rows[0].n,0);
});
test("una aplicación duplicada se rechaza, sin nuevos cambios",async()=>{
 const {db,sql}=await base();
 await ejecutar(db);
 await assert.rejects(()=>ejecutar(db),/VERSION_NOMINA/);
 assert.equal((await readState(sql,"guardia-revision:2026-10-14")).version,3);
 assert.equal((await readState(sql,"roster:v8")).version,14);
});
test("versión modificada de la revisión impide todo el cambio",async()=>{
 const {db,sql}=await base();
 await writeState(sql,"guardia-revision:2026-10-14",{estado:"aprobada",noches:{},cambios:[]});
 await assert.rejects(()=>ejecutar(db),/VERSION_REVISION/);
 assert.equal((await readState(sql,"roster:v8")).version,13);
 assert.equal((await readState(sql,"guardia:2026-10-14__2245")).version,1);
});
test("la nueva ruta exige confirmación y no usa rutas de asistencia o de acreditación",()=>{
 const api=fs.readFileSync(new URL("../app/api/guardia/actualizar-planilla/route.js",import.meta.url),"utf8");
 const page=fs.readFileSync(new URL("../app/guardia/actualizar-planilla/page.js",import.meta.url),"utf8");
 const menu=fs.readFileSync(new URL("../public/legacy/germania-oficiales-menu.js",import.meta.url),"utf8");
 assert.match(api,/aceptoActualizarInscripciones/);
 assert.match(api,/sql\.transaction\(SQL_STEPS\.map/);
 assert.match(api,/sameOrigin\(request\)/);
 assert.match(page,/Actualizar guardia semanal en Germania/);
 assert.match(page,/window\.confirm/);
 assert.match(menu,/ofActualizarPlanillaFoto/);
});
