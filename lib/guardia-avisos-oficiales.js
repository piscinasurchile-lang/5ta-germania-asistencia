/* Avisos internos para oficiales (bandeja dentro de Germania). Un aviso por evento: la clave evita duplicados.
   El Push existente no distingue personas (las suscripciones son anónimas por dispositivo), así que NO se usa
   para esto: llegaría a todos los voluntarios. Ver informe. */
import { writeState, readState } from "./state-store.js";
import { difundirOficiales } from "./germania-webpush.mjs";

export const TIPOS_AVISO = {
  libro_entregado: "El OBAC entregó el libro · noche pendiente de ratificación",
  incidencia_critica: "Incidencia crítica",
  ratificada: "Noche ratificada",
  acreditada_t3: "Cumplimiento acreditado por el Teniente 3°",
  correccion: "Ratificación corregida",
  semana_cerrada: "Cierre semanal completado"
};
/** Instrucción del Capitán (oct-2026): ningún aviso ni notificación a oficiales por la guardia. Con `true` se restablecen. */
export const AVISOS_OFICIALES_ACTIVOS = false;
/** Crea el aviso solo si no existía (ifVersion 0). Devuelve true si es nuevo. Nunca rompe el flujo principal. */
export async function avisarOficiales(sql, { clave, tipo, fecha, titulo, porNombre }) {
  if (!AVISOS_OFICIALES_ACTIVOS) return false;
  try {
    if (!TIPOS_AVISO[tipo] || !/^[A-Za-z0-9:_-]{3,80}$/.test(clave)) return false;
    const mes = String(fecha || new Date().toISOString()).slice(0, 7);
    const w = await writeState(sql, "guardia-aviso-oficial:" + mes + ":" + clave,
      { tipo, fecha: fecha || null, titulo: String(titulo || TIPOS_AVISO[tipo]).slice(0, 160),
        porNombre: porNombre || null, en: new Date().toISOString() }, { ifVersion: 0 });
    if (w.ok) {
      // Push solo a oficiales (inactivo en Staging). Un fallo del push nunca afecta al registro.
      try {
        const roster = (await readState(sql, "roster:v8")).value;
        await difundirOficiales({ tipo, titulo: titulo || TIPOS_AVISO[tipo], id: clave, origen: process.env.GERMANIA_PUSH_ORIGEN || "", roster });
      } catch (e) { console.error("push oficiales", e); }
    }
    return !!w.ok;
  } catch (e) { console.error("aviso oficiales", e); return false; }
}
