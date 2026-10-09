# ADR 0005 · Caché y operación sin conexión
- **Estado:** Propuesto.
- **Contexto:** service worker actual prioriza red para HTML/JS/CSS; auditoría no acredita funcionamiento offline completo.
- **Decisión propuesta:** definir requisitos operativos y política de actualización antes de introducir caché de interfaz o cola offline.
- **Alternativas:** seguir online; cachear solo recursos; sincronización diferida.
- **Consecuencias:** riesgo de mostrar datos obsoletos y duplicar escrituras; exige diseño de conflictos.
- **Datos:** disponibilidad, guardias, registros pendientes (solo si se aprueba).
- **Pruebas futuras:** desconexión, reconexión, conflictos, no pérdida ni duplicación.
