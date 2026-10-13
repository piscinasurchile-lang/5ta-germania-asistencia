# ADR 0010 — Confirmación de lectura de novedades

Estado: implementado en rama de prueba por encargo del administrador el 13-10-2026. Integración pendiente de revisión.

Se reutiliza `novedades:v1` y la API central existente. Cada aviso tiene una lista `novedad-lecturas:<id>` con `{voluntarioId,en}`. Se agrega con PATCH addToList y uniqueBy voluntarioId para evitar duplicados y pérdida de confirmaciones simultáneas. No se crean tablas ni migraciones ni se modifica la API, autenticación o permisos. Los avisos antiguos pueden recibir confirmaciones.

La vista usa la identidad y roles actuales, con las limitaciones registradas en REGISTRO-RIESGOS-SEGURIDAD.md. Confirmar lectura no acredita asistencia. No se escribe ningún aviso real automáticamente. El campo admite 2000 caracteres y conserva saltos de línea. Inicio se refresca cada minuto mientras visible mediante el temporizador existente. Se emite un tono informativo breve al detectar avisos nuevos con la aplicación visible, después de interacción del usuario que habilite audio. La carga inicial no suena.

Pruebas sin conexión a datos reales. No desplegar ni fusionar esta rama sin autorización.
