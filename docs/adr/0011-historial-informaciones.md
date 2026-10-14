# ADR 0011 — Historial de informaciones compartidas

**Estado:** Propuesto (PR de corrección, 14-10-2026). **No autorizado para producción hasta revisión del administrador.**

## Contexto

En la pantalla Inicio, un aviso compartido se podía marcar como leído, pero dejaba de ser consultable al vencer (48 horas por defecto) y la lista de prueba recortaba silenciosamente los registros anteriores al superar 100. Era posible perder una citación y su horario, incluso habiéndola leído.

## Implementación propuesta en rama de corrección

- Se conserva en el almacén de prueba existente informaciones-prueba:v1 el texto, autor, fecha y vencimiento de cada aviso. Un aviso leído **no se borra**.
- Se retira el recorte MAX_RECORDS del POST: el registro completo permanece en esa misma clave existente de Neon. No se crean ni migran tablas, se modifican claves de Guardia ni se altera el acceso actual.
- GET normal mantiene únicamente los avisos vigentes recientes. GET ?historial=1&offset=0 recupera los avisos guardados, estén vigentes o vencidos, por páginas de 30, incluidos sus indicadores de lectura existentes informaciones-prueba-lecturas:<id>.
- La pantalla Inicio separa **Pendientes** de **Historial de avisos**, este último consultable aunque el voluntario ya marcó «Leído».
- Avisos antiguos que ya fueron expulsados del almacenamiento *antes* de esta corrección no se recuperan automáticamente.

## Límites y riesgos

- El canal actual es de **prueba compartida**, con identidad declarada en pantalla. No utilizar todavía como canal institucional confiable, de urgencias o citaciones reservadas: la revisión de seguridad corresponde al responsable delegado.
- Un arreglo JSONB sin poda crece con los años y su lectura/escritura termina siendo más costosa. Esta solución elimina la pérdida actual de registros para un volumen de prueba moderado; antes del uso institucional sostenido, diseñar almacenamiento paginado por registros individuales, con retención institucional y migración revisada.
- No se han ejecutado pruebas de Neon real ni en móviles desde la rama. Validar primero los escenarios de lectura simultánea, vencimiento, historial amplio y pérdida de red.
- No cambiar reglas de asistencia, Guardia, ODD, permisos ni autenticación como parte de este PR.

## Alternativas

1. Conservar límite de 100: rechazado, borra avisos históricos.
2. Crear una nueva tabla de informaciones: pospuesto hasta una decisión específica de modelo de datos y seguridad.
3. Archivo local por dispositivo: rechazado como fuente única, no permite recuperar mensajes tras cambiar de teléfono.

## Pruebas mínimas

Ejecutar npm test y npm run build, abrir Inicio y Dashboard V2 en Preview, comprobar avisos leídos y vencidos, navegar por páginas y regresar a Inicio en Android, iPhone, PC y B-5.
