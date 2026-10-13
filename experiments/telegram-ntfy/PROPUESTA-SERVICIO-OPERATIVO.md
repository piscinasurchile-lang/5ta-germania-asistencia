# Propuesta de servicio operativo (referencia — SIN ACTIVAR)

**Estado: lector DETENIDO. `getUpdates` no autorizado. No se contrata ni configura ningún servidor.** Propuesta y código preparado con pruebas simuladas. **Nada se ha ejecutado contra Telegram.** No integra Germania, no cambia Telegram, no envía avisos periódicos. Depende del resultado de `DIAGNOSTICO-PRIVADO.md`.

## 1. Diagnóstico local vs servicio operativo

| | Diagnóstico local | Servicio operativo |
| --- | --- | --- |
| Dónde | Tu computador, una sola vez | Un equipo siempre encendido que no es tu computador |
| Qué hace | `getMe`, `getWebhookInfo`, `getChat`, `getChatMember` | Lee con `getUpdates` y avisa a ntfy |
| Consume actualizaciones | No | **Sí**, también con `DRY_RUN=1` (ver sección 2b) |
| Estado | Listo para ejecutar | Preparado, **no autorizado ni ejecutado** |

## 2. Lector preparado (rama experimental)

- `src/bot-reader.mjs`: bucle de lectura. Usa solo `getWebhookInfo` (al arrancar) y `getUpdates`, con `timeout`, `limit` y `offset`. Nunca usa offset negativo ni `allowed_updates`.
- `src/estado-lector.mjs`: estado en disco (`.telegram-relay-state.json`), escritura atómica con permisos 0600. Un archivo corrupto se aparta como `.corrupto-*` y se parte de cero.
- `src/bot-reader-cli.mjs` (`npm run reader`): exige el argumento `--autorizado-getupdates` **y** `AUTORIZO_GETUPDATES=SI_LO_AUTORIZO`. Sin ambos termina sin llamar a Telegram.
- Comprobado con pruebas simuladas (sin red, sin token): el offset solo avanza después de que el relay entrega; reintentos con espera creciente (1 s, 2 s, 4 s… con tope); 429 respeta `retry_after`; cortes de red y 5xx se reintentan sin filtrar el token; con webhook o con 409 se detiene sin reintentar; recuperación tras reinicio sin repetir ni perder; mensajes de más de 7 minutos no suenan pero el avance continúa. Además se rompió el código a propósito en 6 puntos y las pruebas lo detectaron.
- Garantía: **al menos una vez**. Un corte justo entre la aceptación de ntfy y el guardado en disco puede repetir un aviso; nunca lo pierde.
- **No comprobado:** comportamiento con el Telegram real, con un despacho real, ni la entrega al teléfono.

## 2b. Qué hace y qué no hace `DRY_RUN`

| | `DRY_RUN=1` (por defecto) | `DRY_RUN=0` |
| --- | --- | --- |
| Publica en ntfy | **No** | Sí, solo a un tema `germania-test-…` y con aviso rotulado de PRUEBA |
| Llama a `getUpdates` | **Sí** | Sí |
| Confirma/consume actualizaciones de Telegram | **Sí** | Sí |
| Avanza y guarda el offset | **Sí** | Sí |

`DRY_RUN` solo controla la publicación en ntfy. Con `DRY_RUN=1` Telegram igualmente olvida las actualizaciones ya confirmadas, y no se pueden recuperar. Por eso el lector exige autorización explícita incluso en simulación.

## 2c. Tema ntfy difícil de adivinar vs. tema protegido con autenticación

**No son equivalentes.**

| | Nombre difícil de adivinar | Protegido con autenticación |
| --- | --- | --- |
| Qué protege | Solo que nadie lo conozca | Quién puede leer y quién puede publicar, con usuario o token |
| Si alguien lo averigua (captura, registro, `.env` filtrado, historial) | Puede **leer** los avisos y también **publicar avisos falsos** | Sin credenciales no puede, aunque conozca el nombre |
| Cómo se corrige un filtrado | Cambiar el tema y volver a suscribir todos los teléfonos | Revocar el token o usuario |
| Qué dice la documentación de ntfy | "Como no hay registro, el tema es esencialmente una contraseña, así que elige algo que no sea fácil de adivinar" | El servidor es abierto por defecto ("todos pueden leer y escribir en cualquier tema"); el control de acceso es opcional, con usuarios, permisos y tokens, y `auth-default-access: deny-all` para instancias privadas |

Fuentes (leídas el 13-oct-2026): https://docs.ntfy.sh/publish/ y https://docs.ntfy.sh/config/

- **Verificado:** lo anterior, según esas páginas.
- **No verificado:** cómo se aplica la protección con autenticación en el servidor público ntfy.sh. La documentación menciona planes que permiten reservar temas, pero no pude leer los detalles. Los comandos de usuarios, permisos y tokens se ejecutan en el servidor, es decir, en un servidor ntfy propio.
- **Para las pruebas con avisos rotulados de PRUEBA:** un nombre largo y aleatorio es un riesgo aceptable, porque el peor caso es leer o falsificar avisos de prueba.
- **Antes de cualquier aviso con datos reales** (direcciones de despachos) hay que decidir entre un tema con autenticación o un servidor ntfy propio. Un nombre difícil de adivinar no basta para eso. No está decidido.

## 3. Única solución recomendada (si el diagnóstico confirma que NO hay webhook)

**Un servidor virtual (VPS) pequeño con Linux, administrado por ti, ejecutando un solo lector bajo `systemd`, que avisa a un tema privado de ntfy suscrito solo a tu Android.**

Por qué: funciona 24/7 sin tu computador, solo hace conexiones salientes (no abre puertos), se reinicia solo y el token queda en un único lugar. Costos y proveedor: no verificados.

Reglas que no se cambian: un solo lector por bot (dos copias se pisan), sin Vercel ni Germania, sin avisos periódicos.

## 4. Pasos concretos (cada uno con tu autorización)

1. Ejecutar el diagnóstico local y confirmar **sin webhook**, bot miembro del grupo y ID válido con `getChat`.
2. **Autorizar por escrito** el uso de `getUpdates` por un único lector.
3. Crear el VPS (Linux, solo acceso con llave SSH) y un usuario sin privilegios para el lector. Instalar Node 20.6 o superior.
4. Copiar la rama `test/telegram-bot-ntfy-20261013` y crear `.env` **en el servidor** (permisos 600) con `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NTFY_TOPIC` (`germania-test-` + más de 20 caracteres aleatorios), `DRY_RUN=1` y `AUTORIZO_GETUPDATES=SI_LO_AUTORIZO`. El token no pasa por chats.
5. Ejecutarlo como servicio `systemd` con reinicio automático y el estado en un directorio persistente.
6. Mirar los registros uno o dos días con `DRY_RUN=1` (ahí se confirma si el bot recibe los despachos reales). Los registros no incluyen el texto del despacho, el token ni el tema.
7. En tu Android: instalar **ntfy** y suscribirte al tema. Activar la entrega instantánea (con la versión de Google Play); en el canal de prioridad urgente, activar "anular No molestar" y elegir un sonido. Excluir ntfy del ahorro de batería (según el fabricante, no verificado).
8. Cambiar a `DRY_RUN=0` y comprobar que llega el aviso de PRUEBA al teléfono.

## 5. Límites y decisión pendiente

- Hoy el laboratorio **solo emite avisos rotulados "PRUEBA GERMANIA - NO EMERGENCIA REAL / NO ACUDIR"** y rechaza cualquier tema que no sea `germania-test-…`. Que el teléfono reciba el despacho como aviso real exige un cambio deliberado de ese rotulado y de esa protección. **No está hecho** y requiere tu decisión.
- Un tema difícil de adivinar no es un tema protegido: ver la sección 2c. Que el aviso llegue únicamente a tu teléfono con garantías exige autenticación, no solo un nombre secreto.
- ntfy: la documentación no describe repetición hasta confirmar la lectura.
- Es un aviso adicional. No reemplaza el llamado oficial.
- Si el diagnóstico encuentra un webhook, `getUpdates` no es posible y este plan cambia (ver `DIAGNOSTICO-PRIVADO.md`, sección 5).
