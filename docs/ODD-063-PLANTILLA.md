# ODD Guardia Nocturna · Original 063/2026

La ODD 063/2026, dictada el 14 de octubre de 2026, es la referencia formal del módulo **ODD Maestras → Guardia Nocturna**.

- Original: PDF de tres páginas, 612 × 935,52 puntos, no A4. La fecha, el número, el período, la referencia a la ODD reemplazada y el Anexo 1 son variables. El resto del documento original queda inalterado.
- SHA-256 exigido: `aa7fceb5cdc71d546e9b093866bdc24fc4318e8b657638926c96a3017476608d`.
- Persistencia: `document_assets.key=odd_guardia_original_063_2026`; inserción única, con validación SHA. No sobrescribir ni confundir con ODD emitidas.
- Fuente de la dotación: `guardia-revision:YYYY-MM-DD` y `roster:v8`, nunca el modelo SQL histórico. Se exigen siete noches consecutivas, aprobación, OBAC, conductor y un mínimo de tres voluntarios. Guardar una ODD no acredita servicios.
- Archivo emitido: `document_assets.key=odd_guardia_emitida_YYYY_NNN`, PDF de tres páginas, inmutable por correlativo.
- El Anexo 1 se rellena dentro de la geometría de la tabla original. Si el número de integrantes no cabe en un casillero no se emite hasta resolver la plantilla; no se generan páginas adicionales silenciosamente.
- **Pendiente de materialización:** el binario adjunto al chat debe ingresarse UNA vez en el control de carga de ODD Maestras; el conector GitHub no acepta bytes de adjuntos por ruta. No afirmar que está instalado hasta que GET `/api/odd-maestras/plantilla-guardia?info=1` confirme `available:true`.
- Esta rama no reemplaza el archivo histórico, no acredita guardias y no debe fusionarse sin pruebas de vista previa y revisión institucional de futuras órdenes.

## Revisión de regresión
- Validación de fechas 14 al 20 de octubre, integridad de 21 personas en estado de guardias, datos personales y conductor.
- PDF comparado con original: tres páginas, escudo, banderas, firmas, pie, marca de agua y dimensiones.
- Descarga móvil Android, iPhone, tableta B-5, PC; revisión de archivo original y de cada PDF emitido.
- Ejecutar `npm test` y `npm run build` antes de integrar.
