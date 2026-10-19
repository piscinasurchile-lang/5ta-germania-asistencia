import { neon } from "@neondatabase/serverless";
import {exigirSesionOficial} from "../../../../lib/guardia-sesion-oficial.js";
import { ensureSchema, readState, writeState } from "../../../../lib/state-store.js";
import { integrantesNoche, validarAcreditacion, firmaDotacion } from "../../../../lib/guardia-acreditacion.js";
import {idsEfectivos,evaluarDotacionEfectiva} from "../../../../lib/guardia-asistencia-efectiva.js";
import {precedenciaOBAC,validarRolesEfectivos,firmaContenido,cumplimientoNoche,cargoTeniente3,cumplimientoFinalT3} from "../../../../lib/guardia-acreditacion.js";
import {agregarIncidencia} from "../../../../lib/guardia-incidencias.js";
import {avisarOficiales} from "../../../../lib/guardia-avisos-oficiales.js";
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
function datosPayload(b,noche,programados){
  const adicionales=Array.isArray(b?.adicionales)?b.adicionales:[], excusas=b?.excusas??{};
  const obac=b?.obacEfectivoId?String(b.obacEfectivoId):String(noche.obac);
  const cond=b?.conductorEfectivoId?String(b.conductorEfectivoId):String(noche.maq);
  return {adicionales,excusas,obac,cond,ids:idsEfectivos(programados,adicionales)};
}
export async function POST(req) {
  if (!origen(req)) return Response.json({error:"origen_no_permitido"},{status:403});
  const sesion=exigirSesionOficial(req); if(sesion) return sesion;
  let b; try { b=await req.json(); } catch { return Response.json({error:"datos_invalidos"},{status:400}); }
  const fecha=String(b?.fecha||""), actor=String(b?.actorId||"");
  const adicionales=Array.isArray(b?.adicionales)?b.adicionales:[], excusas=b?.excusas??{};
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
    const [rr, rev, hr, anterior, libro]=await Promise.all([
      readState(sql,"roster:v8"),readState(sql,"guardia-revision:"+inicio),
      readState(sql,"guardia-horarios:v1"),readState(sql,"guardia-acreditacion:"+fecha),readState(sql,"guardia-libro:"+fecha)
    ]);
    const revision=rev.value, roster=Array.isArray(rr.value)?rr.value:[];
    const oficialNombre=nombreOficial(roster,actor);
    const error=validarAcreditacion({fecha,noche:revision?.noches?.[fecha],
      asistencias:b.asistencias,revision,ahoraLocal:horaChile(),actor,roster,adicionales,excusas});
    if (error) return Response.json({error},{status:409});
    if (!oficialNombre) return Response.json({error:"identidad_nombre_no_disponible"},{status:409});
    const fin=/^\d{2}:\d{2}$/.test(hr.value?.fin||"")?hr.value.fin:"06:00";
    if (horaChile() < diaSiguiente(fecha)+"T"+fin) return Response.json({error:"noche_no_finalizada"},{status:409});
    if (!libro.value || libro.value.estado!=="enviado" || libro.value.revisionAprobadaEn!==revision.aprobadaEn || libro.value.dotacionFirma!==firmaDotacion(revision.noches[fecha])) return Response.json({error:"libro_no_cerrado_o_desactualizado"},{status:409});
    const noche=revision.noches[fecha];
    const programados=integrantesNoche(noche);
    const {obac:obacEf,cond:condEf,ids}=datosPayload(b,noche,programados);
    const errRoles=validarRolesEfectivos({noche,asistencias:b.asistencias,obacEfectivo:obacEf,conductorEfectivo:condEf,roster,motivoPrecedencia:b.motivoPrecedencia});
    if (errRoles) return Response.json({error:errRoles},{status:409});
    const anteriorRegistro=anterior.value && typeof anterior.value==="object"?anterior.value:null;
    const firmaNueva=firmaContenido({asistencias:b.asistencias,adicionales,excusas,obac:obacEf,cond:condEf});
    const firmaVieja=anteriorRegistro?firmaContenido({asistencias:anteriorRegistro.asistencias,adicionales:anteriorRegistro.adicionales,excusas:anteriorRegistro.excusas,
      obac:anteriorRegistro.obacEfectivoId??noche.obac,cond:anteriorRegistro.conductorEfectivoId??noche.maq}):null;
    // Ratificación repetida o reintento tras un corte de internet: mismo contenido = mismo acto. No duplica ni toca el historial.
    const actorEsT3=cargoTeniente3(roster.find(x=>String(x.id)===actor)?.cargo);
    if (anteriorRegistro && anteriorRegistro.estado==="acreditada" && firmaVieja===firmaNueva && !(actorEsT3 && !cumplimientoFinalT3(anteriorRegistro)))
      return Response.json({ok:true,repetida:true,version:anterior.version,acreditadas:anteriorRegistro.asistentes?.length??0,
        acreditadoPorNombre:anteriorRegistro.acreditadoPorNombre||null,acreditadoPorId:anteriorRegistro.acreditadoPorId||null},{headers:{"Cache-Control":"no-store"}});
    if (anterior.version!==b.ifVersion) return Response.json({error:"version_conflict",version:anterior.version},{status:409});
    const asistentes=ids.filter(id=>b.asistencias[id]==="presente");
    const ausentes=ids.filter(id=>b.asistencias[id]==="ausente");
    const dotacionEfectiva=evaluarDotacionEfectiva(noche,b.asistencias,adicionales,{obac:obacEf,maq:condEf});
    const cumplimiento=cumplimientoNoche({dotacionEfectiva,obacPresente:b.asistencias[obacEf]==="presente",
      conductorPresente:b.asistencias[condEf]==="presente",sinFoto:libro.value.sinFoto===true});
    const actorFicha=roster.find(x=>String(x.id)===actor);
    const ahoraISO=new Date().toISOString();
    const motivoCorreccion=String(b.motivoCorreccion||"").trim().slice(0,400);
    const soloAcreditaFinal=!!anteriorRegistro && firmaVieja===firmaNueva;
    if (anteriorRegistro && !soloAcreditaFinal && !motivoCorreccion)
      return Response.json({error:"motivo_correccion_requerido"},{status:400});
    const registro={
      fecha,estado:"acreditada",revisionAprobadaEn:revision.aprobadaEn,
      dotacionFirma:firmaDotacion(noche),
      cierreLibroFotoSHA256:libro.value.fotoSHA256??null,cierreLibroEn:libro.value.enviadoEn,
      asistencias:Object.fromEntries(ids.map(id=>[id,b.asistencias[id]])),
       adicionales:adicionales.map(p=>({id:String(p.id),motivo:p.motivo.trim()})),
       excusas:Object.fromEntries(Object.entries(excusas).map(([id,motivo])=>[String(id),motivo.trim()])),
      asistentes,ausentes,
      obacEfectivoId:obacEf,conductorEfectivoId:condEf,
      motivoPrecedencia:String(b.motivoPrecedencia||"").trim().slice(0,300)||null,
      precedenciaObac:obacEf!==String(noche.obac)?precedenciaOBAC({noche,asistencias:b.asistencias,obac:obacEf,cond:condEf,roster}):null,
      dotacionEfectiva,cumplimiento,
      acreditadoPorId:actor,acreditadoPorNombre:oficialNombre,acreditadoPorCargo:String(actorFicha?.cargo||""),acreditadoEn:ahoraISO,
      motivoCorreccion:soloAcreditaFinal?(anteriorRegistro.motivoCorreccion||""):motivoCorreccion,
      /* Cumplimiento final: solo el T3 lo acredita. Una ratificación o corrección de otro oficial lo deja pendiente. */
      cumplimientoFinal:actorEsT3?{estado:"acreditado",porId:actor,porNombre:oficialNombre,porCargo:String(actorFicha?.cargo||""),en:ahoraISO,firma:firmaNueva}:null,
      /* Trazabilidad: quien ratifica puede haber participado en la guardia (cualquier oficial); queda su rol. */
      t3Participante:ids.includes(String(actor))?{
        id:String(actor),nombre:oficialNombre,
        rol:String(noche.obac)===String(actor)?"OBAC":String(noche.maq)===String(actor)?"Maquinista":programados.includes(String(actor))?"Voluntario":"Asistente adicional",
        asistencia:b.asistencias[String(actor)]
      }:null,
      informeCapitan:{estado:"disponible_automatico",en:ahoraISO},
      /* Historial: cada modificación guarda quién, cuándo, por qué y los valores anteriores y posteriores. */
      historial:soloAcreditaFinal?(anteriorRegistro.historial||[]):anteriorRegistro?[...(anteriorRegistro.historial||[]),{
        cumplimientoFinalAnterior:anteriorRegistro.cumplimientoFinal||null,
        fecha:anteriorRegistro.acreditadoEn,por:anteriorRegistro.acreditadoPorId,
        porNombre:anteriorRegistro.acreditadoPorNombre||null,porCargo:anteriorRegistro.acreditadoPorCargo||null,
        asistentes:anteriorRegistro.asistentes,ausentes:anteriorRegistro.ausentes,
        adicionales:anteriorRegistro.adicionales||[],excusas:anteriorRegistro.excusas||{},
        obacEfectivoId:anteriorRegistro.obacEfectivoId??String(noche.obac),conductorEfectivoId:anteriorRegistro.conductorEfectivoId??String(noche.maq),
        modificadoEn:ahoraISO,modificadoPorId:actor,modificadoPorNombre:oficialNombre,modificadoPorCargo:String(actorFicha?.cargo||""),
        motivo:motivoCorreccion,
        despues:{asistentes,ausentes,adicionales:adicionales.map(p=>({id:String(p.id),motivo:p.motivo.trim()})),excusas,obacEfectivoId:obacEf,conductorEfectivoId:condEf}
      }]:[]
    };
    // T3 acreditando el mismo contenido ya ratificado por otro oficial: se conserva quién ratificó; solo se agrega la acreditación final.
    const aEscribir=soloAcreditaFinal?{...anteriorRegistro,cumplimientoFinal:registro.cumplimientoFinal}:registro;
    const guardado=await writeState(sql,"guardia-acreditacion:"+fecha,aEscribir,{ifVersion:b.ifVersion});
    if (guardado.conflict) {
      // Otro oficial ratificó al mismo tiempo: si dejó el mismo contenido, es el mismo acto; si no, se avisa el conflicto.
      const vigente=guardado.value;
      if (vigente && !anteriorRegistro && firmaContenido({asistencias:vigente.asistencias,adicionales:vigente.adicionales,excusas:vigente.excusas,
          obac:vigente.obacEfectivoId??noche.obac,cond:vigente.conductorEfectivoId??noche.maq})===firmaNueva)
        return Response.json({ok:true,repetida:true,version:guardado.version,acreditadas:vigente.asistentes?.length??0,
          acreditadoPorNombre:vigente.acreditadoPorNombre||null,acreditadoPorId:vigente.acreditadoPorId||null},{headers:{"Cache-Control":"no-store"}});
      return Response.json({error:"version_conflict",version:guardado.version},{status:409});
    }
    // Efectos secundarios (no bloquean la ratificación): incidencias automáticas y avisos a oficiales.
    const esCorreccion=!!anteriorRegistro&&!soloAcreditaFinal;
    if (esCorreccion) await agregarIncidencia(sql,fecha,{id:"auto-corr-"+guardado.version,tipo:"correccion_posterior",personaId:null,
      detalle:"Corrección por "+oficialNombre+": "+motivoCorreccion,estado:"resuelta",automatica:true,registradaPorId:actor,registradaPorNombre:oficialNombre,en:ahoraISO});
    if (dotacionEfectiva.voluntarios<2||!dotacionEfectiva.minimoCumplido) await agregarIncidencia(sql,fecha,{id:"auto-dotacion-"+fecha,tipo:"dotacion_insuficiente",personaId:null,
      detalle:"Dotación efectiva bajo el mínimo (1 conductor, 1 OBAC y 2 voluntarios): "+cumplimiento.motivos.join(", "),estado:"abierta",automatica:true,registradaPorId:actor,registradaPorNombre:oficialNombre,en:ahoraISO});
    await avisarOficiales(sql,{clave:(esCorreccion?"corr:":soloAcreditaFinal?"fin:":"rat:")+fecha+":"+guardado.version,tipo:esCorreccion?"correccion":"ratificada",fecha,
      titulo:(esCorreccion?"Ratificación corregida · ":soloAcreditaFinal?"Cumplimiento acreditado por T3 · ":"Noche ratificada · ")+fecha+" · "+oficialNombre+(aEscribir.cumplimientoFinal?"":" · pendiente de acreditación del T3"),porNombre:oficialNombre});
    return Response.json({ok:true,version:guardado.version,acreditadas:asistentes.length,acreditadoPorNombre:oficialNombre,cumplimiento,cumplimientoFinal:!!aEscribir.cumplimientoFinal},{headers:{"Cache-Control":"no-store"}});
  } catch(e) { console.error("guardia acreditacion failed",e);
    return Response.json({error:"database_error"},{status:500}); }
}
