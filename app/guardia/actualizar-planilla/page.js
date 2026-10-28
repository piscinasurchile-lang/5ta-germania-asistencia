"use client";
import {useEffect,useState} from "react";

const RUTA="/api/guardia/actualizar-planilla";
const fecha=d=>new Date(d+"T12:00:00Z").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",timeZone:"UTC"});
const filaNombres=d=>d.voluntarios.map(p=>p.nombre);
export default function ActualizarGuardiaFotografia(){
 const [datos,setDatos]=useState(null);
 const [cargando,setCargando]=useState(true);
 const [aplicando,setAplicando]=useState(false);
 const [error,setError]=useState("");
 const [aceptoUno,setAceptoUno]=useState(false);
 const [aceptoDos,setAceptoDos]=useState(false);
 async function consultar(){
   setCargando(true);setError("");
   try{
     const r=await fetch(RUTA,{cache:"no-store"});
     const info=await r.json();
     if(!r.ok)throw Error(info?.error||"No se pudo consultar Germania.");
     setDatos(info);
   }catch(e){setError(e.message||"No hay conexión con la base de datos.");}
   finally{setCargando(false);}
 }
 useEffect(()=>{consultar();},[]);
 async function aplicar(){
   if(aplicando||!datos||datos.estado!=="lista"||!aceptoUno||!aceptoDos)return;
   if(!window.confirm("Se reemplazará la programación del 14 al 20 de octubre de 2026 por la fotografía. Se actualizarán todas las inscripciones individuales y la ficha de Esthefani. ¿Confirmas?"))return;
   setAplicando(true);setError("");
   try{
     const r=await fetch(RUTA,{method:"POST",credentials:"same-origin",cache:"no-store",
       headers:{"Content-Type":"application/json"},
       body:JSON.stringify({semana:"2026-10-14",confirmacion:"APLICAR",
         aceptoActualizarInscripciones:true,aceptoCorregirFicha:true})});
     const info=await r.json().catch(()=>({}));
     if(!r.ok)throw Error(info.detalle||info.error||"No se completó la operación.");
     await consultar();
   }catch(e){
     setError(e.message||"No se pudo confirmar el cambio.");
     await consultar();
   }finally{setAplicando(false);}
 }
 const ok=datos?.estado==="lista";
 const completa=datos?.estado==="aplicada";
 return <main className="actualizacion">
  <div className="encabezado">
    <img src="/legacy/germania-icon.svg" width="48" height="53" alt="Escudo Germania"/>
    <div><h1>GERMANIA · Guardia nocturna</h1><p>Actualización de planilla semanal</p></div>
  </div>
  <div className="contenedor">
    <nav><a href="/#oficiales">← Volver a Germania</a></nav>
    <h2>Semana del 14 al 20 de octubre de 2026</h2>
    <p className="sub">Distribución oficial recibida como fotografía. Se corregirán siete noches, los OBAC, conductores y los turnos de cada voluntario.</p>
    {cargando&&<p role="status" className="estado">Consultando datos actuales de Neon…</p>}
    {error&&<p role="alert" className="error">No se confirmó la operación: {error}</p>}
    {!cargando&&datos&&<>
      <p className={"estado "+(completa?"finalizado":ok?"listo":"pendiente")} role="status">
        {completa?"Aplicada y verificada en Neon":ok?"Lista para confirmar":"Se necesita revisión antes de aplicar"}
        <small>{datos.detalle}</small>
      </p>
      <div className="resumen">
        <span><strong>7</strong> noches</span>
        <span><strong>21</strong> personas</span>
        <span><strong>49</strong> asignaciones</span>
      </div>
      <div className="semanal">
        {datos.planilla?.map(d=><section key={d.fecha} className="noche">
          <div className="nocheHead"><h3>{fecha(d.fecha)}</h3><span>{d.coincide?"Sin cambios":"Modificación programada"}</span></div>
          <p><b>OBAC:</b> {d.obac.nombre}</p>
          <p><b>Conductor:</b> {d.conductor.nombre}</p>
          <div className="voluntarios"><b>Voluntarios ({d.voluntarios.length}):</b>
            {filaNombres(d).map((n,i)=><span key={i}>{n}</span>)}
          </div>
        </section>)}
      </div>
      <section className="cierre">
        <h3>Aplicación de los cambios</h3>
        <p>Germania guardará en una sola transacción las siete guardias, la revisión semanal aprobada, las inscripciones de cada persona y el nombre y RUT de Esthefani Noemí Ojeda Fuentes en su ficha actual. Se conservará el historial anterior.</p>
        <p>La programación no se contará como asistencia cumplida. La asistencia la aprueba un oficial autorizado (Capitán o Tenientes) una vez cerrado el libro.</p>
        {!completa&&<>
         <label><input type="checkbox" checked={aceptoUno} onChange={e=>setAceptoUno(e.target.checked)}/> Confirmo que la distribución de la fotografía es la oficial.</label>
         <label><input type="checkbox" checked={aceptoDos} onChange={e=>setAceptoDos(e.target.checked)}/> Autorizo modificar también los turnos individuales y la ficha de Esthefani.</label>
         <button disabled={!ok||!aceptoUno||!aceptoDos||aplicando} onClick={aplicar}>
           {aplicando?"Actualizando y verificando…":"Actualizar guardia semanal en Germania"}
         </button>
        </>}
        {completa&&<a className="terminado" href="/#oficiales">Ver guardia actualizada en Germania</a>}
        {!ok&&!completa&&<button type="button" className="secundario" onClick={consultar}>Volver a comprobar</button>}
      </section>
    </>}
  </div>
  <style>{`
    *{box-sizing:border-box}html,body{margin:0;background:#080d13}
    .actualizacion{background:#080d13;color:#fff;min-height:100dvh;font:15px system-ui,-apple-system,sans-serif;padding:15px 14px 40px}
    .encabezado{max-width:1050px;margin:0 auto 18px;display:flex;align-items:center;gap:14px;border-bottom:2px solid #edcf61;padding:12px 0 16px}
    .encabezado h1{font-size:21px;margin:0}.encabezado p{margin:3px 0;color:#e1c85b}
    .contenedor{max-width:1050px;margin:auto}.contenedor nav{margin-bottom:15px}
    a{color:#b9ddff;text-decoration:none}.contenedor h2{font-size:22px;margin:10px 0}
    .sub{color:#bfccdc;line-height:1.5}.estado{padding:14px;border:1px solid #607486;border-radius:10px;background:#182433;display:grid;gap:6px;font-weight:700}
    .estado small{font-size:12px;font-weight:400;color:#d1dbe3}.estado.finalizado{border-color:#5d9a7f}
    .estado.listo{border-color:#dec168}.estado.pendiente,.error{border:1px solid #d98e56;background:#422417;color:#fff;border-radius:10px;padding:14px}
    .resumen{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}
    .resumen span{background:#1b2937;padding:12px;border-radius:10px;text-align:center;font-size:13px}
    .resumen strong{display:block;font-size:23px;color:#f2d066}
    .semanal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .noche{background:#12202d;border:1px solid #34485a;border-radius:12px;padding:14px}
    .nocheHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
    .nocheHead h3{font-size:16px;text-transform:capitalize;margin:0}
    .nocheHead span{color:#e2c56b;font-size:11px;text-align:right}
    .noche p{margin:5px 0;line-height:1.45}.voluntarios{display:grid;gap:5px;margin-top:12px}
    .voluntarios span{font-size:13px;color:#d4e3f1}
    .cierre{background:#152333;border:1px solid #4a6176;border-radius:13px;margin-top:20px;padding:18px;line-height:1.55}
    .cierre h3{margin:0 0 8px}.cierre label{display:flex;align-items:flex-start;gap:10px;margin:13px 0}
    .cierre input{width:19px;height:19px;flex-shrink:0;margin-top:3px}
    button,.terminado{display:block;width:100%;padding:16px 12px;background:#a32120;color:white;
      font-size:16px;font-weight:750;border:1px solid #ee9d7b;border-radius:9px;text-align:center;margin-top:18px;cursor:pointer}
    button:disabled{opacity:.4;cursor:not-allowed}.cierre .secundario{background:#25394a;border-color:#7490a3}
    .terminado{background:#246b4e;border-color:#7fc0a0}
    @media(max-width:650px){.actualizacion{padding:10px}.encabezado h1{font-size:17px}
      .semanal{grid-template-columns:1fr}.resumen span{font-size:11px}}
  `}</style>
 </main>;
}
