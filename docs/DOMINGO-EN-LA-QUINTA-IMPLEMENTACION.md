# Domingo en la Quinta — especificación de implementación (17-10-2026)

Estado: **rama de preparación, NO publicada**. Autorización de usuario para publicar módulo y punto rojo, condicionada a pruebas y funcionamiento real.

## Alcance funcional
- Módulo con estilo cálido y ligero, diferente de las tarjetas operativas.
- Pertenece a la misma semana de guardia nocturna (miércoles a martes). El domingo se deriva del inicio de semana, no crea una semana adicional.
- Inscripción de guardia diurna en 3 turnos: 10–14, 14–19 y 19–23, selección múltiple.
- Comida de camaradería: sí/no/por confirmar, colaboración en cocina, minuta editable por oficial.
- Pantalla individual muestra la convocatoria del domingo, selección y estado propio.
- Teniente Segundo ve nombres y turnos, participantes en comida y cupos, y puede coordinar; asistencia efectiva se confirma por separado.
- Publicación automática los sábados 12:45 en America/Santiago, para el domingo correspondiente a la semana activa. Evitar publicaciones duplicadas y respetar el horario de verano.
- Notificación visual: punto rojo de aviso pendiente en la aplicación, individual por voluntario; desaparece al abrir/leer la convocatoria. El distintivo sobre el **icono del sistema Android/iOS** requiere compatibilidad de plataforma y, normalmente, notificación push con permiso. No prometer punto rojo universal en icono instalado sin pruebas.
- Un enlace para compartir por WhatsApp, sin duplicar fuente de datos.

## Requisitos antes de publicar
1. Revisar arquitectura de guardias, modelos Neon y sistema existente de avisos/push. No reutilizar claves de asistencia real para inscripciones.
2. Proponer ADR para tablas/contratos/avisos/caché y revisión cruzada.
3. Persistir inscripciones en servidor, con unicidad (semana, domingo, voluntario, turno) y operaciones idempotentes. No usar localStorage como fuente compartida.
4. Vincular voluntario mediante identificación existente, sin cambios a PIN, roles ni sesiones.
5. Crear UI accesible y móvil, controles táctiles >=44px, sin afectar tablet B-5.
6. Probar zona horaria, apertura semanal, cambio de turno, dobles envíos, cupos, lectura individual de aviso, funcionamiento sin red y múltiples dispositivos.
7. Ejecutar npm test y npm run build; probar Android/PWA y confirmar despliegue Vercel READY.
8. Publicar únicamente tras completar pruebas y revisión, manteniendo intactos guardia nocturna, ODD, OBAC, ratificación y estadísticas.

## Riesgo principal
Una encuesta visual que no persista inscripciones o que muestre cupos desactualizados provocaría errores de dotación. No desplegar prototipo estático como funcional.
