# ADR 0009 · OBAC automático por precedencia (propuesta)
- **Estado:** Propuesto. Solo documento: no cambia código, datos, ODD ni seguridad. Pendiente de revisión independiente (ChatGPT) y autorización del usuario.
- **Fecha / origen:** 09-10-2026, decisión de la Oficialidad comunicada por Christian Vergara (517).
- **Contexto:** hoy el OBAC se postula con una ficha propia (`guardia-obac:*`, pestaña «OBAC» en `germania-roles.js`) y luego se ajusta a mano. La Compañía decidió que esa ficha no tiene sentido.
- **Regla decidida (por el usuario):**
  1. Todos los voluntarios se inscriben por noche como voluntarios (mínimo 2 noches; pueden marcar más).
  2. Nadie envía ficha de inscripción de OBAC.
  3. Al cerrar la inscripción, el OBAC de cada noche es el inscrito con **mayor precedencia** esa noche (lista `precedencia:v1`). Si se inscribió un oficial, será el de mayor rango; si no hay ninguno, el voluntario de mayor precedencia.
  4. **Cada noche se calcula de forma independiente.** No hay límite de noches como OBAC: quien tenga la precedencia más alta en tres noches es OBAC tres noches; si otra noche se inscribe alguien con más precedencia, pasa a ser voluntario esa noche.
- **Por confirmar (no asumidas):** (a) si el maquinista de mayor precedencia puede ser OBAC y maquinista a la vez; (b) si se mantiene el ajuste manual antes de generar la ODD; (c) qué ocurre con empates o precedencia faltante.
- **Propuesta técnica:** función pura `obacDeNoche(inscritos, precedencia)` (testeable, sin escrituras) usada por la pantalla de guardia; mostrar el OBAC calculado en el planificador; ocultar la ficha/pestaña OBAC sin borrar registros históricos `guardia-obac:*` en Neon.
- **Contratos a preservar:** la ODD (congelada) lee el OBAC desde lo guardado; el cálculo debe producir el mismo formato para no modificar la ODD. Afecta además estadísticas (`reg.oficial`), noches mínimas (las noches de OBAC ya cuentan), dotación mínima (`GN_DOTACION_MIN.obac`), avisos y textos de ayuda.
- **Riesgos:** precedencia desactualizada o incompleta (un voluntario sin posición); inscripciones tardías que cambian el OBAC ya calculado; edición simultánea de `app.js`/`germania-roles.js` (alto riesgo, coordinar con ChatGPT).
- **Pruebas futuras:** unitarias de `obacDeNoche` (oficial vs. solo voluntarios, empates, noche sin inscritos, cambio de OBAC entre noches), regresión de la ODD y de Informes, Android/iPhone/PC/tablet B-5.
- **No incluye:** seguridad/roles de acceso, ODD, borrado de datos.
