"use client";
import{LOGO_B64}from"../../../lib/logo.js";
import{NOMINA_2026}from"../../../lib/quinta-data";
import{useEffect,useState}from"react";

export default function ConductoresAutorizados(){
  const[lista,setLista]=useState([]);
  const[codigo,setCodigo]=useState("");
  const[autor,setAutor]=useState("");
  const[msg,setMsg]=useState("");
  const[cargando,setCargando]=useState(true);

  async function cargar(){
    setCargando(true);
    const r=await fetch("/api/guardia/conductores-autorizados",{cache:"no-store"});
    const j=await r.json();
    setLista(j.conductores||[]);
    setCargando(false);
  }
  useEffect(()=>{cargar()},[]);

  async function agregar(){
    setMsg("");
    if(!codigo||!autor){ setMsg("Indica el código del integrante y el código del oficial que autoriza."); return; }
    const r=await fetch("/api/guardia/conductores-autorizados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codigo,agregadoPor:autor})});
    const j=await r.json();
    setMsg(r.ok?`${j.nombre} agregado como conductor autorizado.`:j.error==="not_in_roster"?"Ese código no está en la nómina.":j.error==="official_not_authorized"?"Código de oficial no autorizado.":"No fue posible agregarlo.");
    if(r.ok){ setCodigo(""); cargar(); }
  }
  async function quitar(cod){
    if(!autor){ setMsg("Indica el código del oficial que autoriza, arriba, antes de quitar a alguien."); return; }
    if(!confirm("¿Quitar a esta persona de los conductores autorizados?")) return;
    const r=await fetch(`/api/guardia/conductores-autorizados?codigo=${cod}&agregadoPor=${autor}`,{method:"DELETE"});
    if(r.ok) cargar(); else setMsg("No fue posible quitarlo.");
  }

  const I={width:"100%",padding:10,background:"#101216",color:"#fff",border:"1px solid #3a3d44",borderRadius:7};

  return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial",padding:14}}>
    <div style={{maxWidth:640,margin:"auto"}}>
      <header style={{display:"flex",gap:12,alignItems:"center",background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #b3241c",borderRadius:10,padding:18,marginBottom:12}}>
        <img src={LOGO_B64} alt="Escudo Quinta Compañía Germania" style={{width:48,height:55,objectFit:"contain"}}/>
        <div><b style={{color:"#c9a227",fontSize:11}}>CUERPO DE BOMBEROS DE VILLARRICA</b><h1 style={{margin:"5px 0",fontSize:19}}>Conductores autorizados</h1><span style={{color:"#aaa"}}>Habilitación permanente para conducir el B-5 — no se elige semana a semana</span></div>
      </header>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,marginBottom:12,display:"grid",gap:12}}>
        <label>Código del oficial que autoriza (para agregar o quitar)<input inputMode="numeric" style={I} value={autor} onChange={e=>setAutor(e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
        <label>Código del integrante a habilitar<input inputMode="numeric" style={I} value={codigo} onChange={e=>setCodigo(e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
        {codigo&&NOMINA_2026[codigo]&&<small style={{color:"#c9a227"}}>{NOMINA_2026[codigo]}</small>}
        <button onClick={agregar} style={{padding:13,border:0,borderRadius:7,background:"#b3241c",color:"#fff",fontWeight:800}}>Agregar como conductor autorizado</button>
        {msg&&<div style={{padding:11,background:"#101216",border:"1px solid #3a3d44",borderRadius:7}}>{msg}</div>}
      </section>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16}}>
        <h2 style={{fontSize:16,marginTop:0}}>Lista actual ({lista.length})</h2>
        {cargando?<p>Cargando…</p>:lista.length===0?<p style={{color:"#aaa"}}>Nadie autorizado aún.</p>:lista.map(c=>
          <div key={c.codigo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #22242a"}}>
            <span>{c.nombre} · {c.codigo}</span>
            <button onClick={()=>quitar(c.codigo)} style={{padding:"7px 12px",border:"1px solid #3a3d44",borderRadius:7,background:"#101216",color:"#f2c8c8",cursor:"pointer"}}>Quitar</button>
          </div>)}
      </section>
    </div>
  </main>;
}
