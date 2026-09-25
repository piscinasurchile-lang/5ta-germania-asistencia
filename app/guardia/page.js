"use client";

import { useEffect, useMemo, useState } from "react";

const DIAS = ["Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "Lunes", "Martes"];

function isoAdd(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fechaCL(iso) {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" }).format(new Date(`${iso}T12:00:00`));
}

export default function GuardiaPublicaPage() {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState("2026-10-14");
  const [seleccion, setSeleccion] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cupos, setCupos] = useState([2, 3, 4, 1, 3, 2, 4]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("inicio")) setInicio(p.get("inicio"));
  }, []);

  const noches = useMemo(() => DIAS.map((dia, i) => ({ dia, fecha: isoAdd(inicio, i), ocupados: cupos[i] })), [inicio, cupos]);

  function identificar() {
    const limpio = codigo.trim();
    if (!limpio) return setMensaje("Ingresa tu código de voluntario.");
    setNombre(`Voluntario código ${limpio}`);
    setMensaje("Código validado. Selecciona tus noches de guardia.");
  }

  function toggle(fecha, ocupados) {
    if (!nombre || ocupados >= 4) return;
    setSeleccion((actual) => actual.includes(fecha) ? actual.filter((x) => x !== fecha) : [...actual, fecha]);
  }

  function confirmar() {
    if (!nombre) return setMensaje("Primero valida tu código de voluntario.");
    if (!seleccion.length) return setMensaje("Selecciona al menos una noche.");
    setMensaje(`Inscripción preparada: ${seleccion.length} noche${seleccion.length === 1 ? "" : "s"}. En el preview no se altera producción.`);
  }

  return (
    <main className="gn-shell">
      <section className="gn-card gn-head">
        <div className="gn-mark">5ª</div>
        <div><div className="gn-kicker">CUERPO DE BOMBEROS DE VILLARRICA</div><h1>Quinta Compañía “Germania”</h1><p>Inscripción · Guardia Nocturna</p></div>
      </section>

      <section className="gn-card">
        <span className="gn-badge">Inscripción abierta</span>
        <h2>Guardia {fechaCL(inicio)} al {fechaCL(isoAdd(inicio, 6))}</h2>
        <p className="gn-muted">Este enlace permite únicamente inscribirse a Guardia Nocturna. No entrega acceso a otros módulos de la aplicación.</p>
        <div className="gn-row"><input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de voluntario" inputMode="numeric" /><button onClick={identificar}>Validar código</button></div>
        {nombre && <div className="gn-person"><b>{nombre}</b><span>{seleccion.length} noche{seleccion.length === 1 ? "" : "s"} seleccionada{seleccion.length === 1 ? "" : "s"} · objetivo 2, se permiten noches adicionales</span></div>}
      </section>

      <section className="gn-grid">
        {noches.map((n) => {
          const llena = n.ocupados >= 4;
          const activa = seleccion.includes(n.fecha);
          return <button key={n.fecha} className={`gn-night ${activa ? "active" : ""} ${llena ? "full" : ""}`} onClick={() => toggle(n.fecha, n.ocupados)} disabled={llena}>
            <span><b>{n.dia}</b><small>{fechaCL(n.fecha)}</small></span><strong>{n.ocupados}/4</strong><em>{llena ? "Completa" : activa ? "Seleccionada" : "Disponible"}</em>
          </button>;
        })}
      </section>

      <section className="gn-card"><button className="gn-confirm" onClick={confirmar}>Confirmar inscripción</button>{mensaje && <p className="gn-message">{mensaje}</p>}<p className="gn-muted">La inscripción solo se registra al confirmar. Abrir o revisar este enlace no modifica la guardia.</p></section>

      <style jsx>{`
        :global(*){box-sizing:border-box} :global(body){margin:0;background:#f3f1ed;color:#24211e;font-family:Arial,Helvetica,sans-serif}.gn-shell{max-width:760px;margin:auto;padding:18px 14px 50px}.gn-card{background:#fff;border:1px solid #d9d4cc;border-radius:14px;padding:18px;margin-bottom:14px;box-shadow:0 3px 14px #0000000a}.gn-head{display:flex;align-items:center;gap:14px;background:#24211e;color:#fff}.gn-mark{width:58px;height:64px;border:2px solid #d2a74c;border-radius:10px;display:grid;place-items:center;font-size:25px;font-weight:800;color:#d2a74c}.gn-kicker{font-size:10px;letter-spacing:1.4px;color:#d2a74c}.gn-head h1{font-size:21px;margin:4px 0}.gn-head p{margin:0;color:#ddd}.gn-badge{display:inline-block;background:#e8f4eb;color:#27613a;border-radius:99px;padding:6px 10px;font-size:12px;font-weight:700}.gn-card h2{margin:12px 0 6px}.gn-muted{color:#716b64;font-size:13px;line-height:1.45}.gn-row{display:flex;gap:8px;margin-top:16px}.gn-row input{flex:1;min-width:0;border:1px solid #bcb5ac;border-radius:9px;padding:13px;font-size:16px}.gn-row button,.gn-confirm{border:0;border-radius:9px;background:#a62920;color:#fff;font-weight:800;padding:12px 16px}.gn-person{margin-top:14px;padding:12px;background:#f7f5f1;border-radius:9px;display:flex;flex-direction:column;gap:4px}.gn-person span{font-size:12px;color:#716b64}.gn-grid{display:grid;gap:9px;margin-bottom:14px}.gn-night{width:100%;border:1px solid #d9d4cc;background:#fff;border-radius:12px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:3px 12px;text-align:left;color:#24211e}.gn-night span{display:flex;flex-direction:column;gap:3px}.gn-night small{color:#716b64}.gn-night strong{font-size:18px}.gn-night em{font-style:normal;font-size:12px;color:#777;grid-column:1/3}.gn-night.active{border:2px solid #a62920;background:#fff8f7}.gn-night.full{opacity:.58}.gn-confirm{width:100%;font-size:16px;padding:14px}.gn-message{font-weight:700;margin:14px 0 0}@media(min-width:650px){.gn-grid{grid-template-columns:1fr 1fr}.gn-night:last-child{grid-column:1/3}}
      `}</style>
    </main>
  );
}
