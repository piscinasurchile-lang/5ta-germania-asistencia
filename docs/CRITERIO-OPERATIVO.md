# Criterio fundamental · GERMANIA es una herramienta operativa

GERMANIA no es una aplicación comercial ni una red social. La usan bomberos voluntarios durante emergencias, guardias, actividades y servicios. **Prioridad absoluta: rapidez de acceso, claridad visual y seguridad operativa.** (Oficialidad, 08-10-2026.)

## Reglas obligatorias
1. **Acceso inmediato:** las funciones principales se identifican y usan rápido, incluso bajo estrés.
2. **Botones seguros:** reducir espacios decorativos, nunca el tamaño táctil de los botones importantes (mínimo 44 px).
3. **Legibilidad:** texto legible en exteriores, de noche o con mala luz.
4. **Información prioritaria:** Mi disponibilidad, emergencias, guardias y avisos operativos siempre bien identificables.
5. **Sin errores de pulsación:** separación suficiente entre acciones, sobre todo las que cambian el estado del voluntario.
6. **Equipos distintos:** Android, iPhone, Windows y especialmente la tablet B-5.
7. **Rendimiento:** sin animaciones pesadas, cargas adicionales ni demoras.
8. **Continuidad operativa:** no alterar colores, lógica de disponibilidad, registros de asistencia ni procedimientos de emergencia.

## Principio de diseño
**Reducir espacios vacíos, no reducir la seguridad de uso.** Pantalla compacta, institucional, rápida y fácil de operar. El objetivo no es poner más tarjetas, sino que un bombero encuentre la función correcta en el menor tiempo y sin equivocarse. No cambiar colores, identidad visual ni funcionalidades existentes.

## Cómo se aplica (lista de revisión antes de entregar)
- Todo elemento táctil de Inicio ≥ 44 px (se mide con Playwright a 390 px y a 1024 px).
- Ningún texto operativo menor de 13 px.
- Ningún control pequeño pegado a un botón que cambia estado (por eso la ayuda «?» solo existe en **Modo ayuda**, que se activa a propósito y no ejecuta nada).
- Sin animaciones ni cargas nuevas.
- Cada cambio debe mejorar la operación diaria o la de emergencia; si solo decora, no entra.
