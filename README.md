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
