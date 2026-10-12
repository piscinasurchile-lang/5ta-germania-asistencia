# Laboratorio Telegram → ntfy (aislado)

Estado: preparado como código de pruebas; no conectado a Telegram ni desplegado. Exclusivamente en la rama test/telegram-emergencias-villarrica-2022, bajo experiments/telegram-ntfy/. No cambia interfaz, Neon, Vercel, asistencia ni guardias de Germania.

## Por qué se usa una sesión Telegram
El grupo **Despachos Villarrica 2023** no necesita recibir un bot nuevo. Se usa una sesión MTProto de una cuenta que ya tenga acceso al grupo, con credenciales y autorización de su titular. Este lector puede detectar mensajes enviados por personas u otros bots visibles para esa cuenta. Solo lee el grupo cuyo ID exacto se configure. No modifica mensajes ni miembros.

## Preparar en computador privado con Node 20+
Obtener API_ID y API_HASH desde https://my.telegram.org/apps (guardar siempre en privado).

1. cd experiments/telegram-ntfy
2. npm install
3. cp .env.example .env y completar solo TELEGRAM_API_ID, TELEGRAM_API_HASH.
4. npm run auth (ingresar número y código directamente en la terminal; nunca compartir).
5. npm run chats (encuentra el ID exacto del grupo y copiarlo a TELEGRAM_CHAT_ID en .env).
6. npm test
7. npm run watch (por defecto DRY_RUN=1: no envía alarmas).

La sesión se escribe en .telegram-session, archivo privado ignorado por Git. No compartir el contenido con ChatGPT ni guardar sesiones, claves o contraseñas en GitHub.

## Prueba de aviso aislado
Solo después de tener autorización para leer y reproducir el contenido de los despachos, configurar DRY_RUN=0 y un canal NTFY_TOPIC privado cuyo nombre comience con germania-test- y termine con más de 20 caracteres aleatorios. No se permite el canal de producción. Todas las alertas son explícitamente simuladas: PRUEBA / NO EMERGENCIA REAL / NO ACUDIR.

## Interpretación operativa de claves (CLAVES NUEVAS.pdf)

- El catálogo del Departamento de Radiocomunicaciones de Villarrica define 24 claves de emergencias entre 10-0-0 y 10-15 (incluye llamadas estructurales, incendios, materiales peligrosos, rescates y otros). El programa **reconoce el tipo de emergencia pero no deduce que Germania esté despachada** por ver una clave 10-*.
- Una notificación automática de laboratorio exige la mención identificable de B-5 (también B5, B 5, B–5) **o** un "llamado general" no cancelado. No asumir que cualquier clave 10-* implica salida del B-5. El prefijo incompleto "10-0" por sí solo no basta.
- **10-4-1** (rescate vehicular, vehículos menores) y **10-3-3** (rescate en ríos, lagos o canales) son especialidades **no asignadas al B-5 actualmente**, confirmado por la Quinta Compañía. Estas claves por sí solas no activan alarmas. Si el mismo mensaje nombra B-5 con una de esas claves, se registra como `requiere_revision` pero no se hace sonar una alarma automática; existe una contradicción que debe verificarse con la Central. Un llamado general explícito se procesa como convocatoria distinta y puede generar alerta.
- Información de estado/cancelación (por ejemplo 6-3, 6-7, 6-9, 6-10, 6-16, "sin efecto", "cancelado") no constituye un despacho nuevo.
- Las otras claves **no son una lista de especialidades aprobadas para Germania**; el motor sigue exigiendo asignación a B-5 o llamado general. Quedan pendientes ejemplos reales de formato Telegram para aumentar la precisión.
- Las alertas de laboratorio no contienen datos personales completos y se etiquetan siempre como simulación. Todo depende de un grupo por ID exacto, sin tocar producción.

Extrae direcciones identificables, sin inventarlas. Filtra otros chats, evita duplicados por ID de mensaje y descarta avisos de más de siete minutos. El primer inicio ignora el historial antiguo. Usa eventos de Telegram y revisión periódica de 12 segundos. El último ID procesado se conserva en un archivo privado local.

## Pendiente de verificar
Todavía no se han leído mensajes reales, no se ha comprobado la reconexión automática, no existe servicio persistente ni se ha integrado Germania. No usar como sistema de despacho real. Para 24/7 se requiere alojar este proceso de forma permanente; Vercel Functions no es un servicio de escucha permanente. No reemplaza las alarmas oficiales.
