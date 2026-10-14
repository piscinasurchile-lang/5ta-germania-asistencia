# Corrección pendiente: trazabilidad de cambios de OBAC

## Hallazgo verificado en public/legacy/germania-roles.js

La función `revReordenar(n)` recalcula el OBAC por precedencia al guardar modificaciones de dotación. `revLog` registra la operación que originó el cambio, pero no registra necesariamente la transición automática del OBAC. La vista `textoCambio` tampoco describe ese efecto secundario.

## Criterios de aceptación

1. Mantener el OBAC previamente aprobado mientras no exista modificación autorizada de dotación.
2. Tras un reemplazo autorizado, recalcular el OBAC conforme a precedencia, excluyendo al maquinista de ese rol.
3. Si el OBAC cambia, agregar un evento con fecha de guardia, identificadores anterior/nuevo, fecha-hora de modificación, autor y motivo; no modificar registros históricos.
4. No alterar otros integrantes, otras noches ni las acreditaciones.
5. Verificar escenarios: cambio de voluntario sin cambio de OBAC; retiro del OBAC; incorporación de voluntario de mayor precedencia; Capitán como maquinista; edición simultánea y conflicto de versión.
6. Probar con datos aislados. No fusionar hasta comprobar que la traza y el resultado de las siete noches son correctos.

Estado: hallazgo documentado, corrección de código pendiente. La escritura de novedades y cierre OBAC se mantiene aplazada.
