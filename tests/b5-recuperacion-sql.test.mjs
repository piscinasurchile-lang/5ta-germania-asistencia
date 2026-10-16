import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {PGlite} from "@electric-sql/pglite";
import {construirRecuperacionComandancia} from "../lib/b5-recuperar-comandancia.mjs";

const sqlRoute=fs.readFileSync(new URL("../app/api/b5/recuperar-comandancia/route.js",import.meta.url),"utf8");
const sqlText=sqlRoute.match(/const resultados=await sql`([\s\S]*?)`;/)?.[1];
if(!sqlText)throw new Error("No fue posible extraer la sentencia exacta de producción.");
function sqlConParametros(obj){
  const parametros=[],ids=new Map();
  const query=sqlText.replace(/\$\{([^}]+)\}/g,(_,n)=>{
    if(!ids.has(n)){ids.set(n,ids.size+1);parametros.push(obj[n]);}
    return "$"+ids.get(n);
  });
  return {query,parametros};
}
function origen(){
  const ids=Array.from({length:28},(_,i)=>"v"+i);
  const records=Object.fromEntries(ids.map(id=>[id,"ausente"]));
  const fuente={id:"00000000-0000-4000-8000-000000000010",date:"2026-10-15",
    tipo:"Citación de Compañía",records:Object.fromEntries(ids.map((id,i)=>[
      id,i<10?"presente":i<17?"ausente":"justificado"
    ]))};
  const original={date:"2026-10-15",tipo:"Citación de Compañía",
    b5OfflineId:"00000000-0000-4000-8000-000000000006",numero:6,
    origenAsistencia:"citacion_manual",records,anulado:true,generaAsistencia:false};
  return {original,fuente};
}
test("la sentencia atómica cambia el parte N.º 6 y su índice sin duplicarlos",async()=>{
  const db=new PGlite();
  try{
    await db.exec("CREATE TABLE app_state(key text primary key,value jsonb,version integer not null,updated_at timestamptz not null default now())");
    const {original,fuente}=origen();
    const key="parte:2026-10-15__citacion-de-compania";
    const suffix="2026-10-15__citacion-de-compania";
    await db.query("INSERT INTO app_state (key,value,version) VALUES ($1,$2::jsonb,2)",
      [key,JSON.stringify(original)]);
    await db.query("INSERT INTO app_state (key,value,version) VALUES ($1,$2::jsonb,4)",
      ["partes:index:v1",JSON.stringify([{clave:suffix,date:"2026-10-15",tipo:"Citación de Compañía"}])]);
    const siguiente=construirRecuperacionComandancia(original,fuente,new Date().toISOString());
    const args={json:JSON.stringify(siguiente),CLAVE_COMANDANCIA_15:key,
      "actual.version":2,CLAVE_INDICE_COMANDANCIA_15:suffix,
      TIPO_RECUPERADO_COMANDANCIA_15:"Citación de Comandancia"};
    const {query,parametros}=sqlConParametros(args);
    const guardado=await db.query(query,parametros);
    assert.equal(guardado.rows.length,1);
    assert.equal(guardado.rows[0].parte_version,3);
    assert.equal(guardado.rows[0].indice_version,5);
    const result=await db.query("SELECT key,value,version FROM app_state ORDER BY key");
    assert.equal(result.rows.length,2);
    const p=result.rows.find(x=>x.key===key),idx=result.rows.find(x=>x.key==="partes:index:v1");
    assert.equal(p.value.numero,6);
    assert.equal(p.value.tipo,"Citación de Comandancia");
    assert.equal(p.value.anulado,false);
    assert.equal(Object.values(p.value.records).filter(x=>x==="presente").length,10);
    assert.equal(idx.value[0].tipo,"Citación de Comandancia");
    const otra=await db.query(query,parametros);
    assert.equal(otra.rows[0].parte_version,null);
    assert.equal(otra.rows[0].indice_version,null);
    const check=await db.query("SELECT version FROM app_state WHERE key=$1",[key]);
    assert.equal(check.rows[0].version,3);
  }finally{await db.close();}
});
