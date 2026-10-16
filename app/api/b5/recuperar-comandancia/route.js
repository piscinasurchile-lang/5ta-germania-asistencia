import crypto from "node:crypto";
import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState} from "../../../../lib/state-store.js";
import {buscarDispositivo,REGISTRY_KEY,DEVICE_COOKIE,cookieValue,sameOrigin}
  from "../../../../lib/b5-dispositivo.mjs";
import {
  construirRecuperacionComandancia,
  CLAVE_COMANDANCIA_15,CLAVE_INDICE_COMANDANCIA_15,
  TIPO_RECUPERADO_COMANDANCIA_15
} from "../../../../lib/b5-recuperar-comandancia.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"no-store"};
function fallo(error,status=400){return Response.json({ok:false,error},{status,headers:HEADERS});}
function oficialAutorizado(request){
  const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";
  const cookie=cookieValue(request.headers,"quinta_oficialidad");
  if(!secret||!cookie)return false;
  const esperado=crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
  const a=Buffer.from(cookie),b=Buffer.from(esperado);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
async function dbTablet(request){
  if(!process.env.DATABASE_URL)return null;
  const token=cookieValue(request.headers,DEVICE_COOKIE);
  if(!token)return null;
  const sql=neon(process.env.DATABASE_URL);
  await ensureSchema(sql);
  const registro=(await readState(sql,REGISTRY_KEY)).value;
  return buscarDispositivo(registro,token)?sql:null;
}
export async function GET(request){
  try{
    const sql=await dbTablet(request);
    if(!sql)return fallo("tablet_no_registrada",403);
    const parte=await readState(sql,CLAVE_COMANDANCIA_15);
    const valor=parte.value;
    if(!valor)return fallo("parte_no_encontrado",404);
    return Response.json({ok:true,
      numero:valor.numero,version:parte.version,
      anulado:valor.anulado===true,
      tipo:valor.tipo,
      recuperadoDesdeId:valor.b5RecuperadoDesdeId||null
    },{headers:HEADERS});
  }catch(error){
    console.error("B5 estado recuperación",error);
    return fallo("servidor_no_disponible",503);
  }
}
export async function POST(request){
  if(!sameOrigin(request))return fallo("origen_no_permitido",403);
  if(!oficialAutorizado(request))return fallo("oficialidad_requerida",403);
  let body;
  try{body=await request.json();}catch{return fallo("json_invalido",400);}
  if(!Number.isInteger(body?.version)||body.version<1)return fallo("version_invalida",400);
  try{
    const sql=await dbTablet(request);
    if(!sql)return fallo("tablet_no_registrada",403);
    const actual=await readState(sql,CLAVE_COMANDANCIA_15);
    if(!actual.value)return fallo("parte_no_encontrado",404);
    if(actual.value.b5RecuperadoDesdeId===body?.fuente?.id &&
       actual.value.anulado===false && actual.value.numero===6 &&
       actual.value.tipo===TIPO_RECUPERADO_COMANDANCIA_15)
      return Response.json({ok:true,numero:6,version:actual.version,yaRecuperado:true},{headers:HEADERS});
    if(actual.version!==body.version)return fallo("version_conflict",409);
    let corregido;
    try{
      corregido=construirRecuperacionComandancia(actual.value,body.fuente,new Date().toISOString());
    }catch(error){return fallo(error.message||"recuperacion_no_valida",409);}
    const json=JSON.stringify(corregido);
    const resultados=await sql`
      WITH parte_actualizado AS (
        UPDATE app_state SET value=${json}::jsonb,version=app_state.version+1,updated_at=now()
        WHERE key=${CLAVE_COMANDANCIA_15} AND version=${actual.version}
          AND value->>'anulado'='true' AND value->>'numero'='6'
          AND EXISTS(
            SELECT 1 FROM app_state ix, jsonb_array_elements(ix.value) e
            WHERE ix.key='partes:index:v1'
              AND e->>'clave'=${CLAVE_INDICE_COMANDANCIA_15}
          )
        RETURNING version
      ),
      indice_actualizado AS (
        UPDATE app_state
        SET value=(
          SELECT jsonb_agg(
            CASE WHEN e->>'clave'=${CLAVE_INDICE_COMANDANCIA_15}
              THEN jsonb_set(e,'{tipo}',to_jsonb(${TIPO_RECUPERADO_COMANDANCIA_15}::text))
              ELSE e END
          ) FROM jsonb_array_elements(app_state.value) e
        ),version=app_state.version+1,updated_at=now()
        WHERE key='partes:index:v1'
          AND EXISTS(SELECT 1 FROM parte_actualizado)
        RETURNING version
      )
      SELECT (SELECT version FROM parte_actualizado) AS parte_version,
             (SELECT version FROM indice_actualizado) AS indice_version
    `;
    const resultado=resultados?.[0];
    if(!resultado?.parte_version || !resultado?.indice_version)
      return fallo("version_conflict",409);
    return Response.json({ok:true,numero:6,version:resultado.parte_version,
      tipo:TIPO_RECUPERADO_COMANDANCIA_15},{headers:HEADERS});
  }catch(error){
    console.error("B5 recuperación Comandancia",error);
    return fallo("recuperacion_no_disponible",503);
  }
}
