"use client";
import{LOGO_B64}from"../../../lib/logo.js";
import{useEffect,useState}from"react";
function hoy(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
function iso(d){return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}

export default function Conductor(){
  const[inicio,setInicio]=useState(hoy());
  const[autor,setAutor]=useState("");
  const[dias,setDias]=useState([]); // [{fecha,codigo,opciones:[{codigo,nombre}]}]
  const[msg,setMsg]=useState("");
  const[cargando,setCargando]=useState(false);

  const fechas=Array.from({length:7},(_,i)=>{const d=new Date(inicio+"T12:00:00");d.setDate(d.getDate()+i);return iso(d)});

  async function cargar(){
    setCargando(true);
    const filas=await Promise.all(fechas.map(async f=>{
      const [rg,rc]=await Promise.all([
        fetch(`/api/guardia/lista-diaria?fecha=${f}`,{cache:"no-store"}),
        fetch(`/api/guardia/conductor?fecha=${f}`,{cache:"no-store"})
      ]);
      const g=rg.ok?await rg.json():null;
      const c=rc.ok?await rc.json():null;
      const opciones=(g?.voluntarios||[]).map(v=>({codigo:v.efectivo?.codigo||v.codigo,nombre:v.efectivo?.nombre||v.nombre}));
      return{fecha:f,codigo:c?.conductor?.codigo||"",opciones};
    }));
    setDias(filas);
    setCargando(false);
  }
  useEffect(()=>{cargar()},[inicio]);

  function cambiarSeleccion(fecha,codigo){
    setDias(ds=>ds.map(d=>d.fecha===fecha?{...d,codigo}:d));
  }

  async function guardarFila(fecha){
    const fila=dias.find(d=>d.fecha===fecha);
    if(!fila?.codigo){ setMsg("Selecciona un conductor antes de guardar."); return; }
    if(!autor){ setMsg("Indica el código del oficial que autoriza (arriba)."); return; }
    setMsg("");
    const r=await fetch("/api/guardia/conductor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fecha,codigo:fila.codigo,autorizadoPor:autor})});
    const j=await r.json();
    setMsg(r.ok?`Conductor del ${fecha} guardado: ${j.conductor.nombre}.`:j.error==="official_not_authorized"?"Código de oficial no autorizado.":j.error==="driver_not_on_guard"?"El conductor debe integrar la guardia efectiva de esa noche.":"No fue posible asignar el conductor.");
    if(r.ok) cargar();
  }

  const I={width:"100%",padding:10,background:"#101216",color:"#fff",border:"1px solid #3a3d44",borderRadius:7};
  const diaLabel=f=>new Intl.DateTimeFormat("es-CL",{weekday:"short",day:"numeric",month:"short"}).format(new Date(f+"T12:00:00"));

  return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial",padding:14}}>
    <div style={{maxWidth:760,margin:"auto"}}>
      <header style={{display:"flex",gap:12,alignItems:"center",background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #b3241c",borderRadius:10,padding:18,marginBottom:12}}>
        <img src={LOGO_B64} alt="Escudo Quinta Compañía Germania" style={{width:48,height:55,objectFit:"contain"}}/>
        <div><b style={{color:"#c9a227",fontSize:11}}>CUERPO DE BOMBEROS DE VILLARRICA</b><h1 style={{margin:"5px 0",fontSize:19}}>Conductor de Guardia — semana</h1><span style={{color:"#aaa"}}>Un conductor por noche, entre los efectivos de esa fecha</span></div>
      </header>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,marginBottom:12,display:"grid",gap:12}}>
        <label>Inicio de semana<input type="date" style={I} value={inicio} onChange={e=>setInicio(e.target.value)}/></label>
        <label>Código del oficial que autoriza (aplica a los cambios que guardes)<input inputMode="numeric" style={I} value={autor} onChange={e=>setAutor(e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
      </section>
      <section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16}}>
        {cargando?<p>Cargando…</p>:<table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{textAlign:"left",borderBottom:"1px solid #30333a"}}><th style={{padding:8}}>Día</th><th style={{padding:8}}>Conductor</th><th style={{padding:8}}></th></tr></thead>
          <tbody>{dias.map(d=><tr key={d.fecha} style={{borderBottom:"1px solid #22242a"}}>
            <td style={{padding:8,whiteSpace:"nowrap"}}>{diaLabel(d.fecha)}</td>
            <td style={{padding:8,width:"60%"}}>
              <select style={I} value={d.codigo} onChange={e=>cambiarSeleccion(d.fecha,e.target.value)}>
                <option value="">— sin asignar —</option>
                {d.opciones.map(o=><option key={o.codigo} value={o.codigo}>{o.nombre} · {o.codigo}</option>)}
              </select>
              {!d.opciones.length&&<small style={{color:"#aaa"}}>Sin efectivos definidos para esta fecha aún.</small>}
            </td>
            <td style={{padding:8}}><button onClick={()=>guardarFila(d.fecha)} style={{padding:"9px 14px",border:0,borderRadius:7,background:"#b3241c",color:"#fff",fontWeight:800,whiteSpace:"nowrap"}}>Guardar</button></td>
          </tr>)}</tbody>
        </table>}
        {msg&&<div style={{marginTop:12,padding:11,background:"#101216",border:"1px solid #3a3d44",borderRadius:7}}>{msg}</div>}
      </section>
    </div>
  </main>;
}
