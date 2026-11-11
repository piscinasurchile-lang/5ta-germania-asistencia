# ADR 0020 · Estado visible de avisos contrastado con la dotación publicada

Implementado por instrucción de Christian «Soluciona» del 11 de noviembre de 2026. Alcance: coherencia entre Mi espacio, Oficialidad y Ayudante sin modificar la edición diaria aprobada.

El aviso original puede llegar después de que un oficial ya sustituyó al titular. El nuevo editor conserva el historial de la asignación, mientras el aviso original mantiene su estado inicial. Una pantalla que lee solo ese estado pide otro reemplazo aunque la programación aprobada ya cubra la noche.

Se introduce una consulta de lectura `/api/guardia/avisos`: mantiene las mismas claves y datos de app_state; no escribe ni migra registros. Expone el estado efectivo «cubierto» únicamente cuando la revisión publicada contiene prueba de sustitución de una sola persona por otra, con fechas y función coincidentes. La persona saliente debe estar ausente y su reemplazante presente en la dotación aprobada actual. Un borrador, una mera dotación mínima completa, una retirada sin entrada o cambios ambiguos no cierran el aviso. Conserva estadoOriginal, cambioId, cambioEn y responsable/fecha de publicación como trazabilidad de la resolución derivada. Las resoluciones explícitas previas se respetan.

Mi espacio y los avisos/reemplazos de Oficiales consultan esa misma proyección. El aviso original y su motivo permanecen intactos para auditoría; no se acredita asistencia por estar asignado. La publicación notifica a los módulos exteriores para refrescar la lectura sin recargar el cliente diario.

T3, Capitán y Administrador mantienen su consulta y acciones existentes. El Ayudante recibe los pendientes y un acceso «Revisar día» a su edición vigente; no adquiere permiso de publicación, acreditación ni cierre. Un voluntario recibe sus propios avisos y aquellos cuya cobertura le corresponde; el reemplazante no recibe el motivo privado del titular.

No se modifica autenticación, sesiones ni autorizaciones existentes de escritura. Esta consulta no resuelve los riesgos de seguridad registrados por separado. La proyección de lectura permite resolver el caso ya publicado sin escrituras manuales en producción.
