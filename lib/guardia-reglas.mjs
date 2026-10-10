/**
 * Reglas puras de asignación nocturna. No escribe datos ni reemplaza la API.
 * El servidor debe aplicar estas reglas dentro de una transacción de Neon
 * con restricción única por noche para el conductor titular.
 */
export const MIN_VOLUNTARIOS = 3;
export const INICIO_GUARDIA = "22:45";
export const RETIRO_DESDE = "06:00";

export function evaluarInscripcion({fecha, personaId, funcion, habilitados = [], inscripciones = [], cerrada = false}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) return {ok:false, codigo:"FECHA_INVALIDA"};
  if (!personaId) return {ok:false, codigo:"PERSONA_INVALIDA"};
  if (cerrada) return {ok:false, codigo:"INSCRIPCION_CERRADA"};
  if (!["voluntario", "conductor", "obac"].includes(funcion)) return {ok:false, codigo:"FUNCION_INVALIDA"};
  const dia = inscripciones.filter(x=>x.fecha===fecha && x.estado!=="anulada");
  if (dia.some(x=>String(x.personaId)===String(personaId))) return {ok:false,codigo:"YA_INSCRITO"};
  if (funcion==="obac" && !habilitados.some(id=>String(id)===String(personaId))) return {ok:false,codigo:"NO_HABILITADO"};
  if (funcion==="conductor") {
    if (!habilitados.some(id=>String(id)===String(personaId))) return {ok:false,codigo:"NO_HABILITADO"};
    if (dia.some(x=>x.funcion==="conductor")) return {ok:false,codigo:"OCUPADO",mensaje:"OCUPADO. ELIGE OTRO DÍA"};
  }
  return {ok:true,codigo:"DISPONIBLE"};
}

export function resumenNoche(inscripciones, fecha) {
  const activos=inscripciones.filter(x=>x.fecha===fecha && x.estado!=="anulada");
  const voluntarios=activos.filter(x=>x.funcion==="voluntario").length;
  return {voluntarios,minimo:MIN_VOLUNTARIOS,minimoAlcanzado:voluntarios>=MIN_VOLUNTARIOS,
    conductorOcupado:activos.some(x=>x.funcion==="conductor")};
}

export function obacProvisional({inscripciones, fecha, precedencia = [], habilitadosObac = []}) {
  const dia=inscripciones.filter(x=>x.fecha===fecha && x.estado!=="anulada");
  const conductor=dia.find(x=>x.funcion==="conductor");
  // El OBAC ocupa una plaza independiente: nunca cuenta entre los 3 voluntarios.
  const candidatos=new Set(dia.filter(x=>x.funcion==="obac").map(x=>String(x.personaId)));
  const aptos=new Set(habilitadosObac.map(String));
  const seleccionado=precedencia.find(id=>candidatos.has(String(id)) && aptos.has(String(id)) && String(id)!==String(conductor?.personaId));
  return seleccionado==null ? null : String(seleccionado);
}

/** Requiere 3 voluntarios, 1 conductor y 1 OBAC, todos distintos. */
export function guardiaCompleta(inscripciones, fecha) {
 const dia=inscripciones.filter(x=>x.fecha===fecha && x.estado!=="anulada");
 const voluntarios=dia.filter(x=>x.funcion==="voluntario");
 const conductores=dia.filter(x=>x.funcion==="conductor");
 const obacs=dia.filter(x=>x.funcion==="obac");
 const ids=[...voluntarios,...conductores,...obacs].map(x=>String(x.personaId));
 return voluntarios.length>=MIN_VOLUNTARIOS && conductores.length===1 && obacs.length===1 && new Set(ids).size===ids.length;
}
