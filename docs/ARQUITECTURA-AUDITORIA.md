# Auditoría de arquitectura GERMANIA

Fecha: 30-09-2026  
Rama: `refactor/arquitectura-profesional`

## Estado comprobado

- Entrada pública única: `app/page.js` carga la interfaz vigente `/legacy/index.html`.
- La interfaz operativa vigente está en `public/legacy/index.html` y `public/legacy/app.js`.
- Las 16 páginas bajo `app/guardia/**/page.js` no contienen una segunda UI operativa: todas redirigen a `/#guardia`.
- La interfaz vigente no contiene llamadas a `/api/guardia/*`.
- Las APIs antiguas `app/api/guardia/*` permanecen físicamente en el repositorio. No se eliminan todavía porque una búsqueda textual no demuestra por sí sola ausencia de consumidores externos o históricos.
- La persistencia de la interfaz vigente usa `/api/state/[key]`.
- `localStorage` y `sessionStorage` sólo aparecen en el comentario que declara que no se usan como fuente institucional; `lsAvailable()` devuelve `false`.
- No se detectó IndexedDB en la interfaz vigente.
- Guardia desde Oficialidad usa `window.__mostrarPestana('guardia')`; no abre una segunda raíz.
- ODD Maestras continúa como ruta separada existente y queda fuera de esta fase.
- Inventario queda fuera del alcance.

## Deuda controlada

1. `public/legacy/app.js` es monolítico y debe dividirse gradualmente, sin reescritura masiva.
2. `public/legacy/index.html` y `app.js` todavía navegan a ODD Maestras mediante cambio de ruta completo.
3. `app/api/guardia/*` es una API heredada sin consumidor encontrado en la interfaz vigente; mantener hasta auditoría de datos/dependencias.
4. Las rutas `app/guardia/*` son compatibilidad/redirección y pueden simplificarse después de confirmar que no existen enlaces externos necesarios.
5. Dashboard debe estabilizarse antes de reactivar cálculos de Guardia en sus KPI.

## Orden de consolidación

1. Mantener producción sin cambios durante la auditoría.
2. Estabilizar Dashboard y carga/sincronización.
3. Unificar navegación y estados visuales.
4. Extraer utilidades compartidas del monolito sin cambiar comportamiento.
5. Auditar APIs heredadas y datos antes de eliminar.
6. Ejecutar regresión por roles: Voluntario, Oficialidad, Administración y Terminal B-5.
7. Incorporar Novedades como módulo de Oficialidad sólo después de estabilizar la base.
8. Mantener GERMANIA Bridge como aplicación independiente con integración controlada.

## Regla de eliminación

Ningún archivo, API, tabla o dato histórico se elimina por parecer antiguo. Para retirar una pieza deben cumplirse las tres condiciones:

- no existe consumidor activo comprobado;
- existe reemplazo vigente probado cuando corresponda;
- las pruebas de regresión pasan antes de integrar a `main`.
