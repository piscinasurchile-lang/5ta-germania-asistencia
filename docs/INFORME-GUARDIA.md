# Informe de la guardia (oficial a cargo)

Está en la pestaña **Guardia**, arriba. Sirve para ver qué pasa en la semana **antes de decidir y de generar la ODD**. **Solo informa: no bloquea nada.**

## Quién lo ve
Quienes ocupan hoy el cargo de **Capitán** o de **Teniente Tercero** (se identifica con «Mi voluntario»). Los cargos se leen de la nómina, así que cuando cambian con la ODD de enero (Oficiales → Oficialidad) el informe cambia de dueño solo, sin tocar el programa.
Quien no tiene ese cargo ve que es reservado y quiénes son los titulares actuales.

> **Límite actual:** esto es una regla de pantalla. Mientras la API no exija clave de acceso (cambio de seguridad #101) ni permisos por cargo en el servidor, los datos siguen siendo legibles por quien conozca la dirección.

## Qué muestra (semana de miércoles a martes)
- **Semáforo por noche:** inscritos, OBAC, conductor y total.
  - *En regla:* 6 o más. *Bajo la meta:* 5. *Revisar:* menos de 5, o sin OBAC, o sin conductor, o sin inscritos.
  - Referencia: mínimo 5 (OBAC, conductor y 3 bomberos, según la ODD) y meta 6.
  - Si la noche aún no está registrada, se muestra una **proyección** (inscritos + el OBAC por asignar).
- **Avisos:** noches sin conductor / sin OBAC / con poca dotación; conductor asignado que no figura como autorizado; guardianes en estado «desde su casa» (la guardia es solo presencial).
- **Voluntarios:** quiénes no se inscribieron y quiénes tienen una sola noche.
- **Conductores autorizados:** noches inscritas y asignadas de cada uno.
- **Para completar:** por noche, quiénes podrían sumarse (los que **menos noches efectivas** hicieron en las últimas 8 semanas; una noche efectiva es quedarse o entrar de reemplazo), conductores y OBAC posibles (los que menos veces lo han sido).
- **Cambios y retiros de la semana:** quién sale, motivo, quién entra y cuándo se registró.
- **Copiar resumen:** texto listo para pegar en el grupo de oficiales.

## De dónde salen los datos
Inscripciones (`guardia-inscripcion:*`), guardias registradas (`guardia:*`), períodos (`guardia-plan:*`) y la nómina. No escribe nada.

## Pendiente
- Conectar el botón «Generar ODD» (la ODD de Guardia aún lee el modelo antiguo de la API).
- La semana interactiva de inscripción en la pantalla Voluntarios y las alertas de cambio.
- Permisos por cargo en el servidor.
