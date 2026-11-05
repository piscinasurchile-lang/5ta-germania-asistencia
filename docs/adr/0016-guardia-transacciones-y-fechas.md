# ADR 0016 — Correcciones de concurrencia y coherencia de Guardia

Estado: aceptado para implementación y pruebas aisladas por autorización de Christian: «Soluciona uno a uno estos 7 y cuando soluciones informas». Producción no autorizada por esta decisión.

Se conservan app_state, claves, datos históricos y trigger existente. Las operaciones de plan+índice, aprobación de siete guardias+revisión e integración de reemplazos se ejecutan mediante una transacción PostgreSQL interactiva sobre una única conexión del driver Neon ya instalado. Lecturas bloqueadas, versiones esperadas y cualquier fallo causan rollback completo, incluido historial. Claves inexistentes requieren versión0; no se reintentan mutaciones automáticamente. La conexión Pool se crea y cierra en cada solicitud (Node24, WebSocket nativo). No hay migración de esquema ni cambio de DATABASE_URL.

La ruta de programación conserva la comprobación de sesión oficial configurable y reutiliza puedeAprobarGuardia; no resuelve R1–R6. Solo admite claves de programación. Los previews del proyecto de producción no habilitan escrituras de programación; las pruebas HTTP utilizan Postgres local aislado y Staging requiere GERMANIA_STAGING=1.

Las fechas civiles nuevas se expresarán en America/Santiago. Las cadenas históricas YYYY-MM-DD y marcas de tiempo UTC se conservan. La dotación mínima es2+1+1 también en validación y exportación ODD. Mensajes de errores operativos no muestran datos personales ni provocan escrituras. No se modifica la política de roles ni el intervalo de los temporizadores existentes.


## Pase de la preparación aprobada — 5 de noviembre de 2026

Encargo posterior de Christian: «Ok dale y soluciona», referido al pase de Staging a Germania real. Se conecta la interfaz aprobada al contrato transaccional ya existente, sin cambiar esta API ni sus permisos. No se traslada el bloqueo de endpoint exclusivo de Staging: la conexión sigue siendo la configuración vigente del proyecto de producción. Las semanas iniciadas se mantienen en la revisión anterior, sin migrar ni reescribir guardias.
