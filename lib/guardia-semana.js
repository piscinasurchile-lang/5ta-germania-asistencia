/* Resumen y reglas del cierre semanal de guardia nocturna (puro, sin base de datos). */
import { integrantesNoche, registroVigente, cumplimientoFinalT3, cumplimientoNoche } from "./guardia-acreditacion.js";
import { informeRatificado, nocheFinalizada } from "./guardia-libro.js";

/** Acta automática de una noche terminada: toda la dotación programada como presente. */
export function actaAutomatica(fecha, noche) {
  const ids = [...new Set(integrantesNoche(noche))];
  const asistencias = Object.fromEntries(ids.map(id => [id, "presente"]));
  const obac = noche?.obac ? String(noche.obac) : "", maq = noche?.maq ? String(noche.maq) : "";
  return {
    estado: "acreditada", fecha, automatica: true, asistentes: ids, ausentes: [], asistencias, adicionales: [], excusas: {},
    acreditadoPorId: null, acreditadoPorNombre: "Automática (noche terminada)", acreditadoPorCargo: null, acreditadoEn: null,
    cumplimientoFinal: { estado: "acreditado", automatica: true, porId: null, porNombre: "Automática (noche terminada)", porCargo: null, en: null },
    obacEfectivoId: obac, conductorEfectivoId: maq,
    dotacionEfectiva: { voluntarios: (noche?.vol || []).length, conductor: maq ? 1 : 0, obac: obac ? 1 : 0, total: ids.length },
    cumplimiento: cumplimientoNoche({ dotacionEfectiva: { voluntarios: (noche?.vol || []).length }, obacPresente: !!obac, conductorPresente: !!maq, sinFoto: false }),
    historial: []
  };
}
export function resumenNoche({ fecha, noche, libro, acreditacion, incidencias = [], revision, ahora }) {
  const finalizada = nocheFinalizada(fecha, ahora);
  const ratificada = !!(acreditacion && informeRatificado({ acreditacion, revision, noche, cierre: libro }));
  /* Noche terminada = cumplida (instrucción del Capitán, oct-2026): sin cierre OBAC, ratificación ni acreditación T3.
     Si no hay un acta real vigente, la noche terminada de una revisión aprobada cuenta con su dotación programada
     como presente. Solo lectura: no escribe ni cambia las actas guardadas. */
  const real = ratificada || (!!acreditacion && registroVigente(acreditacion, revision)); // acta real válida: se respeta aunque falte el cierre OBAC o el paso T3
  const automatica = !real && finalizada && revision?.estado === "aprobada" && !!noche && integrantesNoche(noche).length > 0;
  const ac = real ? acreditacion : (automatica ? actaAutomatica(fecha, noche) : null);
  const abiertas = incidencias.filter(x => x.estado !== "resuelta");
  let estado = "pendiente";
  if (!finalizada) estado = "en_curso_o_futura";
  else if (!ac && !libro) estado = "sin_cierre_de_libro";
  else if (!ac) estado = "registro_cerrado";
  else estado = "acreditada_oficial"; // ya no hay paso T3: acta real válida o acta automática
  return {
    fecha, estado, finalizada,
    programada: { maq: noche?.maq ?? null, obac: noche?.obac ?? null, vol: noche?.vol ?? [], total: noche ? integrantesNoche(noche).length : 0 },
    libro: libro ? { cerrado: true, sinFoto: libro.sinFoto === true, motivoSinFoto: libro.motivoSinFoto || null, cierrePorOficial: libro.cierrePorOficial || null, obacNombre: libro.obacNombre || null, enviadoEn: libro.enviadoEn || null, obacId: libro.obacId || null, novedades: libro.novedades || "" } : { cerrado: false },
    /* Dos pasos: ratifica cualquier oficial; el cumplimiento final lo acredita un oficial autorizado. `reglamento` = si la dotación cumplió el Reglamento. */
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
/** Una semana se puede cerrar cuando todas sus noches terminaron, están ratificadas (vigentes) y un oficial autorizado acreditó su cumplimiento. */
export function nochesPendientesSemana(resumenes) {
  return resumenes.filter(r => r.estado !== "acreditada_oficial").map(r => ({ fecha: r.fecha, estado: r.estado }));
}
export { registroVigente };
