# ADR 0004 · Tablet B-5 como dispositivo especial
- **Estado:** Propuesto.
- **Contexto:** Lenovo TB-8505X, Android 10, 2 GB RAM, 16 GB, Helio A22, pantalla 1280×800. Auditoría indica que `B5_TABLET` aún no está implementado como identificación exclusiva.
- **Decisión propuesta:** medir dispositivo real y estudiar identificación explícita por instalación; aplicar adaptaciones aisladas sin alterar móviles o PC.
- **Alternativas:** solo media queries por ancho; detección por user-agent; registro explícito.
- **Consecuencias:** requiere verificar dimensiones CSS, memoria, tiempos de carga, conectividad y compatibilidad.
- **Datos:** preferencia local de dispositivo, si se aprueba; no alterar registros institucionales.
- **Pruebas futuras:** tablet física, Android, iPhone, Windows; vista 1280×800.
