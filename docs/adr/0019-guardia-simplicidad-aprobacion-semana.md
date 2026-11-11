# ADR 0019 · Simplicidad y aprobación semanal de Guardia

Estado: alcance autorizado por Christian Vergara el 10 de noviembre de 2026: simplificar lo antiguo, conservar íntegra la nueva edición por día, ofrecer aprobación individual y semanal y modificar solamente los cuadros del anexo de ODD. Integración y publicación pendientes de revisión.

## Decisión

La pantalla nueva de asignación, sus menús por integrante, sus estilos y el prototipo aprobado permanecen sin modificaciones. Se retiran el selector de modalidad sin acción y el acceso antiguo de revisión que duplicaba la pantalla nueva. Inscripciones, avisos y el historial se consultan desplegables. Los avisos pendientes de reemplazo conservan su resolución existente porque no equivalen a editar una dotación.

La aprobación semanal se presenta fuera del iframe de edición diaria. Requiere semana terminada, libros vigentes, revisión explícita del resumen y confirmación del oficial. El resumen distingue ajustes guardados de asistencias propuestas según programación. La vista diaria debe haber vuelto a preparación: el cliente existente impide salir de revisión mientras cualquier día tenga cambios pendientes. Así la nueva aprobación no interpreta el mensaje del último día como estado global ni descarta ediciones pendientes.

El servidor reutiliza la misma acreditación canónica que la aprobación diaria, dentro de una conexión y una transacción. Bloquea y verifica versiones de nómina, programación, libros y acreditaciones. Si una noche falla, revierte todas las escrituras de la operación. Conserva los días ya acreditados, las excusas, los reemplazos y las estadísticas derivadas. Los avisos se emiten después del commit. No se crea otro modelo ni otra tabla de asistencia. El cierre semanal existente permanece separado y conserva sus permisos.

Se mantiene el original ODD 063 y se admite además el original ODD 071 entregado por el usuario, cada uno con su identidad y SHA256 conocidos; cuando ambos están archivados se prefiere 071. No se sobreescribe el original ni una ODD emitida. El generador redibuja solamente los cuadros del anexo y mantiene las páginas institucionales originales. En la revisión de la propia ODD 071, las páginas 1 y 2 resultan idénticas visualmente. Los datos de los cuadros proceden de la programación aprobada, nunca de la nómina de ejemplo del PDF de referencia.

## Verificación

Pruebas de aprobación conjunta con excusas y reemplazos, conservación de una noche ya aprobada, reintentos, versión obsoleta, falta de libro, semana futura y rollback cuando falla la séptima escritura. Pruebas diarias existentes y compilación de Next.js. Comparación de las páginas originales y render del anexo mejorado. La nueva pantalla diaria no presenta diferencias respecto a main.
