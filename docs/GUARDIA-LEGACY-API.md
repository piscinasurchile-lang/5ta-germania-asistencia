# Guardia — inventario de API heredada

Fecha: 30-09-2026

La interfaz vigente de `public/legacy` no contiene llamadas a `/api/guardia/*`. Sin embargo, estas rutas no se eliminan en esta fase porque implementan un modelo relacional histórico distinto del estado central vigente y pueden contener datos institucionales ya persistidos.

## Tablas detectadas en la API heredada

- `guardia_semanas`
- `guardia_inscripciones`
- `guardia_estado_noche`
- `guardia_obac`
- `guardia_reemplazos`
- `guardia_confirmaciones`
- `guardia_conductores` (referenciada)
- otras tablas específicas pueden existir en las rutas restantes.

## Rutas conservadas

- cambios-periodo
- completar
- conductor
- conductores-autorizados
- confirmacion
- estado-noche
- historico
- inscripcion
- lista-diaria
- obac
- odd-archivo
- orden-dia
- reemplazos
- semanas
- solicitudes-reemplazo

## Motivo para no borrar

Las rutas contienen reglas y datos que no equivalen simplemente al registro actual `guardia:<clave>` de `app_state`: semanas, ventanas de inscripción, asignaciones por Oficialidad, reemplazos, confirmación de cumplimiento, OBAC, conductor y estados de noche.

Por tanto, “no usado por la UI actual” no significa “seguro para borrar”.

## Condición para retiro futuro

Antes de eliminar estas rutas se debe:

1. inventariar las tablas y cantidad de registros existentes en producción;
2. comparar esos registros con la Guardia vigente;
3. migrar o preservar cualquier antecedente institucional no representado en la fuente vigente;
4. comprobar que no existen consumidores externos;
5. ejecutar la matriz de regresión;
6. retirar primero rutas de UI/redirecciones y después, en una migración separada, APIs/tablas que hayan quedado realmente obsoletas.

Hasta entonces se consideran **heredadas, aisladas y protegidas**, no código disponible para nuevas funciones.
