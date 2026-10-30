/* GERMANIA · Resumen en vivo al pie de Asistencia → Pasar lista.
 * Solo lectura: NO modifica partes, nómina, PDFs, API ni Neon.
 * La interfaz clásica continúa siendo la fuente de verdad para los estados.
 */
(function(window, document){
  "use strict";

  function contar(roster, estados){
    var c={total:0,presente:0,ausente:0,justificado:0,sinMarcar:0,noPresentes:0,porcentaje:0};
    (Array.isArray(roster)?roster:[]).forEach(function(p){
      if(!p||p.activo===false)return;
      c.total++;
      var estado=estados&&estados[p.id];
      if(estado==="presente")c.presente++;
      else if(estado==="justificado")c.justificado++;
      else if(estado==="ausente")c.ausente++;
      else c.sinMarcar++;
    });
    c.noPresentes=c.ausente+c.justificado;
    c.porcentaje=c.total?Math.round(c.presente/c.total*100):0;
    return c;
  }

  window.GermaniaResumenAsistencia={contar:contar};

  function iniciar(){
    var tbody=document.getElementById("listaBody");
    if(!tbody||document.getElementById("asistenciaResumenVivo"))return;
    var tabla=tbody.closest("table");
    if(!tabla)return;

    var estilo=document.createElement("style");
    estilo.textContent=
      '#asistenciaResumenVivo{margin:14px 0 4px;padding:14px;border:1px solid #535c61;'+
      'border-radius:12px;background:#10181e;}'+
      '#asistenciaResumenVivo h2{font-size:19px;margin:0 0 10px;}'+
      '#asistenciaResumenVivo .ar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}'+
      '#asistenciaResumenVivo .ar-item{padding:9px 5px;text-align:center;'+
      'border:1px solid #3b454c;border-radius:8px;background:#17232c;min-width:0;}'+
      '#asistenciaResumenVivo .ar-valor{font-size:23px;font-weight:800;line-height:1.2;color:#ffcc00;}'+
      '#asistenciaResumenVivo .ar-label{font-size:13px;color:#e0e5e8;margin-top:3px;}'+
      '#asistenciaResumenVivo .ar-note{margin:9px 0 0;font-size:13px;color:#b8c4ca;}'+
      '@media(max-width:640px){#asistenciaResumenVivo .ar-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}';
    document.head.appendChild(estilo);

    var seccion=document.createElement("section");
    seccion.id="asistenciaResumenVivo";
    seccion.setAttribute("aria-label","Resumen actualizado de asistencia");
    seccion.innerHTML='<h2>Resumen de asistencia</h2><div class="ar-grid" id="arValores" aria-live="polite"></div>'+
      '<p class="ar-note">No presentes = ausentes + justificados. Sin marcar no equivale a ausente.</p>';
    tabla.insertAdjacentElement("afterend",seccion);
    function item(numero,texto){
      return '<div class="ar-item"><div class="ar-valor">'+numero+
        '</div><div class="ar-label">'+texto+'</div></div>';
    }
    function actualizar(){
      try{
        var c=contar(typeof ROSTER!=="undefined"?ROSTER:[],
          typeof currentRecord!=="undefined"?currentRecord:{});
        var vista=document.getElementById("arValores");
        if(vista)vista.innerHTML=
          item(c.total,"Total voluntarios")+
          item(c.presente,"Presentes")+
          item(c.ausente,"Ausentes")+
          item(c.justificado,"Justificados")+
          item(c.sinMarcar,"Sin marcar")+
          item(c.porcentaje+"%","Asistencia");
      }catch(error){
        console.error("No se pudo mostrar resumen de asistencia",error);
      }
    }
    /* Los clics individuales actualizan currentRecord antes de burbujear a tbody. */
    tbody.addEventListener("click",function(e){
      if(e.target.closest("[data-status]"))actualizar();
    });
    var todos=document.getElementById("marcarTodosBtn");
    if(todos)todos.addEventListener("click",actualizar);
    /* Fecha/tipo y carga de partes guardados reconstruyen las filas asincrónicamente. */
    new MutationObserver(actualizar).observe(tbody,{childList:true});

    /* Tras guardar se conservan los botones PDF/WhatsApp, pero NO se duplica el resumen. */
    var resumenAnterior=document.getElementById("resumenRow");
    if(resumenAnterior)resumenAnterior.hidden=true;
    var box=document.getElementById("resumenBox");
    var titulo=box&&box.querySelector("h2");
    if(titulo)titulo.textContent="Parte guardado · Exportar";
    actualizar();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);
  else iniciar();
})(window,document);
