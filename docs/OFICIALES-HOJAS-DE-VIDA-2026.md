# Oficiales · Hojas de vida — especificación funcional (09-10-2026)

Estado: propuesta en rama aislada. NO implementada. No modificar Neon, producción, ODD ni permisos existentes hasta revisión.

## Ubicación
Exclusivamente dentro del módulo **Oficiales** actual. No crear módulo principal ni enlace en pantalla pública, disponibilidad o guardias. Gestión de registros dentro de Oficiales para importaciones.

## Identidad
Una fuente canónica por voluntario (ID estable, RUT, código, nombres, foto). Los módulos operativos reutilizan solo los datos necesarios; no acceden a ficha completa. Mantener inactivos y trasladados, nunca borrar por ausencia en Excel. Investigar compatibilidad con `roster:v8`, `germania-nomina.js` y fotos estáticas antes de migrar.

## Ficha
Búsqueda por nombre, RUT y código; alta de voluntario; edición de campos; antecedentes personales, ingreso bomberil original e ingreso a Germania separados; cursos, premios, sanciones, compañías anteriores, cargos e historial. Consultar años anteriores. Guardar quién cambió qué y cuándo, con corrección trazable.

## Historial de cargos
Cada designación institucional: cargo, organización, fecha efectiva de inicio, fecha efectiva de término (nula si vigente), fuente, responsable. Al registrar cambio, cerrar el cargo anterior con fecha efectiva y abrir el nuevo, sin inventar fechas históricas. No confundir cargos institucionales con funciones temporales de OBAC/maquinista durante guardias.

## Importación
Vista previa, conciliación por identificador, duplicados, discrepancias, aprobación. Completar solo campos vacíos; jamás sobrescribir datos ya existentes automáticamente. Antecedentes repetibles se agregan sin duplicados. Archivo original y procedencia. Nómina, estadística de actividades, hojas de vida y lista de precedencia son conjuntos diferentes; **precedencia NO es presencia/asistencia**.

## PDF institucional
Generar PDF con foto y antecedentes pertinentes, fecha de emisión y datos institucionales, para traslados. No incluir datos médicos sensibles por defecto. Descargar como adjunto mediante `Content-Disposition: attachment`, tipo `application/pdf`, nombre legible, sin forzar visor de terceros. Los navegadores/SO deciden carpeta y posible apertura; probar Chrome/Edge Windows, Android, iOS y tablet B-5.

## Seguridad y límites
Acceso solo desde Oficiales, con controles de autorización reales en servidor para lectura, edición, importación y PDF; no basta ocultar botones. Diseño de permisos sujeto a revisión de responsable de seguridad. No almacenar fichas médicas en respuestas públicas ni caché compartida.

## Compatibilidad y pruebas
Carga diferida de ficha y documentos. Mantener lista de precedencia `precedencia:v1` y ADR 0009 para OBAC; no mezclar con estadísticas de asistencia ni guardias. Verificar regresión en ingreso, nómina, disponibilidad, ODD, guardias, informes y fotos. Probar PDF y auditoría. Ningún cambio en producción sin revisión y pruebas.
