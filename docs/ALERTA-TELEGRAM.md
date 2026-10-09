# Alerta de emergencias: Telegram → GERMANIA → celulares (ntfy)

**Estado:** propuesto (PR), no desplegado. Aviso **adicional**; no reemplaza el llamado oficial de Comandancia.

## Cómo funciona
```
Grupo "Emergencias Villarrica" ──(bot)──▶ POST /api/telegram/webhook ──▶ ntfy (prioridad 5) ──▶ celulares con la app ntfy
```
- La ruta valida el secreto de Telegram, filtra por palabras clave y publica en ntfy con prioridad urgente.
- No usa la base de datos (Neon), ni sesiones, ni roles, ni ODD.

## Qué cambia / qué NO cambia
- Nuevo: `app/api/telegram/webhook/route.js`, `lib/alerta-telegram.js`, `tests/alerta-telegram.test.mjs`, este documento y 2 variables en `.env.example`.
- No cambia: interfaz, Guardia, ODD, autenticación, PWA ni caché.

## Puesta en marcha (en este orden)

### 1. Bot (lo hace quien administra el grupo, o con su permiso)
1. En Telegram, hablar con **@BotFather** → `/newbot` → guardar el **token** (es secreto; no pegarlo en chats ni en el repo).
2. Agregar el bot al grupo de emergencias. Si es un **canal**, debe ser administrador. En un grupo, para que vea todos los mensajes: BotFather → `/setprivacy` → *Disable*, o hacerlo administrador.
3. Limitación de Telegram: **un bot no recibe mensajes enviados por otros bots**. Si el despacho lo publica un bot, este método no lo verá.

### 2. Variables en Vercel (Settings → Environment Variables → Production)
| Variable | Valor |
| --- | --- |
| `TELEGRAM_WEBHOOK_SECRET` | texto aleatorio largo (letras, números, `_` y `-`) |
| `NTFY_TOPIC` | texto aleatorio largo; es la "contraseña" del canal de alertas |
| `ALERTA_PALABRAS` | opcional, ej. `5ta,quinta,germania,b-5` (sin tildes ni mayúsculas importa poco). **Vacío = alerta en todo mensaje** |
| `TELEGRAM_CHAT_ID` | opcional, id del grupo para ignorar otros chats |
| `ALERTA_INCLUIR_TEXTO` | `0` para que la alerta NO copie el texto (solo avisa) |

Después de guardar, volver a desplegar para que las variables apliquen.

### 3. Conectar Telegram con la ruta (una sola vez)
Reemplazar `TOKEN`, `SECRETO` y el dominio, y ejecutar en un computador:
```
curl -s "https://api.telegram.org/botTOKEN/setWebhook" \
  --data-urlencode "url=https://TU-DOMINIO.vercel.app/api/telegram/webhook" \
  --data-urlencode "secret_token=SECRETO" \
  --data-urlencode 'allowed_updates=["message","channel_post"]'
```
Revisar con `https://api.telegram.org/botTOKEN/getWebhookInfo` (debe mostrar la URL y `last_error_message` vacío).

### 4. Celulares (cada voluntario)
1. Instalar **ntfy** (Android: Play Store o F-Droid; iPhone: App Store).
2. Suscribirse al tema `NTFY_TOPIC`.
3. Android: en los ajustes de notificación de ntfy, dar al canal de prioridad *urgente* sonido alto y permitir que interrumpa "No molestar" (no verificado en la documentación de ntfy; probar en cada equipo).
4. iPhone: no hay garantía de que suene con el teléfono en silencio o en un modo de concentración. Probar y, si hace falta, permitir ntfy en el modo de concentración.

### 5. Prueba
Escribir en el grupo un mensaje con una palabra clave. Debe llegar en segundos con título "🚨 EMERGENCIA". Probar con el celular bloqueado, en silencio y con "No molestar" activado, y anotar qué equipos no suenan.

## Riesgos y límites
- **Disponibilidad:** si Vercel, ntfy.sh o internet fallan, no hay alerta. Si ntfy falla, la ruta responde 502 y Telegram reintenta.
- **Falsos negativos del filtro:** un despacho que no contenga ninguna palabra clave no alerta. Empezar sin filtro o con palabras amplias.
- **Privacidad:** ntfy.sh es un servicio externo y el tema largo es lo único que protege las alertas. Si los mensajes traen direcciones o datos sensibles, usar `ALERTA_INCLUIR_TEXTO=0` o un servidor ntfy propio (`NTFY_SERVER`, `NTFY_TOKEN`).
- **Autorización:** confirmar con Comandancia / administradores del grupo que se pueda leer y reenviar ese canal.
