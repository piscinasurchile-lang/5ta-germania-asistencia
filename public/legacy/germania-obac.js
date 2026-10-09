// Cálculo del OBAC de una noche de guardia (ADR 0009, propuesta). Función pura:
// no lee ni escribe datos, no toca la ODD ni la seguridad. Aún no está conectada a la pantalla.
//
// Reglas (confirmadas por el usuario el 09-10-2026):
//  - El OBAC es el inscrito de mayor precedencia esa noche.
//  - Maquinista y OBAC son roles distintos: quien se inscribe como maquinista no compite por OBAC.
//  - Si esa noche no hay maquinista inscrito, el inscrito de mayor precedencia habilitado como
//    maquinista (hoy el Capitán) pasa a maquinista y deja de ser OBAC; el OBAC es el siguiente.
//  - Quien no tiene posición en la lista de precedencia queda al final, nunca sobre alguien con posición.
//    Entre varios sin posición hay empate: se avisa y lo resuelve el Teniente 3° a mano.

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
//   habilitadoMaquinista: puede cumplir de maquinista si falta (marca «conductor» de la nómina + oficial).
// orden: ids en orden de precedencia (el primero es el de mayor precedencia).
function obacDeNoche({ inscritos, orden }) {
  const lista = Array.isArray(inscritos) ? inscritos : [];
  const posiciones = new Map();
  (Array.isArray(orden) ? orden : []).forEach((id, i) => { if (!posiciones.has(String(id))) posiciones.set(String(id), i); });
  const pos = (id) => (posiciones.has(String(id)) ? posiciones.get(String(id)) : Infinity);

  // Sin duplicados, conservando el orden de llegada para los sin posición.
  const vistos = new Set();
  const unicos = [];
  for (const p of lista) {
    if (!p || p.id == null) continue;
    const id = String(p.id);
    if (vistos.has(id)) continue;
    vistos.add(id);
    unicos.push({ id, maquinista: !!p.maquinista, habilitado: !!p.habilitadoMaquinista, llegada: unicos.length });
  }
  const porPrecedencia = (a, b) => (pos(a.id) - pos(b.id) || a.llegada - b.llegada);
  const sinPos = (a, b) => pos(a.id) === Infinity && pos(b.id) === Infinity;

  const maquinistas = unicos.filter((p) => p.maquinista).sort(porPrecedencia).map((p) => p.id);
  let candidatos = unicos.filter((p) => !p.maquinista).sort(porPrecedencia);

  let maquinistaPorRespaldo = null;
  if (!maquinistas.length) {
    const respaldo = candidatos.find((p) => p.habilitado);
    if (respaldo) {
      maquinistaPorRespaldo = respaldo.id;
      candidatos = candidatos.filter((p) => p.id !== respaldo.id);
    }
  }

  const obac = candidatos.length ? candidatos[0].id : null;
  const empateSinPosicion = candidatos.length > 1 && sinPos(candidatos[0], candidatos[1]);
  return {
    obac,
    maquinistas: maquinistaPorRespaldo ? [maquinistaPorRespaldo] : maquinistas,
    maquinistaPorRespaldo,
    voluntarios: candidatos.slice(1).map((p) => p.id),
    empateSinPosicion,
  };
}
  root.GermaniaObac={ obacDeNoche:obacDeNoche, ordenDePrecedencia:ordenDePrecedencia };
})(typeof window!=="undefined"?window:globalThis);
