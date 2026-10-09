# Registro de riesgos pendientes — GERMANIA 2026

> **IMPORTANTE · SEGURIDAD PENDIENTE DE REVISIÓN POR RESPONSABLE EXTERNO**
>
> **Estado:** pendiente / no corregido / no validado en producción.
> **Responsable:** persona externa designada por el administrador (nombre aún no informado).
> **Decisión del administrador (2026-10-08):** los asuntos de seguridad serán revisados por otra persona. ChatGPT y Claude deben mantenerlos documentados, pero no implementar cambios de seguridad por iniciativa propia.

## Fuente y alcance

Hallazgos de la auditoría «Auditoría integral de arquitectura · GERMANIA 2026», realizada por Claude sobre `main` @ `22e5df3` el 2026-10-08 y contrastada parcialmente por ChatGPT con el código de GitHub. **No equivalen a una prueba de intrusión ni a una validación de exposición efectiva en producción.** Se requiere evaluación del responsable.

## Hallazgos para entregar al responsable

| ID auditoría | Prioridad reportada | Tema pendiente |
| --- | --- | --- |
| R1 | Crítico | Lectura y escritura de `/api/state/*` sin comprobación de sesión de usuario en el servidor; posible acceso a datos personales y operativos. |
| R2 | Crítico | `MODO_PRUEBA_ABIERTO=true` en `public/legacy/app.js`; retirar el aviso visual «Modo prueba» **no** desactiva este comportamiento. |
| R3 | Alto | Identidad y roles determinados en el cliente al seleccionar un nombre; falta validación de rol en servidor. |
| R4 | Alto | API heredada de Oficialidad expone códigos usados por mecanismos de autorización antiguos. |
| R5 | Alto | Cookie de sesión de Oficialidad con token estático y limitaciones de expiración/revocación. |
| R6 | Alto | PIN de Oficialidad sin limitación de intentos reportada. |
| R11 | Medio | Cabeceras de seguridad y restricciones de incrustación por revisar. |
| R13 | Medio | Posible exposición de datos/fotos de voluntarios en recursos públicos. |

**Nota:** R7–R10, R12 y demás hallazgos de arquitectura, consistencia, rendimiento y pruebas siguen en la auditoría original; este registro separa únicamente los puntos de seguridad.

## Reglas de coordinación

1. **No marcar estos hallazgos como solucionados** hasta recibir verificación del responsable.
2. **No modificar** autenticación, sesiones, PIN, roles, permisos, políticas de acceso ni datos personales sin encargo explícito del administrador y coordinación con el responsable.
3. Evitar que cambios funcionales en guardias, ODD, nómina, estadísticas o tablet B-5 interfieran con una futura corrección de seguridad.
4. El responsable deberá verificar los hallazgos contra el código y la configuración vigentes, diseñar pruebas sin alterar datos reales y entregar recomendaciones para revisión.
5. Cualquier corrección posterior requiere rama independiente, PR, pruebas y autorización de despliegue.

## Seguimiento

- **2026-10-08:** registrado por indicación del administrador. Responsable externo aún no identificado. **Sin cambios funcionales ni de seguridad.**
- **Próxima acción:** asignar responsable, revisar alcance y documentar conclusiones en este registro o en un ADR de seguridad.
