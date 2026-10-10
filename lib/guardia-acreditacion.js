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
  if (!noche.maq || !noche.obac || ids.length !== new Set(ids).size) return null;
  return JSON.stringify({
    maq: String(noche.maq),
    obac: String(noche.obac),
    vol: noche.vol.map(String).sort()
  });
}
export function validarAcreditacion({ fecha, noche, asistencias, revision, ahoraLocal, actor, roster }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return "fecha_invalida";
  if (!revision || revision.estado !== "aprobada" || !revision.aprobadaEn) return "dotacion_no_aprobada";
  if (!noche) return "noche_no_asignada";
  if (!Array.isArray(noche.vol) || noche.vol.length < 2 || !noche.maq || !noche.obac)
    return "dotacion_incompleta";
  if (!actor || !roster?.some((p) => String(p.id) === String(actor) && p.activo !== false && /teniente\s*(tercero|3)/i.test(p.cargo || ""))) return "solo_teniente_tercero";
  const ids = integrantesNoche(noche);
  if (!ids.length || ids.length !== new Set(ids).size) return "dotacion_duplicada";
  if (!asistencias || typeof asistencias !== "object" || Array.isArray(asistencias)) return "asistencia_incompleta";
  const keys = Object.keys(asistencias);
  if (keys.length !== ids.length || keys.some((id) => !ids.includes(id)) || ids.some((id) => !["presente","ausente"].includes(asistencias[id]))) return "asistencia_incompleta";
  if (!ahoraLocal || typeof ahoraLocal !== "string" || ahoraLocal < fecha) return "noche_no_finalizada";
  return null;
}
export function registroVigente(acreditacion, revision) {
  return !!acreditacion && acreditacion.estado === "acreditada" &&
    !!revision && revision.estado === "aprobada" &&
    acreditacion.revisionAprobadaEn === revision.aprobadaEn &&
    !!acreditacion.dotacionFirma && acreditacion.dotacionFirma === firmaDotacion(revision.noches?.[acreditacion.fecha]) &&
    acreditacion.fecha && revision.noches?.[acreditacion.fecha] &&
    Array.isArray(acreditacion.asistentes) &&
    acreditacion.asistentes.every((id) => integrantesNoche(revision.noches[acreditacion.fecha]).includes(String(id))) &&
    Array.isArray(acreditacion.ausentes) &&
    Object.keys(acreditacion.asistencias || {}).length === integrantesNoche(revision.noches[acreditacion.fecha]).length &&
    integrantesNoche(revision.noches[acreditacion.fecha]).every((id) =>
      ["presente","ausente"].includes(acreditacion.asistencias[id]) &&
      (acreditacion.asistencias[id] === "presente") === acreditacion.asistentes.includes(id));
}
