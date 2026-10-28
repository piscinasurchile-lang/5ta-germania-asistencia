# ADR 0012 · Aprobación de guardia nocturna en un solo paso

**Estado:** Propuesto / rama `integracion/staging-a-produccion-20261028`. Decisión de negocio definitiva del usuario (Christian Vergara, 2026-10-28); implementación pendiente de revisión cruzada y autorización para fusionar. No desplegar sin autorización específica.

## Contexto
El flujo vigente tenía dos capas posteriores al cierre del libro: la aprobación de un oficial autorizado y una «acreditación adicional» (cumplimiento final) del Teniente Tercero, que además condicionaba qué noches contaban en estadísticas y en el cierre semanal. El usuario decidió eliminar por completo ese procedimiento.

## Decisión
Nuevo flujo:
1. El OBAC registra y cierra el libro (con fotografía; el cierre excepcional sin foto por oficial se mantiene).
2. El Capitán o los Tenientes 1°, 2° y 3° revisan asistencias, ausencias y fotografías.
3. El oficial **aprueba la guardia en un solo paso**.
4. Esa aprobación es la única puerta para las estadísticas (`GermaniaGuardiaReglas.acreditacionVigente`).

Estados de noche: `sin_cierre_de_libro` → `registro_cerrado` → `aprobada`.

## Compatibilidad (sin migración de datos)
- Se conservan los nombres de clave y campo heredados: `guardia-acreditacion:<fecha>`, `estado:"acreditada"`, `acreditadoPor*`. Renombrarlos exigiría migrar Neon y no aporta valor operativo.
- Se mantiene la clave `ratificacion` en el contrato de `resumenNoche`.
- `cumplimientoFinal` en registros antiguos se **ignora al leer** y, si la noche se corrige, se preserva en `historial[].cumplimientoFinalAnterior`.
- Se elimina la ruta `/api/guardia/acreditar-final` y todo botón, pantalla y mensaje de acreditación adicional. `acreditada_t3` queda solo como etiqueta heredada de avisos antiguos.

## Trazabilidad
- Cada aprobación guarda quién, cuándo y la asistencia exacta; idempotente por `firmaContenido`.
- Toda corrección exige `motivoCorreccion` y añade al `historial`: quién, cuándo, motivo, estado antes y después. Concurrencia optimista con `ifVersion`.
- No se borran registros históricos, fotografías ni estadísticas; las versiones previas siguen en `app_state_history`.

## Permisos
Sin cambios: aprueban Capitán y Teniente 1°/2°/3°; administrador y otros oficiales solo leen. Los roles y la seguridad no se tocan (ver `REGISTRO-RIESGOS-SEGURIDAD.md`).

## Alternativas
- Mantener la acreditación como paso opcional: descartada por el usuario.
- Migrar nombres de claves: descartada por riesgo sobre datos oficiales.

## Datos afectados
Ninguna escritura sobre Neon en este cambio. En una copia de la base se verificó que las estadísticas no varían (2 registros heredados, ambos ya contaban).

## Pruebas
`npm test` (362/362), `npm run build`, `tests/guardia-aprobacion-un-paso.test.mjs` (10 pruebas de ruta con PGlite) y recorrido en navegador con datos aislados (41/41). Se comprobó por mutación que las pruebas detectan la regresión de la regla anterior.

## Pendiente
Visto del Capitán y cierre semanal se mantienen (no son acreditación): decidir si se retiran. Registro de externos sigue limitado a T3 por permiso del servidor. Respaldo (rama/snapshot de Neon; retención de historia solo 6 h) antes de cualquier fusión final.
