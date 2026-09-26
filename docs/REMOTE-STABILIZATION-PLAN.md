# Estabilización remota Lista B-5

Rama aislada para consolidar mejoras sin afectar `main` ni producción.

## Reglas
- Salida B-5 conserva el 100% de sus campos operacionales.
- Nómina es la fuente única de identidad, cargo y condición COND.
- Oficialidad usa autenticación/sesión backend; no se reemplaza seguridad por almacenamiento local.
- Guardia, OBAC, conductor, ODD, EPP, inventario y mantenciones deben reutilizar datos centrales.
- No integrar PR históricos obsoletos de forma directa.
- Todo cambio requiere build/CI verde y revisión del diff antes de merge.

## Objetivos
1. Consolidar sesión de Oficialidad.
2. Sustituir texto libre por catálogos donde el dominio sea cerrado.
3. Crear panel central de alertas sin duplicar fuentes.
4. Crear búsqueda transversal de voluntarios.
5. Optimizar móvil sin eliminar campos de Salida B-5.
6. Revisar Guardia completa y rescatar únicamente cambios aún necesarios de ramas antiguas.
7. Ejecutar pruebas de integridad y regresión antes de cualquier integración.
