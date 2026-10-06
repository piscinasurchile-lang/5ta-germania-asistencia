/* Ayudas para interpretar la respuesta de la lectura de una ODD de cargos. */
/* Saca el JSON de la respuesta aunque venga con texto alrededor. */
export function extraerJson(texto) {
  const t = String(texto || "").replace(/```json|```/gi, "");
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i < 0 || j <= i) return null;
  try { return JSON.parse(t.slice(i, j + 1)); } catch { return null; }
}
export function limpiarResultado(r) {
  if (!r || !Array.isArray(r.cargos)) return null;
  const cargos = r.cargos
    .filter((x) => x && typeof x.cargo === "string" && typeof x.nombre === "string")
    .map((x) => ({ cargo: x.cargo.trim().slice(0, 60), nombre: x.nombre.trim().slice(0, 120) }))
    .filter((x) => x.cargo && x.nombre)
    .slice(0, 40);
  const anio = Number.isInteger(r.anio) && r.anio >= 2023 && r.anio <= 2100 ? r.anio : null;
  const fecha = typeof r.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha) ? r.fecha : null;
  return { anio, fecha, cargos };
}
