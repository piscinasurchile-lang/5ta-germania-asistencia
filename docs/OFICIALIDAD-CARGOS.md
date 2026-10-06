# Oficialidad: cambio de cargos cada año

Cada año hay elecciones y la ODD de la primera semana de enero define quién ocupa cada cargo (o confirma que se mantienen).
El módulo **Oficiales → Oficialidad** permite registrarlo de tres formas, y en todos los casos se revisa antes de aplicar.

## Cómo se usa
1. Elegir el **año** y la fecha desde la que **rige** (la fecha de la ODD).
2. Llenar la tabla de una de estas formas:
   - **Mantener todos los del año anterior** (un clic) y cambiar solo los que correspondan.
   - **Leer desde foto o archivo**: foto o PDF de la ODD, o una planilla CSV (`Cargo;Nombre`) o un texto.
   - **Pegar texto de la ODD** (se entienden «Tte. 2º», «Teniente Segundo», «Tesorero Gral.», tablas de dos columnas, etc.).
   - A mano, eligiendo en cada cargo.
3. Revisar la tabla: cada cargo muestra **quién lo tenía el año anterior** y su estado (*se mantiene*, *cambia*, *nuevo*, *queda vacante*). Se avisa si alguien queda con dos cargos y si un nombre no se reconoció.
4. **Guardar y aplicar a la nómina.** Se pide confirmación (y la clave de Oficialidad en modo producción).

## Qué queda guardado (todo, para consulta y estadística)
| Clave | Contenido |
|---|---|
| `oficialidad:AÑO` | Cargo → voluntario (formato de siempre) |
| `oficialidad-meta:AÑO` | Fecha desde la que rige, quién lo registró, origen (a mano / mantener / foto / PDF / texto / planilla), resumen de cambios, versión |
| `oficialidad-fuente:AÑO` | El documento original (foto reducida o PDF de hasta ~1 MB), como respaldo |
| `roster:v8` | Cargo actual de cada voluntario, y en su hoja de vida «Ejerció como X durante AÑO (desde …)» |

Los cargos del año y la nómina se guardan **en una sola operación (todo o nada)**. Cada cambio conserva la versión anterior («Versiones anteriores»).

## Lectura de fotos y PDF (consulta a un servicio de IA)
- Es **opcional**: sin configuración, la app explica que no está activada y ofrece las otras vías.
- Para activarla, definir en Vercel la variable `ANTHROPIC_API_KEY` (y, si se quiere, `ANTHROPIC_MODEL`). La clave la crea y guarda quien administra la cuenta; no queda en el repositorio.
- **Solo se envía la imagen o el PDF.** Los nombres de la nómina no salen de GERMANIA: la comparación con la nómina se hace en el equipo.
- La ruta exige la **sesión de Oficialidad** (la clave de Oficialidad), para que nadie pueda gastar la clave de IA.
- La lectura puede equivocarse (fotos inclinadas, nombres parecidos): por eso **siempre hay una pantalla de revisión** antes de aplicar y un nombre ambiguo nunca se asigna solo.

## Pendiente (otras etapas)
- Los permisos por cargo (quién ve el informe de la guardia, quién registra el cambio) y la lista de oficiales 2026 escrita en el código de la API antigua de Guardia deben pasar a leer estos registros por año.
- Generar la ODD de traspaso y la de orden de precedencia con estos datos.
