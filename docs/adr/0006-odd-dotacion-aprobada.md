# ADR 0006 · ODD y dotación aprobada
- **Estado:** Propuesto; ODD CONGELADAS.
- **Contexto:** auditoría reporta ODD Maestras leyendo `/api/guardia/orden-dia` (SQL heredado), mientras inscripciones actuales usan claves `guardia-*`. Definiciones de dotación pueden diferir.
- **Decisión propuesta:** antes de cambiar código, definir contrato único de dotación aprobada y reglas de incompletitud según especificación operativa vigente.
- **Alternativas:** adaptar lector ODD; servicio adaptador; migrar modelos.
- **Consecuencias:** riesgo de emitir dotaciones desactualizadas; no desplegar sin validación funcional.
- **Datos:** `guardia-*`, `guardia:*`, tablas `guardia_*`, registros ODD.
- **Pruebas futuras:** OBAC, maquinista, reemplazos, noches incompletas, PDF, concurrencia.
- **Bloqueo:** ninguna modificación de ODD sin autorización expresa.
