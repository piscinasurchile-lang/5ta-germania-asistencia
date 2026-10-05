# Changelog

## V2 preview
- Dashboard independiente de `app.js`.
- Solo lectura.
- Cache e in-flight dedupe por clave.
- Carga acotada de partes (6 concurrentes).
- Guardia secundaria (4 concurrentes) y no bloqueante.
- Contador visible de solicitudes.
- Sin auditoría/test-mode del legado.
