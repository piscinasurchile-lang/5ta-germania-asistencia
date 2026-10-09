# ADR 0008 · Glosario y nombres operativos
- **Estado:** Propuesto.
- **Contexto:** interfaz usa «Maquinista» y ciertos campos históricos usan `conductor`; «OBAC» es cargo operativo.
- **Decisión propuesta:** conservar terminología visible institucional y documentar equivalencias sin renombrar datos existentes.
- **Alternativas:** renombrar campos (requiere migración y pruebas); conservar con glosario.
- **Consecuencias:** menor confusión entre agentes y menor riesgo de romper integraciones.
- **Datos:** campos `conductor` y estructuras de guardia; no cambiar ahora.
- **Pruebas futuras:** presentación de roles y conteo de dotación.
