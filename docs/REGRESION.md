# Matriz de regresión GERMANIA

Esta matriz es obligatoria antes de integrar cambios estructurales a `main`.

| Área | Prueba mínima | Resultado esperado |
|---|---|---|
| Inicio | Abrir aplicación con red normal/lenta | La estructura aparece sin quedar bloqueada; sincronización no cambia de pantalla |
| Foto | Usuario sin foto o foto fallida | No aparece icono roto; se mantiene respaldo institucional |
| Navegación | Cambiar Inicio → Asistencia → Salida B-5 → Oficialidad → Guardia → Informes | La vista elegida permanece activa |
| Persistencia | Guardar dato y recargar/cambiar dispositivo | Dato recuperado desde base central |
| Voluntario | Cambiar disponibilidad | Estado central visible según permisos |
| Asistencia | Abrir actividad, registrar estados y reabrir | Registros conservados |
| Salida B-5 | Crear/reabrir parte | Datos y asistentes conservados |
| Guardia | Abrir calendario y período | No redirige a Inicio; datos provienen del módulo vigente |
| Guardia | Selección normal semanal | Miércoles 23:00 a miércoles 07:00, 7 turnos |
| Guardia | Domingo diurno | Coexiste con turno nocturno sin reemplazarlo |
| Guardia | Reemplazo | Conserva designado, reemplazo y marca temporal disponible |
| Dashboard | Abrir con Guardia sin datos | Dashboard carga; KPI Guardia puede ser 0 |
| Dashboard | Parte individual defectuoso/no disponible | Resto de datos válidos sigue renderizando |
| Oficialidad | Entrar/salir de herramientas | Sin navegación inesperada |
| ODD Maestras | Abrir ruta vigente | Continúa independiente; esta limpieza no altera su lógica |
| Administración | Nómina/cargos/cursos/hoja de vida | Datos centrales disponibles |
| Terminal B-5 | Acceso de prueba administrador | Sin pérdida de acceso por refactor |
| PDF | Generar documentos existentes | Contenido vigente sin pérdida de campos |
| Guardia · avisos y desbordes | Elegir un miércoles, activar domingo diurno, confirmar período, inscribirse (1 noche y 2 noches), confirmar y recibir aviso de ODD al mismo tiempo, en 320, 360, 390, 768 y 1280 px | Sin desborde horizontal; avisos apilados sin taparse entre sí ni tapar botones; ventanas de confirmación completas en pantalla |
| Móvil | Navegación y controles principales | Sin desborde crítico; menú utilizable |
| PC/tablet | Guardia | Calendario izquierda y configuración derecha cuando hay ancho |
| Error remoto | Fallo de una consulta secundaria | Aplicación no queda en pantalla de carga permanente |

## Criterios de bloqueo

No fusionar si:
- falla Build o CI;
- aparece una segunda implementación operativa de un módulo;
- se introduce almacenamiento local como fuente institucional;
- una sincronización fuerza navegación a Inicio;
- se elimina una API/dato heredado sin auditoría de consumidores;
- ODD Maestras o Inventario cambian accidentalmente durante esta fase.
| Ingreso → Buscar persona | Buscar por RUT/nombre revisa nómina, bajas, copias, precedencia y ODD sin escribir; Reactivar conserva anotaciones; ficha de ingreso rechaza RUT repetido | 320/390/1280 |
| Inicio y Guardia por rol | Identidad → novedades, tarjetas, minuta en orden PDF; pestañas Voluntario/Maquinista/OBAC/Información según rol; Oficiales oculto a no oficiales; sin desbordes | 320/390/768/1280 |
| Revisión de dotación | Crear borrador, quitar/agregar/cambiar, resultado y cambios, aprobar → guardias de la semana; reabrir; sin desbordes | 320/390/1280 |
| Ciclo de guardia | Vista Mi guardia/Gestión; tabs de elección solo con elección abierta; aprobación crea guardia dom 19:00; No puedo → aviso → reemplazo actualiza revisión/guardia/aviso; cumplidas y «no cuenta» | 320/390/768/1280 |
| Inicio sin repetidos | Selector de nombre oculto tras elegir («No soy yo» lo abre); atajos no repetidos (escritorio: Guardia, Estadística; móvil: Asistencia, Estadística, Oficiales); Oficiales en 4 grupos; aviso de prueba no tapa contenido ni la barra inferior | 390/1280 |
| Varias semanas abiertas / volver a Inicio | Inicio y Guardia se refrescan al entrar; aviso muestra la primera semana sin confirmar; Gestión con selector de semana | 390/1280 |
| Tarjetas por cargo en Inicio | Con elección abierta Inicio muestra Voluntario (+Maquinista si conductor, +OBAC si rango, +Información si mando); desaparecen al cerrar; Mis noches en Guardia; sin IDs duplicados ni desbordes | 320/390/768/1280 |
| Botones de Inicio | Mi estado y Emergencia · B-5 para todos; Guardia nocturna solo oficiales; CSS no queda en caché vieja (sw v6, ?v=…d) | 390/1280 |
| OBAC | Solo ven la tarjeta OBAC Capitán, Tte 1°/2°/3° y los 2 siguientes de la precedencia (6 en total) | 390 |
| Maquinista / vista de prueba | En toda la app dice «Maquinista» (no «Conductor»); 517 ve tarjetas Maquinista y OBAC solo lectura; voluntario marca todas las noches que quiera (mín. 2); OBAC puede sumar noches como voluntario | 390 |
