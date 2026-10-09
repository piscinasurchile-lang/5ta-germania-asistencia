# CLAUDE.md · Instrucciones para Claude Code en GERMANIA

Lee primero `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `docs/CRITERIO-OPERATIVO.md` y los ADR relevantes. Las instrucciones comunes prevalecen; este archivo solo complementa el flujo de Claude.

- Repositorio: `piscinasurchile-lang/5ta-germania-asistencia`.
- Idioma de informes y aplicación: español de Chile.
- Pruebas locales disponibles según auditoría: `npm test` (PGlite en memoria) y `npm run build`. No equivalen a validación de producción.
- Antes de editar `public/legacy/app.js` o `germania-roles.js`, coordinar con ChatGPT: alto riesgo de edición simultánea.
- Toda propuesta debe indicar archivo y evidencia, separando **comprobado**, **inferido** y **no verificado**.
- No editar seguridad: remitirse a `docs/REGISTRO-RIESGOS-SEGURIDAD.md`; responsable externo.
- No eliminar el modo de prueba interno ni modificar permisos por interpretar que se ocultó su banner visual.
- No tocar ODD ni alterar Neon/Vercel sin autorización específica.
- No crear PRs que mezclen documentación, refactorizaciones y cambios operativos.
- Cuando el usuario pida una auditoría de solo lectura, no crear commits ni cambiar configuración.
- Revisión cruzada: entregar a ChatGPT el diagnóstico/PR para evaluación independiente.
