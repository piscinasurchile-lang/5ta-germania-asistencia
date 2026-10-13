/**
 * Estado durable del lector: siguiente offset de getUpdates y último mensaje procesado.
 * Escritura atómica (archivo temporal + sync + rename) para sobrevivir a cortes de energía o reinicios.
 * El archivo es privado (0600) y está en .gitignore.
 */
import { open, readFile, rename, rm } from 'node:fs/promises';

const FS_REAL = { open, readFile, rename, rm };
export const RUTA_ESTADO_POR_DEFECTO = '.telegram-relay-state.json';

const nuevo = () => ({ version: 1, offset: null, ultimoMessageId: 0, actualizado: null });

export function validarEstado(estado) {
  const valido = estado && estado.version === 1
    && (estado.offset === null || (Number.isSafeInteger(estado.offset) && estado.offset > 0))
    && Number.isSafeInteger(estado.ultimoMessageId) && estado.ultimoMessageId >= 0;
  if (!valido) throw new Error('estado del lector inválido');
  return estado;
}

export function crearAlmacen(ruta, { fs = FS_REAL, ahora = Date.now, pid = process.pid } = {}) {
  if (!ruta || typeof ruta !== 'string') throw new Error('ruta de estado requerida');
  return {
    /** origen: 'nuevo' (no existía), 'archivo' (válido) o 'corrupto' (se aparta una copia y se parte de cero). */
    async cargar() {
      let texto;
      try {
        texto = await fs.readFile(ruta, 'utf8');
      } catch (error) {
        if (error?.code === 'ENOENT') return { estado: nuevo(), origen: 'nuevo' };
        throw error; // permisos u otro fallo del disco: no se adivina
      }
      try {
        return { estado: validarEstado(JSON.parse(texto)), origen: 'archivo' };
      } catch {
        const copia = `${ruta}.corrupto-${ahora()}`;
        try { await fs.rename(ruta, copia); } catch { /* mejor esfuerzo */ }
        return { estado: nuevo(), origen: 'corrupto', copia };
      }
    },
    async guardar(estado) {
      validarEstado(estado);
      const temporal = `${ruta}.${pid}.tmp`;
      let archivo;
      try {
        archivo = await fs.open(temporal, 'w', 0o600);
        await archivo.writeFile(JSON.stringify(estado) + '\n');
        await archivo.sync();
        await archivo.close();
        archivo = undefined;
        await fs.rename(temporal, ruta);
      } catch (error) {
        try { await archivo?.close(); } catch { /* ya cerrado */ }
        try { await fs.rm(temporal, { force: true }); } catch { /* mejor esfuerzo */ }
        throw error;
      }
    }
  };
}
