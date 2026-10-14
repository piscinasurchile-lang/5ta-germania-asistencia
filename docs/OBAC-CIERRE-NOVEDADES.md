# Guardia OBAC: novedades y cierre

- El OBAC asignado por la revisión aprobada puede informar novedades durante su turno.
- Cada novedad conserva autor, fecha, hora y texto original.
- Las novedades no urgentes se resumen para Capitán, Teniente Tercero y administrador a las 08:30, hora de Chile. No generar alarma nocturna.
- Si el OBAC finaliza después de las 08:30, el aviso de cierre se envía al cerrar.
- El cierre se realiza manualmente a la hora real de retiro, no automáticamente a las 06:00.
- El cierre sin novedades debe permitir consignar «Sin novedades».
- El cierre no acredita asistencia: solo el Teniente Tercero acredita cumplimiento.
- La dotación y los datos de guardias existentes no se modifican durante pruebas.

Estado: especificación pendiente de implementación y pruebas. No habilitar como operativa antes de verificar permisos y notificaciones.

## Condición obligatoria antes de habilitar escritura

La identificación por nombre/código y la validación de origen HTTP no autentican al voluntario. No exponer POST de novedades ni cierre hasta disponer de una sesión autenticada y comprobar en el servidor que el actor coincide con `guardia-revision:<miércoles>.noches[fecha].obac` de una revisión aprobada. Los reportes serán de solo lectura para los tres destinatarios autorizados. Mantener la bitácora inmutable y un cierre único por noche. No enviar alertas de madrugada. Un proceso programado deberá entregar el resumen después de las 08:30 de Chile y marcar cada entrega para evitar duplicados. Probar únicamente con base aislada; nunca sobre el turno vigente.
