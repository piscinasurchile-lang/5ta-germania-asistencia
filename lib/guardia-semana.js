/* Resumen y reglas del cierre semanal de guardia nocturna (puro, sin base de datos). */
import { integrantesNoche, registroVigente, cumplimientoFinalT3 } from "./guardia-acreditacion.js";
import { informeRatificado, nocheFinalizada } from "./guardia-libro.js";

export function resumenNoche({ fecha, noche, libro, acreditacion, incidencias = [], revision, ahora }) {
  const finalizada = nocheFinalizada(fecha, ahora);
  const ratificada = !!(acreditacion && informeRatificado({ acreditacion, revision, noche, cierre: libro }));
  const ac = ratificada ? acreditacion : null;
  const abiertas = incidencias.filter(x => x.estado !== "resuelta");
  let estado = "pendiente";
  if (!finalizada) estado = "en_curso_o_futura";
  else if (!libro) estado = "sin_cierre_de_libro";
  else if (!ratificada) estado = "registro_cerrado";
  else estado = cumplimientoFinalT3(ac) ? "acreditada_t3" : "ratificada_pendiente_t3";
  return {
    fecha, estado, finalizada,
    programada: { maq: noche?.maq ?? null, obac: noche?.obac ?? null, vol: noche?.vol ?? [], total: noche ? integrantesNoche(noche).length : 0 },
    libro: libro ? { cerrado: true, sinFoto: libro.sinFoto === true, motivoSinFoto: libro.motivoSinFoto || null, cierrePorOficial: libro.cierrePorOficial || null, obacNombre: libro.obacNombre || null, enviadoEn: libro.enviadoEn || null, obacId: libro.obacId || null, novedades: libro.novedades || "" } : { cerrado: false },
    /* Dos pasos: ratifica cualquier oficial; el cumplimiento final lo acredita solo el T3. `reglamento` = si la dotación cumplió el Reglamento. */
    cumplimientoFinal: ac && cumplimientoFinalT3(ac) ? (ac.cumplimientoFinal || { estado: "acreditado", porId: ac.acreditadoPorId, porNombre: ac.acreditadoPorNombre, porCargo: ac.acreditadoPorCargo || "Teniente 3°", en: ac.acreditadoEn, anteriorAlFlujo: true }) : null,
    reglamento: ac ? (ac.cumplimiento?.estado === "acreditado" ? "cumple" : "con_incumplimientos") : null,
    ratificacion: ac ? {
      version: undefined, porId: ac.acreditadoPorId, porNombre: ac.acreditadoPorNombre, porCargo: ac.acreditadoPorCargo || null, en: ac.acreditadoEn,
      asistentes: ac.asistentes, ausentes: ac.ausentes, adicionales: ac.adicionales || [], excusas: ac.excusas || {},
      obacEfectivoId: ac.obacEfectivoId ?? String(noche?.obac ?? ""), conductorEfectivoId: ac.conductorEfectivoId ?? String(noche?.maq ?? ""),
      dotacionEfectiva: ac.dotacionEfectiva, cumplimiento: ac.cumplimiento || null, correcciones: (ac.historial || []).length, historial: ac.historial || [], motivoPrecedencia: ac.motivoPrecedencia || null, t3Participante: ac.t3Participante || null, porCodigo: ac.acreditadoPorId
    } : null,
    incidencias: { total: incidencias.length, abiertas: abiertas.length, criticasAbiertas: abiertas.filter(x => ["obac_ausente", "conductor_ausente", "retiro_obac_conductor", "dotacion_insuficiente"].includes(x.tipo)).length, items: incidencias }
  };
}
/** Una semana se puede cerrar cuando todas sus noches terminaron, están ratificadas (vigentes) y el T3 acreditó su cumplimiento. */
export function nochesPendientesSemana(resumenes) {
  return resumenes.filter(r => r.estado !== "acreditada_t3").map(r => ({ fecha: r.fecha, estado: r.estado }));
}
export { registroVigente };
