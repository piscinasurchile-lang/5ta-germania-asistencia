/* GERMANIA · resumen de disponibilidad (En cuartel / Disponibles / Maquinistas).
   Mismo cálculo que la minuta y que public/legacy/widget.html: de cada voluntario ACTIVO vale su
   último estado (por «desde») entre «disponibilidad:vigente» y los últimos 15 días. */

/* Fecha de hoy en Chile (el servidor corre en UTC). */
export function hoyChile(ahora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

export function clavesDisponibilidad(hoy, dias = 15) {
  const claves = ["disponibilidad:vigente"];
  const [y, m, d] = hoy.split("-").map(Number);
  for (let i = 0; i < dias; i++) {
    const f = new Date(Date.UTC(y, m - 1, d - i));
    claves.push("disponibilidad:" + f.toISOString().slice(0, 10));
  }
  return claves;
}

export function resumenDisponibilidad(roster, valoresPorClave) {
  const ultimo = {};
  const poner = (id, r) => {
    if (!r || !r.estado) return;
    const a = ultimo[id];
    if (!a || (Date.parse(r.desde) || 0) >= (Date.parse(a.desde) || 0)) ultimo[id] = r;
  };
  Object.values(valoresPorClave || {}).forEach((v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return;
    Object.keys(v).forEach((id) => poner(id, v[id]));
  });
  let cuartel = 0, disponibles = 0, maquinistas = 0;
  (Array.isArray(roster) ? roster : []).filter((m) => m && m.activo !== false).forEach((m) => {
    const e = ultimo[m.id] && ultimo[m.id].estado;
    if (e === "cuartel") cuartel++;
    if (e === "disponible") disponibles++;
    if ((e === "cuartel" || e === "disponible") && m.conductor === true) maquinistas++;
  });
  return { cuartel, disponibles, maquinistas };
}
