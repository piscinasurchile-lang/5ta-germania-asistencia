import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {filasArchivo} from "../../../../lib/asistencia-xlsx.mjs";
import {prepararFilas, conciliar, normalizar} from "../../../../lib/asistencia-conciliacion.mjs";

export const runtime="nodejs";
export const maxDuration=30;
const NO_CACHE={"Cache-Control":"no-store"};
function error(motivo,status=400){return Response.json({error:motivo},{status,headers:NO_CACHE});}
function allowed(request) {
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try {if(new URL(origin).host!==request.headers.get("host"))return false;}
  catch {return false;}
  const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN;
  const got=request.cookies?.get("quinta_oficialidad")?.value||"";
  if(!secret||!got)return false;
  const expected=crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
  const a=Buffer.from(got),b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
function digest(v){return crypto.createHash("sha256").update(v).digest("hex");}
function resumen(arr){return arr.slice(0,35);}
function vista(plan,meta) {
  return {
    ...meta,
    totales:{filas:plan.total,existentes:plan.iguales.length,nuevas:plan.nuevas.length,
      diferencias:plan.diferencias.length,ambiguas:plan.ambiguas.length,
      duplicadasArchivo:plan.duplicadasArchivo.length,errores:plan.errores.length,
      fueraIndice:plan.fueraIndice},
    nuevas:resumen(plan.nuevas.map(({date,tipo,detalle,ubicacion})=>({fecha:date,tipo,detalle,ubicacion}))),
    diferencias:resumen(plan.diferencias),
    ambiguas:resumen(plan.ambiguas),
    errores:resumen(plan.errores),
    duplicadasArchivo:resumen(plan.duplicadasArchivo),
    puedeAplicar:plan.errores.length===0&&plan.ambiguas.length===0&&
      plan.diferencias.length===0&&plan.duplicadasArchivo.length===0
  };
}
function extraerDatos(rows) {
  const byKey=new Map(rows.map(r=>[r.key,r]));
  const roster=byKey.get("roster:v8")?.value;
  const index=byKey.get("partes:index:v1")?.value;
  if(!Array.isArray(roster)||!Array.isArray(index))throw new Error("La nómina o el índice de partes no está disponible");
  const parts=rows.filter(r=>r.key.startsWith("parte:")&&r.value&&
    typeof r.value==="object"&&!Array.isArray(r.value)&&r.value.date&&r.value.tipo);
  const validos=new Set(index.map(i=>i.clave));
  const fuera=parts.filter(p=>!validos.has(p.key.slice(6)));
  return {roster,index,parts,fuera,tipos:byKey.get("tipos:v2")?.value||[],
    version:byKey.get("partes:index:v1")?.version||0,
    snapshot:digest(JSON.stringify(rows.map(r=>[r.key,r.version,r.value])))};
}
function analizar(archivo,datos) {
  const filas=filasArchivo(archivo.name,archivo.buffer);
  if(filas.length>4000)throw new Error("La planilla supera 4.000 actividades");
  const {actividades,errores}=prepararFilas(filas,datos.roster,datos.tipos);
  const consulta=conciliar(actividades,datos.parts.map(p=>p.value));
  return {...consulta,errores,total:filas.length,fueraIndice:datos.fuera.length};
}
export async function POST(request){
  if(!allowed(request))return error("Acceso de Oficialidad requerido",403);
  if(!process.env.DATABASE_URL)return error("Base de datos no configurada",503);
  let form,mode,file,buffer;
  try{
    form=await request.formData();
    mode=String(form.get("accion")||"vista_previa");
    file=form.get("archivo");
    if(!file||typeof file.arrayBuffer!=="function")return error("Adjunte archivo Excel o CSV");
    if(file.size>8*1024*1024||file.size<10)return error("Archivo vacío o demasiado grande (máximo 8 MB)");
    buffer=Buffer.from(await file.arrayBuffer());
  }catch{return error("No fue posible recibir el archivo");}
  if(!["vista_previa","aplicar"].includes(mode))return error("Acción desconocida");
  if(!/^[^\r\n/\\]{1,120}\.(xlsx|csv)$/i.test(file.name))return error("Formato: Excel .xlsx o .csv");
  const sql=neon(process.env.DATABASE_URL);
  try{
    const rows=await sql.query("SELECT key,value,version FROM app_state WHERE key IN ('roster:v8','tipos:v2','partes:index:v1') OR key LIKE 'parte:%' ORDER BY key LIMIT 4000",[]);
    const datos=extraerDatos(rows);
    const plan=analizar({name:file.name,buffer},datos);
    const huella=digest(digest(buffer)+"|"+datos.snapshot);
    const pre=vista(plan,{archivo:file.name,huella,fecha:new Date().toISOString()});
    if(mode==="vista_previa")return Response.json(pre,{headers:NO_CACHE});
    if(form.get("huella")!==huella)return error("Los datos cambiaron desde la comparación. Vuelva a comparar.",409);
    if(!pre.puedeAplicar)return error("Hay conflictos o actividades sin identificar; revise antes de aplicar",409);
    const existentes=new Set(datos.index.map(i=>i.clave));
    const entries=[];
    for(const a of plan.nuevas){
      const present=Object.entries(a.records).filter(([,estado])=>estado==="presente").map(([id])=>id).sort().join(",");
      const id=digest([a.date,normalizar(a.tipo),normalizar(a.detalle),present].join("|")).slice(0,20);
      const clave=a.date+"__excel_"+id;
      if(existentes.has(clave)||entries.some(p=>p.clave===clave))return error("Identificador duplicado; revisar Excel",409);
      entries.push({clave,key:"parte:"+clave,parte:{date:a.date,tipo:a.tipo,detalle:a.detalle,
        records:a.records,registradoPor:"",importado:true,importId:"excel-2026:"+id,importFuente:file.name}});
    }
    const indice=datos.index.slice();
    for(const row of datos.fuera){
      const p=row.value,clave=row.key.slice(6);
      if(!existentes.has(clave)){indice.push({clave,date:p.date,tipo:p.tipo});existentes.add(clave);}
    }
    for(const e of entries)indice.push({clave:e.clave,date:e.parte.date,tipo:e.parte.tipo});
    if(!entries.length&&!datos.fuera.length)return Response.json({ok:true,aplicadas:0,recuperadasIndice:0,totales:pre.totales},{headers:NO_CACHE});
    const payload=JSON.stringify(entries.map(e=>({key:e.key,parte:e.parte}))), nuevoIndice=JSON.stringify(indice);
    // Una única sentencia: fallo de versión o inserciones aborta íntegra la operación.
    const statement=[
      "WITH lockidx AS MATERIALIZED (SELECT version FROM app_state WHERE key='partes:index:v1' FOR UPDATE),",
      "backup AS (INSERT INTO app_state_history(key,value,version,replaced_at)",
      "SELECT 'partes:index:v1',s.value,s.version,now() FROM app_state s",
      "WHERE s.key='partes:index:v1' AND s.version=$2 AND (SELECT version FROM lockidx)=$2",
      "RETURNING id),",
      "inserted AS (INSERT INTO app_state(key,value,version,updated_at)",
      "SELECT e->>'key',e->'parte',1,now() FROM jsonb_array_elements($1::jsonb) e",
      "WHERE (SELECT version FROM lockidx)=$2",
      "ON CONFLICT(key) DO NOTHING RETURNING key),",
      "updated AS (UPDATE app_state SET value=$3::jsonb,version=version+1,updated_at=now()",
      "WHERE key='partes:index:v1' AND version=$2",
      "AND (SELECT count(*) FROM inserted)=$4",
      "AND (SELECT count(*) FROM backup)=1 RETURNING key)",
      "SELECT 1/(CASE WHEN (SELECT count(*) FROM updated)=1 THEN 1 ELSE 0 END) AS check_ok,",
      "(SELECT count(*)::int FROM inserted) AS cantidad"
    ].join("\n");
    const out=await sql.query(statement,[payload,datos.version,nuevoIndice,entries.length]);
    return Response.json({ok:true,aplicadas:Number(out[0]?.cantidad||0),
      recuperadasIndice:datos.fuera.length,totales:pre.totales},{headers:NO_CACHE});
  }catch(ex){
    const mensaje=String(ex?.message||"Error desconocido");
    if(/columna|hojas|excel|csv|ZIP|planilla|archivo|filas|límite/i.test(mensaje))
      return error(mensaje,422);
    console.error("Conciliación asistencia:",ex);
    return error("La actualización no se completó. Compare nuevamente antes de reintentar.",409);
  }
}
