"use client";
import { useState } from "react";
import { destinoSeguro } from "../../lib/destino.js";

export default function Acceso() {
  const [codigo, setCodigo] = useState("");
  const [msg, setMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    if (!codigo.trim()) { setMsg("Escribe la clave de la Compañía."); return; }
    setCargando(true); setMsg("");
    try {
      const r = await fetch("/api/acceso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        const volver = destinoSeguro(new URLSearchParams(window.location.search).get("volver"));
        (window.top || window).location.href = volver;
        return;
      }
      setMsg(r.status === 429
        ? "Demasiados intentos. Espera " + Math.max(1, Math.ceil((j.esperaSeg || 900) / 60)) + " minutos e inténtalo de nuevo."
        : "Clave incorrecta.");
    } catch {
      setMsg("No hay conexión. Inténtalo de nuevo.");
    }
    setCargando(false);
  }

  const caja = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#07090b", color: "#fff", fontFamily: "system-ui, sans-serif" };
  const tarjeta = { width: "100%", maxWidth: 380, background: "#101216", border: "1px solid #3a3d44", borderRadius: 14, padding: 26, textAlign: "center" };
  return (
    <main style={caja}>
      <form onSubmit={entrar} style={tarjeta}>
        <img src="/legacy/germania-icon.png" alt="Escudo Quinta Compañía Germania" width={96} style={{ marginBottom: 14 }} />
        <h1 style={{ fontSize: 20, margin: "0 0 4px" }}>GERMANIA</h1>
        <p style={{ margin: "0 0 18px", color: "#9aa0a8", fontSize: 14 }}>Quinta Compañía · Cuerpo de Bomberos de Villarrica</p>
        <label htmlFor="codigo" style={{ display: "block", textAlign: "left", fontSize: 13, marginBottom: 6, color: "#c9ccd1" }}>Clave de la Compañía</label>
        <input id="codigo" type="password" inputMode="text" autoComplete="current-password" autoFocus value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: 12, fontSize: 16, background: "#0d0e11", border: "1px solid #3a3d44", borderRadius: 8, color: "#fff" }} />
        <button type="submit" disabled={cargando}
          style={{ width: "100%", marginTop: 14, padding: 12, fontSize: 16, fontWeight: 700, border: 0, borderRadius: 8, background: "#ffcc00", color: "#000", cursor: "pointer", opacity: cargando ? 0.6 : 1 }}>
          {cargando ? "Verificando…" : "Entrar"}
        </button>
        <div role="alert" style={{ minHeight: 22, marginTop: 12, fontSize: 14, color: "#ff8a80" }}>{msg}</div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#7d838c" }}>La clave se pide una sola vez en cada dispositivo. Si no la tienes, consúltala con la Oficialidad.</p>
      </form>
    </main>
  );
}
