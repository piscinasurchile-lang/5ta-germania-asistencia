import { neon } from "@neondatabase/serverless";
import { buscarOficial2026 } from "../../../../lib/oficialidad-2026";
export const runtime="nodejs";export const dynamic="force-dynamic";
const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
const vd=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||"");
function so(r){const o=r.headers.get("origin");if(!o)return false;try{return new URL(o).host===r.headers.get("host")}catch{return false}}
async function schema(s){await s`CREATE TABLE IF NOT EXISTS guardia_cambios_periodo(id bigserial PRIMARY KEY,fecha_inicio_original date NOT NULL,fecha_fin_original date NOT NULL,accion text NOT NULL,nuevo_inicio date,nuevo_fin date,motivo text NOT NULL,oficial varchar(6) NOT NULL,afectados jsonb NOT NULL DEFAULT '[]'::jsonb,creado_en timestamptz NOT NULL DEFAULT now())`}
export async function POST(r){
 if(!so(r))return Response.json({error:"forbidden_origin"},{status:403});const s=db();if(!s)return Response.json({error:"database_not_configured"},{status:503});
 let b;try{b=await r.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
 const inicio=String(b.fechaInicio||""),fin=String(b.fechaFin||""),accion=String(b.accion||""),ni=String(b.nuevoInicio||""),nf=String(b.nuevoFin||""),motivo=String(b.motivo||"").trim().slice(0,1000),oficial=String(b.oficial||"");
 if(!vd(inicio)||!vd(fin)||!["cancelar","reprogramar"].includes(accion)||!motivo||!buscarOficial2026(oficial))return Response.json({error:"invalid_data"},{status:400});
 if(accion==="reprogramar"){if(!vd(ni)||!vd(nf))return Response.json({error:"invalid_new_period"},{status:400});const d=Math.round((new Date(nf+"T12:00:00")-new Date(ni+"T12:00:00"))/86400000);if(d!==6)return Response.json({error:"period_must_be_7_days"},{status:400})}
 try{
  await schema(s);
  const w=await s`SELECT id,estado,apertura,cierre FROM guardia_semanas WHERE fecha_inicio=${inicio}::date AND fecha_fin=${fin}::date LIMIT 1`;if(!w.length)return Response.json({error:"not_found"},{status:404});
  const ins=await s`SELECT codigo,nombre,array_agg(fecha::text ORDER BY fecha) fechas FROM guardia_inscripciones WHERE semana_inicio=${inicio}::date GROUP BY codigo,nombre ORDER BY nombre`;
  const afectados=JSON.stringify(ins);
  if(accion==="cancelar"){
   await s.transaction([
    s`UPDATE guardia_semanas SET estado='cancelada',actualizado_en=now() WHERE id=${w[0].id}`,
    s`INSERT INTO guardia_cambios_periodo(fecha_inicio_original,fecha_fin_original,accion,motivo,oficial,afectados) VALUES(${inicio}::date,${fin}::date,'cancelar',${motivo},${oficial},${afectados}::jsonb)`
   ]);
  }else{
   const existe=await s`SELECT id FROM guardia_semanas WHERE fecha_inicio=${ni}::date AND fecha_fin=${nf}::date LIMIT 1`;if(existe.length)return Response.json({error:"new_period_exists"},{status:409});
   await s.transaction([
    s`UPDATE guardia_semanas SET estado='cancelada',actualizado_en=now() WHERE id=${w[0].id}`,
    s`INSERT INTO guardia_semanas(fecha_inicio,fecha_fin,apertura,cierre,estado,creado_por) VALUES(${ni}::date,${nf}::date,${w[0].apertura},${w[0].cierre},'confirmada',${oficial})`,
    s`INSERT INTO guardia_cambios_periodo(fecha_inicio_original,fecha_fin_original,accion,nuevo_inicio,nuevo_fin,motivo,oficial,afectados) VALUES(${inicio}::date,${fin}::date,'reprogramar',${ni}::date,${nf}::date,${motivo},${oficial},${afectados}::jsonb)`
   ]);
  }
  const texto=accion==="cancelar"?`Guardia Nocturna 5ª Compañía: se informa que el período ${inicio} al ${fin} fue cancelado. Motivo: ${motivo}.`:`Guardia Nocturna 5ª Compañía: el período ${inicio} al ${fin} fue modificado. Nuevo período: ${ni} al ${nf}. Las inscripciones anteriores no se trasladan; se abrirá una nueva inscripción. Motivo: ${motivo}.`;
  return Response.json({ok:true,accion,afectados:ins,mensaje:texto,nuevoPeriodo:accion==="reprogramar"?{inicio:ni,fin:nf,estado:"confirmada"}:null});
 }catch(e){console.error(e);return Response.json({error:"database_error"},{status:500})}
}