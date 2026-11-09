# ADR 0018 · Propuesta de OBAC y maquinista por noche

Estado: aceptado por Christian Vergara el 9 de noviembre de 2026 («Siga y corrigue»), después de confirmar el criterio y revisar los casos reproducidos.

Fernando Jerez conserva sus dos capacidades en la nómina: Capitán y habilitado para conducir. Cada noche tiene un solo maquinista y un OBAC distinto. Cuando otro inscrito puede conducir, el integrante de mayor precedencia conserva OBAC; si es el único habilitado, conduce y OBAC corresponde al siguiente inscrito por precedencia.

La propuesta automática usa la unión de inscripción general y específica de maquinistas. Conserva las marcas al deduplicar personas, reconoce a todos los habilitados y elige un único conductor. Entre alternativas que preservan al OBAC de mayor precedencia, mantiene primero la inscripción específica de maquinista y su orden de inscripción. En la inscripción general, sin hora por noche, desempata por id para garantizar el mismo resultado entre consumidores. Oficiales, Ayudante y Administrador conservan la revisión de la propuesta en sus controles existentes.

La función compartida `GermaniaObac.obacDeNoche` calcula la propuesta; `cobertura` usa su único maquinista en lugar de conservar todos los slots previos. Tabla semanal, historial de inscripción y preparación consumen el mismo cálculo. No hay escritura automática de asignaciones ni migración de datos.

La revisión ya aprobada sigue siendo la fuente institucional: no se recalculan sus funciones ni se modifican guardias históricas, acreditaciones, libros, permisos o inscripciones reales. Las decisiones manuales se conservan en sus registros existentes.
