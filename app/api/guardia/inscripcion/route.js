import {permitirInscripcionHeredada} from "../../../../lib/guardia-acceso.mjs";
import { neon } from "@neondatabase/serverless";
export const runtime="nodejs"; export const dynamic="force-dynamic";
const vd=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||""),vc=v=>/^\d{1,6}$/.test(v||"");
const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
function origin(r){const o=r.headers.get("origin");if(!o)return false;try{return new URL(o).host===r.headers.get("host")}catch{return false}}
async function schema(s){
 await s`CREATE TABLE IF NOT EXISTS guardia_inscripciones(id bigserial PRIMARY KEY,semana_inicio date NOT NULL,fecha date NOT NULL,codigo varchar(6) NOT NULL,nombre text NOT NULL,creado_en timestamptz NOT NULL DEFAULT now(),UNIQUE(semana_inicio,fecha,codigo))`;
 await s`ALTER TABLE guardia_inscripciones ADD COLUMN IF NOT EXISTS conductor_disponible boolean NOT NULL DEFAULT false`;
 await s`CREATE INDEX IF NOT EXISTS guardia_inscripciones_semana_idx ON guardia_inscripciones(semana_inicio,fecha)`;
 await s`CREATE TABLE IF NOT EXISTS guardia_semanas(id bigserial PRIMARY KEY,fecha_inicio date NOT NULL,fecha_fin date NOT NULL,apertura timestamptz NOT NULL,cierre timestamptz NOT NULL,estado text NOT NULL DEFAULT 'abierta',creado_por varchar(6) NOT NULL,creado_en timestamptz NOT NULL DEFAULT now(),actualizado_en timestamptz NOT NULL DEFAULT now(),UNIQUE(fecha_inicio,fecha_fin))`;
}
async function esMaquinista(s,codigo){
 if(!codigo)return false;
 const r=await s`SELECT value FROM app_state WHERE key='roster:v8' LIMIT 1`;
 const roster=r[0]?.value||[]; return roster.some(p=>String(p.clave)===codigo&&p.activo!==false&&p.conductor===true);
}
export async function GET(r){
 const s=db();if(!s)return Response.json({error:"database_not_configured"},{status:503});
 const u=new URL(r.url),inicio=u.searchParams.get("inicio"),codigo=u.searchParams.get("codigo")||"";
 if(!vd(inicio)||codigo&&!vc(codigo))return Response.json({error:"invalid_data"},{status:400});
 try{await schema(s);
  const rows=await s`SELECT fecha::text,codigo,nombre,conductor_disponible FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date ORDER BY fecha,creado_en`;
  const dias={};for(const x of rows){const f=String(x.fecha).slice(0,10);(dias[f]??=[]).push({codigo:String(x.codigo),nombre:x.nombre,maquinistaDisponible:!!x.conductor_disponible})}
  const propias=codigo?rows.filter(x=>String(x.codigo)===codigo).map(x=>String(x.fecha).slice(0,10)):[];
  const w=(await s`SELECT estado,apertura,cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date ORDER BY creado_en DESC LIMIT 1`)[0]||null;
  const now=Date.now(),abierta=!!w&&w.estado==="abierta"&&now>=+new Date(w.apertura)&&now<=+new Date(w.cierre);
  return Response.json({dias,propias,esMaquinista:await esMaquinista(s,codigo),semana:w?{...w,abierta}:null},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}
export async function PUT(r){
 // No confiar en codigo/nombre del cliente como identidad. Mantener cerrada
 // la escritura heredada hasta disponer de sesión individual verificada.
 if(!permitirInscripcionHeredada(process.env)) return Response.json({error:"identity_verification_required"},{status:403,headers:{"Cache-Control":"no-store"}});
 if(!origin(r))return Response.json({error:"forbidden_origin"},{status:403});const s=db();if(!s)return Response.json({error:"database_not_configured"},{status:503});
 let b;try{b=await r.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
 const inicio=String(b.inicio||""),codigo=String(b.codigo||""),nombre=String(b.nombre||"").trim(),fechas=[...new Set((Array.isArray(b.fechas)?b.fechas:[]).map(String))];
 if(!vd(inicio)||!vc(codigo)||!nombre||fechas.some(f=>!vd(f))||fechas.length<2||fechas.length>7)return Response.json({error:"minimum_two_nights"},{status:400});
 try{await schema(s);const w=(await s`SELECT fecha_fin::text,estado,apertura,cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date ORDER BY creado_en DESC LIMIT 1`)[0];
  if(!w)return Response.json({error:"registration_not_open"},{status:409});const fin=String(w.fecha_fin).slice(0,10),now=Date.now();
  if(w.estado!=="abierta"||now<+new Date(w.apertura)||now>+new Date(w.cierre))return Response.json({error:"registration_closed"},{status:409});
  if(fechas.some(f=>f<inicio||f>fin))return Response.json({error:"invalid_date_for_week"},{status:400});
  const maq=await esMaquinista(s,codigo),disp=maq&&b.conductorDisponible===true,payload=JSON.stringify(fechas),lock=Number(inicio.replaceAll("-",""));
  await s.transaction([s`SELECT pg_advisory_xact_lock(${lock})`,s`DELETE FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date AND codigo=${codigo}`,s`INSERT INTO guardia_inscripciones(semana_inicio,fecha,codigo,nombre,conductor_disponible) SELECT ${inicio}::date,value::date,${codigo},${nombre},${disp} FROM jsonb_array_elements_text(${payload}::jsonb) ON CONFLICT(semana_inicio,fecha,codigo) DO UPDATE SET nombre=EXCLUDED.nombre,conductor_disponible=EXCLUDED.conductor_disponible`]);
  return Response.json({ok:true,total:fechas.length,esMaquinista:maq,conductorDisponible:disp},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}
