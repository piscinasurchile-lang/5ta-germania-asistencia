# Guardia — autenticación individual y migración segura

Estado: **diseño pendiente de implementar**. No fusionar ni desplegar PR #114.

## Administrador principal
Christian fue indicado como administrador principal. **El nombre no es prueba de identidad**. No asignar privilegios por coincidencia de nombre, selector `miVoluntario`, cookie de oficialidad compartida o campos enviados por el cliente. Vincular la cuenta a un ID único de voluntario mediante un proceso de alta autenticado y verificado.

## Hallazgos del código actual
1. `app/api/auth/officiality/route.js` emite una cookie compartida a quien conoce el PIN de oficialidad; no identifica a un voluntario ni acredita un rol individual.
2. `app/api/state/[key]/route.js` permite lecturas y escrituras anónimas para numerosas claves, incluidas `guardia-plan:` y `guardia-inscripcion:`. Las comprobaciones de `Origin` no autentican usuarios.
3. El bloqueo actual de `guardia-rol:`, `guardia-obac-meta:`, `guardia-revision:` y `precedencia:` devuelve 403 incluso al administrador. No considerar esos módulos operativos.
4. El guardado de rol y el retiro de noches de voluntario son escrituras separadas, no una transacción; hay riesgo de estados parciales y carreras.

## Requisitos de implementación
1. Crear cuentas individuales con ID inmutable, credenciales verificadas y hash seguro; sesión firmada con expiración, cookies HttpOnly/Secure/SameSite y revocación.
2. Dar de alta al primer administrador por procedimiento de arranque controlado (secreto fuera del repositorio y verificación de identidad), nunca por nombre en pantalla ni por PIN compartido.
3. Resolver en el servidor identidad, rol y habilitación desde registros autorizados; no confiar en `who`, `cargo` o `rol` del navegador.
4. Crear endpoints específicos para Guardia y validar permisos por acción y por noche. No exponer escrituras genéricas de claves sensibles.
5. Ejecutar asignación de rol y transferencia de noches en una sola transacción con control de concurrencia, o devolver conflicto 409 sin cambios parciales.
6. Migrar la interfaz legacy a esos endpoints, conservar historial de cambios y evitar romper funciones actuales en producción.
7. Añadir pruebas ejecutables de acceso anónimo, suplantación, revocación, roles, concurrencia, rollback y semana cerrada. Verificar tablet B-5 y móviles antes del despliegue.

## Criterio de salida
No fusionar hasta que los endpoints de Guardia funcionen con identidad individual real, autorización del servidor, persistencia transaccional y pruebas de integración satisfactorias.
