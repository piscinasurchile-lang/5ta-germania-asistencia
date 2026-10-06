"use client";
import { useEffect } from "react";

/* Si la clave de la Compañía deja de valer (por ejemplo, se cambió), lleva a la pantalla de acceso en vez de mostrar errores. */
export default function AccesoGuard() {
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async function (...args) {
      const r = await original.apply(this, args);
      try {
        if (r.status === 401 && r.headers.get("x-acceso") === "requerido") {
          const top = window.top || window;
          top.location.href = "/acceso?volver=" + encodeURIComponent(top.location.pathname + top.location.search);
        }
      } catch {}
      return r;
    };
    return () => { window.fetch = original; };
  }, []);
  return null;
}
