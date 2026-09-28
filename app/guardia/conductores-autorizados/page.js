"use client";
import{useOficial}from"../../../lib/oficialSesion.js";
import{LOGO_B64}from"../../../lib/logo.js";
import{useEffect,useState}from"react";

export default function ConductoresAutorizados(){
  const[lista,setLista]=useState([]);
  const[pendientes,setPendientes]=useState([]);
  const[codigo,setCodigo]=useState("");
  const[autor,setAutor]=useOficial();
  const[msg,setMsg]=useState("");
  const[cargando,setCargando]=useState(true);

  async function cargar(){
    setCargando(true);
    const r=await fetch("/api/guardia/conductores-autorizados",{cache:"no-store"});
    const j=await r.json();
    setLista(j.conductores||[]);
    setPendientes(j.pendientes||[]);
    setCargando(false);
  }
  useEffect(()=>{cargar()},[]);

  async function cambiar(cod,activar){
    if(!autor){ setMsg("Indica primero el código del oficial que aprueba/revoca."); return; }
    setMsg("");
    const r=await fetch("/api/guardia/conductores-autorizados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codigo:cod,aprobadoPor:autor,activar})});
    const j=await r.json();
    setMsg(r.ok?`${j.nombre} ${activar?"aprobado como conductor.":"ya no figura como conductor."}`:j.error==="official_not_authorized"?"Código de oficial no autorizado.":"No fue posible guardar el cambio.");
    if(r.ok){ setCodigo(""); cargar(); }
  }

  const I={width:"100%",padding:10,background:"#101216",color:"#fff",border:"1px solid #3a3d44",borderRadius:7};

  return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial",padding:14}}>
    <div style={{maxWidth:640,margin:"auto"}}>
      <header style={{display:"flex",gap:12,alignItems:"center",background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #b3241c",borderRadius:10,padding:18,marginBottom:12}}>
        <img src={LOGO_B64} alt="Escudo Quinta Compañía Germania" style={{width:48,height:55,objectFit:"contain"}}/>
        <div><b style={{color:"#c9a227",fontSize:11}}>CUERPO DE BOMBEROS DE VILLARRICA</b><h1 style={{margin:"5px 0",fontSize:19}}>Conductores autorizados</h1><span style={{color:"#aaa"}}>Un cambio aquí se refleja también en la Nómina (mismo dato, un solo lugar)</span></div>
      </header>

      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,marginBottom:12,display:"grid",gap:12}}>
        <label>Código del oficial que aprueba/revoca<input inputMode="numeric" style={I} value={autor} onChange={e=>setAutor(e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
        {msg&&<div style={{padding:11,background:"#101216",border:"1px solid #3a3d44",borderRadius:7}}>{msg}</div>}
      </section>

      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,marginBottom:12}}>
        <h2 style={{fontSize:16,marginTop:0}}>Aprobar a quien terminó el curso</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select style={{...I,flex:"1 1 220px"}} value={codigo} onChange={e=>setCodigo(e.target.value)}>
            <option value="">— seleccionar integrante —</option>
            {pendientes.map(p=><option key={p.codigo} value={p.codigo}>{p.nombre} · {p.codigo}</option>)}
          </select>
          <button onClick={()=>codigo&&cambiar(codigo,true)} disabled={!codigo} style={{padding:"10px 16px",border:0,borderRadius:7,background:"#b3241c",color:"#fff",fontWeight:800}}>Aprobar como conductor</button>
        </div>
      </section>

      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16}}>
        <h2 style={{fontSize:16,marginTop:0}}>Conductores autorizados hoy ({lista.length})</h2>
        {cargando?<p>Cargando…</p>:lista.length===0?<p style={{color:"#aaa"}}>Nadie está marcado como conductor todavía.</p>:lista.map(c=>
          <div key={c.codigo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #22242a"}}>
            <span>{c.nombre} · {c.codigo}</span>
            <button onClick={()=>cambiar(c.codigo,false)} style={{padding:"7px 12px",border:"1px solid #3a3d44",borderRadius:7,background:"#101216",color:"#f2c8c8",cursor:"pointer"}}>Revocar</button>
          </div>)}
      </section>
    </div>
  </main>;
}
