# Guardia: limpieza de la tarjeta de Oficiales al cambiar de voluntario

Estado: implementado en rama; pendiente de integración y publicación.

El resumen de Inicio podía conservar la tarjeta del oficial anterior: cargar() no limpiaba la vista al cambiar de identidad, una edición pendiente podía bloquear la nueva consulta y pintarOficial() retornaba para voluntarios sin limpiar pintarResumenMando(). La lectura fallida conservaba la tarjeta antigua.

Se descartan inmediatamente los datos visuales de la identidad anterior al seleccionar otra persona, se ocultan sus tarjetas/botones y se recargan los datos correspondientes. Las respuestas del actor anterior no restauran sus fichas; al terminar una lectura pendiente se consulta al actor elegido actualmente. Actualizar la misma identidad mientras edita mantiene la protección de su formulario.

No cambia la autenticación, sesiones, roles ni permisos de servidor. No acredita una corrección de los riesgos de seguridad registrados por separado. No modifica la edición diaria, fotos, asistencia, ODD ni datos reales.

Pruebas: cambio de oficial a voluntario sin conexión, lectura antigua que termina después del cambio, nueva consulta del actor seleccionado, edición de la misma persona conservada y limpieza del resumen en una respuesta sin mando.

## Presentación solicitada por Christian

El acceso de Inicio se muestra únicamente al Teniente Tercero y al Ayudante de Capitán activos, dentro de un desplegable nativo cerrado inicialmente. Una actualización conserva si estaba abierto; un cambio de identidad lo cierra y limpia. Los botones conservan sus acciones al plegarse. Los demás roles conservan sus accesos existentes fuera de esta tarjeta.

T3 conserva las tareas de revisión existentes. Ayudante consulta las guardias que su acceso actual permite leer, sin botones de acreditación nuevos ni ampliación de lectura de pendientes o fotos. No cambia ningún permiso de servidor.
