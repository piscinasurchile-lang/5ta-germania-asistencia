# Contrato de integración — Domingo en la Quinta

**Estado:** propuesta de interfaz, no aprobada para producción.

## Identidad (responsable externo, ADR 0003)
El cliente NO debe enviar `voluntarioId` como autoridad. El servidor debe derivar el identificador de una sesión autenticada y verificada, implementada por el responsable designado. No modificar PIN, cookies, roles ni sesiones actuales en esta rama.

## Endpoints previstos
- `GET /api/domingo-quinta`: fecha y resumen agregado, sin nombres ni preferencias individuales.
- `GET /api/domingo-quinta/mi-inscripcion`: requiere identidad verificada; devuelve exclusivamente la inscripción del solicitante.
- `PUT /api/domingo-quinta/mi-inscripcion`: requiere identidad verificada; acepta turnos 1–3, comida sí/no/quizás, ayuda en cocina. Identificador derivado en servidor; validación de origen, CSRF y ventana de apertura.
- `GET /api/domingo-quinta/oficiales`: requiere permiso verificado de oficial, entrega nómina nominal para coordinación del Teniente Segundo.
- `GET /api/domingo-quinta/avisos`: requiere identidad verificada; indica convocatoria pendiente por voluntario.
- `POST /api/domingo-quinta/avisos/leer`: requiere identidad verificada; confirma lectura del anuncio. Idempotente.

## Datos y migraciones
Crear migración revisada por responsable de datos, con índices de unicidad (domingo, voluntario), versiones y registro de lecturas. Prohibir DDL en cada solicitud. No asociar las inscripciones a asistencias realizadas.

## UI
- La encuesta es parte del domingo de la semana miércoles–martes.
- El usuario elige turnos y comida, revisa, guarda y puede editar antes del cierre.
- Confirmación solo después de respuesta positiva del servidor.
- El punto rojo de Inicio depende exclusivamente de avisos pendientes consultados al servidor. El badge del icono Android depende de notificaciones push, permisos y soporte del dispositivo.
- En caso de caída de red, indicar que no se guardó, sin simular confirmación.

## Puesta en marcha
No fusionar PR #206 mientras el POST permita identificación por un campo editable o mientras falten identidad, migración, pruebas de integración y revisión. El endpoint de escritura permanece temporalmente bloqueado.

## Decisión del administrador (17-10-2026)
Para esta actividad, la identificación será por selección de nombre y apellido desde la nómina existente de Germania, sin solicitar PIN ni contraseña adicional. La compañía aplica responsabilidad disciplinaria por suplantación. Registrar fecha/hora de cambios y evitar duplicados. La identificación por nombre no demuestra quién realizó el cambio; conservar esta limitación explícita y no declarar identidad verificada. No modificar autenticación general ni reglas de otros módulos.
