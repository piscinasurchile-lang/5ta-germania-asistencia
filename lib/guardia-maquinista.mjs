/**
 * Validaciones puras para la reserva TITULAR de maquinista.
 * No autentica identidad: la revisión de permisos corresponde a seguridad.
 * No modifica guardias históricas ni la ODD.
 */
export function idVoluntarioValido(id) {
  return /^(?:\d{1,8}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(String(id||""));
}

export function fechaISOValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) return false;
  const d = new Date(fecha + "T12:00:00Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === fecha;
}

export function fechasSemana(inicio) {
  if (!fechaISOValida(inicio) || new Date(inicio + "T12:00:00Z").getUTCDay() !== 3) return [];
  const base = Date.parse(inicio + "T12:00:00Z");
  return Array.from({ length: 7 }, (_, i) => new Date(base + i * 86400000).toISOString().slice(0, 10));
}

export function validarReservaMaquinista({ inicio, fecha, personaId, plan, miembro, ahora = Date.now() }) {
  if (!idVoluntarioValido(personaId)) return { ok: false, codigo: "VOLUNTARIO_INVALIDO" };
  const noches = fechasSemana(inicio);
  if (!noches.length || !fechaISOValida(fecha) || !noches.includes(fecha)) return { ok: false, codigo: "FECHA_FUERA_DE_SEMANA" };
  if (!plan || plan.inicio !== inicio || plan.estado !== "abierta" || plan.confirmado === false) return { ok: false, codigo: "INSCRIPCION_CERRADA" };
  const fin = Date.parse(plan.cierre);
  if (!Number.isFinite(fin) || ahora >= fin) return { ok: false, codigo: "INSCRIPCION_CERRADA" };
  if (!miembro || String(miembro.id) !== String(personaId) || miembro.activo === false || miembro.conductor !== true) {
    return { ok: false, codigo: "MAQUINISTA_NO_HABILITADO" };
  }
  return { ok: true, codigo: "DISPONIBLE" };
}

export function fechaEnRegistro(registro, fecha) {
  if (!Array.isArray(registro)) return false;
  return registro.some(x => (typeof x === "string" ? x : x?.f) === fecha);
}
