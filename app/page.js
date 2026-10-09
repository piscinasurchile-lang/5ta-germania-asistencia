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

    // La Minuta de Disponibilidad se renderiza únicamente en legacy/app.js.
    const loading = () => doc.getElementById("appLoading");
    const isLoaded = () => {
      const el = loading();
      return !el || el.classList.contains("hidden") || win.getComputedStyle(el).display === "none";
    };

    // Usar tiempo real: algunas tablets Android reducen la frecuencia de
    // setInterval y un contador por "ticks" puede tardar 4x o más.
    const startedAt = Date.now();
    let recoveryStarted = false;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (isLoaded()) {
        clearInterval(interval);
        setReady(true);
        setFailed(false);
        return;
      }

      // A los 6 s liberamos primero la interfaz. La recuperación secundaria
      // corre después y nunca puede dejar el cargador esperando una petición.
      if (elapsed >= 6000 && !recoveryStarted) {
        recoveryStarted = true;
        loading()?.classList.add("hidden");
        setReady(true);
        setFailed(false);
        // El inicio de legacy/app.js ya realiza estas cargas. No repetirlas
        // desde el contenedor: en conexiones lentas duplicaban lecturas y
        // renderizados mientras la inicialización original seguía en curso.
        // La recuperación aquí solo libera la máscara visual; no escribe datos.
      }

      if (elapsed >= 12000) {
        clearInterval(interval);
        if (!recoveryStarted && !isLoaded()) setFailed(true);
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
