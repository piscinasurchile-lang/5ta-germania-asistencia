import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { ensureSchema, readState } from "../../../../lib/state-store.js";
import { fechaValida, diaSiguiente, inicioSemana, horaChile, fotoTipo, persona, esTercero, esCapitan } from "../../../../lib/guardia-libro.js";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const NO_CACHE={"Cache-Control":"no-store"};
function json(v,status=200){return Response.json(v,{status,headers:NO_CACHE});}
function sameOrigin(req){const origin=req.headers.get("origin");if(!origin)return false;try{return new URL(origin).host===req.headers.get("host");}catch{return false;}}
function db(){return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;}
async function iniciar(sql){
  await ensureSchema(sql);
  await sql`CREATE TABLE IF NOT EXISTS guardia_libro_noche (
    fecha date PRIMARY KEY,
    obac_id text NOT NULL,
    nombre_obac text NOT NULL,
    novedades text NOT NULL,
    foto bytea NOT NULL,
    foto_mime text NOT NULL,
    foto_sha256 text NOT NULL,
    revision_aprobada_en text NOT NULL,
    cerrado_en timestamptz NOT NULL DEFAULT now()
  )`;
}
function nombre(p){return [p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" ");}
function permiteVer(p, registro){return esTercero(p)||esCapitan(p)||String(registro.obac_id)===String(p.id);}
export async function POST(req){
  if(!sameOrigin(req))return json({error:"origen_no_permitido"},403);
  if(Number(req.headers.get("content-length")||0)>1800000)return json({error:"foto_demasiado_grande"},413);
  let data;try{data=await req.json();}catch{return json({error:"datos_invalidos"},400);}
  const fecha=String(data?.fecha||""),actorId=String(data?.actorId||"");
  const novedades=String(data?.novedades||"").trim();
  if(!fechaValida(fecha)||!actorId||!novedades||novedades.length>2000)return json({error:"datos_invalidos"},400);
  const match=/^data:image\/(webp|jpeg);base64,([a-zA-Z0-9+/=]+)$/.exec(String(data?.foto||""));
  if(!match||match[2].length>1450000)return json({error:"foto_invalida"},400);
  const foto=Buffer.from(match[2],"base64"),mime=fotoTipo(foto);
  if(!mime||mime!==("image/"+match[1])||foto.length<3000||foto.length>950000)return json({error:"foto_invalida_o_excesiva"},400);
  const ahora=horaChile();
  if(ahora<diaSiguiente(fecha)+"T06:00")return json({error:"noche_no_finalizada"},409);
  // El turno solo se muestra al OBAC hasta el siguiente cambio de guardia.
  const dosDias=diaSiguiente(diaSiguiente(fecha));
  if(ahora>=dosDias+"T06:00")return json({error:"plazo_de_cierre_finalizado"},409);
  const sql=db();if(!sql)return json({error:"database_not_configured"},503);
  try{
    await iniciar(sql);
    const [r,n]=await Promise.all([readState(sql,"roster:v8"),readState(sql,"guardia-revision:"+inicioSemana(fecha))]);
    const p=persona(r.value,actorId),doc=n.value;
    if(!p||doc?.estado!=="aprobada"||String(doc.noches?.[fecha]?.obac)!==actorId)return json({error:"obac_no_autorizado_o_guardia_no_aprobada"},403);
    const hash=crypto.createHash("sha256").update(foto).digest("hex");
    const base64=foto.toString("base64");
    const insert=await sql`INSERT INTO guardia_libro_noche
      (fecha,obac_id,nombre_obac,novedades,foto,foto_mime,foto_sha256,revision_aprobada_en)
      VALUES (${fecha}::date,${actorId},${nombre(p)},${novedades},decode(${base64},'base64'),${mime},${hash},${String(doc.aprobadaEn||"")})
      ON CONFLICT(fecha) DO NOTHING RETURNING fecha`;
    if(!insert.length)return json({error:"libro_ya_cerrado"},409);
    return json({ok:true,fecha,hash,novedades,estado:"pendiente_ratificacion"});
  }catch(err){console.error("guardia libro POST",err);return json({error:"database_error"},500);}
}
export async function GET(req){
  const sql=db();if(!sql)return json({error:"database_not_configured"},503);
  const url=new URL(req.url),actorId=url.searchParams.get("actorId")||"";
  const fecha=url.searchParams.get("fecha"),foto=url.searchParams.get("foto")==="1";
  if(!actorId||foto&&!fecha||fecha&&!fechaValida(fecha))return json({error:"datos_invalidos"},400);
  try{
    await iniciar(sql);
    const r=await readState(sql,"roster:v8"),p=persona(r.value,actorId);
    if(!p)return json({error:"no_autorizado"},403);
    if(foto){
      const rows=await sql`SELECT obac_id,foto_mime,encode(foto,'base64') AS contenido FROM guardia_libro_noche WHERE fecha=${fecha}::date LIMIT 1`;
      if(!rows.length)return json({error:"no_encontrado"},404);
      if(!permiteVer(p,rows[0]))return json({error:"no_autorizado"},403);
      return new Response(Buffer.from(rows[0].contenido,"base64"),{status:200,headers:{"Content-Type":rows[0].foto_mime,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
    }
    const rows=await sql`SELECT to_char(l.fecha,'YYYY-MM-DD') AS fecha,l.obac_id,l.nombre_obac,
      l.novedades,l.foto_sha256,l.revision_aprobada_en,l.cerrado_en,
      COALESCE(a.value->>'estado','') AS estado_acreditacion
      FROM guardia_libro_noche l
      LEFT JOIN app_state a ON a.key='guardia-acreditacion:' || to_char(l.fecha,'YYYY-MM-DD')
      ORDER BY l.fecha DESC LIMIT 90`;
    return json({items:rows.filter(row=>permiteVer(p,row)).slice(0,30)});
  }catch(err){console.error("guardia libro GET",err);return json({error:"database_error"},500);}
}
