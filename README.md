# GERMANIA · Quinta Compañía

Sistema institucional de la Quinta Compañía Germania de Villarrica.

## Arquitectura vigente

- `app/page.js`: entrada única de la aplicación.
- `public/legacy/index.html` + `public/legacy/app.js`: interfaz operativa vigente mientras se completa la consolidación modular.
- `app/api/state/[key]`: persistencia central institucional (fuente de verdad).
- `app/api/auth`: acceso y permisos.
- `app/api/guardia/*`: API histórica de Guardia. Se conserva hasta terminar auditoría de dependencias; no debe usarse para crear una segunda interfaz.
- `app/guardia/*`: rutas antiguas aisladas/redirigidas. No son una segunda aplicación.
- `app/odd-maestras`: módulo existente; no se modifica durante la limpieza de Guardia.

## Reglas de arquitectura

1. Una sola experiencia GERMANIA y una sola navegación.
2. Una implementación vigente por módulo; no crear raíces paralelas.
3. La base central es la única fuente oficial. El almacenamiento local no es persistencia institucional.
4. Los cambios estructurales se hacen en rama, se compilan y se prueban antes de integrar a `main`.
5. Código antiguo: primero aislar y verificar dependencias; eliminar sólo cuando esté demostrado que no es usado.
6. Los módulos comparten identidad, permisos, navegación y persistencia central.
7. Novedades se incorporará como módulo de Oficialidad sobre esta arquitectura, no como aplicación paralela.
8. GERMANIA Bridge es un proyecto independiente y sólo se conectará mediante una interfaz/API controlada.

## Módulos objetivo

```text
GERMANIA
├── Acceso / usuarios / permisos
├── Voluntario
├── Oficialidad
│   ├── Guardia
│   ├── ODD
│   ├── Novedades
│   ├── Asistencia
│   ├── Partes
│   ├── Cursos
│   └── Hoja de vida
├── Administración
├── Dashboard / estadísticas
├── Terminal B-5
├── API
└── Base central
```

GERMANIA es independiente de ARVIKO, Inventario y GERMANIA Bridge.


## Regla Maestra — Papelería Institucional GERMANIA

Documento patrón visual oficial: **ODD 017/2026 CÍTESE A EJERCICIO**, original aportado por el Administrador.

1. GERMANIA usa una sola familia de papelería institucional. ODD, PAS, partes, informes, nóminas y demás documentos deben heredar una plantilla canónica común; no se permiten diseños independientes por módulo.
2. Son invariantes: emblema oficial **FEUERWEHR 5 · 2025 · VILLARRICA**, franjas negro/rojo/dorado, relación proporcional entre emblema, franjas y ancho útil, márgenes, jerarquía tipográfica, encabezado, pie y reglas de paginación. El emblema conserva siempre su relación de aspecto.
3. El contenido central es variable según el tipo de documento. Cambia la información y su estructura funcional; no cambia la identidad institucional de la hoja.
4. Las proporciones se calculan sobre el ancho/alto útil del papel. Carta y Oficio se componen de forma independiente manteniendo las mismas relaciones visuales; está prohibido obtener Oficio estirando o escalando un PDF Carta.
5. En documentos multipágina, la primera hoja usa la presentación institucional completa. Las siguientes conservan identidad institucional, identificación del documento y `Página X de Y`, evitando desperdiciar espacio.
6. No se cortan entre páginas filas, bloques críticos ni el bloque final de firmas/cargos/timbres. Si el bloque final no cabe completo, pasa íntegro a la página siguiente.
7. Está prohibido inventar, sustituir o usar escudos, firmas, timbres o elementos gráficos genéricos. Si falta un activo oficial, ese elemento no se genera hasta disponer del original.
8. Firmas reales y timbres son **activos documentales protegidos**. No se guardan en `/public`, no se entregan al navegador y no aparecen en perfiles, edición, previsualización normal ni UI de Voluntario/Oficialidad. El servidor los incorpora únicamente al PDF institucional autorizado.
9. El acceso directo a activos de firma/timbre debe ser rechazado por servidor incluso si un usuario conoce o adivina su identificador. La sustitución de esos activos queda reservada al Administrador principal autorizado y debe dejar trazabilidad de autor, fecha y vigencia.
10. Un PDF ya emitido conserva su snapshot documental e histórico. Un cambio posterior de autoridad, firma o timbre no modifica documentos ya emitidos.
11. Toda nueva plantilla documental debe reutilizar el generador/plantilla canónica de papelería; una implementación futura no puede reinterpretar esta regla.

### Regla de aceptación documental

Un documento GERMANIA no se considera terminado si no coincide con el patrón institucional en identidad y proporciones, no imprime correctamente en el papel seleccionado, presenta cortes incorrectos, expone activos protegidos o utiliza recursos que no sean oficiales de la Quinta Compañía Germania Villarrica.
