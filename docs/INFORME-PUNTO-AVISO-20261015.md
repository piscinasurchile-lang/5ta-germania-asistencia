# Germania · Informe técnico del punto de aviso en el ícono (15-10-2026)

**Estado:** análisis técnico confirmado; rama de trabajo `feat/punto-aviso-pwa-20261015`. **No publicado, no activado en teléfonos.** `main`, Neon y Vercel de producción no se modifican por este informe.

## Requisito operativo definitivo del administrador

- Cuando el Capitán u otro oficial publica una información en el apartado **Informaciones** para toda la compañía, cada teléfono que haya habilitado las notificaciones debe recibir una señal en el ícono instalado de **GERMANIA**. Un solo punto, **sin contadores**.
- El mensaje ya publicado se sigue viendo en su lugar habitual dentro de Germania. No agregar una pantalla paralela de mensajería.
- Al **abrir Germania**, el teléfono **limpia el punto automáticamente**, sin botón **Leído**, confirmación o trámite.
- **No registrar quién leyó, quién abrió ni fecha de lectura**. Tampoco generar estadísticas de lectura.
- El próximo mensaje genera un punto nuevo. La prueba debe usar exclusivamente el canal de ensayos, con un texto inequívoco: **«PRUEBA GERMANIA — Aviso de prueba. No corresponde a una emergencia ni a una ODD oficial.»** No enviar alertas falsas de emergencia.
- El parpadeo del emblema durante la carga de la app es una **segunda incidencia**, distinta del aviso, y no debe mezclarse con este PR.

## Verificación del código del 15-10-2026

- App Next.js, interfaz operativa en iframe: `app/page.js` / `public/legacy/index.html`. PWA con manifest existente y service worker `public/sw.js`.
- El módulo `Informaciones` **ya existe**: `app/api/informaciones/prueba/route.js` almacena mensajes compartidos de prueba en Neon, `public/legacy/germania-roles.js` los consulta y los muestra en Inicio.
- Actualmente ese ensayo ofrece un botón «Leído» y guarda lecturas por voluntario en `informaciones-prueba-lecturas:<id>`; **es el comportamiento que el administrador pidió abandonar**. No trasladar esa lógica al aviso del ícono, y no escribir nuevas lecturas al construir el nuevo flujo.
- No se encontró una implementación de suscripciones Web Push ni un controlador `push` en `public/sw.js`: la app cerrada no puede recibir todavía un aviso de fondo.

## Solución técnica mínima

1. **Recepción en segundo plano:** suscripción Web Push en la PWA instalada. Se solicita **una sola vez** permiso de notificaciones por acción explícita del usuario (exigencia de los navegadores; especialmente iPhone). No confundir permiso con botón «Leído».
2. **Entrega:** guardar solamente los datos técnicos de cada suscripción de dispositivo (endpoint y claves criptográficas necesarios para mandar push), **sin asociarlos a identidad del voluntario ni crear registros de lectura**. Enviar un push por nueva información. No almacenar a quién se envió ni quién abrió.
3. **Indicador:** service worker procesa el push, llama a `self.navigator.setAppBadge()` si existe y muestra una notificación de «Nueva información en Germania» para los sistemas que la exigen. **Sin número**; el sistema operativo decide color y diseño. En Android, el punto del lanzador depende de una notificación activa y de ajustes del teléfono.
4. **Al abrir la app:** `navigator.clearAppBadge()` si está soportado; cerrar las notificaciones de Germania cuyo `tag` corresponda al aviso (para que desaparezca también el punto del lanzador Android). No informar al servidor de que se abrió. Este paso debe ejecutarse desde el documento principal, no depender del iframe.
5. **Contenido:** los textos completos permanecen en el apartado existente `Informaciones`. El push no transporta texto confidencial ni reportes operativos falsos. Las publicaciones de ODD PDF y otros módulos quedan fuera de la prueba inicial.

## Limitaciones reales verificadas

- **No existe un punto rojo forzado e idéntico en todas las marcas.** Android muestra el distintivo de notificación según modelo/launcher y ajustes, e iPhone controla el aspecto de su insignia. No se modificará gráficamente el escudo ni se superpondrá un punto estático al archivo de ícono: eso no reaccionaría a mensajes en segundo plano.
- Los teléfonos deben tener **Germania instalada**, permitir notificaciones y disponer de conectividad cuando el sistema entregue el push. En iPhone: PWA en pantalla de inicio, iOS 16.4 o superior.
- Para que aparezca el punto **con la app cerrada**, es necesario un envío Web Push desde servidor; leer Neon cada 60 segundos solo sirve si la app está abierta.
- La entrega de Web Push es de **mejor esfuerzo**, no sustituye radios ni alertas operativas de emergencia.

## Fuentes técnicas
- Apple: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- WebKit: https://webkit.org/blog/13878/
- MDN: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Display_badge_on_app_icon

## Validación pendiente (sin enviar todavía mensaje a los teléfonos)

- PWA instalada en un Android: generar un push de prueba con app cerrada; comprobar punto/notificación; abrir Germania; comprobar limpieza del punto sin tocar controles.
- Repetir en iPhone compatible y un segundo Android.
- Comprobar que el texto de prueba está en `Informaciones`, que mensajes sucesivos generan otra notificación y que no se escriben lecturas.
- Revisar consumo de batería, carga y compatibilidad con el modo tablet B-5.
- Ejecutar `npm test`, `npm run build` y revisión de PR. No fusionar ni desplegar sin decisión de integración.

## Estado y siguiente paso

Este documento registra la solución acordada para que permanezca disponible aunque se interrumpa la llamada. La ruta definitiva requiere implementación probada de Web Push, configuración VAPID y autorización técnica para activar el envío real. **No se ha enviado ninguna notificación ni un mensaje de prueba a los dispositivos de los voluntarios.**
