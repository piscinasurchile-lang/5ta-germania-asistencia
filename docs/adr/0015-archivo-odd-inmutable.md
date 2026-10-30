# ADR 0015 · Archivo ODD inmutable y subida manual

- Estado: decisión funcional aceptada por Christian en esta conversación e integración autorizada expresamente con «Integra eso a Germania», después de probar Staging.
- Alcance: Archivo de ODD, resúmenes de lo que dispone cada orden, subida desde Oficiales, relaciones «deja sin efecto», lecturas individuales y avisos durante 24 horas. Google Cloud/Drive automático se pospone por indicación del usuario.
- Fuente revisada: Staging `431f89179bcc842d75c17141550520218cf133d1`; producción base `0417fd321bb07bf5ac1194e2d7d8d74a81775898`.
- Integración: portar archivos/bloques concretos, sin merge entre repositorios y sin copiar conexiones, secretos, datos de guardias o configuración de Staging.

## Decisión
Cada ODD publicada se identifica por número único y conserva su documento original. Una nueva orden puede dejar sin efecto otras anteriores. Las órdenes anteriores permanecen y se enlazan; no se reemplazan ni eliminan, y dejar sin efecto a una orden no revive automáticamente las que ella había invalidado.

Se mantiene el botón existente Archivo de ODD y el botón Subir ODD de Oficiales. Ayudante informa ODD conserva el alta sin PDF, los datos de citación y el calendario; las altas siguen siendo inmutables. El PDF se analiza temporalmente y el oficial revisa un resumen extractivo antes de publicar. Los documentos escaneados requieren resumen manual revisado. Los 59 históricos de Drive se incorporan como catálogo, con sus resúmenes, sin avisos masivos.

## Datos
Se mantiene exactamente la conexión DATABASE_URL de producción. Migración aditiva en código: `germania_odd_archivo`, `germania_odd_pdf`, `germania_odd_lecturas` y `germania_odd_sync` (esta última registra resultados de avisos; no activa Drive). No se alteran ni eliminan tablas existentes. Documento y PDF se insertan atómicamente. La clave primaria impide duplicados concurrentes.

Las nuevas rutas se habilitan únicamente en el proyecto de producción conocido y con `GERMANIA_ODD_ARCHIVO=1`. Los Preview del repositorio de producción permanecen bloqueados para evitar que una prueba escriba en la base real.

## Compatibilidad y seguridad
- Se conserva el buscador anterior dentro de los PDF e indexación mediante un acceso dentro del archivo.
- No se cambian PIN, login, roles ni rutas de autenticación. Se reutiliza la sesión de Oficialidad existente para publicar.
- La firma de lecturas por persona mantiene la selección de nombre existente; no es autenticación personal ni resuelve R1–R6 del registro de riesgos.
- El catálogo nuevo proyecta solo metadatos necesarios. Los nuevos PDF requieren persona seleccionada o sesión oficial. No se presenta esto como corrección global de seguridad.
- La ruta legacy deja de aceptar reemplazos de ODD o de sus PDF. Las demás protecciones de Guardia de la API de estado se conservan.
- Se preservan Push a oficiales, suscripciones e identificación de voluntario; solo se añade enlace a la ficha ODD. Las pruebas usan un emisor simulado y no publican avisos en producción.
- El contador ODD no borra el indicador de otras notificaciones activas.
- Se conserva portada, B-5, asistencia, guardias y ODD Maestras. ADR 0006 no cambia.

## Validación y revisión
Pruebas con PDF real, PostgreSQL local embebido, concurrencia, lectura por persona, rechazo de duplicados y navegación móvil/tablet. Revisión independiente por otro agente según AGENTS.md; no se dispone de herramienta Claude y no se afirma revisión por Claude ni cierre del registro externo de seguridad.

## Reversión
Restaurar el commit anterior de la aplicación si la verificación falla. Las tablas y documentos nuevos se conservan; no borrar datos para revertir la interfaz. La configuración de conexión institucional no cambia.
