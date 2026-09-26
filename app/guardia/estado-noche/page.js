"use client";
import{useEffect,useState}from"react";
import Script from "next/script";
import{LOGO_B64}from"../../../lib/logo.js";
function hoy(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
const COMANDANCIA={comandante_1:"Comandante 1°",comandante_3:"Comandante 3°"};
export default function EstadoNoche(){const[fecha,setFecha]=useState(hoy()),[estado,setEstado]=useState("activa"),[compania,setCompania]=useState(""),[motivo,setMotivo]=useState(""),[documento,setDocumento]=useState(""),[instruidoPor,setInstruidoPor]=useState(""),[oficial,setOficial]=useState(""),[msg,setMsg]=useState(""),[guardado,setGuardado]=useState(false);async function cargar(){const r=await fetch("/api/guardia/estado-noche?fecha="+fecha,{cache:"no-store"}),j=await r.json();if(r.ok){const x=j.estado;setEstado(x.estado||"activa");setCompania(x.compania_cubre||"");setMotivo(x.motivo||"");setDocumento(x.documento||"");setInstruidoPor(x.instruido_por||"");setGuardado(x.estado&&x.estado!=="activa")}}useEffect(()=>{cargar()},[fecha]);async function guardar(){setMsg("");setGuardado(false);const r=await fetch("/api/guardia/estado-noche",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fecha,estado,companiaCubre:compania,motivo,documento,instruidoPor,autorizadoPor:oficial})}),j=await r.json();setMsg(r.ok?"Estado de la noche actualizado.":j.error==="reason_required"?"Debe indicar el motivo.":j.error==="comandancia_required"?"Debe indicar qué Comandante instruyó el cambio.":j.error==="company_required"?"Debe indicar qué compañía cubre.":"Revise el código del oficial y los datos.");setGuardado(r.ok&&estado!=="activa")}
function generarPdf(){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  try{doc.addImage(LOGO_B64,"PNG",14,10,17,19)}catch(e){}
  doc.setFont("helvetica","bold");doc.setFontSize(14);
  doc.text("CONSTANCIA DE ESTADO DE GUARDIA",35,18);
  doc.setFont("helvetica","normal");doc.setFontSize(10);
  doc.text('Quinta Compañía de Bomberos "Germania" de Villarrica',35,24);
  doc.setFontSize(8);doc.text("Cuerpo de Bomberos de Villarrica",35,28.5);
  doc.setFontSize(10);
  const rows=[["Fecha",fecha],["Estado",estado==="suspendida"?"Guardia suspendida":estado==="cubierta_otra_compania"?"Cubierta por otra compañía":"Activa"]];
  if(estado==="cubierta_otra_compania")rows.push(["Compañía que cubre",compania||"—"]);
  rows.push(["Instruido por",COMANDANCIA[instruidoPor]||"—"],["Motivo",motivo||"—"],["Documento / referencia",documento||"—"]);
  doc.autoTable({head:[["Campo","Detalle"]],body:rows,startY:36,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});
  const fy=doc.lastAutoTable.finalY+16;
  doc.setFontSize(9);
  doc.line(20,fy,85,fy);doc.text("Oficial que registra",20,fy+5);
  doc.line(115,fy,180,fy);doc.text("Comandancia (referencia)",115,fy+5);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+18);
  doc.save(`constancia_estado_guardia_${fecha}.pdf`);
}
const I={width:"100%",padding:12,background:"#101216",color:"#fff",border:"1px solid #3a3d44",borderRadius:7};
return <main style={{minHeight:"100vh",background:"#0d0e11",color:"#f2f2f2",fontFamily:"Arial,sans-serif",padding:14}}><div style={{maxWidth:620,margin:"auto"}}><header style={{background:"#15171b",border:"1px solid #30333a",borderTop:"4px solid #b3241c",borderRadius:10,padding:18,marginBottom:12}}><b style={{color:"#c9a227",fontSize:11}}>CUERPO DE BOMBEROS DE VILLARRICA</b><h1 style={{margin:"5px 0",fontSize:22}}>Suspensión o cambio de compañía</h1><span style={{color:"#aaa"}}>Guardia Nocturna · Solo Oficialidad</span></header><section style={{background:"#15171b",border:"1px solid #30333a",borderRadius:10,padding:16,display:"grid",gap:12}}><label>Fecha<input type="date" style={I} value={fecha} onChange={e=>setFecha(e.target.value)}/></label><label>Estado<select style={I} value={estado} onChange={e=>setEstado(e.target.value)}><option value="activa">Guardia activa</option><option value="suspendida">Guardia suspendida</option><option value="cubierta_otra_compania">Cubierta por otra compañía</option></select></label>{estado==="cubierta_otra_compania"&&<label>Compañía que cubre<input style={I} value={compania} onChange={e=>setCompania(e.target.value)}/></label>}{estado!=="activa"&&<label>Instruido por (Comandancia)<select style={I} value={instruidoPor} onChange={e=>setInstruidoPor(e.target.value)}><option value="">— seleccionar —</option><option value="comandante_1">Comandante 1°</option><option value="comandante_3">Comandante 3°</option></select></label>}{estado!=="activa"&&<label>Motivo (ingreso manual, obligatorio)<textarea style={{...I,minHeight:90}} value={motivo} onChange={e=>setMotivo(e.target.value)}/></label>}<label>Documento / referencia<input style={I} value={documento} onChange={e=>setDocumento(e.target.value)}/></label><label>Código oficial que registra el cambio<input inputMode="numeric" style={I} value={oficial} onChange={e=>setOficial(e.target.value.replace(/\D/g,"").slice(0,6))}/></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={guardar} style={{padding:13,border:0,borderRadius:7,background:"#b3241c",color:"#fff",fontWeight:800,flex:1}}>Guardar estado</button>{guardado&&<button onClick={generarPdf} style={{padding:13,border:"1px solid #3a3d44",borderRadius:7,background:"#101216",color:"#c9a227",fontWeight:800}}>Generar constancia PDF</button>}</div>{msg&&<div style={{padding:11,background:"#101216",border:"1px solid #3a3d44",borderRadius:7}}>{msg}</div>}</section></div>
<Script src="/legacy/jspdf.min.js" strategy="afterInteractive"/>
<Script src="/legacy/jspdf-autotable.min.js" strategy="afterInteractive"/>
</main>}