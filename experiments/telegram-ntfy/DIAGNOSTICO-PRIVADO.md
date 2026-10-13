# Diagnóstico privado del bot (solo lectura)

Alcance: laboratorio aislado. **No integra Germania** (no usa ni modifica `/api/telegram/webhook` ni ninguna ruta de la app) y **no cambia Telegram**: no `setWebhook`, no `deleteWebhook`, no mensajes, no BotFather, no miembros.

## 1. Ejecutar en privado

Requisitos: Node 20.6 o superior (por `--env-file`). No se necesita `npm install`.

1. Entrar a la carpeta `experiments/telegram-ntfy` de la rama `test/telegram-bot-ntfy-20261013`.
2. Copiar `.env.example` a `.env` (está en `.gitignore`) y abrirlo en un editor local.
3. Completar solo `TELEGRAM_BOT_TOKEN` (BotFather → `/mybots` → `@Alerta5taVillarrica_bot` → API Token). No escribirlo en la terminal ni en chats; no capturar la pantalla. Dejar vacíos `TELEGRAM_CHAT_ID`, `NTFY_TOPIC`, `TELEGRAM_API_ID` y `TELEGRAM_API_HASH`.
4. Ejecutar `npm run bot:check` (primera pasada: identidad y webhook).
5. Obtener el ID candidato del grupo desde Telegram Web (número `-100…` al final de la dirección). **Es solo un candidato**: no se da por válido hasta que `getChat` lo confirme.
6. Pegarlo en `TELEGRAM_CHAT_ID` y repetir `npm run bot:check` (segunda pasada: getChat y getChatMember).
7. Antes de cualquier commit, comprobar con `git status` que `.env` no aparece.

La salida no contiene el token. Del webhook solo muestra el **hostname**. El ID del grupo no es una credencial, pero conviene tratarlo como privado.

## 2. Qué comprueba y qué no

| Comprobado por el diagnóstico | NO comprueba |
| --- | --- |
| El token pertenece a `@Alerta5taVillarrica_bot` (getMe). | Que el bot reciba mensajes reales. |
| Si hay webhook, su hostname, las actualizaciones pendientes y si hubo error de entrega (getWebhookInfo). | Quién administra ese receptor. |
| El ID existe, coincide con lo configurado y con el título "Despachos Villarrica 2023" (getChat). | Que quien publica los despachos no sea un bot. |
| El bot es miembro del grupo (getChatMember). | Que la alarma llegue al teléfono. |

Pruebas locales (sin red ni token): `npm test` → 78/78. Cubren que solo se consultan getMe, getWebhookInfo, getChat y getChatMember, y que la salida nunca incluye token, ruta ni parámetros del webhook.

## 3. getUpdates: qué consulta y cuándo consume

Fuente oficial: https://core.telegram.org/bots/api (sección getUpdates; leída el 13-oct-2026).

**Documentado**
- Consulta la cola de actualizaciones que Telegram guarda para el bot y aún no ha entregado. `limit`: 1–100 (por defecto 100). `timeout`: segundos de espera larga; 0 = consulta corta.
- Una actualización queda **confirmada** "tan pronto como se llama a getUpdates con un `offset` mayor que su `update_id`", y entonces **todas las anteriores se olvidan** (se consumen).
- Un `offset` negativo devuelve desde el final de la cola y también olvida todo lo anterior. **No usarlo.**
- Las actualizaciones se guardan hasta ser recibidas, pero no más de 24 horas.
- **No funciona si hay un webhook configurado.**
- `allowed_updates`: si se omite, se usa el ajuste anterior. Por eso no se debe enviar este parámetro (podría cambiar la configuración del bot).

**Inferido de lo anterior (no probado)**
- Una llamada sin `offset` devuelve las pendientes sin confirmarlas.

**Conocimiento general, no verificado en la documentación ni en nuestro bot**
- Si otro proceso ya consulta el mismo bot con getUpdates, una segunda consulta simultánea produce un error 409 y puede cortar la espera del otro lector. Por eso no se hace ni una consulta de prueba a ciegas.

## 4. Comunicación entre bots

Fuente oficial: https://core.telegram.org/api/bots/bot-to-bot

**Documentado**
- Fuera de los contextos que describe, los bots normalmente no reciben mensajes de otros bots.
- En un grupo, un bot recibe el mensaje de otro bot si trae un comando dirigido a él o si responde a un mensaje suyo.
- Sin mención ni respuesta, el bot receptor debe ser **administrador** del grupo **y** tener la privacidad de grupo desactivada en BotFather. Además, en grupos al menos uno de los dos bots debe tener activado el "Bot-to-Bot Communication Mode".

**Comprobado en nuestro grupo**
- La privacidad de `@Alerta5taVillarrica_bot` quedó en DISABLED (mensaje de BotFather del 9-oct) y el bot fue agregado al grupo (aviso visible en el chat). Su rol de administrador no está comprobado y se dijo que no hace falta.
- Que quien publica los despachos no es un bot es una **afirmación del usuario**, sin verificar con la herramienta.
- No se ha observado ninguna entrega real de un despacho al bot.

## 5. Siguiente paso según el resultado

Nada de esto se activa sin autorización.

**A. No hay webhook**
- El receptor experimental sería un proceso local con getUpdates como único lector, con las reglas de la sección 3: sin `offset` negativo, sin `allowed_updates`, y confirmando el `offset` solo después de que ntfy acepte el aviso (o el mensaje se descarte por el filtro).
- Cada actualización pasa a `crearRelayBot().recibir(update)` (ya existe y está probado) y de ahí a un tema privado `germania-test-…`, al que solo se suscribe el teléfono del usuario. `DRY_RUN=1` por defecto.
- El lector ya está preparado y probado con simulaciones (`src/bot-reader.mjs`, ver `PROPUESTA-SERVICIO-OPERATIVO.md`), pero **no se ha ejecutado contra Telegram** y necesita autorización explícita antes de usar getUpdates. Para funcionar 24/7 requiere un equipo encendido, no Vercel.
- Supuesto sin verificar: que nadie más lea este bot. El bot es de reciente creación y el token estaría solo con el usuario.

**B. Hay webhook**
- getUpdates no es posible mientras exista. Con el hostname se identifica el receptor:
  - Si es el dominio de Germania, es la ruta histórica: no se toca ni se reutiliza, y leer desde ahí significaría reemplazar el webhook, que está fuera de alcance. Se detiene el trabajo y se decide.
  - Si es otro servidor propio, la opción sin tocar Telegram es pedir al dueño del receptor que reenvíe una copia de las actualizaciones al relay.
  - Si es un host desconocido, no se toca; primero se averigua quién lo configuró.
- Un `pending_update_count` que crece junto con un error reciente indica que el receptor actual está fallando.

**C. Los despachos los publica un bot**
- Aplica la limitación documentada de la sección 4. Revertirla exige cambios del dueño del grupo (administrador del bot) y de BotFather, fuera de alcance.
