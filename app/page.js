"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [updating, setUpdating] = useState(false);
  const versionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      const register = () => navigator.serviceWorker.register("./sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
    return () => clearTimeout(timer);
  }, [frameKey]);

  useEffect(() => {
    const checkVersion = async () => {
      if (document.visibilityState !== "visible" || updating) return;
      try {
        const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!versionRef.current) { versionRef.current = data.version; return; }
        if (data.version !== versionRef.current) {
          const doc = frameRef.current?.contentDocument;
          const editing = !!doc?.querySelector("input:focus,textarea:focus,select:focus");
          if (editing) return;
          versionRef.current = data.version;
          setUpdating(true);
          setReady(false);
          setTimeout(() => { setFrameKey(k => k + 1); setUpdating(false); }, 900);
        }
      } catch {}
    };
    const timer = setInterval(checkVersion, 15000);
    document.addEventListener("visibilitychange", checkVersion);
    checkVersion();
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", checkVersion); };
  }, [updating]);

  const onFrameLoad = () => {
    const frame = frameRef.current;
    if (!frame) return;
    let doc, win;
    try {
      doc = frame.contentDocument;
      win = frame.contentWindow;
      if (!doc || !win) throw new Error("iframe no disponible");
    } catch {
      setReady(true);
      return;
    }

    const style = doc.createElement("style");
    style.textContent = `
      html,body{width:100%!important;min-height:100%!important;overflow-x:hidden!important}
      .wrap{max-width:none!important;width:100%!important;margin:0!important;padding:16px 18px 76px!important}
      .masthead{width:100%!important}
      #testModeBanner{left:12px!important;right:12px!important;bottom:12px!important;max-width:none!important}
      @media (min-width:700px){
        .home-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
        .card{width:100%!important}
      }
    `;
    doc.head.appendChild(style);

    // Disponibilidad: solo cambia el orden visual. La nómina maestra, IDs,
    // guardias, ODD, asistencia y estadísticas permanecen intactos.
    // Se mueve el <tr> completo para conservar juntos todos los datos de la fila.
    if (!win.__germaniaDisponibilidadOrdenInstalado && typeof win.renderDisponibilidad === "function") {
      const renderOriginal = win.renderDisponibilidad;
      win.renderDisponibilidad = async function (...args) {
        const resultado = await renderOriginal.apply(this, args);
        try {
          const body = doc.getElementById("dispBody");
          if (!body || typeof win.getDisponibilidadHoy !== "function" || typeof win.sortedRoster !== "function") return resultado;

          const disponibilidad = await win.getDisponibilidadHoy();
          const base = win.sortedRoster(false);
          const filas = Array.from(body.children);
          if (filas.length !== base.length) return resultado;

          const apellido = (p) => [p.apellidoPaterno || "", p.apellidoMaterno || "", p.nombre || ""]
            .join(" ")
            .trim();
          const esActivo = (p) => {
            const estado = disponibilidad[p.id]?.estado || "";
            return estado === "cuartel" || estado === "disponible";
          };

          const ordenadas = base.map((p, indice) => ({ p, indice, fila: filas[indice] }))
            .sort((a, b) => {
              const aActivo = esActivo(a.p);
              const bActivo = esActivo(b.p);
              if (aActivo !== bActivo) return aActivo ? -1 : 1;
              if (aActivo && bActivo) {
                return apellido(a.p).localeCompare(apellido(b.p), "es", { sensitivity: "base" }) || a.indice - b.indice;
              }
              return a.indice - b.indice;
            });

          ordenadas.forEach(({ fila }) => body.appendChild(fila));
        } catch (e) {
          console.error("Orden visual de disponibilidad:", e);
        }
        return resultado;
      };
      win.__germaniaDisponibilidadOrdenInstalado = true;
      win.renderDisponibilidad().catch(e => console.error("Disponibilidad inicial:", e));
    }

    const loading = () => doc.getElementById("appLoading");
    const isLoaded = () => {
      const el = loading();
      return !el || el.classList.contains("hidden") || win.getComputedStyle(el).display === "none";
    };

    let elapsed = 0;
    const interval = setInterval(async () => {
      elapsed += 250;
      if (isLoaded()) {
        clearInterval(interval);
        setReady(true);
        setFailed(false);
        return;
      }

      // La carga histórica/validación de Guardia nunca debe bloquear la interfaz B-5.
      if (elapsed === 6000) {
        try {
          if (typeof win.loadListaForSelection === "function") await win.loadListaForSelection();
          if (typeof win.cargarMiVoluntario === "function") win.cargarMiVoluntario();
          if (typeof win.renderDisponibilidad === "function") await win.renderDisponibilidad();
          if (typeof win.renderTipoSelect === "function") win.renderTipoSelect();
          if (typeof win.populateTipoFilters === "function") win.populateTipoFilters();
          loading()?.classList.add("hidden");
        } catch (e) {
          console.error("Recuperación Tablet B-5:", e);
        }
      }

      if (elapsed >= 12000) {
        clearInterval(interval);
        if (isLoaded()) {
          setReady(true);
          setFailed(false);
        } else {
          setFailed(true);
        }
      }
    }, 250);
  };

  const retry = () => {
    setReady(false);
    setFailed(false);
    setSlow(false);
    setFrameKey(k => k + 1);
  };

  return (
    <main style={{ margin: 0, width: "100vw", height: "100dvh", overflow: "hidden", background: "#07090b", position: "relative" }}>
      {!ready && (
        <div role="status" aria-live="polite" style={{ position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center", background: "#07090b", color: "#fff", fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: 24, textAlign: "center" }}>
          <div>
            <img src="/legacy/germania-icon.svg" alt="Quinta Compañía Germania" width="96" height="96" style={{ objectFit: "contain", marginBottom: 18 }} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>{updating ? "Actualizando GERMANIA…" : "Estamos cargando tu información…"}</div>
            <div style={{ marginTop: 8, color: "#c8c8c8", fontSize: 15 }}>{updating ? "Hay una nueva versión. Se aplicará automáticamente." : failed ? "No pudimos completar la carga." : slow ? "La conexión está tardando. Dame unos segundos." : "Dame unos segundos."}</div>
            {failed && <button type="button" onClick={retry} style={{ marginTop: 18, padding: "11px 18px", borderRadius: 8, border: "1px solid #ffcc00", background: "#171d22", color: "#fff", fontWeight: 700 }}>Reintentar</button>}
          </div>
        </div>
      )}
      <iframe
        key={frameKey}
        ref={frameRef}
        title="GERMANIA · Quinta Compañía"
        src={`/legacy/index.html?v=20261001-2&reload=${frameKey}`}
        onLoad={onFrameLoad}
        style={{ border: 0, width: "100vw", height: "100dvh", display: "block", background: "#07090b" }}
      />
    </main>
  );
}
