/* Incidencias de la guardia nocturna: se guardan por noche en `guardia-incidencias:<fecha>`.
   Cada incidencia tiene un id (idempotencia ante reintentos) y nunca se borra: solo se resuelve. */
import { readState, writeState } from "./state-store.js";

export const TIPOS_INCIDENCIA = {
  no_llega: "Voluntario que no llega",
  obac_ausente: "OBAC ausente",
  conductor_ausente: "Conductor ausente",
  retiro_obac_conductor: "OBAC o conductor se retira durante la noche",
  llega_tarde: "Voluntario que llega tarde",
  retiro_anticipado: "Voluntario que se retira anticipadamente",
  reemplazo_durante: "Reemplazo durante la guardia",
  refuerzos: "Solicitud de refuerzos",
  dotacion_insuficiente: "Dotación inferior al mínimo",
  foto_faltante: "Fotografía del libro faltante",
  falla_conexion: "Falla de conexión",
  correccion_posterior: "Corrección posterior al cierre",
  otra: "Otra novedad"
};
export const TIPOS_CRITICOS = new Set(["obac_ausente", "conductor_ausente", "retiro_obac_conductor", "dotacion_insuficiente"]);
const MAX_ITEMS = 120;

export function validarIncidencia(b, { auto = false } = {}) {
  const id = String(b?.id || "");
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) return "id_invalido";
  if (!TIPOS_INCIDENCIA[b?.tipo]) return "tipo_invalido";
  const detalle = String(b?.detalle || "").trim();
  if (!auto && detalle.length < 3) return "detalle_requerido";
  if (detalle.length > 600) return "detalle_largo";
  if (b?.personaId != null && b.personaId !== "" && !/^[A-Za-z0-9_-]{1,12}$/.test(String(b.personaId))) return "persona_invalida";
  return null;
}

/** Agrega una incidencia (idempotente por id) con reintentos ante concurrencia. */
export async function agregarIncidencia(sql, fecha, item) {
  for (let intento = 0; intento < 6; intento++) {
    const cur = await readState(sql, "guardia-incidencias:" + fecha);
    const doc = cur.value && Array.isArray(cur.value.items) ? cur.value : { fecha, items: [] };
    const previa = doc.items.find(x => x.id === item.id);
    if (previa) return { ok: true, repetida: true, incidencia: previa };
    if (doc.items.length >= MAX_ITEMS) return { ok: false, error: "demasiadas_incidencias" };
    const nuevo = { ...doc, items: [...doc.items, item] };
    const w = await writeState(sql, "guardia-incidencias:" + fecha, nuevo, { ifVersion: cur.version });
    if (w.ok) return { ok: true, repetida: false, incidencia: item, version: w.version };
  }
  return { ok: false, error: "conflicto_reintentar" };
}

export async function resolverIncidencia(sql, fecha, id, resolucion) {
  for (let intento = 0; intento < 6; intento++) {
    const cur = await readState(sql, "guardia-incidencias:" + fecha);
    const doc = cur.value && Array.isArray(cur.value.items) ? cur.value : null;
    const i = doc ? doc.items.findIndex(x => x.id === id) : -1;
    if (i < 0) return { ok: false, error: "incidencia_no_existe" };
    if (doc.items[i].estado === "resuelta") return { ok: true, repetida: true, incidencia: doc.items[i] };
    const items = doc.items.slice();
    items[i] = { ...items[i], estado: "resuelta", ...resolucion };
    const w = await writeState(sql, "guardia-incidencias:" + fecha, { ...doc, items }, { ifVersion: cur.version });
    if (w.ok) return { ok: true, repetida: false, incidencia: items[i], version: w.version };
  }
  return { ok: false, error: "conflicto_reintentar" };
}
