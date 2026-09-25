"use client";

import { useEffect, useMemo, useState } from "react";

const DIAS = ["Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "Lunes", "Martes"];
const MAX_GUARDIANES = 4;
const OCUPADOS_PREVIEW = [2, 3, 1, 4, 2, 0, 1];

function isoAdd(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fechaCorta(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function GuardiaPublicaPage() {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState("2026-10-14");
  const [seleccion, setSeleccion] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("inicio")) setInicio(p.get("inicio"));
  }, []);

  const noches = useMemo(
    () => DIAS.map((dia, i) => ({ dia, fecha: isoAdd(inicio, i), ocupados: OCUPADOS_PREVIEW[i] })),
    [inicio]
  );

  function identificar() {
    const limpio = codigo.trim();
    if (!limpio) {
      setNombre("");
      setMensaje("Ingresa tu código de voluntario.");
      return;
    }
    setNombre(`Voluntario código ${limpio}`);
    setMensaje("");
  }

  function toggle(fecha, ocupados) {
    if (!nombre || ocupados >= MAX_GUARDIANES) return;
    setSeleccion((actual) => actual.includes(fecha) ? actual.filter((x) => x !== fecha) : [...actual, fecha]);
  }

  function confirmar() {
    if (!nombre) return setMensaje("Primero valida tu código de voluntario.");
    if (!seleccion.length) return setMensaje("Marca al menos una noche disponible.");
    const elegidas = noches.filter((n) => seleccion.includes(n.fecha));
    setMensaje(`Inscripción preparada: ${elegidas.map((n) => `${n.dia} ${fechaCorta(n.fecha)}`).join(", ")}.`);
  }

  return (
    <main className="guardia-page">
      <section className="panel encabezado">
        <div className="escudo">5ª</div>
        <div>
          <div className="institucion">CUERPO DE BOMBEROS DE VILLARRICA</div>
          <h1>Quinta Compañía “Germania”</h1>
          <p>Guardia Nocturna</p>
        </div>
      </section>

      <section className="panel formulario">
        <div className="paso">
          <span className="numero">1</span>
          <div className="contenido">
            <label htmlFor="codigo">Ingrese su código de voluntario</label>
            <div className="codigo-row">
              <input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} inputMode="numeric" autoComplete="off" />
              <button type="button" onClick={identificar}>Continuar</button>
            </div>
            {nombre && <div className="nombre">{nombre}</div>}
          </div>
        </div>

        <div className="separador" />

        <div className="paso">
          <span className="numero">2</span>
          <div className="contenido">
            <h2>Seleccione sus noches</h2>
            <p className="ayuda">Mínimo 2 cuando sea posible. Puede seleccionar más.</p>
            <div className="dias">
              {noches.map((n) => {
                const lleno = n.ocupados >= MAX_GUARDIANES;
                const elegido = seleccion.includes(n.fecha);
                return (
                  <label key={n.fecha} className={`dia ${lleno ? "lleno" : ""}`}>
                    <input
                      type="checkbox"
                      checked={elegido}
                      disabled={!nombre || lleno}
                      onChange={() => toggle(n.fecha, n.ocupados)}
                    />
                    <span className="dia-texto">{n.dia} {fechaCorta(n.fecha)}</span>
                    <span className={`cupo c${n.ocupados}`}>{n.ocupados}/{MAX_GUARDIANES}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="separador" />

        <div className="paso">
          <span className="numero">3</span>
          <div className="contenido">
            <h2>Confirme su inscripción</h2>
            <p className="resumen">Noches seleccionadas: <strong>{seleccion.length}</strong></p>
            <button type="button" className="confirmar" onClick={confirmar}>Confirmar inscripción</button>
            {mensaje && <div className="mensaje">{mensaje}</div>}
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(*){box-sizing:border-box}
        :global(body){margin:0;background:#0d0e11;color:#f2f2f2;font-family:inherit}
        .guardia-page{width:min(100%,520px);margin:0 auto;padding:14px 12px 40px}
        .panel{background:#15171b;border:1px solid #292c32;border-radius:10px;overflow:hidden}
        .encabezado{display:flex;gap:12px;align-items:center;padding:16px;border-top:3px solid #c72c2c;margin-bottom:12px}
        .escudo{width:48px;height:55px;border:2px solid #d5a62e;border-radius:7px;display:grid;place-items:center;color:#d5a62e;font-weight:800;flex:0 0 auto}
        .institucion{font-size:10px;letter-spacing:.8px;color:#d5a62e}.encabezado h1{font-size:18px;margin:3px 0}.encabezado p{margin:0;color:#aaa;font-size:13px}
        .formulario{padding:18px 16px}.paso{display:flex;gap:12px;align-items:flex-start}.numero{width:25px;height:25px;border-radius:50%;background:#b91f24;color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px;flex:0 0 auto}.contenido{width:100%;min-width:0}.contenido label,.contenido h2{font-size:16px;font-weight:700;margin:0}.codigo-row{display:flex;gap:9px;margin-top:10px}.codigo-row input{min-width:0;flex:1;height:46px;background:#0f1013;border:1px solid #363940;border-radius:6px;color:#fff;padding:0 12px;font-size:18px}.codigo-row button,.confirmar{border:0;border-radius:6px;background:#b91f24;color:#fff;font-weight:700;padding:0 18px;min-height:46px}.nombre{margin-top:8px;color:#d5a62e;font-weight:700}.separador{height:1px;background:#292c32;margin:18px 0 18px 37px}.ayuda{margin:3px 0 12px;color:#aaa;font-size:13px}.dias{display:flex;flex-direction:column;gap:5px}.dia{display:grid;grid-template-columns:30px 1fr 52px;align-items:center;min-height:45px;padding:3px 4px;border-radius:6px}.dia:hover{background:#1d2025}.dia input{width:23px;height:23px;accent-color:#b91f24;margin:0}.dia-texto{font-size:17px;font-weight:650}.cupo{justify-self:end;min-width:46px;text-align:center;padding:5px 7px;border-radius:5px;font-weight:800;color:#111}.c0,.c1{background:#e3a72f}.c2{background:#72bd69}.c3{background:#c8c34a}.c4{background:#5da962}.lleno{opacity:.6}.lleno .dia-texto{text-decoration:none}.resumen{color:#bbb}.confirmar{width:100%;font-size:16px}.mensaje{margin-top:10px;padding:10px;border:1px solid #363940;border-radius:6px;background:#101216;line-height:1.4}.contenido input:disabled{cursor:not-allowed}
        @media(max-width:420px){.guardia-page{padding:8px 8px 28px}.formulario{padding:16px 12px}.codigo-row{flex-direction:column}.codigo-row button{width:100%}.dia{grid-template-columns:29px 1fr 48px}.dia-texto{font-size:16px}}
      `}</style>
    </main>
  );
}
