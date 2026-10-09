# ADR 0007 · Modularización gradual de interfaz heredada
- **Estado:** Propuesto.
- **Contexto:** `public/legacy/app.js` concentra numerosos dominios y otros scripts dependen de sus globales.
- **Decisión propuesta:** extraer solo funciones aislables y probadas, sin reescritura total ni interfaces paralelas.
- **Alternativas:** mantener monolito; reescribir completamente (no recomendado sin pruebas).
- **Consecuencias:** coordinar agentes por archivo, preservar contratos globales y regresión visual.
- **Datos:** ninguno por defecto; verificar en cada extracción.
- **Pruebas futuras:** arranque, navegación, disponibilidad, guardias, ODD y estadísticas.
