import {idsEfectivos,validarComplementos} from "./guardia-asistencia-efectiva.js";
// Validación pura: una noche jamás se acredita por el paso de las horas ni por asignación.
export function integrantesNoche(noche) {
  if (!noche || !Array.isArray(noche.vol)) return [];
  return [noche.maq, noche.obac, ...noche.vol].filter(Boolean).map(String);
}
/** Firma de la composición y rol de la dotación aprobada. Cambia al sustituir un integrante
 * o cambiar su función. No se toma del cliente. Se usa para invalidar acreditaciones anteriores. */
export function firmaDotacion(noche) {
  if (!noche || !Array.isArray(noche.vol)) return null;
  const ids = integrantesNoche(noche);
  if (!noche.maq || !noche.obac || noche.vol.length<2 ||
      noche.vol.some(id=>id===null || id===undefined || String(id).trim()==="") ||
      ids.length!==noche.vol.length+2 || ids.length!==new Set(ids).size) return null;
  return JSON.stringify({
    maq: String(noche.maq),
    obac: String(noche.obac),
    vol: noche.vol.map(String).sort()
  });
}
export function validarAcreditacion({ fecha, noche, asistencias, revision, ahoraLocal, actor, roster, adicionales=[], excusas={} }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return "fecha_invalida";
  if (!revision || revision.estado !== "aprobada" || !revision.aprobadaEn) return "dotacion_no_aprobada";
  if (!noche) return "noche_no_asignada";
  if (!Array.isArray(noche.vol) || noche.vol.length < 2 || !noche.maq || !noche.obac)
    return "dotacion_incompleta";
  if (!actor || !roster?.some((p) => String(p.id) === String(actor) && p.activo !== false && /teniente\s*(tercero|3)/i.test(p.cargo || ""))) return "solo_teniente_tercero";
  const ids = integrantesNoche(noche);
  if (ids.length<4 || ids.length!==noche.vol.length+2 ||
      noche.vol.some(id=>id===null || id===undefined || String(id).trim()===""))
    return "dotacion_incompleta";
  if (ids.length !== new Set(ids).size) return "dotacion_duplicada";
  if (!asistencias || typeof asistencias !== "object" || Array.isArray(asistencias)) return "asistencia_incompleta";
  const complemento=validarComplementos(ids,adicionales,excusas,asistencias,roster);
  if(complemento)return complemento;
  const todos=idsEfectivos(ids,adicionales);
  const keys = Object.keys(asistencias);
  if (keys.length !== todos.length || keys.some((id) => !todos.includes(id)) || todos.some((id) => !["presente","ausente"].includes(asistencias[id]))) return "asistencia_incompleta";
  // La noche empieza en `fecha` (22:45) y termina a las 06:00 del día siguiente: antes no se puede acreditar.
  const siguiente = new Date(Date.parse(fecha + "T12:00:00Z") + 864e5).toISOString().slice(0, 10);
  if (!ahoraLocal || typeof ahoraLocal !== "string" || ahoraLocal < siguiente + "T06:00") return "noche_no_finalizada";
  return null;
}
export function registroVigente(acreditacion, revision) {
 const ac=acreditacion, noche=revision?.noches?.[ac?.fecha];
 if(!ac||ac.estado!=="acreditada"||revision?.estado!=="aprobada"||!noche||
    ac.revisionAprobadaEn!==revision.aprobadaEn||
    !ac.dotacionFirma||ac.dotacionFirma!==firmaDotacion(noche)||
    !ac.asistencias||typeof ac.asistencias!=="object"||Array.isArray(ac.asistencias)||
    !Array.isArray(ac.asistentes)||!Array.isArray(ac.ausentes))return false;
 const programados=integrantesNoche(noche),adicionales=ac.adicionales??[],excusas=ac.excusas??{};
 if(!Array.isArray(adicionales)||adicionales.length>15||!excusas||typeof excusas!=="object"||Array.isArray(excusas))return false;
 const ids=idsEfectivos(programados,adicionales);
 if(ids.length!==new Set(ids).size)return false;
 if(adicionales.some(x=>typeof x?.motivo!=="string"||x.motivo.trim().length<8||
    ac.asistencias[String(x.id)]!=="presente"))return false;
 if(Object.entries(excusas).some(([id,m])=>!programados.includes(id)||
   ac.asistencias[id]!=="ausente"||typeof m!=="string"||m.trim().length<3))return false;
 const presentes=ids.filter(id=>ac.asistencias[id]==="presente");
 const ausentes=ids.filter(id=>ac.asistencias[id]==="ausente");
 return Object.keys(ac.asistencias).length===ids.length&&
    presentes.length+ausentes.length===ids.length&&
    ac.asistentes.length===presentes.length&&ac.ausentes.length===ausentes.length&&
    new Set(ac.asistentes.map(String)).size===presentes.length&&
    new Set(ac.ausentes.map(String)).size===ausentes.length&&
    presentes.every(id=>ac.asistentes.includes(id))&&
    ausentes.every(id=>ac.ausentes.includes(id));
}
