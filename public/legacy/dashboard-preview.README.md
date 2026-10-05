# Dashboard V2 — preview aislado

Ruta: `/legacy/dashboard-preview.html`

- Solo lectura: no usa PUT ni modifica Neon.
- No lee ni escribe `germania:test-audit:v1`, `germania:test-mode:v1` ni `germania:test-baseline:v1`.
- Deduplica solicitudes en vuelo y cachea cada clave durante la carga.
- `partes:index:v1` se consulta una vez; cada `parte:*` como máximo una vez por carga.
- `guardias:index` se consulta una vez; cada `guardia:*` como máximo una vez por carga.
- Guardia se carga después del resumen principal y no bloquea asistencia.
- Cambio de período usa generación para ignorar resultados obsoletos.
- Botón Actualizar limpia el cache del preview y realiza una nueva lectura controlada.

Este archivo y el preview no sustituyen el Dashboard de producción. La integración se hará solo después de validación manual.