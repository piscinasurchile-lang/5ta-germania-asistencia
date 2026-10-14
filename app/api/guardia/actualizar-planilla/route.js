import {neon} from "@neondatabase/serverless";
import {FOTO,SQL_STEPS,planParaNomina} from "../../../../lib/guardia-foto-oct2026.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"no-store"};
const reply=(body,status=200)=>Response.json(body,{status,headers:HEADERS});
const client=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
function sameOrigin(request){
 const origin=request.headers.get("origin");
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}
}
async function consultar(sql){
 const [registros,inscripciones,acreditaciones]=await Promise.all([
  sql`SELECT key,value,version FROM app_state WHERE key IN
   ('roster:v8','guardia-revision:2026-10-14','guardia:2026-10-14__2245',
    'guardia:2026-10-15__2245','guardia:2026-10-16__2245','guardia:2026-10-17__2245',
    'guardia:2026-10-18__2245','guardia:2026-10-19__2245','guardia:2026-10-20__2245')`,
  sql`SELECT count(*)::int AS total,
    count(*) FILTER(WHERE version<>1)::int AS modificadas
    FROM app_state WHERE key LIKE 'guardia-inscripcion:2026-10-14:%'`,
  sql`SELECT count(*)::int AS total FROM app_state WHERE key LIKE 'guardia-acreditacion:2026-10-%'
    AND substr(key,22,10) BETWEEN '2026-10-14' AND '2026-10-20'`
 ]);
 const mapa=new Map(registros.map(x=>[x.key,x]));
 const roster=mapa.get("roster:v8");
 const revision=mapa.get("guardia-revision:2026-10-14");
 if(!roster||!revision||!Array.isArray(roster.value))throw Error("No se pudo cargar nómina y revisión");
 const planilla=planParaNomina(roster.value);
 const estados=planilla.map(d=>{
    const actual=mapa.get("guardia:"+d.fecha+"__2245");
    if(!actual)throw Error("No se encontró la guardia de "+d.fecha);
    const vol=(actual.value?.guardianes||[]).map(p=>String(p.id));
    return {...d,anterior:{obac:actual.value?.oficial||null,
       conductor:actual.value?.conductor||null,voluntarios:vol},
       coincide:actual.value?.oficial===d.obac.id&&actual.value?.conductor===d.conductor.id&&
         vol.length===d.voluntarios.length&&
         vol.every(x=>d.voluntarios.some(y=>y.id===x))};
 });
 const aplicada=revision.value?.origenAjuste==="Planilla fotográfica autorizada 14–20 octubre 2026"&&
    revision.version>=3&&roster.version>=14&&
    estados.every(d=>d.coincide);
 const lista=revision.version===2&&revision.value?.estado==="aprobada"&&
    roster.version===13&&estados.every(d=>mapa.get("guardia:"+d.fecha+"__2245")?.version===1)&&
    inscripciones[0]?.total===20&&inscripciones[0]?.modificadas===0&&acreditaciones[0]?.total===0;
 return {semana:"2026-10-14",fin:"2026-10-20",planilla:estados,
   personas:21,asignaciones:49,voluntarios:35,
   estado:aplicada?"aplicada":lista?"lista":"requiere_revision",
   inscripcionesActuales:inscripciones[0]?.total||0,
   acreditaciones:acreditaciones[0]?.total||0,
   detalle:aplicada?"La planilla ya fue aplicada en Neon.":
     lista?"Los datos actuales coinciden con la versión previa validada.":
     "La base cambió o requiere revisión. No se permite sobrescribir."};
}
export async function GET(){
 const sql=client();if(!sql)return reply({error:"base_no_configurada"},503);
 try{return reply(await consultar(sql));}
 catch(e){console.error("planilla guardia GET",e);return reply({error:"no_se_pudo_revisar_guardia"},503);}
}
export async function POST(request){
 if(!sameOrigin(request))return reply({error:"origen_no_permitido"},403);
 const sql=client();if(!sql)return reply({error:"base_no_configurada"},503);
 let body;
 try{body=await request.json();}catch{return reply({error:"datos_invalidos"},400);}
 if(body?.confirmacion!=="APLICAR"||body?.semana!=="2026-10-14"||
     body?.aceptoActualizarInscripciones!==true||
     body?.aceptoCorregirFicha!==true)
   return reply({error:"confirmacion_explicita_requerida"},400);
 try{
   const previo=await consultar(sql);
   if(previo.estado==="aplicada")return reply({ok:true,yaAplicada:true,estado:previo.estado});
   if(previo.estado!=="lista")return reply({error:"datos_cambiaron",estado:previo.estado},409);
   // Todas las consultas se ejecutan en la MISMA transacción de PostgreSQL.
   // DO de inicio y fin abortan y revierten todo si existe cualquier diferencia.
   await sql.transaction(SQL_STEPS.map(sentencia=>sql.query(sentencia,[])),{isolationLevel:"Serializable"});
   const actual=await consultar(sql);
   if(actual.estado!=="aplicada"){
     console.error("guardia foto: postcheck fallido");
     return reply({error:"verificacion_pendiente",detalle:"La operación requiere comprobación manual."},503);
   }
   return reply({ok:true,estado:"aplicada",semana:actual.semana,fin:actual.fin,
      noches:7,personas:21,asignaciones:49});
 }catch(e){
   console.error("guardia foto POST",String(e?.message||e));
   const texto=String(e?.message||"");
   if(/VERSION_|VALIDACION_|YA_ACREDITADA|RUT_OTRA_FICHA|ESTHEFANI_NO_UNICA|could not serialize/i.test(texto))
     return reply({error:"conflicto_de_version",detalle:"No se cambió ningún registro: vuelve a revisar la semana."},409);
   return reply({error:"actualizacion_no_confirmada",detalle:"No se debe asumir que los registros cambiaron. Actualiza la revisión."},503);
 }
}
