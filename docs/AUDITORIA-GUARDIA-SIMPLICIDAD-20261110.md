# Guardia Nocturna · auditoría de controles

Alcance autorizado: retirar duplicidades antiguas conservando la edición nueva por día. Trabajo en rama; no se ejecutan acciones de programación, suspensión o acreditación contra producción.

| Control | Resolución |
| --- | --- |
| Semana normal / Guardia extraordinaria | Retirados: no tenían manejador ni guardado. |
| Calendario y semana seleccionada | Conservados para crear y consultar; fecha final mostrada es martes. |
| Publicar semana / plazo | Conservados antes de aprobar programación. No ofrecen reabrir una programación aprobada. |
| Cerrar inscripción | Conservado; se oculta cuando ya cerró o se aprobó la programación. |
| Limpiar selección | Conservado en Opciones: solo limpia selección, no borra registros. |
| Anular / Suspender por Comandancia | Conservados dentro de Opciones con sus controles de versiones existentes. |
| Guardia diurna y horarios excepcionales | Conservados desplegables; no se inventa otra modalidad. |
| Tabla semanal | Consulta institucional de programación; mantiene imprimir y un solo acceso a generar ODD. |
| Revisión antigua | Se retira su pestaña de acceso; la modificación se realiza en el módulo nuevo. |
| Menús nuevos dentro de cada día | Intactos: Agregar, Cambiar, OBAC, Maquinista, Voluntario, Reemplazo y guardar por día. |
| Avisos de reemplazo | Conservados: resuelven solicitudes de inasistencia, función distinta de modificar integrantes. |
| No inscritos / estadísticas | Conservados bajo Inscripciones y avisos; se distingue el número de designados del número original de inscritos. |
| Historial de inscripciones | Conservado: mide elecciones, no asistencias acreditadas. |
| Historial de guardias | Desplegable. Conserva detalle y descarga de semanas anteriores. Se retira el segundo acceso Generar ODD. |
| Cierre del OBAC / foto / novedades | Intactos; son soporte del cumplimiento, no una segunda edición de programación. |
| Aprobación diaria | Intacta. |
| Aprobar toda la semana | Nuevo resumen fuera de los cuadros diarios, confirmación explícita y escritura conjunta atómica. |
| Cerrar la semana | Se conserva: consolida noches ya aprobadas; no sustituye la aprobación de asistencia. |
| ODD de Guardia | Conserva texto, escudos, bandera y firmas. Solo cambian los cuadros del anexo; 071 es la referencia preferida si está archivada. |

Validación: controles inactivos reproducidos en el navegador de producción antes de modificar código. Pruebas integradas con Postgres aislado en memoria, sin copias en producción. La comprobación visual de la interfaz modificada desde el navegador remoto queda pendiente: este no alcanza el servidor local. No se presentan esas comprobaciones como realizadas.
