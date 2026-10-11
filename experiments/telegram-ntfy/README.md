# Laboratorio Telegram y ntfy

**Prueba aislada.** No tiene webhook, credenciales ni conexión a la aplicación Germania, Neon o Vercel. Ejecutar `npm run demo` solo imprime un ejemplo: no envía mensajes.

Se trabaja exclusivamente en `test/telegram-emergencias-villarrica-2022`, bajo `experiments/telegram-ntfy/`.

El prototipo reconoce `B-5`, `B5`, `10-0` y `llamado general`, valida el identificador del grupo y prepara un aviso `PRUEBA - NO EMERGENCIA REAL` con prioridad 5 para ntfy.

Para verificarlo, ejecutar `npm test` y `npm run demo` dentro de esta carpeta.

Antes de conectar el grupo Emergencias Villarrica 2022, se debe comprobar que el bot tiene acceso a los mensajes reales, en particular si vienen de otro bot de Telegram, y configurar el identificador de grupo sin publicar credenciales. Para pruebas en teléfonos, usar un tema de ntfy aislado y únicamente el dispositivo autorizado. En Android habilitar entrega instantánea y revisar restricciones de batería. En iPhone comprobar avisos con bloqueo y modos de concentración. No hay garantía absoluta de sonido 24/7. No sustituye el despacho oficial.

Pendiente: recepción real del bot, deduplicación y registros, extracción de direcciones y pruebas de notificación en teléfono. No integrar a producción sin pruebas explícitas.
