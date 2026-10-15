/* Germania · consulta individual de asistencia 2026, bajo demanda y solo lectura. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nombre=m=>[m.nombre,m.apellidoPaterno,m.apellidoMaterno].filter(Boolean).join(" ").trim();
const apellido=m=>String(m.apellidoPaterno||m.apellidoMaterno||m.nombre||"—").trim();
const estadoTexto=v=>v==="presente"?"Asistió":v==="justificado"?"Justificó":"No asistió";
let contexto=null,seleccion="",ultimoResumen=null;

function recopilar(m,partes,vigente,aplica,categoria){
 const filas=[],categorias={};
 for(const pt of partes){
  if(!vigente(m,pt.date)||!aplica(pt,m.id))continue;
  const estado=pt.records?.[m.id]||"ausente",tipo=categoria(pt);
  if(!categorias[tipo])categorias[tipo]={total:0,pres:0,just:0,aus:0};
  const c=categorias[tipo];c.total++;
  if(estado==="presente")c.pres++;
  else if(estado==="justificado")c.just++;
  else c.aus++;
  filas.push({fecha:pt.date,tipo,actividad:String(pt.tipo||"Sin tipo"),detalle:String(pt.detalle||""),estado});
 }
 filas.sort((a,b)=>b.fecha.localeCompare(a.fecha)||a.actividad.localeCompare(b.actividad,"es"));
 const presentes=filas.filter(f=>f.estado==="presente").length;
 const justificados=filas.filter(f=>f.estado==="justificado").length;
 return {filas,categorias,presentes,justificados,ausentes:filas.length-presentes-justificados,
  obligaciones:filas.length,porcentaje:filas.length?100*presentes/filas.length:0};
}
function errorConsulta(mensaje){
 const caja=$("pnPersonaDetalle");if(caja)caja.innerHTML='<p class="sub">'+esc(mensaje)+'</p>';
 const boton=$("pnPersonaPdf");if(boton)boton.disabled=true;
 ultimoResumen=null;
}
function elegir(id){
 seleccion=id||"";
 const ctx=contexto;
 if(!ctx||!seleccion){errorConsulta("Selecciona el nombre completo para consultar sus asistencias e inasistencias.");return;}
 const persona=ctx.r.porPersona.find(x=>String(x.m.id)===seleccion);
 if(!persona){errorConsulta("El voluntario no está disponible en este período.");return;}
 const res=recopilar(persona.m,ctx.partes,ctx.vigente,ctx.aplica,ctx.categoria);
 ultimoResumen={persona:persona.m,datos:res,periodo:ctx.R.etiqueta};
 const sum='<div class="pn-persona-kpis">'+
  '<span><b>'+res.porcentaje.toFixed(1)+'%</b>Asistencia</span>'+
  '<span><b>'+res.presentes+'</b>Asistencias</span>'+
  '<span><b>'+res.obligaciones+'</b>Citaciones aplicables</span>'+
  '<span><b>'+res.justificados+'</b>Justificadas</span>'+
  '<span><b>'+res.ausentes+'</b>Ausencias</span></div>';
 const categorias=Object.entries(res.categorias).sort((a,b)=>a[0].localeCompare(b[0],"es")).map(([tipo,c])=>
  '<tr><td>'+esc(tipo)+'</td><td>'+c.pres+'</td><td>'+c.aus+'</td><td>'+c.just+'</td><td><strong>'+(100*c.pres/c.total).toFixed(1)+'%</strong></td></tr>').join("");
 const detalle=res.filas.map(f=>'<tr class="'+(f.estado==="ausente"?"pn-falta":"")+'"><td>'+esc(f.fecha)+'</td><td><b>'+esc(f.actividad)+'</b>'+(f.detalle?'<small>'+esc(f.detalle)+'</small>':"")+'</td><td>'+esc(f.tipo)+'</td><td><span class="pn-estado pn-'+esc(f.estado)+'">'+estadoTexto(f.estado)+'</span></td></tr>').join("");
 const caja=$("pnPersonaDetalle");
 if(caja)caja.innerHTML='<h3>'+esc(nombre(persona.m))+'</h3><p class="sub">'+esc(ctx.R.etiqueta)+' · Solo registros de asistencia correspondientes al voluntario.</p>'+
  sum+'<h4>Asistencia por tipo de actividad</h4>'+
  (categorias?'<div class="pn-tabla-wrap"><table><thead><tr><th>Actividad</th><th>Asist.</th><th>Faltas</th><th>Just.</th><th>%</th></tr></thead><tbody>'+categorias+'</tbody></table></div>':'<p class="sub">Sin convocatorias aplicables en este período.</p>')+
  '<details class="pn-eventos"><summary>Ver actividades y fechas ('+res.filas.length+')</summary>'+
  (detalle?'<div class="pn-tabla-wrap"><table><thead><tr><th>Fecha</th><th>Actividad</th><th>Categoría</th><th>Estado</th></tr></thead><tbody>'+detalle+'</tbody></table></div>':'<p class="sub">No se registran actividades.</p>')+'</details>';
 const boton=$("pnPersonaPdf");if(boton)boton.disabled=false;
}
function generarPdf(){
 if(!contexto||!ultimoResumen||!seleccion||String(ultimoResumen.persona.id)!==seleccion)return;
 const {persona,datos,periodo}=ultimoResumen;
 const {jsPDF}=window.jspdf||{};if(!jsPDF){alert("El generador PDF aún no está disponible.");return;}
 const doc=new jsPDF(),ctx=contexto;
 ctx.cabeceraPdf(doc,"ASISTENCIA INDIVIDUAL");
 doc.setFont("helvetica","bold");doc.setFontSize(11);
 doc.text(nombre(persona),35,35);
 doc.setFont("helvetica","normal");doc.setFontSize(9);
 doc.text(periodo,35,41);
 doc.autoTable({startY:48,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]},
  head:[["Resumen de asistencia","Cantidad"]],
  body:[["Citaciones aplicables",String(datos.obligaciones)],["Asistencias",String(datos.presentes)],
    ["Inasistencias",String(datos.ausentes)],["Justificadas",String(datos.justificados)],
    ["Porcentaje de asistencia",datos.porcentaje.toFixed(1)+"%"]]});
 doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
  head:[["Categoría","Convocatorias","Asistió","Faltó","Justificó","%"]],
  body:Object.entries(datos.categorias).map(([tipo,d])=>[tipo,String(d.total),String(d.pres),
   String(d.aus),String(d.just),(100*d.pres/d.total).toFixed(1)+"%"])});
 doc.autoTable({startY:doc.lastAutoTable.finalY+8,styles:{fontSize:7.5,cellPadding:2},headStyles:{fillColor:[179,36,28]},
  head:[["Fecha","Tipo de actividad","Detalle","Resultado"]],
  body:datos.filas.map(f=>[f.fecha,f.actividad+" · "+f.tipo,f.detalle||"—",estadoTexto(f.estado)]),
  didParseCell:function(data){if(data.section==="body"&&data.column.index===3&&data.cell.raw==="No asistió")data.cell.styles.textColor=[180,20,35];}});
 const archivo="asistencia_"+nombre(persona).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").toLowerCase()+
  "_"+ctx.R.desde+"_"+ctx.R.hasta+".pdf";
 Promise.resolve(ctx.descargarPdf(doc,archivo)).catch(e=>{console.error("PDF individual",e);alert("No fue posible generar el PDF individual.");});
}
function render(ctx){
 contexto=ctx;
 const tbody=$("pnDetalle"),select=$("pnPersonaSelect");
 if(!tbody||!select)return;
 tbody.innerHTML=ctx.r.porPersona.slice().sort((a,b)=>(a.m.n||999)-(b.m.n||999)).map(x=>{
  const s=ctx.stats[x.m.id]||{pres:0,oblig:0};
  return '<tr><td class="name-col" title="'+esc(nombre(x.m))+'">'+esc(apellido(x.m))+'</td>'+
   '<td>'+s.pres+'</td><td>'+s.oblig+'</td><td><strong>'+x.p.toFixed(1)+'%</strong></td></tr>';
 }).join("");
 const orden=ctx.r.porPersona.slice().sort((a,b)=>nombre(a.m).localeCompare(nombre(b.m),"es"));
 select.innerHTML='<option value="">Selecciona un voluntario…</option>'+orden.map(x=>
  '<option value="'+esc(String(x.m.id))+'">'+esc(nombre(x.m))+'</option>').join("");
 if(!orden.some(x=>String(x.m.id)===seleccion))seleccion="";
 select.value=seleccion;
 select.onchange=()=>elegir(select.value);
 const pdf=$("pnPersonaPdf");if(pdf)pdf.onclick=generarPdf;
 if(seleccion)elegir(seleccion);else errorConsulta("Selecciona el nombre completo para ver su asistencia y descargar el informe.");
}
window.GermaniaEstadisticaIndividual={render,recopilar};
})();
