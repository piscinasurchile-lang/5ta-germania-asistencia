"use client";

import { useEffect, useMemo, useState } from "react";

const DIAS = ["Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "Lunes", "Martes"];
const MAX_GUARDIANES = 4;

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
  const cupos = [2, 3, 4, 1, 3, 2, 4];

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("inicio")) setInicio(p.get("inicio"));
  }, []);

  const noches = useMemo(
    () => DIAS.map((dia, i) => ({ dia, fecha: isoAdd(inicio, i), ocupados: cupos[i] })),
    [inicio]
  );

  function identificar() {
    const limpio = codigo.trim();
    if (!limpio) {
      setNombre("");
      return setMensaje("Ingresa tu código de voluntario.");
    }
    setNombre(`Voluntario código ${limpio}`);
    setMensaje("Código validado. Marca los días disponibles que puedas realizar guardia.");
  }

  function toggle(fecha, ocupados) {
    if (!nombre || ocupados >= MAX_GUARDIANES) return;
    setSeleccion((actual) =>
      actual.includes(fecha) ? actual.filter((x) => x !== fecha) : [...actual, fecha]
    );
  }

  function confirmar() {
    if (!nombre) return setMensaje("Primero valida tu código de voluntario.");
    if (!seleccion.length) return setMensaje("Marca al menos una noche disponible.");
    const dias = noches.filter((n) => seleccion.includes(n.fecha)).map((n) => `${n.dia} ${fechaCL(n.fecha)}`);
    setMensaje(`✓ Inscripción preparada correctamente: ${dias.join(", ")}. Este Preview no modifica producción.`);
  }

  return (
    <main className="gn-shell">
      <section className="gn-card gn-head">
        <div className="gn-mark">5ª</div>
        <div>
          <div className="gn-kicker">CUERPO DE BOMBEROS DE VILLARRICA</div>
          <h1>Quinta Compañía “Germania”</h1>
          <p>Guardia Nocturna</p>
        </div>
      </section>

      <section className="gn-card">
        <span className="gn-badge">INSCRIPCIÓN ABIERTA</span>
        <h2>{fechaCL(inicio)} al {fechaCL(isoAdd(inicio, 6))}</h2>
        <p className="gn-instruction">1. Ingresa tu código de voluntario.</p>
        <div className="gn-row">
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código de voluntario" inputMode="numeric" aria-label="Código de voluntario" />
          <button onClick={identificar}>VALIDAR</button>
        </div>
        {nombre && (
          <div className="gn-person">
            <b>{nombre}</b>
            <span>2 noches es el objetivo. Puedes tomar más si hay cupos.</span>
          </div>
        )}
      </section>

      <section className="gn-card">
        <h2 className="gn-step">2. Marca los días disponibles</h2>
        <p className="gn-muted">Los días completos están bloqueados y no se pueden seleccionar.</p>
        <div className="gn-grid">
          {noches.map((n) => {
            const llena = n.ocupados >= MAX_GUARDIANES;
            const activa = seleccion.includes(n.fecha);
            const disponibles = MAX_GUARDIANES - n.ocupados;
            return (
              <button
                key={n.fecha}
                className={`gn-night ${activa ? "active" : ""} ${llena ? "full" : ""}`}
                onClick={() => toggle(n.fecha, n.ocupados)}
                disabled={llena || !nombre}
                aria-pressed={activa}
              >
                <span className="gn-day"><b>{n.dia}</b><small>{fechaCL(n.fecha)}</small></span>
                <span className="gn-status">
                  {llena ? <><strong>COMPLETO</strong><small>4/4</small></> : activa ? <><strong>✓ ELEGIDO</strong><small>{disponibles} cupo{disponibles === 1 ? "" : "s"} disponible{disponibles === 1 ? "" : "s"}</small></> : <><strong>DISPONIBLE</strong><small>{disponibles} cupo{disponibles === 1 ? "" : "s"}</small></>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="gn-card">
        <h2 className="gn-step">3. Confirma tu inscripción</h2>
        <div className="gn-counter">Has elegido <b>{seleccion.length}</b> noche{seleccion.length === 1 ? "" : "s"}</div>
        <button className="gn-confirm" onClick={confirmar}>CONFIRMAR MIS GUARDIAS</button>
        {mensaje && <p className="gn-message">{mensaje}</p>}
        <p className="gn-muted center">Mirar esta página no cambia ninguna inscripción. Solo se registra al confirmar.</p>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box} :global(body){margin:0;background:#f3f1ed;color:#24211e;font-family:Arial,Helvetica,sans-serif}.gn-shell{max-width:760px;margin:auto;padding:18px 14px 50px}.gn-card{background:#fff;border:1px solid #d9d4cc;border-radius:14px;padding:18px;margin-bottom:14px;box-shadow:0 3px 14px #0000000a}.gn-head{display:flex;align-items:center;gap:14px;background:#24211e;color:#fff}.gn-mark{width:58px;height:64px;border:2px solid #d2a74c;border-radius:10px;display:grid;place-items:center;font-size:25px;font-weight:800;color:#d2a74c;flex:0 0 auto}.gn-kicker{font-size:10px;letter-spacing:1.4px;color:#d2a74c}.gn-head h1{font-size:21px;margin:4px 0}.gn-head p{margin:0;color:#ddd}.gn-badge{display:inline-block;background:#e8f4eb;color:#27613a;border-radius:99px;padding:7px 11px;font-size:12px;font-weight:800}.gn-card h2{margin:12px 0 6px}.gn-step{font-size:19px}.gn-instruction{font-size:16px;font-weight:700;margin:18px 0 8px}.gn-muted{color:#716b64;font-size:13px;line-height:1.45}.center{text-align:center}.gn-row{display:flex;gap:8px}.gn-row input{flex:1;min-width:0;border:1px solid #bcb5ac;border-radius:9px;padding:14px;font-size:18px}.gn-row button,.gn-confirm{border:0;border-radius:9px;background:#a62920;color:#fff;font-weight:800;padding:13px 16px;font-size:15px}.gn-person{margin-top:14px;padding:14px;background:#f7f5f1;border-radius:9px;display:flex;flex-direction:column;gap:5px;font-size:17px}.gn-person span{font-size:13px;color:#716b64}.gn-grid{display:grid;gap:10px;margin-top:14px}.gn-night{min-height:76px;width:100%;border:2px solid #d9d4cc;background:#fff;border-radius:12px;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;color:#24211e}.gn-day{display:flex;flex-direction:column;gap:5px;font-size:17px}.gn-day small{font-size:13px;color:#716b64}.gn-status{text-align:right;display:flex;flex-direction:column;gap:4px}.gn-status strong{font-size:14px;color:#27613a}.gn-status small{font-size:12px;color:#716b64}.gn-night.active{border-color:#a62920;background:#fff8f7}.gn-night.active .gn-status strong{color:#a62920}.gn-night.full{background:#ece9e4;border-color:#d3cec6;opacity:.72;cursor:not-allowed}.gn-night.full .gn-status strong{color:#625d57}.gn-night:disabled:not(.full){opacity:.55}.gn-counter{text-align:center;padding:10px;font-size:16px}.gn-confirm{width:100%;font-size:17px;padding:16px;min-height:54px}.gn-message{font-weight:700;line-height:1.45;margin:14px 0 0;padding:12px;background:#f7f5f1;border-radius:9px}@media(max-width:520px){.gn-shell{padding:10px 10px 36px}.gn-card{padding:15px}.gn-head h1{font-size:18px}.gn-row{flex-direction:column}.gn-row button{min-height:50px}.gn-night{min-height:82px}.gn-status strong{font-size:13px}}@media(min-width:650px){.gn-grid{grid-template-columns:1fr 1fr}.gn-night:last-child{grid-column:1/3}}
      `}</style>
    </main>
  );
}
