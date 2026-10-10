# Auditoría técnica independiente · PR #145 (Guardia nocturna unificada)

- Autor: Claude (revisión cruzada para ChatGPT). Fecha: 2026-10-09.
- Alcance: solo lectura. Commit auditado: `a387248` (rama `feat/guardias-unificadas-20261009`), contra `main` en `d830766`.
- No se modificó producción, Neon ni Vercel. No se fusionó el PR.
- Convención: **comprobado** = leído o ejecutado; **inferido** = deducido del código; **no verificado** = fuera de alcance.

## Qué contiene realmente (comprobado)
7 archivos, +204 líneas: `lib/guardia-reglas.mjs`, `lib/guardia-acceso.mjs`, `app/api/guardia/reserva/route.js` (POST siempre 503), 4 líneas en `app/api/guardia/inscripcion/route.js`, 2 archivos de pruebas y un workflow de CI.
No toca pantalla, nómina, ODD ni Neon. Pruebas: 67/67 en ejecución local (47 de main + 20 nuevas); CI en verde.

## A. Hallazgos críticos
1. **Reintroduce la ficha de OBAC eliminada en main (#140/#142).** `obacProvisional` solo considera inscritos con función `"obac"`; `evaluarInscripcion` exige `habilitadosObac` y un solo OBAC inscrito por noche. La regla confirmada es: OBAC = inscrito de mayor precedencia entre todos los voluntarios.
   Demostración: noche con Teniente 3° y dos voluntarios inscritos como voluntarios y el Capitán como maquinista → PR: `obacProvisional = null`, `guardiaCompleta = false`; main (`GermaniaObac.obacDeNoche`): OBAC = Teniente 3°.
2. **La exclusividad del maquinista no está implementada.** `POST /reserva` siempre responde 503; no hay índice único ni migración; el comentario menciona un «UPSERT» inexistente; el `GET` lee `guardia-conductor:<fecha>`, clave que nadie escribe, y por eso siempre devuelve `ocupado:false`.
   Con dos solicitudes simultáneas sobre la misma lectura, las reglas devuelven DISPONIBLE a ambas (comprobado).
3. **La protección de identidad está en un endpoint que la app no usa.** No hay llamadas a `/api/guardia/inscripcion` en la app; la pantalla escribe en `/api/state/guardia-*`, que valida solo el origen. `GUARDIA_INSCRIPCION_LEGACY_BLOQUEADA` no protege nada real y `identidadInscripcionVerificada` no se usa y compara dos valores enviados por el cliente. (Seguridad: responsable externo; solo observación.)
4. **Tercer sistema de inscripciones en paralelo** (tabla SQL antigua sin uso en pantalla + claves `guardia-inscripcion:`/`guardia-maq:` + modelo del PR).

## B. Errores encontrados
- Semana miércoles–martes sin validar: fecha de 2027 sin semana abierta → DISPONIBLE. `INICIO_GUARDIA` y `RETIRO_DESDE` exportadas pero sin uso.
- Mínimo de 2 noches ausente en las reglas (sí existe en la pantalla).
- Capitán: solo se excluye de candidatos a OBAC; falta el respaldo (sin maquinista → Capitán maquinista y el siguiente en precedencia es OBAC).
- Precedencia: reglas esperan lista de ids; main guarda `precedencia:v1` con cargo y nombre. Sin adaptador, sin manejo de voluntarios sin posición ni empates.
- `reserva/route.js` importa `neon`, `ensureSchema`, `evaluarInscripcion` sin usarlos.
- CI: en PR solo corre si cambian `lib/guardia-reglas.mjs`, `tests/**` o el workflow; no corre `npm run build`.

## C. Funcionalidades existentes a reutilizar
- Identificación: `miVoluntario` del dispositivo + ficha de la nómina (el PR no agrega pantallas de identificación: correcto).
- Maquinistas: `conductor === true` y activo (`esMaquinista` en la API antigua y en `germania-roles.js`).
- OBAC: `public/legacy/germania-obac.js` (`GermaniaObac.obacDeNoche`) como única fuente de verdad.
- Plan semanal: `guardia-plan:<inicio>` con `cierre` (fijado por el Teniente 3°), Revisión y Reemplazos con correcciones manuales.
- Registro de cambios: `app_state_history` (trigger sobre `guardia-*`).
- Concurrencia: `ifVersion` de `writeState` y el patrón de bloqueo + transacción del endpoint antiguo.

## D. Correcciones recomendadas
1. Mantener el PR en borrador; no fusionar tal como está.
2. Quitar la función `obac`, `habilitadosObac` y `obacProvisional`; usar `GermaniaObac`.
3. Reducir el PR a una sola pieza: exclusividad del maquinista por noche, validada en servidor (clave `guardia-conductor:<fecha>` creada solo si no existe —verificar semántica de `writeState`— o bloqueo transaccional). Mensaje: «OCUPADO. ELIGE OTRO DÍA».
4. Validar en servidor: nómina activa + `conductor === true`; fecha dentro del plan (miércoles–martes); plazo según `cierre` del plan.
5. Cambios de pantalla en `germania-roles.js` en PR aparte, coordinados con ChatGPT (hoy la pantalla permite titular + reserva de maquinista).
6. Separar reglas, interfaz y seguridad en PR distintos.

## E. Pruebas adicionales
Concurrencia real (dos reservas paralelas sobre PGlite, una sola exitosa); semana miércoles–martes; mínimo 2 noches; retiro desde 06:00; Capitán maquinista inscrito y Capitán de respaldo; precedencia desde `precedencia:v1` real (sin posición y empates); compatibilidad con `guardia-inscripcion:`, `guardia-maq:`, `guardia-revision:` e historial; lectura de ocupación tras escribir; pruebas de pantalla en móvil, tablet B-5 y PC.

## F. Riesgos para los voluntarios
- Fusionar hoy (inferido): daño inmediato bajo (endpoint bloqueado, sin cambios de pantalla); el riesgo aparece al conectarlo (vuelve la ficha OBAC; falsa sensación de seguridad).
- En main hoy (comprobado, ajeno al PR): pueden quedar dos maquinistas el mismo día (titular + reserva); las escrituras a `/api/state` solo validan el origen.
- Observación sobre #144 ya integrado (inferido, no probado): su documento dice «no desplegar hasta cerrar bloqueantes»; si un oficial edita antecedentes médicos sin la cookie `quinta_oficialidad`, el servidor podría descartarlos sin avisar. Revisar con el responsable de seguridad.

## G. Veredicto: NO APROBADO para integrar
Contradice la regla de OBAC vigente, no resuelve la concurrencia y protege un endpoint sin uso. El CI verde solo prueba que las reglas hacen lo escrito, no que sean las correctas.

No verificado: producción, Neon real, cookie de oficialidad, dispositivos reales.
Decisión pendiente del usuario: con «solo un maquinista por noche», ¿se elimina la figura de «reserva» o la reserva sigue y solo el titular queda bloqueado?
