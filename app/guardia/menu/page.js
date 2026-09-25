"use client";
import Link from "next/link";

const items=[
  ["Calendario de Guardia","/guardia/calendario","Solo Oficialidad · Crear semana y abrir inscripción"],
  ["Inscripción de Guardia","/guardia","Voluntarios"],
  ["Lista diaria","/guardia/lista-diaria","Oficialidad"],
  ["OBAC","/guardia/obac","Confirmación"],
  ["Reemplazos","/guardia/solicitudes","Solicitud y aprobación"],
  ["Conductor","/guardia/conductor","Asignación"],
  ["Orden del Día / PDF","/guardia/orden-dia","Validación y emisión"],
  ["Archivo de ODD","/guardia/archivo","Órdenes emitidas"],
  ["Histórico y estadísticas","/guardia/historico","Seguimiento"]
];

export default function MenuGuardia(){
 return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial,sans-serif",padding:"18px 12px 42px"}}>
  <div style={{width:"100%",maxWidth:720,margin:"0 auto"}}>
   <section style={{display:"flex",gap:14,alignItems:"center",padding:18,background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #c72c2c",borderRadius:12,marginBottom:14}}>
    <div style={{width:54,height:60,border:"2px solid #d5a62e",borderRadius:8,display:"grid",placeItems:"center",color:"#d5a62e",fontWeight:900,fontSize:18,flex:"0 0 auto"}}>5ª</div>
    <div><div style={{color:"#d5a62e",fontWeight:800,fontSize:11,letterSpacing:".7px"}}>CUERPO DE BOMBEROS DE VILLARRICA</div><h1 style={{fontSize:21,margin:"4px 0"}}>Quinta Compañía “Germania”</h1><p style={{margin:0,color:"#b8b8b8",fontSize:14}}>Guardia Nocturna · Menú operativo</p></div>
   </section>
   <section style={{padding:12,background:"#15171b",border:"1px solid #30333a",borderRadius:12}}>
    {items.map(([t,h,s])=><Link href={h} key={h} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,minHeight:64,padding:"10px 16px",margin:"8px 0",background:"#101216",border:"1px solid #30333a",borderRadius:9,color:"#f4f4f4",textDecoration:"none"}}>
      <span><strong style={{display:"block",fontSize:16}}>{t}</strong><small style={{display:"block",marginTop:3,color:"#a9abb0",fontSize:12}}>{s}</small></span><span style={{color:"#d5a62e",fontSize:27,fontWeight:700}}>›</span>
    </Link>)}
   </section>
  </div>
 </main>
}