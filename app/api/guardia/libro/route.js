import {neon} from "@neondatabase/serverless";
import {createHash} from "node:crypto";
import {ensureSchema,readState} from "../../../../lib/state-store.js";
import {firmaDotacion} from "../../../../lib/guardia-acreditacion.js";
import {miercolesSemana,horaCivilChile,ventanaCierreOBAC,nocheFinalizada,cargoT3,cargoCapitan,puedeVerLibro} from "../../../../lib/guardia-libro.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const MAX_PHOTO=1600000;
const error=(code,status)=>Response.json({error:code},{status});
const nombre=p=>[p?.nombre,p?.apellidoPaterno,p?.apellidoMaterno].filter(Boolean).join(" ").trim();
const actorDe=(r,id)=>(Array.isArray(r)?r:[]).find(p=>String(p.id)===String(id)&&p.activo!==false);
function origen(req){let o=req.headers.get("origin");if(!o)return false;try{return new URL(o).host===req.headers.get("host");}catch{return false;}}
function mimeDe(b){
 if(b.length>12&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP")return "image/webp";
 if(b.length>3&&b[0]===255&&b[1]===216&&b[2]===255)return "image/jpeg";
 if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 return null;
}
async function db(){
 if(!process.env.DATABASE_URL)throw Error("no_database");
 const sql=neon(process.env.DATABASE_URL);
 await ensureSchema(sql);
 return sql;
}
async function guardia(sql,fecha){
 const inicio=miercolesSemana(fecha);
 if(!inicio)return null;
 const rev=await readState(sql,"guardia-revision:"+inicio);
 if(rev.value?.estado!=="aprobada"||!rev.value.aprobadaEn)return null;
 const noche=rev.value.noches?.[fecha];
 return noche?{revision:rev.value,noche}:null;
}
export async function GET(req){
 const u=new URL(req.url),id=u.searchParams.get("actorId")||"";
 if(!id)return error("actor_requerido",400);
 try{
  const sql=await db(),roster=(await readState(sql,"roster:v8")).value,actor=actorDe(roster,id);
  if(!actor)return error("actor_no_en_nomina",403);
  if(u.searchParams.get("foto")==="1"){
   const fecha=u.searchParams.get("fecha")||"",g=await guardia(sql,fecha);
   if(!g||!puedeVerLibro(actor,g.noche))return error("no_autorizado",403);
   const cierre=(await readState(sql,"guardia-libro:"+fecha)).value;
   if(!cierre?.fotoClave)return error("foto_no_disponible",404);
   const rows=await sql.query("SELECT encode(data,'base64') AS b64 FROM document_assets WHERE key=$1 AND active=true LIMIT 1",[cierre.fotoClave]);
   if(!rows.length)return error("foto_no_disponible",404);
   return new Response(Buffer.from(rows[0].b64,"base64"),{headers:{"Content-Type":cierre.fotoMime||"image/jpeg","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  }
  const ahora=horaCivilChile();
  const q="SELECT g.value AS revision,n.fecha,n.dotacion,cl.value AS cierre,ac.value AS acreditacion,COALESCE(ac.version,0) AS acreditacion_version "+
    "FROM (SELECT key,value FROM app_state WHERE key LIKE 'guardia-revision:%' ORDER BY key DESC LIMIT 8) g "+
    "CROSS JOIN LATERAL jsonb_each(COALESCE(g.value->'noches','{}'::jsonb)) AS n(fecha,dotacion) "+
    "LEFT JOIN app_state cl ON cl.key='guardia-libro:'||n.fecha "+
    "LEFT JOIN app_state ac ON ac.key='guardia-acreditacion:'||n.fecha "+
    "WHERE g.value->>'estado'='aprobada' AND n.fecha<=$1 ORDER BY n.fecha DESC LIMIT 56";
  const rows=await sql.query(q,[ahora.slice(0,10)]);
  const of=cargoT3(actor.cargo)||cargoCapitan(actor.cargo);
  const items=rows.filter(r=>of||String(r.dotacion?.obac||"")===String(actor.id))
   .map(r=>({fecha:r.fecha,revisionAprobadaEn:r.revision.aprobadaEn,dotacion:r.dotacion,
     cierre:r.cierre,acreditacion:r.acreditacion,acreditacionVersion:Number(r.acreditacion_version||0),
     finalizada:nocheFinalizada(r.fecha,ahora),cierreHabilitado:ventanaCierreOBAC(r.fecha,ahora),
     acreditacionVigente:!!r.acreditacion&&r.acreditacion.estado==="acreditada"&&
       r.acreditacion.revisionAprobadaEn===r.revision.aprobadaEn&&
       r.acreditacion.dotacionFirma===firmaDotacion(r.dotacion)}));
  return Response.json({items,esT3:cargoT3(actor.cargo),esCapitan:cargoCapitan(actor.cargo)},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia libro GET",e);return error("database_error",500);}
}
export async function POST(req){
 if(!origen(req))return error("origen_no_permitido",403);
 let f;try{f=await req.formData();}catch{return error("formulario_invalido",400);}
 const fecha=String(f.get("fecha")||""),actorId=String(f.get("actorId")||"");
 const novedades=String(f.get("novedades")||"").trim(),foto=f.get("foto");
 if(!miercolesSemana(fecha)||!actorId||!novedades||novedades.length>1800||!foto||typeof foto.arrayBuffer!=="function")return error("datos_incompletos",400);
 if(!foto.size||foto.size>MAX_PHOTO)return error("foto_supera_limite_1_6mb",413);
 const bytes=Buffer.from(await foto.arrayBuffer()),mime=mimeDe(bytes);
 if(!mime)return error("formato_foto_invalido",415);
 try{
  const sql=await db(),roster=(await readState(sql,"roster:v8")).value,actor=actorDe(roster,actorId);
  const g=await guardia(sql,fecha),ahora=horaCivilChile();
  if(!actor||!g||String(g.noche.obac)!==String(actorId))return error("solo_obac_designado",403);
  if(!ventanaCierreOBAC(fecha,ahora))return error("fuera_de_ventana_cierre",409);
  const firma=firmaDotacion(g.noche);
  if(!firma)return error("dotacion_incompleta",409);
  if((await readState(sql,"guardia-libro:"+fecha)).value)return error("libro_ya_cerrado",409);
  const fotoClave="guardia_libro_"+fecha,hash=createHash("sha256").update(bytes).digest("hex");
  const meta={fecha,estado:"enviado",obacId:String(actor.id),obacNombre:nombre(actor),
    novedades,fotoClave,fotoMime:mime,fotoBytes:bytes.length,fotoSHA256:hash,
    revisionAprobadaEn:g.revision.aprobadaEn,dotacionFirma:firma,
    enviadoEn:new Date().toISOString(),destinatarios:["teniente_tercero","capitan"]};
  const query="WITH foto AS (INSERT INTO document_assets(key,data,active,source,effective_year,updated_at) "+
    "VALUES ($1,decode($2,'base64'),true,'guardia_libro',$3,now()) ON CONFLICT(key) DO NOTHING RETURNING key), "+
    "cierre AS (INSERT INTO app_state(key,value,updated_at,version) SELECT $4,$5::jsonb,now(),1 FROM foto "+
    "ON CONFLICT(key) DO NOTHING RETURNING version) SELECT EXISTS(SELECT 1 FROM cierre) AS ok";
  const rows=await sql.query(query,[fotoClave,bytes.toString("base64"),Number(fecha.slice(0,4)),"guardia-libro:"+fecha,JSON.stringify(meta)]);
  if(!rows[0]?.ok)return error("cierre_existente_o_conflicto",409);
  return Response.json({ok:true,fecha,obac:meta.obacNombre,hash},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("guardia libro POST",e);return error("database_error",500);}
}
