# Asistencia — validación antes de publicar

Autorización: Christian solicitó desarrollar, corregir y pasar a producción. Buscador de Oficiales pendiente.

## Alcance comprobado

- Formulario manual: fecha, hora, tipo, detalle y responsable obligatorios; todos los estados explícitos, mínimo un presente.
- Nueva actividad independiente aunque coincida fecha y tipo. Guardado conserva clave y operación al reintentar; un doble toque no inicia otro envío.
- Operación PostgreSQL atómica: correlativo, parte e índice. Versiones evitan sobrescribir cambios de otra persona. Reintento del mismo contenido devuelve el resultado existente.
- Corrección conserva número, nómina e información histórica adicional. Historial carga la clave exacta seleccionada.
- PDF y compartir reciben los datos guardados. Hora incluida en PDF. La prueba de navegador genera el PDF con las bibliotecas reales y verifica hora y nombres presentes (excluye ausentes); intercepta la entrega final del PDF/WhatsApp, sin enviar mensajes reales ni acreditar comportamiento de aplicaciones externas.
- Dos asistencias manuales recientes al pie; una tercera desaparece de esa vista, pero conserva su registro e índice.

## Evidencia local

- Regresión general: 419 pruebas aprobadas, incluidas origen externo/datos vacíos y bloqueo de preview.
- `npm run build`: correcto.
- `node tests/asistencia-ui-browser.mjs`: correcto en 390 y 1024 px, con PostgreSQL PGlite aislado. Simula HTTP503 después de commit; el reintento conserva el número. Prueba doble toque, validaciones, exportaciones separadas, dos recientes y corrección del segundo de tres partes. Controles visibles ≥44 px, sin desborde horizontal ni errores JavaScript.
- Navegador temporal de prueba; no se añaden dependencias al proyecto. Chromium se ejecutó desde una instalación auxiliar debido al fallo del descargador de Playwright.
- Sin migraciones ni escrituras de prueba en Neon real. No se cambia captura B-5, Guardia, ODD ni el buscador pendiente.

## Límites

La entrega nativa del PDF depende del navegador, sistema y WhatsApp instalado; conserva la alternativa de descarga. Los riesgos de seguridad delegados continúan documentados por separado. Las pruebas locales no representan una medición de rendimiento en la tablet física.
