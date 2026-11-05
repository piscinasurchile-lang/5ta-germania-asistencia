# Pase de preparación de Guardia Nocturna

Autorización: encargo de Christian del 5 de noviembre de 2026, posterior a aprobación del diseño y prueba de cambios en Staging. Alcance exclusivo: preparación/asignación; producción base c4eaba6e640287b68cfe92c7d19d2d6c1b32d12a.

## Implementación

- Se conserva el prototipo aprobado y el tema oscuro, rojo y amarillo, dentro de un desplegable.
- Usa la semana existente del calendario, sin otra fecha ni otra aplicación.
- Se reutiliza `/api/guardia/programacion`; no se porta `/api/guardia/gestion` ni su conexión exclusiva de pruebas.
- No se modifica DATABASE_URL, PIN, sesiones, permisos, disponibilidad, asistencia, emergencia, tablet B-5 ni ODD.
- Solo preparación de semanas no iniciadas, tras cerrar inscripciones. Revisión de semanas iniciadas permanece en el código vigente para preservar libros, fotografías y aprobaciones vinculadas.
- Se conserva la visibilidad T3/administrador. La API existente sigue siendo la autoridad del guardado.
- David Briones se obtiene de la función existente de apoyo externo; solo T3 lo incorpora y únicamente como maquinista. No se añade a roster:v8 ni a estadísticas.
- Se conserva la publicación anterior al guardar borradores. La nueva publicación usa control de versiones para revisión y cada guardia, junto con el índice, en una sola transacción.
- Cambiar la identidad durante cualquier lectura cancela el envío pendiente; no se atribuye el cambio a otro integrante.

## Respaldo y reversión

Neon producción: snapshot `snap-rough-snow-b5qjtwtl`, creado antes del pase; vence el 12 de noviembre de 2026. No se cambiaron registros de producción para crear el respaldo.

Reversión del código: restaurar el commit base o el despliegue anterior. No ejecutar restauraciones de base ni borrar registros sin una instrucción expresa; la publicación del código no requiere migración.

## Validación

Validación previa: `npm test` — 437/437 pruebas aprobadas, sin omisiones; `npm run build` — correcto. Revisión independiente final: sin bloqueos, nueve regresiones integradas repetidas y aprobadas. Las nuevas pruebas usan PostgreSQL local aislado (PGlite) y el manejador real de `/api/guardia/programacion`: nómina, noche individual, siete noches e índice, conservación de foto/metadatos, reemplazos, versiones, actor, cierre de inscripciones y David/T3.

Se realiza además una revisión independiente de código. No se presentan estas pruebas como una edición desde el teléfono del usuario. La comprobación posterior a publicación es de lectura; no se inyectan voluntarios de prueba en la base real.

## Coordinación

PR #264 sigue pendiente y trata los permisos de programación del Ayudante. Este pase no lo fusiona ni modifica esos permisos; conserva el comportamiento actual de main. Los riesgos R1–R6 del registro de seguridad siguen pendientes del responsable y no se dan por solucionados.
