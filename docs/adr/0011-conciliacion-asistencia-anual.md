# ADR 0011 · Conciliación de asistencia desde planilla anual

**Estado:** Propuesto / rama de prueba. No desplegar sin validación con la planilla original y revisión independiente.

## Contexto
GERMANIA posee asistencia histórica en Neon (claves parte:* y partes:index:v1). Existe un histórico fijo de 67 actividades y un CSV heredado que genera IDs distintos en cada importación; volver a subirlo puede duplicar actividades. También se encontraron partes válidos fuera del índice.

## Decisión propuesta
- Conservar la navegación existente: Oficialidad → Administración → Importar / Respaldo.
- Añadir vista previa de Excel .xlsx o CSV fecha;tipo;actividad;asistentes.
- Conciliar por actividad y voluntario y buscar los partes existentes directamente en Neon, no sólo en el índice.
- Resolver asistentes usando identificador estable, RUT o nombre completo unívoco; ante ambigüedad, bloquear el lote.
- Los eventos ya existentes nunca se vuelven a crear. Las diferencias de asistencia se presentan para revisión, no se sobrescriben automáticamente.
- Un mismo día puede contener varias emergencias: actividades con detalles diferentes se conservan. Si los datos no distinguen eventos múltiples con mismo día/tipo/detalle, bloquear por ambigüedad.
- Agregar únicamente actividades nuevas; reincorporar al índice claves existentes válidas que falten; no borrar registros.
- Validar dos veces contra el estado de Neon y aplicar en una única sentencia SQL atómica con versión esperada del índice; mantener respaldo histórico del índice anterior en app_state_history.
- Desactivar visualmente herramientas heredadas de carga/borrado para evitar usos accidentales; conservar el código histórico por compatibilidad.
- Guardia y ODD quedan totalmente excluidas.

## Validación obligatoria
1. Obtener el archivo anual real de la Compañía; revisar si su estructura es de tabla (soportada) o de matriz por voluntario/mes (requiere adaptación). No transformar automáticamente una estructura desconocida.
2. Probar reimportación exacta (cero nuevos), agregado de mes, edición de asistente, dos llamados mismo día, cambio de nómina, miembro ambiguo y reintento concurrente.
3. Ejecutar npm test y npm run build; validar interfaz Android, PC y tablet B-5.
4. Revisar partes:index:v1 frente a partes efectivamente presentes y confirmar estadística individual.
5. Revisión cruzada y autorización específica antes de fusionar y desplegar.

## Riesgos y límites
- Los Excel .xls y los formatos matriciales no están soportados en esta primera versión; fallan sin escrituras. El parser XLSX no almacena el archivo original.
- No se modifica la sesión de Oficialidad existente; la ruta nueva exige la misma cookie de Oficialidad.
- No se realizan migraciones SQL ni actualizaciones de Neon durante el desarrollo.
- Las correcciones manuales a registros existentes quedan fuera de la primera versión y deberán usar una ruta auditada aprobada.
