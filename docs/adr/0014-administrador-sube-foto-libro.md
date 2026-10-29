# ADR 0014 · El administrador sube la foto del libro de una noche terminada

**Estado:** Aceptado el 2026-10-29 por Christian Vergara (517), administrador del proyecto y responsable de seguridad. Implementado y fusionado en main (PR #241).

## Contexto
La foto del libro la sube solo el OBAC designado y solo en su ventana (de las 06:00 del día siguiente a las 06:00 del subsiguiente). Si el OBAC no la subió a tiempo, la noche no se puede aprobar. El administrador consiguió la foto en el cuartel (noche del 18 de octubre) y no tenía cómo subirla.

## Decisión
- `POST /api/guardia/libro` acepta además al administrador (clave 517 activa), sin ventana, siempre que la noche haya terminado.
- El cierre queda marcado `cierrePorAdministrador:true` con `cerradoPorId/Nombre/Cargo`; el aviso a oficiales lo dice. Mismo límite de 1,6 MB, misma validación de imagen y mismo hash.
- No reemplaza cierres existentes (`libro_ya_cerrado`); reintento con la misma foto es idempotente.
- Interfaz: bloque «Subir la foto del libro» solo para el administrador, en el control de guardia y en el panel de aprobación, solo en noches terminadas sin cierre.
- No cambia: cierre sin foto, cierre semanal, incidencias, visto del Capitán, registro de externos.

## Corrección de noches ya aprobadas (doble registro del 20 de octubre)
El formulario de una noche aprobada quedaba abierto y se podía volver a guardar por error. Ahora está tras «Corregir esta aprobación», se rechaza si no hay cambios y, antes de guardar, se listan los cambios (por ejemplo «Ludwig: Excusado → Asistió») y se pide un motivo de al menos 5 letras.

## Datos
Ninguna migración. El 20 de octubre se restauró en Neon la versión 1 (a petición del administrador) y se eliminó del historial la versión errónea.
