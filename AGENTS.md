# AGENTS.md · Reglas compartidas de GERMANIA

Aplicable a ChatGPT, Claude y otros agentes que trabajen en este repositorio. Leer primero `ARCHITECTURE.md`, `README.md`, `docs/CRITERIO-OPERATIVO.md`, `docs/ESPECIFICACION-REDISENO-Y-GUARDIA.md` y los ADR relevantes.

## Misión
GERMANIA es una aplicación operativa para bomberos. Priorizar claridad, velocidad, integridad de datos y seguridad operativa sobre decoración.

## Límites obligatorios
1. No borrar voluntarios ni registros reales; ante discrepancias de nómina, investigar y comunicar.
2. No cambiar colores institucionales, disponibilidad dinámica, asistencia, emergencia u ODD sin autorización expresa.
3. No modificar ODD Maestras ni sus fuentes sin decisión arquitectónica aceptada y autorización.
4. No tocar Neon, Vercel, secretos ni producción sin autorización explícita y verificación de impacto.
5. **Seguridad delegada:** no modificar PIN, sesiones, autenticación, roles, permisos o datos personales por iniciativa propia. Consultar `docs/REGISTRO-RIESGOS-SEGURIDAD.md`; el responsable externo revisará esos asuntos. No dar por corregidos sus hallazgos.
6. Conservar comportamiento de Android, iPhone, Windows y tablet B-5; cambios exclusivos B-5 deben quedar aislados.
7. No crear otra aplicación ni duplicar modelos de Guardia. No borrar tablas históricas sin inventario.
8. Mantener controles táctiles operativos de al menos 44 px, textos legibles y separación segura, según `docs/CRITERIO-OPERATIVO.md`.

## Procedimiento
- Revisar `main` vigente y leer archivos/dependencias antes de proponer cambios.
- Identificar riesgos y confirmar si otro agente está trabajando sobre los mismos archivos.
- Un tema por rama y PR pequeño; indicar archivos, alcance, pruebas, riesgos y qué NO cambia.
- Decisiones de modelo de datos, contratos, dispositivos, caché y seguridad: **ADR propuesto y aceptación previa**.
- Ejecutar `npm test`, `npm run build` y regresiones relevantes; reportar lo no ejecutado.
- Revisión cruzada ChatGPT ↔ Claude; no fusionar ni desplegar sin autorización.
- Informar estados reales: propuesto, implementado, probado, fusionado, publicado.

## Coordinación por dominio
| Dominio | Archivos principales | Criterio |
| --- | --- | --- |
| Persistencia | `lib/state-store.js`, `app/api/state/**` | Alto riesgo de datos; ADR y pruebas |
| Guardia | `public/legacy/app.js`, `germania-roles.js` | Un agente editando a la vez |
| ODD | `app/odd-maestras/**`, APIs relacionadas | No modificar sin autorización |
| Estadística | `public/legacy/dashboard-preview.html` | Confirmar que la vista es solo lectura |
| Tablet B-5 | `app/page.js`, `public/sw.js`, estilos | Medir y aislar cambios |
| Seguridad | Rutas auth/state y roles | Responsable externo; registro pendiente |

## Glosario y reglas
En la interfaz, **Maquinista** puede corresponder a campo interno `conductor`; no renombrar campos sin migración. **OBAC** es el oficial a cargo de la guardia. Ver especificación vigente para mínimos, noches, sustituciones y roles; **no inventar reglas** ni aplicar cambios por deducción.

## Documentación
Actualizar `ARCHITECTURE.md` y ADR cuando se apruebe un cambio estructural. El repositorio es el registro compartido, no los chats de agentes.
