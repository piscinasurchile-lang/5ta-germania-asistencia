# ADR 0013 · El administrador del proyecto aprueba y corrige guardias

**Estado:** Propuesto / rama `feat/admin-aprueba-guardia`. Encargo explícito del administrador (Christian Vergara, código 517, 2026-10-29). No desplegar sin su autorización específica.

## Contexto
Hasta el ADR 0012 solo Capitán y Tenientes 1°, 2° y 3° aprobaban y corregían guardias; el administrador (517) solo leía. Para revisar o corregir una noche, el administrador debía ingresar como otro voluntario, lo que mezcla identidades y deja la trazabilidad a nombre de otra persona.

## Decisión
- El administrador del proyecto (código 517, activo en la nómina) puede **aprobar y corregir** guardias directamente, con su propia identidad.
- La aprobación o corrección queda registrada con su nombre y el cargo **«Administrador»** (`acreditadoPorCargo` / `modificadoPorCargo`). El resto del contrato no cambia: motivo obligatorio en correcciones, `historial`, idempotencia y `ifVersion`.
- **No se amplía nada más.** Siguen igual: cierre excepcional sin fotografía (solo oficiales autorizados), cierre semanal, incidencias, visto bueno del Capitán, registro de externos (T3; el Capitán solo consulta tras la aprobación) y lectura de oficiales.
- El servidor informa `puedeExternos` y la interfaz oculta el registro de externos a quien el servidor rechazaría (administrador y T1/T2), para evitar botones que no funcionan.

## Seguridad (coordinación)
Es un cambio de permisos. Se hace por encargo explícito del administrador, según `REGISTRO-RIESGOS-SEGURIDAD.md` (regla 2), en rama independiente, con pruebas y sin desplegar sin autorización. **Pendiente: informar al responsable externo de seguridad** (aún no designado). Persiste el hallazgo R3: la identidad se determina en el cliente (`actorId`), de modo que este permiso tiene la misma debilidad que el de los demás oficiales; no se resuelve aquí.

## Datos afectados
Ninguna migración ni escritura en Neon. Solo cambia quién puede escribir `guardia-acreditacion:<fecha>`.

## Pruebas
`tests/guardia-admin-aprueba.test.mjs` (rutas reales con base en memoria): aprobar y corregir como administrador, rechazo de Ayudante, voluntarios, OBAC y 517 inactivo, y que no se amplíen otros permisos. Prueba de mutación: quitar el permiso hace fallar las pruebas. Recorrido en navegador con datos ficticios (14/14).

## Revertir
Retirar `puedeAprobarGuardia` de `validarAcreditacion` y la condición `||esAdmin` en `puedeRatificar` de la ruta del libro.
