# Auditoría de siete puntos — correcciones preparadas

Autorización: Christian pidió solucionar uno a uno los siete hallazgos e informar cada resultado. Implementación y pruebas autorizadas; producción pendiente de autorización de integración.

1. Versiones capturadas con el documento abierto. Todos los escritores de guardias exigen versión; plan obsoleto no reabre una suspensión. La versión de aprobación/anulación se congela antes de awaits y refrescos. Cerrar/suspender conserva clave original.
2. Plan+índice, aprobación de siete noches+revisión y reemplazos se confirman en transacción PostgreSQL interactiva con rollback e historial. No hay migración ni segunda fuente de datos.
3. Lecturas necesarias fallidas abortan antes de escribir. No se reemplaza información por datos predeterminados; reemplazo no se marca cubierto si falta revisión o guardia aprobada. Mensajes operativos explícitos y audio opcional sin bloqueo.
4. Nuevas fechas civiles y ventanas diarias en America/Santiago. Salida del día siguiente correcta a22:45. No se reinterpretan datos históricos ni timestamps UTC.
5. ODD Maestras acepta2voluntarios+OBAC+conductor, manteniendo siete noches aprobadas y personas distintas. Originales ODD no modificados.
6. Configuración de interfaz centralizada e inmutable con los mismos códigos517/vista517. No modifica roles, autenticación, códigos del servidor ni R1–R6. No cambia frecuencias de temporizadores.
7. Etiqueta Total de asistencias. Conteos, porcentajes e históricos conservados.

## Validación

- 409/409 pruebas generales aprobadas; compilación Next.js correcta.
- Navegador390/1024: Estadísticas, Atrás, Android, menú, conservación de filtros, descarga PDF, infografía y reintento. Regresión móvil del Archivo ODD aprobada.
- Revisión por agente independiente: corrigió carrera de RV.ver y captura de selección; pruebas dirigidas aprobadas, sin bloqueadores. No equivale a revisión externa de Claude ni cierra riesgos de seguridad.
- Prueba real de Pool y API en proyecto germania-staging (base aislada existente): deployment dpl_Hi6kBqwCxFxFx7mPjoppCHeiwbEB, commit d91e4741dc3495c9d84f893986c0b02a983991ce. Lote válido200; versión obsoleta409; segundo documento intacto; restauración de valores temporales200. Se usaron dos claves futuras no indexadas con valor previo nulo. Sin avisos ni Push. No se copió ni consultó conexión de producción.
- Vercel rechazó despliegue directo403; el flujo Git de Staging compiló y desplegó correctamente. Lectura de runtime errors de Staging devolvió403; no se afirma haber inspeccionado esos logs.
- Las siete PR son dependientes en orden251→257. Los últimos ajustes de revisión se incluyen en la PR final. No se fusionaron ni desplegaron en producción.
