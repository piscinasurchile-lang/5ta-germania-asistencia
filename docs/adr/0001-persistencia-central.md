# ADR 0001 · Persistencia institucional central
- **Estado:** Propuesto (documentar decisión existente; no cambiar implementación).
- **Contexto:** README establece Neon como fuente institucional. Auditoría describe `app_state` con versiones e historial parcial.
- **Decisión propuesta:** preservar fuente central y control de concurrencia; no tratar almacenamiento local como registro institucional.
- **Alternativas:** múltiples fuentes locales (rechazar por divergencias); migración total inmediata (no propuesta).
- **Consecuencias:** exigir revisión de claves, índices, historial y compatibilidad antes de cambiar persistencia.
- **Datos:** `app_state`, `app_state_history`, `roster:*`, `guardia:*`, `parte:*`.
- **Pruebas futuras:** escrituras concurrentes, recuperación, integridad de índices.
