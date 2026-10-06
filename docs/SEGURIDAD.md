# Seguridad y acceso

## Qué se encontró (octubre 2026)
1. **Cualquiera con la dirección del sitio podía leer y escribir la base** (`/api/state/<clave>`): la API no pedía iniciar sesión. La nómina incluye nombres, RUT y teléfonos.
2. **`public/legacy/app.js` es un archivo público y contiene la nómina semilla** (26 voluntarios con nombre, RUT y teléfono) y un mapa RUT → foto. Está también en el repositorio público de GitHub.
3. **La «clave de Oficialidad» solo se comprueba en la pantalla** (el servidor no la exige para guardar), y el PIN se podía probar sin límite de intentos.
4. No se encontraron secretos reales en el repositorio (`.env.example` solo tiene plantillas).

## Qué hace este cambio
- **Clave de la Compañía** (`ACCESS_CODE`): si se define en Vercel, toda la app y toda la API la exigen **una vez por dispositivo** (cookie firmada, `HttpOnly`, 180 días). Sin clave: la API responde 401 y las páginas llevan a `/acceso`.
  - `app.js`, las fotos de voluntarios, el `index.html` y el resto de `/legacy` **dejan de entregarse sin clave**.
  - Es público solo lo mínimo: `/acceso`, `/api/acceso`, `/api/health`, íconos, `manifest`, `sw.js`, `robots.txt`, `version.json`.
  - **Si `ACCESS_CODE` no está definido, el filtro queda desactivado** y todo funciona como antes.
- **Límite de intentos**: 5 fallos seguidos bloquean 15 minutos (clave de la Compañía y PIN de Oficialidad), por IP. Se guarda en claves `security:rl:*` (reservadas, no accesibles desde la API).
- **Cabeceras**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-Robots-Tag: noindex` y `robots.txt`.

## Cómo activarlo (paso a paso)
1. Fusionar este cambio (no cambia nada visible mientras `ACCESS_CODE` no exista).
2. En Vercel → Settings → Environment Variables: crear `ACCESS_CODE` con la clave elegida (Production, y Preview si se quiere). Debe existir también `SESSION_SECRET` (ya existe).
3. Volver a desplegar (Redeploy).
4. En cada tablet/celular: abrir GERMANIA, escribir la clave una vez.
5. **Cambiar la clave**: modificar `ACCESS_CODE` y redesplegar; todos los dispositivos la pedirán de nuevo.

Si algo sale mal: borrar `ACCESS_CODE` en Vercel y redesplegar devuelve el acceso abierto.

## Pendiente (no resuelto aquí)
- **Datos personales en el repositorio público y en su historial** (RUT, teléfonos, nombres, fotos): hacer el repositorio **privado** y sacar la nómina semilla de `app.js`. Quitarlos del código no los borra del historial de Git.
- **La clave de Oficialidad no se exige en el servidor**: quien tenga la clave de la Compañía puede guardar cambios sin pasar por «Modificar». Falta que el servidor exija la cookie de Oficialidad para modificar partes/hojas ya guardados.
- Cada persona usa la misma clave de la Compañía; no hay usuarios individuales.
