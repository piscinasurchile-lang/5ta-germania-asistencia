# Informe de traspaso para auditoría Claude — Germania
Fecha de corte: 18–19 octubre 2026 (Chile)

## Estado verificable
- Producción: rama `main`, NO modificada ni fusionada.
- Integración: rama `integracion-staging-20261018`, PR draft #207: https://github.com/piscinasurchile-lang/5ta-germania-asistencia/pull/207
- Último CI analizado: commit `dd28440fef65f2103b12af5e89facc59af955aa9`, GitHub Actions CI **294 aprobadas / 20 fallidas / 314 total**. Workflow Build: success. Vercel preview: success. No interpretar build exitoso como aprobación funcional.
- Se trasladaron 17 archivos funcionales/de pruebas en commits de integración previos; dos archivos de pruebas se ajustaron posteriormente. La integración **NO está completa**.
- No se ha ejecutado auditoría Claude, E2E con navegador real, prueba con guardia real ni respaldo de Neon.

## Bloqueos observados
1. `lib/guardia-acreditacion.js` ahora exige OBAC + maquinista + **3 voluntarios** (mínimo cinco). Pruebas históricas `tests/guardia-acreditacion.test.mjs`, estadísticas y otros escenarios siguen armando guardias de dos voluntarios y fallan. Distinguir tests obsoletos de regresiones; NO rebajar mínimo para hacer pasar pruebas.
2. `tests/domingo-quinta.test.mjs` falla porque `public/legacy/index.html` todavía no contiene `id="domingoQuinta"`. Módulos de domingo/citaciones/emergencia fueron copiados sin activación de interfaz. No considerar funcionalidad integrada hasta cableado y validación.
3. `tests/guardia-oficiales-visto.test.mjs` espera texto `Visto · Capitán` ausente en la versión del cierre OBAC. Revisar semántica, permisos y presentación.
4. `public/legacy/app.js` de staging contiene RUT ficticios (serie 90.000...), mientras producción tiene RUT reales. **PROHIBIDO copiar íntegro** sin reconciliación; preservar identificadores y datos reales, sin publicar RUT en informes.
5. `lib/guardia-foto-oct2026.mjs` staging también incorpora un RUT ficticio en SQL de migración. Conservar lógica y valores reales de producción, revisar migraciones una por una.
6. `public/legacy/index.html` staging contiene banda visible «COPIA DE PRUEBA · STAGING». No copiarla a producción. `app/page.js` difiere solo en versión de iframe/cache; revisar antes de cambiar.
7. Quedan diferencias en `public/legacy/index.html`, `public/legacy/app.js`, `lib/alerta-telegram.js`, `lib/germania-webpush.mjs`, `package-lock.json`, `public/legacy/dashboard-preview.html` y documentación. Evitar alterar alertas Telegram o activar notificaciones por accidente.
8. La producción tiene aproximadamente 120 archivos que no están en staging; **nunca reemplazar el árbol completo**.

## Reglas funcionales innegociables
- Guardia nocturna: mínimo 1 OBAC + 1 maquinista + 3 voluntarios. Si falta un inscrito pero la dotación efectiva cumple mínimo, registrar ausencia sin obligar reemplazo. Si baja del mínimo, registrar incumplimiento y gestionar reemplazo.
- Cierre libro: OBAC sube foto y novedades; T3 ratifica asistencia real, excusas y rezagados. Sin ratificación T3 no acreditar asistencia. Capitán recibe visto/informe posterior, solo lectura. La ODD aprobada permanece intacta.
- Una persona no suma doble asistencia; rezagados justificados pueden contarse una vez; excusados no son presentes. Mantener trazabilidad e histórico.
- Asistencia B-5 y citaciones: guardar/recuperar/editar/borrar con confirmación; PDF y WhatsApp; importación Excel idempotente sin duplicados.
- Tablet B-5 Android 10: uso ligero y funcionamiento offline con sincronización segura cuando vuelve Wi-Fi.
- No mezclar proyecto Telegram con Germania.

## Trabajo solicitado a Claude
1. Auditar PR #207 contra `main` y contra staging; enumerar archivo por archivo: integrado, pendiente, conflicto, excluido y por qué.
2. Identificar causa exacta de las 20 fallas de CI y corregir código/tests de manera que representen la dotación vigente, sin debilitar reglas. Exigir CI 100% verde.
3. Reconciliar `app.js` e `index.html` por cambios mínimos, preservar roster real y datos de producción; integrar módulos de interfaz sin banner ni identidades de prueba.
4. Revisar seguridad de rutas, roles OBAC/T3/Capitán, concurrencia/versionado, integridad y migraciones, manejo de offline, no duplicación y PDF.
5. Ejecutar pruebas unitarias, integración, navegador móvil/escritorio, casos ficticios reforzada/incompleta/reemplazo/ausencia/rezagado/OBAC/maquinista, sin alterar registros reales.
6. Entregar informe con evidencia, defectos críticos, riesgos residuales, checklist de aceptación y recomendación GO/NO-GO. No fusionar PR ni desplegar producción.
7. Antes de cualquier publicación futura: respaldo verificable de Neon, plan rollback y autorización explícita.

## Criterio de salida
NO-GO mientras haya CI rojo, interfaces desconectadas, identidades ficticias sin reconciliar, pruebas E2E ausentes o respaldo Neon pendiente. Claude debe informar resultados, no asumir que una compilación Vercel equivale a operación validada.
