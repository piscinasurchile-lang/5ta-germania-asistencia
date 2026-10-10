export const RESERVA_TITULAR_SQL = String.raw`WITH control AS (
        SELECT
          NOT EXISTS (
            SELECT 1 FROM app_state s
            WHERE s.key LIKE $1 AND s.key <> $2
              AND EXISTS (
                SELECT 1 FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END
                ) AS x(v)
                WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
              )
          ) AS sin_otro,
          NOT EXISTS (
            SELECT 1 FROM app_state s
            WHERE s.key = $4
              AND EXISTS (
                SELECT 1 FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(s.value)='array' THEN s.value ELSE '[]'::jsonb END
                ) AS x(v)
                WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
              )
          ) AS sin_vol
      ),
      reserva AS (
        INSERT INTO app_state(key,value,updated_at,version)
        SELECT $5, jsonb_build_object('id',$6::text,'semana',$7::text,'fecha',$3::text,'en',now()),now(),1
        FROM control WHERE sin_otro AND sin_vol
        ON CONFLICT(key) DO NOTHING RETURNING key
      ),
      inscripcion AS (
        INSERT INTO app_state(key,value,updated_at,version)
        SELECT $2,jsonb_build_array(jsonb_build_object('f',$3::text,'t',now())),now(),1
        FROM reserva
        ON CONFLICT(key) DO UPDATE SET
          value = CASE WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(app_state.value)='array' THEN app_state.value ELSE '[]'::jsonb END
            ) AS x(v)
            WHERE (CASE WHEN jsonb_typeof(x.v)='string' THEN x.v #>> '{}' ELSE x.v->>'f' END) = $3
          ) THEN app_state.value
          ELSE (CASE WHEN jsonb_typeof(app_state.value)='array' THEN app_state.value ELSE '[]'::jsonb END) || EXCLUDED.value END,
          updated_at=now(),version=app_state.version+1
        RETURNING key
      )
      SELECT EXISTS(SELECT 1 FROM reserva) AS reservada,
        EXISTS(SELECT 1 FROM inscripcion) AS guardada,
        (SELECT sin_otro FROM control) AS sin_otro,
        (SELECT sin_vol FROM control) AS sin_vol`;
