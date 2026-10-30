# ADR 0017 — Asistencia validada y guardado único

Estado: aceptado dentro del alcance autorizado por Christian el 30-10-2026: «desarróllalo, arréglalo y pásalo a producción». Buscador nuevo de Oficiales pendiente.

Se conserva el modelo app_state, las claves parte:*, partes:index:v1 y correlativo:parte:<año>, DATABASE_URL y los datos históricos. No hay migración ni nuevas tablas. La operación manual de Asistencia usa una transacción en una única conexión Pool del driver ya instalado; guarda número, parte e índice juntos. La misma clave y operación devuelve el resultado confirmado sin incrementar número ni versión. Correcciones exigen la versión leída y conservan número, identidad y metadatos. Un fallo revierte la transacción; no hay reintentos automáticos de escritura.

Los campos adicionales hora, eligibleIds y metadatos de operación se escriben solo en partes nuevos o corregidos explícitamente. Los registros históricos sin esos campos siguen leyéndose y exportándose. La lista manual inicia sin marcar; se exige fecha/hora real, tipo, detalle, responsable, todos los estados explícitos y al menos un presente. La nómina nueva se contrasta en el servidor; las correcciones conservan la nómina original.

La interfaz congela la solicitud pendiente y permite reintentar exactamente la misma operación ante respuesta incierta; no inicia otra actividad mientras se resuelve. No se usa almacenamiento local como fuente institucional. Historial abre la clave exacta seleccionada. Al pie se muestran las últimas dos asistencias manuales, con ver/modificar, PDF y WhatsApp; los demás registros no se borran. Compartir utiliza el parte confirmado, nunca el formulario sin guardar.

No modifica autenticación, PIN ni roles; conserva el desbloqueo de Oficialidad existente y las restricciones de origen. El registro de riesgos R1–R6 sigue pendiente. No cambia captura B-5, Guardia ni ODD. En previews de producción se bloquean escrituras; staging requiere GERMANIA_STAGING=1.

Pruebas: validaciones, idempotencia, versiones, rollback tras fallo del índice, metadatos históricos, nómina cambiada y rechazo de emergencias B-5 en PostgreSQL local aislado; regresión general, compilación y navegador móvil/tablet antes de integrar. Producción se verifica con lecturas y solicitudes inválidas, sin partes de prueba.
