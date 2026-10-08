# GERMANIA · Especificación de rediseño visual y Guardia Nocturna segura

Fecha: 08-10-2026 · Rama: `feat/rediseno-germania-guardia-segura`
Base: «GERMANIA – Especificación técnica final» (PDF aprobado) + arquitectura vigente (`docs/ARQUITECTURA-AUDITORIA.md`).

Regla central (del PDF): **una sola Germania, una sola fuente de datos, vistas adaptadas al rol.**

---

## 1. Objetivo

1. Que toda la app se vea como el PDF: oscura, roja/amarilla, tarjetas, iconografía coherente, escudo FEUERWEHR · 5 · 2025 · VILLARRICA.
2. Que la Guardia Nocturna **no pierda datos**, aunque dos personas guarden a la vez o falle la conexión.
3. Que cualquier persona pueda usarla, con poca o mucha educación formal: textos simples, botones grandes, un paso por pantalla, errores que explican qué hacer.

Fuera de alcance (según PDF §7): permisos avanzados de Oficiales, Inventario, ODD Maestras, GERMANIA Bridge.

## 2. Diagnóstico (lo comprobado en el código)

### 2.1 Riesgos de pérdida de datos

| # | Hallazgo | Dónde | Consecuencia |
|---|---|---|---|
| D1 | `PUT /api/state/[key]` reemplaza el valor completo; gana la última escritura | `app/api/state/[key]/route.js` | Dos oficiales editando la misma guardia: uno borra lo del otro sin aviso |
| D2 | Los índices (`guardias:index`, `guardia-plan:index`) se leen, se modifican y se reescriben | `setGuardia`, `gnSavePlan` en `app.js` | Dos guardias guardadas a la vez: una desaparece del índice y de los informes |
| D3 | No hay historial: al sobrescribir, el valor anterior se pierde | tabla `app_state` | Un error humano no se puede deshacer |
| D4 | La inscripción hace dos escrituras seguidas (noches + confirmación) con «rollback» manual | `gnInsGuardar` | Si falla la red entre ambas, queda inscripción sin confirmar o al revés |
| D5 | El usuario no ve claramente si se guardó | UI | Reintenta, cierra la app o cree que guardó |

### 2.2 Problemas de interfaz

- En celular el inicio pasa a **fondo blanco** (`#panel-germania{background:#f5f6f7}`): rompe la identidad del PDF.
- Navegación superior con pestañas (`.tabs`) oculta en móvil; el PDF define barra inferior + menú lateral.
- Botones y campos pequeños (6–8 px de relleno) y letra de 12–13 px.
- Jerga sin explicar: «OBAC», «Salida B-5», «Cupo».
- Espaciados irregulares (`margin`/`padding` sueltos, sin escala).
- La pantalla de Guardia mezcla en una sola vista planificación, inscripción, dotación e informes.

## 3. Sistema visual (tomado del PDF)

**Colores**

| Token | Valor | Uso |
|---|---|---|
| `--g-bg` | `#07090b` | Fondo de toda la app |
| `--g-card` | `#10151a` | Tarjetas |
| `--g-card-2` | `#171d22` | Tarjetas internas / controles |
| `--g-line` | `#303840` | Bordes |
| `--g-red` | `#e30613` | Acción principal, alertas, encabezados de tabla |
| `--g-red-deep` | `#8f0710` | Fondos de selección roja |
| `--g-gold` | `#ffcc00` | Escudo, foco, selección, números |
| `--g-ok` / `--g-info` / `--g-warn` / `--g-no` | `#1ebc62` / `#2589ff` / `#ffad17` / `#ff2634` | Estados: En cuartel / Disponible / Fuera de zona / No disponible |
| `--g-text` / `--g-muted` | `#ffffff` / `#b9c0c6` | Texto (contraste ≥ 7:1 sobre fondo) |

**Escala de espacio:** 4 · 8 · 12 · 16 · 24 · 32 px (`--sp-1…--sp-6`). Ningún valor suelto.
**Tipografía:** Oswald (títulos) + Source Sans 3 (texto), base **16 px**, líneas de 1.45.
**Controles:** alto mínimo **48 px**, separación mínima entre botones **8 px**, radio 12 px.
**Estados siempre con color + texto + icono** (nunca solo color).
**Foco visible** (anillo dorado 3 px) y `prefers-reduced-motion` respetado.

## 4. Estructura de pantallas

- **Encabezado:** escudo + «GERMANIA · Quinta Compañía · Villarrica».
- **Barra inferior (móvil):** Inicio · Guardia · Emergencia B-5 · Más. «Más» abre el menú lateral con las demás opciones, como en el PDF.
- **PC/tablet:** misma barra superior de pestañas, con los mismos colores y tarjetas en dos columnas cuando hay ancho.
- **Inicio (voluntario):** foto circular + nombre + rol → «Mi estado hoy» (4 botones grandes) → «Mi guardia» → información para mí → minuta/tabla dinámica (orden PDF: En cuartel, Disponibles, No disponibles, Fuera de zona, Sin marcar).
- **Guardia:** se separa visualmente en tarjetas con título numerado: 1 Inscribirme · 2 Mis guardias · 3 Dotación del turno · 4 Informes. El oficial ve además «Programación del período».

**Lenguaje simple** (texto en pantalla; la sigla se mantiene entre paréntesis):
«Oficial a cargo (OBAC)», «Conductor / Maquinista», «Emergencia B-5», «Elige al menos 2 noches», «Se guardó a las 08:41 ✓».

## 5. Guardia Nocturna: reglas y protección de datos

### 5.1 Reglas (PDF §3)

- Cada inscripción = persona + noche + rol + estado. Sin doble conteo.
- Reemplazo: resta al titular, suma al reemplazante, queda registrado quién, cuándo y por qué.
- Un oficial que conduce cuenta solo como conductor esa noche.
- Noche completa = 3 voluntarios + 1 conductor + 1 OBAC, definido en **una sola constante** (`GN_DOTACION_MIN`); los voluntarios adicionales son refuerzos.
- ODD no se emite como válida con dotación incompleta.

### 5.2 Protección de datos (todas retrocompatibles)

| Id | Medida | Cómo |
|---|---|---|
| P1 | **Historial automático** | Antes de sobrescribir una clave de guardia, la versión anterior se copia a `app_state_history` (clave, valor, fecha). Permite recuperar. |
| P2 | **Control de versiones** (concurrencia optimista) | `GET` devuelve `version`; `PUT` acepta `ifVersion`. Si no coincide → `409` y el cliente muestra «Otra persona cambió esto; revisa y vuelve a guardar» sin pisar nada. |
| P3 | **Índices atómicos** | Nuevo `PATCH` con `op:"addToList"` agrega un elemento en una sola sentencia SQL (sin leer-modificar-escribir). |
| P4 | **Inscripción con reversa + historial** | Se mantiene el guardado en dos claves (`guardia-inscripcion` y `guardia-confirmacion`) porque otras partes de la app las leen por separado; si falla la segunda, se restaura la primera, y ahora ambas quedan además en el historial (P1). Unificarlas en un solo registro queda como mejora futura. |
| P5 | **Confirmación visible** | Aviso «Guardando… / Guardado ✓ hora / No se pudo guardar» en todos los guardados. El botón «Guardar guardia» se bloquea mientras guarda (evita doble envío). |
| P6 | **Recuperable** | Todo lo que se sobrescribe en claves de guardia queda en `app_state_history`. (Las confirmaciones de borrado existentes no se modificaron.) |

Compatibilidad: si el cliente no envía `ifVersion`, el servidor se comporta como hoy (y igual deja historial).

## 6. Mejoras adicionales recomendadas (no incluidas en este cambio)

1. Dividir `public/legacy/app.js` (4.900 líneas) por módulo, sin reescribir.
2. Cola de reintentos sin conexión para el voluntario en terreno (hoy se bloquea y avisa).
3. Pantalla «Historial de cambios» para oficiales que lea `app_state_history`.
4. Respaldo diario descargable (JSON) de las claves `guardia*`.
5. Pruebas end-to-end automatizadas del flujo inscripción → roles → cierre → ODD → reemplazo.

## 7. Decisiones

**Resuelta (08-10-2026):** dotación mínima por noche = **3 voluntarios + 1 conductor + 1 OBAC**. Los voluntarios que se sumen sobre esos 3 son **refuerzos**. Cada voluntario se inscribe en **al menos 2 noches**. En el código: `GN_DOTACION_MIN` y `GN_NOCHES_MIN` (`public/legacy/app.js`). El formulario del turno muestra «mínimo de 3 completo / faltan N / N refuerzos».

**Pendiente:** si una noche incompleta **bloquea** el cierre de la ODD (PDF) o solo **avisa** (lo conversado antes). Hoy solo avisa.

## 8. Criterios de aceptación

- Fondo oscuro en todas las pantallas y tamaños; sin fondo blanco en móvil.
- Controles ≥ 48 px; texto ≥ 16 px; foco visible.
- Dos guardados simultáneos de la misma guardia no se pisan (409 + mensaje).
- Dos guardias guardadas a la vez aparecen ambas en el índice.
- Toda sobrescritura deja copia en `app_state_history`.
- `npm run build` pasa; la matriz de `docs/REGRESION.md` sin regresiones.
- No se despliega a producción hasta pasar pruebas (PDF «Criterio final»).
