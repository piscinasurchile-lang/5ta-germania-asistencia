# Avisos de Guardia: acceso al día del cambio

Implementado en rama; pendiente de integración y publicación.

Cada aviso pendiente muestra su propio botón «Asignar reemplazo». El acceso selecciona primero la semana del calendario mediante gnElegirSemana, abre Guardia una sola vez y selecciona el día del aviso en el cliente existente. Espera la carga del documento correcto mediante observación del DOM, sin el salto antiguo a Reemplazos tras 350 ms. Reabrir otra noche de la misma semana reutiliza el iframe y no descarta su borrador local. Se conserva el permiso existente.

Una actualización de alertas cuyo contenido no cambió conserva sus nodos y el foco. Esto evita un redibujado innecesario del aviso, pero no demuestra que el doble parpadeo comunicado después de guardar esté resuelto. El cliente diario deshabilita sus controles durante carga/guardado y su estilo vigente reduce la opacidad al 45%; no se modifica ese comportamiento aprobado.

Permanecen intactos germania-guardia-asignacion.js, su CSS y el prototipo. No cambia el guardado, la aprobación, ODD, alertas emitidas ni datos de producción.

Validación: seis regresiones de selección de semana/día, lectura lenta, fechas inválidas, permisos, navegación simultánea, documento anterior y carga asíncrona del iframe. Prueba Playwright móvil incluida en tests/guardia-aviso-dia-browser.mjs; no ejecutable en este entorno porque Chromium rechaza socket() con Operation not permitted. Queda pendiente su comprobación visual en entorno habilitado.
