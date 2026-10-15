"use client";

import { useState } from "react";

export async function limpiarAvisosLocales() {
  try {
    if (typeof navigator === "undefined") return;
    if (typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge().catch(() => {});
    }
    if (!("serviceWorker" in navigator)) return;
    const registro = await navigator.serviceWorker.getRegistration("/");
    const avisos = registro && typeof registro.getNotifications === "function"
      ? await registro.getNotifications({ tag: "germania-informaciones" })
      : [];
    avisos.forEach((aviso) => aviso.close());
  } catch {
    // La maqueta sigue funcionando aunque el sistema no admita insignias.
  }
}

export default function PruebaNotificacion() {
  const [estado, setEstado] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function emitir() {
    if (ocupado) return;
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setEstado("Este navegador no permite la prueba del sistema. Usa la simulación del teléfono.");
      return;
    }
    setOcupado(true);
    setEstado("Solicitando autorización al teléfono…");
    try {
      // Solicitar permiso directamente desde el toque del usuario.
      const solicitud = Notification.permission === "granted"
        ? Promise.resolve("granted")
        : Notification.requestPermission();
      const permiso = await solicitud;
      if (permiso !== "granted") {
        setEstado("No se concedió permiso de notificaciones. La simulación visual sigue disponible.");
        return;
      }
      const registro = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await registro.showNotification("GERMANIA · Prueba de información", {
        body: "AVISO DE PRUEBA. No corresponde a una emergencia.",
        icon: "/legacy/germania-192.png",
        badge: "/legacy/favicon-64.png",
        tag: "germania-informaciones",
        renotify: true,
        data: { demo: true, url: "/demo-avisos" },
      });
      if (typeof navigator.setAppBadge === "function") {
        await navigator.setAppBadge().catch(() => {});
      }
      setEstado("Notificación de prueba enviada a ESTE dispositivo. El punto del ícono depende del sistema y de que esté instalada la PWA.");
    } catch {
      setEstado("El sistema no permitió crear la notificación. La simulación visual sigue funcionando.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="prueba">
      <strong>Probar una notificación del teléfono</strong>
      <p>Esta opción utiliza el sistema de notificaciones del dispositivo que estás usando. No envía nada a otros teléfonos y no prueba todavía Web Push desde el servidor.</p>
      <button type="button" disabled={ocupado} onClick={emitir}>
        {ocupado ? "Preparando notificación…" : "Probar notificación en mi teléfono"}
      </button>
      <button type="button" disabled={ocupado} className="limpiar" onClick={async () => {
        await limpiarAvisosLocales();
        setEstado("Aviso local limpiado. No se registró ninguna lectura.");
      }}>
        Limpiar notificación
      </button>
      <div role="status" aria-live="polite">{estado}</div>
      <style jsx>{`
        .prueba{border-top:1px solid #415665;margin-top:22px;padding-top:20px}
        strong{font-size:15px}
        p{font-size:12px;color:#c4cdd6;line-height:1.6;margin:8px 0 12px}
        button{display:block;width:100%;border:1px solid #c5a148;background:#805e12;color:#fff;border-radius:9px;font-weight:700;font-size:13px;min-height:43px;padding:10px;cursor:pointer}
        button.limpiar{margin-top:7px;background:#21303b;border-color:#597083}
        button:disabled{opacity:.55;cursor:wait}
        button:focus-visible{outline:3px solid #f5cb60;outline-offset:3px}
        [role=status]{font-size:12px;color:#d8dfeb;min-height:18px;line-height:1.5;margin-top:9px}
      `}</style>
    </section>
  );
}
