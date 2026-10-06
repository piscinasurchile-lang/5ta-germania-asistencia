# Guardado seguro, historial de versiones y modificación (asistencia y emergencias B-5)

## Qué resuelve
- Una emergencia o un parte **nunca queda a medias**: hoja, asistencia, índices y número correlativo se guardan en **una sola operación** (todo o nada).
- Todo lo que se guarda queda en la base central (Neon) y se puede **modificar** con el botón «Modificar» (en modo producción pide la clave de Oficialidad).
- Cada modificación conserva la **versión anterior** para poder recuperarla («Versiones anteriores»).
- Dos tablets guardando a la vez no se pisan: la segunda recibe un aviso y no se sobrescribe nada.
- El Historial abre cada actividad por su **clave exacta** (antes buscaba por fecha y tipo y las emergencias B-5 salían en blanco).

## Piezas
| Pieza | Archivo | Función |
|---|---|---|
| Esquema común | `lib/db.js` | Cliente SQL, creación de tabla (una vez por instancia), historial y `app_assert` |
| Guardado atómico / lectura en bloque | `app/api/state-batch/route.js` | `POST {writes:[{key,value,expect?}]}` en una transacción SERIALIZABLE; `GET ?prefix=` o `?keys=` |
| Historial | `app/api/state-history/route.js` | `GET ?key=` devuelve versiones anteriores |
| Cliente | `public/legacy/app.js` | `sSetMany`, `sGetPrefix`, `sGetMany`, hoja B-5 con borrador, «Modificar» y «Versiones anteriores» |

## Concurrencia (`expect`)
Cada escritura puede indicar el valor que esperaba encontrar. Si otra persona lo cambió, el servidor responde **409** y **no guarda nada**; el cliente relee y reintenta (contadores e índices) o avisa al usuario (si cambió la misma hoja o parte).

## Historial de versiones
La tabla `app_state_hist` se llena sola con un *trigger* en `app_state`: guarda el valor **anterior** cada vez que un registro cambia o se elimina.
No se versionan: claves `germania:*` (auditoría de uso), `svborrador:*` (borrador automático), claves `__*` y valores de más de ~300 KB.

Recuperar a mano una versión (SQL):
```sql
SELECT id, version_at, replaced_at, value FROM app_state_hist
 WHERE key = 'parte:2026-10-02__emergencia-b-5__1900' ORDER BY id DESC;
-- para volver a una versión:
UPDATE app_state SET value = (SELECT value FROM app_state_hist WHERE id = <ID>), updated_at = now()
 WHERE key = 'parte:2026-10-02__emergencia-b-5__1900';
```
El historial **crece con el tiempo**: conviene revisar su tamaño una vez al año.

## Hoja de servicio B-5
- La clave de la hoja (`servicio:<fecha>__<hhmm>`) se fija al crearla y **no cambia** aunque se corrija la fecha u hora de salida. Guarda `parteClave` y el parte guarda `hojaClave`.
- **Borrador automático** (`svborrador:v1`) a los 4 s de cada cambio; al volver a abrir la app se ofrece «Continuar con el borrador».
- Cambiar de pestaña o corregir la hora ya **no borra** a los concurrentes marcados.
- Las salidas «… B-5» no se pueden guardar desde «Pasar lista» (evita duplicar la asistencia).

## Pruebas realizadas
Servidor (PostgreSQL 18), navegador simulado con la app real, y validación del esquema en una rama temporal de Neon. Ver descripción del pull request.
