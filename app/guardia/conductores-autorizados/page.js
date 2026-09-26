"use client";
import{LOGO_B64}from"../../../lib/logo.js";
import{useEffect,useState}from"react";

export default function ConductoresAutorizados(){
  const[lista,setLista]=useState([]);
  const[cargando,setCargando]=useState(true);

  async function cargar(){
    setCargando(true);
    const r=await fetch("/api/guardia/conductores-autorizados",{cache:"no-store"});
    const j=await r.json();
    setLista(j.conductores||[]);
    setCargando(false);
  }
  useEffect(()=>{cargar()},[]);

  return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial",padding:14}}>
    <div style={{maxWidth:640,margin:"auto"}}>
      <header style={{display:"flex",gap:12,alignItems:"center",background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #b3241c",borderRadius:10,padding:18,marginBottom:12}}>
        <img src={LOGO_B64} alt="Escudo Quinta Compañía Germania" style={{width:48,height:55,objectFit:"contain"}}/>
        <div><b style={{color:"#c9a227",fontSize:11}}>CUERPO DE BOMBEROS DE VILLARRICA</b><h1 style={{margin:"5px 0",fontSize:19}}>Conductores autorizados</h1><span style={{color:"#aaa"}}>Se toma directo del flag "Conductor" (COND) de la Nómina</span></div>
      </header>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,marginBottom:12}}>
        <b style={{color:"#c9a227"}}>Esta lista no se edita aquí.</b>
        <p style={{color:"#ccc",marginBottom:0}}>Para agregar o quitar a alguien, márcalo como "Conductor" en Oficiales → Nómina (el mismo tag "COND" que ya aparece en Pasar Lista). El cambio se refleja acá y en la tabla semanal de Conductor automáticamente.</p>
      </section>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16}}>
        <h2 style={{fontSize:16,marginTop:0}}>Marcados como conductor hoy ({lista.length})</h2>
        {cargando?<p>Cargando…</p>:lista.length===0?<p style={{color:"#aaa"}}>Nadie está marcado como conductor en la Nómina todavía.</p>:lista.map(c=>
          <div key={c.codigo} style={{padding:"10px 0",borderBottom:"1px solid #22242a"}}>{c.nombre} · {c.codigo}</div>)}
      </section>
    </div>
  </main>;
}
