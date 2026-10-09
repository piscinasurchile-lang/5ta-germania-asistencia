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

## Dispositivo especial: Tablet del carro B-5 (`B5_TABLET`)

Antecedentes entregados por la Oficialidad (2026-10-08). Es información de auditoría: **la aplicación todavía no se modifica**.

| Dato | Valor |
|---|---|
| Marca / modelo | Lenovo TB-8505X |
| Nombre comercial | Lenovo Tab M8 (2.ª generación), versión celular |
| Sistema operativo | Android 10 |
| RAM / almacenamiento | 2 GB / 16 GB |
| Procesador | MediaTek Helio A22 Tab, 4 núcleos, 2,0 GHz |
| Pantalla | 1280 × 800 px |
| Identificador interno | `B5_TABLET` |

### Cómo se identifica hoy el dispositivo (comprobado en el código)

**No se identifica.** Búsqueda en `app/`, `lib/`, `public/` y `docs/`:

- No existe ninguna constante, clave de almacenamiento, parámetro de URL ni clase CSS `B5_TABLET`. El nombre aparece solo como texto en `public/legacy/dashboard-preview.TESTPLAN.md` (paso de prueba) y `dashboard-preview.SCOPE.md` («no modifica … lógica B5_TABLET»); esa «lógica» no está implementada como detección.
- La única lectura de `navigator.userAgent` es `esIOS()` (`public/legacy/app.js`), que decide el flujo de compartir/descargar archivos en iPhone/iPad. No distingue la tablet.
- Lo único que cambia con el tamaño de pantalla son media queries por **ancho** (`max-width:700px`, `min-width:701px`, `max-width:999px`, `min-width:1000px`, `max-width:380px` en `germania-ui.css` e `index.html`) y un `matchMedia("(max-width:700px)")` que pliega secciones de la Hoja de Servicio. Por tanto la tablet cae en «móvil», «tablet» o «PC» según el ancho CSS que reporte el navegador, no por ser la B-5.
- `viewport`: `width=device-width`, `initial-scale=1`, `maximum-scale=1` (`app/layout.js`).
- Existen ya adaptaciones **de comportamiento** pensadas para esta tablet, sin detectarla: reloj por tiempo real en vez de contar ticks de `setInterval` (`app/page.js`), recuperación de datos tras carga lenta («Recuperación Tablet B-5»), y Service Worker con red primero para HTML/JS/CSS para no dejar una versión vieja atrapada (`public/sw.js`, caché v6).
- «Terminal B-5» figura como rol de regresión (`docs/REGRESION.md`) con acceso de administrador de prueba; tampoco es detección de equipo.

### Riesgos de recursos (hardware)

- 2 GB de RAM y 16 GB de almacenamiento: Android 10 deja poca memoria libre al navegador. Evitar cargas grandes simultáneas (`app.js` es un monolito y `LOGO_B64` va incrustado), animaciones pesadas y listados sin paginar.
- CPU de gama de entrada: evitar re-renderizados completos y trabajo síncrono largo; lo pesado debe ir en segundo plano (patrón ya usado en `app.js`).
- Pantalla 1280 × 800 con densidad desconocida: el ancho CSS real **no está medido**. Debe leerse en la propia tablet (`innerWidth`, `devicePixelRatio`, orientación) antes de elegir umbrales.

### Propuesta de arquitectura (para decidir, no implementada)

1. **Identificar por registro explícito, no por adivinanza.** Una marca guardada en el equipo (p. ej. `localStorage["germania:dispositivo"]="B5_TABLET"`), activable desde Administración o con un enlace de activación único. Ni el User-Agent ni el tamaño son fiables: otro Android o un PC con ventana similar podría confundirse con la B-5.
2. **Efecto limitado a una clase CSS** (`html.dev-b5`) añadida solo si existe la marca. Todo ajuste específico se escribe bajo ese selector, de modo que sin la clase los demás Android, iPhone y PC ven exactamente lo mismo que hoy.
3. **Primero medir, después ajustar.** Registrar en la tablet ancho/alto CSS, DPR, memoria (`navigator.deviceMemory`) y fluidez; recién entonces definir tamaños de botón y densidad, respetando el mínimo táctil de 44 px del `docs/CRITERIO-OPERATIVO.md`.
4. **Sin cambiar lógica operativa:** colores, disponibilidad, registros de asistencia y procedimientos de emergencia no dependen del dispositivo.
5. **Pruebas:** agregar a `docs/REGRESION.md` una fila por la tablet (marca activa y marca inactiva) y comprobar que PC, iPhone y otros Android no cambian.

Pendiente de confirmar por la Oficialidad: orientación de uso (vertical u horizontal) y si la tablet queda fija en el carro con un único usuario o la usan varios voluntarios.

## Regla de eliminación

Ningún archivo, API, tabla o dato histórico se elimina por parecer antiguo. Para retirar una pieza deben cumplirse las tres condiciones:

- no existe consumidor activo comprobado;
- existe reemplazo vigente probado cuando corresponda;
- las pruebas de regresión pasan antes de integrar a `main`.
