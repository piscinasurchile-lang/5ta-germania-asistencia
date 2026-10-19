import { firmaDotacion, registroVigente, cargoAutorizadoGuardia } from "./guardia-acreditacion.js";
export { cargoAutorizadoGuardia };
// Regla institucional de cierre del libro. Solo el OBAC designado puede cerrarlo.
// La fecha identifica el inicio del turno (22:45); el cierre ocurre al día siguiente, desde las 06:00.
export function siguienteDia(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha||"")) return null;
  const d=new Date(fecha+"T12:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0,10)!==fecha) return null;
  d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
}
export function miercolesSemana(fecha){
  if(!siguienteDia(fecha))return null;
  const d=new Date(fecha+"T12:00:00Z");
  d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);
  return d.toISOString().slice(0,10);
}
export function horaCivilChile(date=new Date()) {
  const t=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
    timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hour12:false,hourCycle:"h23"
  }).formatToParts(date).map(x=>[x.type,x.value]));
  return t.year+"-"+t.month+"-"+t.day+"T"+t.hour+":"+t.minute;
}
export function ventanaCierreOBAC(fecha,ahora) {
  const dia=siguienteDia(fecha);if(!dia||typeof ahora!=="string")return false;
  const despues=siguienteDia(dia);
  return ahora>=dia+"T06:00" && ahora<despues+"T06:00";
}
export function nocheFinalizada(fecha,ahora) {
  const dia=siguienteDia(fecha);
  return !!dia&&typeof ahora==="string"&&ahora>=dia+"T06:00";
}
export function cargoT3(cargo){return /teniente\s*(tercero|3)/i.test(String(cargo||""));}
export function cargoCapitan(cargo){return /^\s*capit[aá]n/i.test(String(cargo||""));}
/** Lectura institucional: todos los oficiales vigentes, sin conceder acreditación. */
export function esOficialGuardia(cargo){
 const c=String(cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
 return /^(capitan|teniente(?:\s|$)|ayudante|director|secretari|tesorer|jefe de maquinas)/.test(c);
}
export function semanaVigente(fecha,fechaHoy){
 return miercolesSemana(fecha)!==null&&miercolesSemana(fecha)===miercolesSemana(fechaHoy);
}
export function vistoCapitanValido(visto,acreditacion){
 return !!(visto?.estado==="visto" && visto.ratificacionEn &&
    acreditacion?.acreditadoEn && visto.ratificacionEn===acreditacion.acreditadoEn);
}

// Administrador técnico de Germania: consulta y supervisión, sin atribuciones de acreditación.
export function esAdministradorGuardia(actor){return !!actor && actor.activo!==false && String(actor.clave||"")==="517";}
// Al Capitán solo se le entrega el informe después de la ratificación efectiva del T3.
export function informeRatificado({acreditacion,revision,noche,cierre}){
  /* Cierre con fotografía (OBAC) o cierre excepcional por un oficial sin fotografía (queda marcado sinFoto). */
  return !!(cierre && cierre.estado==="enviado" && (cierre.sinFoto===true || (cierre.fotoClave && cierre.fotoSHA256)) &&
    revision?.estado==="aprobada" && revision.aprobadaEn &&
    cierre.revisionAprobadaEn===revision.aprobadaEn &&
    cierre.dotacionFirma===firmaDotacion(noche) &&
    registroVigente(acreditacion,revision) &&
    (acreditacion.cierreLibroFotoSHA256??null)===(cierre.fotoSHA256??null) &&
    acreditacion.cierreLibroEn===cierre.enviadoEn);
}
export function puedeVerLibro(actor,noche,ratificada=false){
  if(!actor||actor.activo===false)return false;
  return esAdministradorGuardia(actor)||cargoAutorizadoGuardia(actor.cargo)||String(noche?.obac||"")===String(actor.id)||
    (esOficialGuardia(actor.cargo)&&ratificada===true);
}
