# Estadísticas: identidad y retorno a la pantalla de origen

Solicitud de Christian: revisar colores, botones, ausencia de Atrás y carga extraña al volver.

La entrada vigente redirigía desde Germania a dashboard-preview.html y los enlaces de retorno cargaban nuevamente toda la interfaz heredada. La corrección presenta el mismo dashboard de solo lectura en una ventana interna a pantalla completa, cargada bajo demanda. Al cerrar se conserva la pantalla operativa, su posición y sus campos. Reabrir conserva filtros y datos ya consultados; Actualizar continúa siendo la acción explícita para solicitar datos nuevos. Se reutiliza el manejo existente de Atrás del teléfono, sin agregar un segundo controlador de historial.

Se comparte germania-ui.css y se añade un estilo acotado a Estadísticas con los colores institucionales, controles de 48 px, foco visible, escudo y botones Atrás/Inicio. El PDF conserva fondo legible para impresión. Cambiar filtros invalida infografías anteriores y sus generaciones pendientes, evitando exportar un período obsoleto. El estado de carga bloquea repeticiones de Actualizar y permite reintentar fallas.

Los cálculos, contratos de API, autenticación, registros operativos y bases de datos se conservan. Todas las consultas de la vista son GET. No se publican datos de prueba ni notificaciones.

Validación: suite general npm test; npm run build; navegador 390/1024 px con los scripts reales de navegación, menú y Atrás. El flujo verifica origen y borrador conservados, Android Atrás, filtros persistentes sin nueva carga, menú cerrado al regresar, descarga PDF, infografía invalidada incluyendo resultado tardío, reintento de HTTP 503, colores institucionales, botones ≥44 px y ausencia de desborde de página.

Cambios preparados en rama/PR para revisión previa al despliegue de producción. Revisión independiente realizada por otro agente; no equivale a revisión externa de Claude ni modifica hallazgos de seguridad.
