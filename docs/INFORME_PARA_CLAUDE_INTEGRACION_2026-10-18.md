# Informe actualizado para Claude — Germania PR #207
Fecha: 19 octubre 2026. Estado: NO-GO. No fusionar ni publicar.

## Autoridad normativa (prioridad máxima)
El **Reglamento de Guardia Nocturna oficial**, artículo 9, manda por encima de decisiones previas, código y pruebas. Dotación mínima: **4 personas = 1 conductor/maquinista + 1 oficial/OBAC + 2 voluntarios**. Fuente oficial del proyecto: `public/legacy/reglamentos/reglamento-guardia-nocturna.pdf` en rama `main`. No modificar la norma para adaptar el software. Ante otra contradicción, documentarla y solicitar resolución antes de cambiar lógica.

## Decisión de alcance
**Domingo de Quinta queda expresamente fuera del PR #207**, reservado para un proyecto de guardia distinto. Se retiraron del branch cinco archivos: `app/api/domingo-quinta/route.js`, `lib/domingo-quinta.mjs`, `public/legacy/germania-domingo-quinta.js`, `public/legacy/germania-domingo-quinta.css`, `tests/domingo-quinta.test.mjs`. No reintroducirlos ni cablearlos en la interfaz actual.

## Auditoría Claude recibida (NO-GO)
Claude auditó el PR de solo lectura, base `main` 8b6ac9f, 20 archivos en ese corte. Halló que el mínimo erróneo de 3 voluntarios explicaba la mayoría de 20 fallos CI; con mínimo reglamentario de 2 voluntarios persistían fallas de expediente excepcional, domingo quinta (interfaz desconectada) y visto Capitán (texto de prueba desactualizado). Indicó que main ya tenía fallas antiguas y que no deben confundirse con regresiones del PR. La auditoría no ejecutó despliegue ni fusión.

## Correcciones aplicadas después de esa auditoría, exclusivamente al branch
- `lib/guardia-acreditacion.js`: firma, validación y recuento con 2 voluntarios; 4 personas en total.
- `lib/guardia-asistencia-efectiva.js`: `minimoCumplido` y `faltanVoluntarios` con 2 voluntarios.
- `tests/guardia-oficiales-visto.test.mjs`: expectativa de etiqueta «Dar visto bueno · Capitán».
- `tests/guardia-expediente-excepciones.test.mjs`: escenario reducido a 2 voluntarios, presentes/ausentes/excusas consistentes.
- Retirados los cinco archivos de Domingo de Quinta antes mencionados.
Estas modificaciones **todavía necesitan verificación de CI**; no afirmar que pasaron sin resultado.

## Integración pendiente y riesgos
- Citaciones y emergencia B-5: scripts copiados pero no cableados en `public/legacy/index.html`; decidir activación solo con cambios mínimos, pruebas y aprobación. Sus comentarios «(STAGING)» no deben quedar en producción.
- `lib/guardia-externos.js` y API externa: sin interfaz conectada; revisar o dejar fuera del alcance.
- `public/legacy/germania-cierre-libro.js`: cambios amplios; verificar OBAC, ratificación T3, vista Capitán, permisos y no duplicación.
- NO copiar `public/legacy/app.js` completo desde staging: contiene RUT ficticios. No copiar `lib/guardia-foto-oct2026.mjs` desde staging por RUT ficticio en SQL. NO incorporar banner «COPIA DE PRUEBA · STAGING» de `index.html`.
- Preservar archivos y datos reales exclusivos de producción; no tocar `main`, Neon productivo, Telegram/webpush ni notificaciones no aprobadas.
- Respaldo existente reportado: `backup-pre-etapa2-20261018`. Verificar integridad y actualidad antes de cualquier futura publicación; su existencia no equivale a backup pre-release actualizado.

## Reglas de negocio que deben verificarse
- Dotación aprobada mínima: 1 conductor, 1 OBAC, 2 voluntarios. Si hay ausencia, T3 la registra aunque la noche quede bajo mínimo; calcular dotación efectiva y alertar incumplimiento sin falsear presentes. Si hay suficientes efectivos, no exigir reemplazo innecesario.
- Cierre OBAC: foto y novedades; T3 ratifica asistencia real y puede justificar excusas, rezagados y reemplazos con trazabilidad. Solo T3 acredita. Capitán revisa después sin modificar el libro; ODD aprobada intacta.
- Sin doble conteo, roles separados, firmas coherentes, autorización servidor, sincronización offline sin sobrescrituras, historial, PDF y WhatsApp.

## Encargo a Claude
1. Revisar el diff **actual** de PR #207 contra `main` y confirmar que cumple artículo 9, sin introducir Domingo de Quinta.
2. Ejecutar CI del nuevo head; reportar total, aprobadas y fallidas, separando fallos preexistentes de regresiones nuevas. Corregir fallos genuinos sin rebajar controles.
3. Evaluar módulos aún desconectados (citaciones, emergencia, externos) y proponer incluirlos de forma segura o postergarlos; **no activarlos automáticamente**.
4. Probar guardias ficticias: mínimo reglamentario, reforzada, incompleta, ausencia, excusa, reemplazo, rezagado, cambio OBAC/maquinista, cierre y ratificación, visto Capitán, histórico.
5. Revisar frontend móvil/tablet B-5, permisos API, datos reales, persistencia y PDF; registrar evidencia de pruebas E2E.
6. Entregar auditoría final GO/NO-GO con riesgos, checklist, commit exacto, CI y plan de rollback. No fusionar ni desplegar `main` sin autorización explícita.

## Estado
PR draft: https://github.com/piscinasurchile-lang/5ta-germania-asistencia/pull/207 . La producción sigue sin modificaciones por esta integración. **NO-GO hasta pruebas verificadas, backup vigente y aprobación explícita.**
