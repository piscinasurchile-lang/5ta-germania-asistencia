// Propuesta automática de dotación por noche. No lee ni escribe registros.
// Se conserva al integrante de mayor precedencia como OBAC cuando otro inscrito
// puede conducir. Si hay un único habilitado, conduce y el siguiente es OBAC.
// Las asignaciones aprobadas y los ajustes manuales usan sus registros existentes.

(function(root){
// Convierte la lista de precedencia (filas {nombre}) en una lista ordenada de ids de voluntario.
// «resolver» recibe un nombre y devuelve el id del voluntario de la nómina, o null si no figura.
function ordenDePrecedencia(lista, resolver) {
  const ids = [];
  for (const fila of Array.isArray(lista) ? lista : []) {
    const id = resolver(fila && fila.nombre);
    if (id != null && !ids.includes(String(id))) ids.push(String(id));
  }
  return ids;
}

// inscritos: [{ id, maquinista?: boolean, habilitadoMaquinista?: boolean }]
//   maquinista: se inscribió como maquinista esa noche.
//   habilitadoMaquinista: figura habilitado para conducir en la nómina.
// orden: ids en orden de precedencia (el primero es el de mayor precedencia).
function obacDeNoche({ inscritos, orden }) {
  const lista = Array.isArray(inscritos) ? inscritos : [];
  const posiciones = new Map();
  (Array.isArray(orden) ? orden : []).forEach((id, i) => { if (!posiciones.has(String(id))) posiciones.set(String(id), i); });
  const pos = (id) => (posiciones.has(String(id)) ? posiciones.get(String(id)) : Infinity);

  // Sin duplicados, conservando el orden de llegada para los sin posición.
  const vistos = new Map();
  const unicos = [];
  for (const p of lista) {
    if (!p || p.id == null) continue;
    const id = String(p.id);
    if (vistos.has(id)) {
      const previo = vistos.get(id);
      previo.maquinista = previo.maquinista || !!p.maquinista;
      previo.habilitado = previo.habilitado || !!p.habilitadoMaquinista;
      continue;
    }
    const integrante = { id, maquinista: !!p.maquinista, habilitado: !!p.habilitadoMaquinista, llegada: unicos.length };
    vistos.set(id, integrante);
    unicos.push(integrante);
  }
  const porPrecedencia = (a, b) => (pos(a.id) - pos(b.id) || a.llegada - b.llegada);
  const sinPos = (a, b) => pos(a.id) === Infinity && pos(b.id) === Infinity;

  const precedencia = unicos.slice().sort(porPrecedencia);
  const habilitados = unicos.filter((p) => p.maquinista || p.habilitado);
  // Si hay alternativa habilitada, el primero por precedencia conserva el mando.
  const opciones = habilitados.length > 1
    ? habilitados.filter((p) => p.id !== precedencia[0].id)
    : habilitados;
  // Fuera del mando, se conserva primero la inscripción específica de maquinista.
  // Las inscripciones específicas conservan su orden. La inscripción general
  // no tiene hora por noche: se desempata por id para no depender del orden
  // de las claves recibidas. El mando puede ajustar la propuesta antes de aprobar.
  const elegido = opciones.slice().sort((a, b) => Number(b.maquinista) - Number(a.maquinista) || (a.maquinista ? a.llegada - b.llegada : a.id.localeCompare(b.id)))[0] || null;
  const maquinistas = elegido ? [elegido.id] : [];
  const maquinistaPorRespaldo = elegido && !elegido.maquinista ? elegido.id : null;
  const candidatos = precedencia.filter((p) => !elegido || p.id !== elegido.id);

  const obac = candidatos.length ? candidatos[0].id : null;
  const empateSinPosicion = candidatos.length > 1 && sinPos(candidatos[0], candidatos[1]);
  return {
    obac,
    maquinistas,
    maquinistaPorRespaldo,
    voluntarios: candidatos.slice(1).map((p) => p.id),
    empateSinPosicion,
  };
}
  root.GermaniaObac={ obacDeNoche:obacDeNoche, ordenDePrecedencia:ordenDePrecedencia };
})(typeof window!=="undefined"?window:globalThis);

