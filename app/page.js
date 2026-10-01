"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ margin: 0, width: "100%", height: "100dvh", overflow: "hidden", background: "#07090b", position: "relative" }}>
      {!ready && (
        <div role="status" aria-live="polite" style={{
          position: "absolute", inset: 0, zIndex: 10, display: "grid", placeItems: "center",
          background: "#07090b", color: "#fff", fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
          padding: 24, textAlign: "center"
        }}>
          <div>
            <img src="/legacy/germania-192.png" alt="Quinta Compañía Germania" width="96" height="96"
              style={{ objectFit: "contain", marginBottom: 18 }} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>Estamos cargando tu información…</div>
            <div style={{ marginTop: 8, color: "#c8c8c8", fontSize: 15 }}>
              {slow ? "La conexión está tardando. Dame unos segundos." : "Dame unos segundos."}
            </div>
          </div>
        </div>
      )}
      <iframe
        title="GERMANIA · Quinta Compañía"
        src="/legacy/index.html"
        onLoad={() => setReady(true)}
        style={{ border: 0, width: "100%", height: "100dvh", display: "block", background: "#07090b" }}
      />
    </main>
  );
}
