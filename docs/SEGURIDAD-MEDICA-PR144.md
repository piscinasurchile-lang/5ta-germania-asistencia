# Seguridad médica — auditoría de bloqueo de producción (PR #144)

## Regla aprobada
Solo oficiales y administrador pueden consultar, editar o exportar antecedentes médicos. El control debe verificarse en el servidor, no solo ocultando botones.

## Hallazgos verificados en código (2026-10-09)
1. `GET /api/state/roster:v8` devuelve el JSON completo de la nómina sin comprobar sesión de oficialidad. Si el JSON contiene `grupoSanguineo`, `alergias`, `alergiasMedicamentos`, `condicionesMedicas` o `medicacionHabitual`, un usuario no autorizado puede leerlos. **Bloqueante**.
2. `PUT /api/state/roster:v8` comprueba origen, pero no sesión de oficialidad; el origen no identifica al usuario. **Bloqueante**.
3. La UI `public/legacy/app.js` escribe campos `data-hv` mediante `saveRoster()` al estado general. **Bloqueante**.
4. `POST /api/auth/officiality` entrega cookie HttpOnly `quinta_oficialidad`, pero el endpoint genérico de estado no la valida. La cookie es una base aprovechable, no una autorización efectiva en ese endpoint.
5. `app_state_history` conserva versiones anteriores de `roster`, potencialmente con datos médicos. La migración debe contemplar esas copias y su retención sin destruir registros institucionales.

## Implementación necesaria antes de producción
1. Crear almacenamiento médico separado, con acceso exclusivo a través de rutas que validen en servidor la sesión de oficialidad; negar acceso por defecto (401/403). Definir cómo se identifica y revoca el administrador y cada oficial.
2. Realizar migración **no destructiva** de datos médicos existentes, con copia de respaldo, comparación por ID de voluntario y verificación de integridad antes de retirar campos médicos del JSON público.
3. Proteger todas las lecturas y escrituras: `GET/PUT/PATCH` del estado genérico no deben revelar ni aceptar datos médicos, incluso en cargas antiguas, conflictos de versión o respuestas de error.
4. Evitar que las copias históricas del roster queden accesibles por rutas públicas. Revisar retención y acceso a `app_state_history` antes de cualquier limpieza; no borrar historia sin aprobación.
5. El PDF médico debe obtener la información por la ruta autorizada. El PDF de traslado no debe incluir datos médicos por defecto.
6. Pruebas: sin sesión → 401; voluntario → 403; oficial/admin → 200; sesión caducada → 401; GET del roster general sin campos médicos; PUT con campos médicos rechazado o depurado sin pérdida; migración reversible; PDF sin filtraciones; pruebas en preview.

## Estado
Auditoría documentada, **no** significa que la separación de datos ni los permisos estén implementados. No desplegar PR #144 a producción hasta cerrar los bloqueantes. La función de eliminación de voluntarios se mantiene sin cambios por instrucción del usuario.
