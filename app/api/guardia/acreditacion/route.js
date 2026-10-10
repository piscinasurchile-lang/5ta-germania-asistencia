import { neon } from "@neondatabase/serverless";
import { ensureSchema, readState, writeState } from "../../../../lib/state-store.js";
import { integrantesNoche, validarAcreditacion, firmaDotacion } from "../../../../lib/guardia-acreditacion.js";
export const runtime = "nodejs";

// Identificación provisoria por nombre y apellidos de la nómina institucional.
// No es autenticación personal: la seguridad individual sigue pendiente de auditoría.
export function nombreOficial(roster, actor) {
  const p=Array.isArray(roster)?roster.find(x=>String(x.id)===String(actor)):null;
  if(!p || p.activo===false || !String(p.nombre||"").trim() || !String(p.apellidoPaterno||"").trim()) return null;
  const nombre=[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" ").trim();
  return nombre || null;
}
function origen(req) {
  const o=req.headers.get("origin");
  if (!o) return false;
  try { return new URL(o).host===req.headers.get("host"); } catch { return false; }
}
function horaChile() {
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
    timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hour12:false,hourCycle:"h23"
  }).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
function diaSiguiente(fecha) {
  const d=new Date(fecha+"T12:00:00Z");
  d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
}
export async function POST(req) {
  if (!origen(req)) return Response.json({error:"origen_no_permitido"},{status:403});
  let b; try { b=await req.json(); } catch { return Response.json({error:"datos_invalidos"},{status:400}); }
  const fecha=String(b?.fecha||""), actor=String(b?.actorId||"");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !Number.isInteger(b?.ifVersion) || b.ifVersion<0)
    return Response.json({error:"datos_invalidos"},{status:400});
  const semana=new Date(fecha+"T12:00:00Z"); if (Number.isNaN(semana.getTime()))
    return Response.json({error:"fecha_invalida"},{status:400});
  // Una semana de guardia comienza siempre un miércoles.
  const miercoles=new Date(semana); miercoles.setUTCDate(miercoles.getUTCDate()-(miercoles.getUTCDay()+4)%7);
  const inicio=miercoles.toISOString().slice(0,10);
  if (!process.env.DATABASE_URL) return Response.json({error:"database_not_configured"},{status:503});
  const sql=neon(process.env.DATABASE_URL);
  try {
    await ensureSchema(sql);
    const [rr, rev, hr, anterior]=await Promise.all([
      readState(sql,"roster:v8"),readState(sql,"guardia-revision:"+inicio),
      readState(sql,"guardia-horarios:v1"),readState(sql,"guardia-acreditacion:"+fecha)
    ]);
    const revision=rev.value, roster=Array.isArray(rr.value)?rr.value:[];
    const oficialNombre=nombreOficial(roster,actor);
    const error=validarAcreditacion({fecha,noche:revision?.noches?.[fecha],
      asistencias:b.asistencias,revision,ahoraLocal:horaChile(),actor,roster});
    if (error) return Response.json({error},{status:409});
    if (!oficialNombre) return Response.json({error:"identidad_nombre_no_disponible"},{status:409});
    const fin=/^\d{2}:\d{2}$/.test(hr.value?.fin||"")?hr.value.fin:"08:00";
    if (horaChile() < diaSiguiente(fecha)+"T"+fin) return Response.json({error:"noche_no_finalizada"},{status:409});
    if (anterior.version!==b.ifVersion) return Response.json({error:"version_conflict",version:anterior.version},{status:409});
    const ids=integrantesNoche(revision.noches[fecha]);
    const asistentes=ids.filter(id=>b.asistencias[id]==="presente");
    const ausentes=ids.filter(id=>b.asistencias[id]==="ausente");
    const anteriorRegistro=anterior.value && typeof anterior.value==="object"?anterior.value:null;
    const registro={
      fecha,estado:"acreditada",revisionAprobadaEn:revision.aprobadaEn,
      dotacionFirma:firmaDotacion(revision.noches[fecha]),
      asistencias:Object.fromEntries(ids.map(id=>[id,b.asistencias[id]])),
      asistentes,ausentes,
      acreditadoPorId:actor,acreditadoPorNombre:oficialNombre,acreditadoEn:new Date().toISOString(),
      motivoCorreccion:String(b.motivoCorreccion||"").trim().slice(0,400),
      historial:anteriorRegistro?[...(anteriorRegistro.historial||[]),{
        fecha:anteriorRegistro.acreditadoEn,por:anteriorRegistro.acreditadoPorId,
        porNombre:anteriorRegistro.acreditadoPorNombre||null,
        asistentes:anteriorRegistro.asistentes,ausentes:anteriorRegistro.ausentes
      }]:[]
    };
    if (anteriorRegistro && !registro.motivoCorreccion)
      return Response.json({error:"motivo_correccion_requerido"},{status:400});
    const guardado=await writeState(sql,"guardia-acreditacion:"+fecha,registro,{ifVersion:b.ifVersion});
    if (guardado.conflict) return Response.json({error:"version_conflict",version:guardado.version},{status:409});
    return Response.json({ok:true,version:guardado.version,acreditadas:asistentes.length,acreditadoPorNombre:oficialNombre},{headers:{"Cache-Control":"no-store"}});
  } catch(e) { console.error("guardia acreditacion failed",e);
    return Response.json({error:"database_error"},{status:500}); }
}
