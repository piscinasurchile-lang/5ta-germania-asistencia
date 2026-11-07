# ADR 0017 · Integración de asignación y revisión semanal

Estado: aceptado por Christian Vergara el 7 de noviembre de 2026. Aprobó el prototipo final e indicó «Integra». Aceptó expresamente agregar Motivo y permitir al Ayudante preparar ajustes y consultar las fotografías de la semana terminada; la aprobación final conserva sus responsables actuales.

Se integra el cliente aprobado en Staging, con siete noches y menú individual. El archivo original `prototypes/germania-revision-simplificada.html` se conserva intacto. No se entregan demostraciones, nómina ficticia, simulación de publicación, restablecimiento ni vista de prueba de Mi espacio. Las asignaciones publicadas siguen llegando al Mi espacio existente.

La preparación usa `guardia-revision:*` y el guardado transaccional existente. El Ayudante puede guardar borradores, nunca publicar por esa ampliación. La revisión de cumplimiento se habilita cuando termina la última noche de la semana. Sus borradores se guardan en `revision.cumplimiento`, anclados a aprobación, firma de dotación y versión de acreditación. Un borrador obsoleto no sustituye la acreditación vigente ni afecta estadísticas.

Los oficiales y el administrador aprueban mediante la ruta de acreditación existente, con sus validaciones de libro, versión, asistencia, motivos e historial. Los metadatos opcionales `revisionSemanal` conservan estados y relaciones de reemplazo, validados contra la asistencia canónica. Justificado representa ausencia con excusa. Los adicionales presentes requieren motivo. La dotación programada y los cierres del libro no se reescriben al revisar cumplimiento.

La consulta de fotos del Ayudante se limita a la revisión de una semana terminada. No se altera carga, almacenamiento ni administración del libro. No se amplían los permisos globales de autenticación, publicación, acreditación o cierre semanal. No se migran tablas ni se generan datos de prueba en producción.
