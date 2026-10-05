# Validación Dashboard V2

1. Abrir `/legacy/dashboard-preview.html` en el deployment Preview de Vercel.
2. Confirmar que el resumen aparece antes que Guardia.
3. Probar Año 2026 y dos meses distintos.
4. Confirmar que el contador de solicitudes no crece sin interacción.
5. Esperar 60 segundos: no debe existir polling.
6. Confirmar en runtime logs: cero solicitudes a `germania:test-audit:v1` desde esta página.
7. Confirmar por carga: `partes:index:v1` una vez, `guardias:index` una vez y cada detalle como máximo una vez.
8. Probar en B5_TABLET, móvil y PC.
9. No integrar a producción hasta aprobación manual.