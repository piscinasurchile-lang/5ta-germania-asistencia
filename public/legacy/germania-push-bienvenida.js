(function () {
  "use strict";

  const tarjeta = document.getElementById("g-push-bienvenida");
  const boton = document.getElementById("g-push-autorizar");
  const estado = document.getElementById("g-push-estado");
  const accesoAnterior = document.querySelector("#inicioNovedades .g-push-activar");
  if (!tarjeta || !boton || !estado) return;

  // El tablero B-5 es operativo; no se interrumpe con invitaciones personales.
  try {
    if (new URLSearchParams(window.parent.location.search).has("b5dest") ||
        localStorage.getItem("germania:modo-dispositivo:v1") === "b5") return;
  } catch {}

  if (!("Notification" in window) || !("serviceWorker" in navigator) ||
      !("PushManager" in window) || !window.isSecureContext) return;

  let configuracionActual = null;
  let trabajando = false;

  function mensaje(texto) {
    estado.textContent = texto || "";
    estado.hidden = !texto;
  }

  function mostrar(texto = "") {
    tarjeta.hidden = false;
    if (accesoAnterior) accesoAnterior.hidden = true;
    mensaje(texto);
  }

  function ocultar() {
    tarjeta.hidden = true;
    if (accesoAnterior) accesoAnterior.hidden = true;
    mensaje("");
  }

  function claveBytes(clave) {
    const base64 = clave.replace(/-/g, "+").replace(/_/g, "/");
    const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return Uint8Array.from(binario, letra => letra.charCodeAt(0));
  }

  function claveCoincide(suscripcion, clave) {
    const anterior = suscripcion.options?.applicationServerKey;
    if (!anterior) return true;
    const bytesAnteriores = new Uint8Array(anterior);
    const bytesActuales = claveBytes(clave);
    return bytesAnteriores.length === bytesActuales.length &&
      bytesAnteriores.every((byte, index) => byte === bytesActuales[index]);
  }

  async function obtenerConfiguracion() {
    const respuesta = await fetch("/api/push/suscripcion", { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo conectar con Germania.");
    const datos = await respuesta.json();
    if (!datos.disponible || !datos.publicKey) throw new Error("Los avisos todavía no están disponibles.");
    configuracionActual = datos;
    return datos;
  }

  async function registrarTelefono(configuracion) {
    const registro = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    let suscripcion = await registro.pushManager.getSubscription();
    if (suscripcion && !claveCoincide(suscripcion, configuracion.publicKey)) {
      await suscripcion.unsubscribe();
      suscripcion = null;
    }
    if (!suscripcion) {
      suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveBytes(configuracion.publicKey)
      });
    }
    const respuesta = await fetch("/api/push/suscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({}, suscripcion.toJSON(), { voluntarioId: (document.getElementById("miVoluntario") || {}).value || null }))
    });
    if (!respuesta.ok) throw new Error("No se pudo registrar el teléfono. Intenta nuevamente.");
    ocultar();
  }

  async function comprobarInicio() {
    try {
      const configuracion = await obtenerConfiguracion();
      if (Notification.permission === "granted") {
        // Con permiso previo, registra o repara sin nuevos toques ni diálogos.
        try {
          await registrarTelefono(configuracion);
          return;
        } catch {
          mostrar("No pudimos completar el registro. Toca el botón para reintentar.");
          return;
        }
      }
      if (Notification.permission === "denied") {
        mostrar("Las notificaciones están bloqueadas. Habilítalas en los ajustes de Germania de tu teléfono.");
        boton.disabled = true;
        boton.textContent = "Permiso bloqueado en Android";
        return;
      }
      mostrar();
    } catch {
      // Un fallo de conexión no debe tapar ni bloquear el Inicio de Germania.
    }
  }

  boton.addEventListener("click", async () => {
    if (trabajando) return;
    trabajando = true;
    boton.disabled = true;
    mensaje("Activando avisos en este teléfono…");
    try {
      // Debe ejecutarse directamente durante el toque, antes de cualquier
      // consulta de red, para preservar el gesto requerido por Android/iOS.
      const permiso = Notification.permission === "granted"
        ? "granted" : await Notification.requestPermission();
      if (permiso !== "granted") {
        mostrar("Para recibir ODD automáticamente debes permitir las notificaciones en tu teléfono.");
        if (permiso === "denied") {
          boton.textContent = "Permiso bloqueado en Android";
        }
        return;
      }
      const config = configuracionActual || await obtenerConfiguracion();
      await registrarTelefono(config);
    } catch (error) {
      mostrar(error?.message || "No fue posible activar los avisos. Intenta nuevamente.");
    } finally {
      trabajando = false;
      boton.disabled = Notification.permission === "denied";
    }
  });

  void comprobarInicio();
})();
