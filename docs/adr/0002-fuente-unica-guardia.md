# ADR 0002 · Fuente única de Guardia
- **Estado:** Propuesto; NO autoriza migración ni borrado.
- **Contexto:** conviven claves `guardia-*` en `app_state` y tablas SQL históricas. ODD Maestras consulta la API SQL heredada.
- **Decisión propuesta:** estudiar `app_state` como fuente vigente para la Guardia, inventariar consumidores y datos SQL antes de definir adaptación de ODD.
- **Alternativas:** mantener ambos con sincronización; migrar a SQL; consolidar KV.
- **Consecuencias:** riesgo de ODD con dotación antigua; requiere reconciliación y plan de reversión.
- **Datos:** `guardia-*`, `guardia:*`, tablas `guardia_*`.
- **Pruebas futuras:** dotación aprobada, reemplazos, maquinista, OBAC, historial.
- **Bloqueo:** no modificar ODD sin autorización y ADR 0006 aceptado.
