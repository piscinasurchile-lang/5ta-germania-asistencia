/* Germania · Interfaz de conciliación de asistencia anual.
 * No modifica la asistencia hasta que Oficialidad confirma el resultado.
 */
(function(document, window){
  "use strict";
  const API="/api/asistencia/conciliar";
  const escapeHTML=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function init(){
    const destino=document.getElementById("sub-importar");
    if(!destino||document.getElementById("conciliacionAsistencia"))return;
    const card=document.createElement("section");
    card.className="card";
    card.id="conciliacionAsistencia";
    card.innerHTML=
      '<h2 style="border-left:5px solid var(--fire);padding-left:12px;">Actualizar asistencia desde Excel</h2>'+
      '<p class="sub">Sube la planilla anual completa (.xlsx o .csv). Germania compara antes de guardar. No borra registros anteriores ni reemplaza asistencias sin revisión.</p>'+
      '<div class="field" style="margin:14px 0;"><label for="conciliacionArchivo">Archivo de asistencia</label>'+
      '<input id="conciliacionArchivo" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" style="min-height:48px;"></div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">'+
      '<button type="button" class="btn" id="conciliacionComparar" style="min-height:48px;">Comparar con Germania</button>'+
      '<button type="button" class="btn gold" id="conciliacionAplicar" style="min-height:48px;" disabled>Aplicar nuevas actividades</button></div>'+
      '<div id="conciliacionMensaje" role="status" aria-live="polite" style="margin-top:12px;"></div>'+
      '<div id="conciliacionResultados" style="margin-top:14px;"></div>';
    destino.insertBefore(card,destino.firstChild);
    // Las herramientas fijas de 2026 y el importador CSV anterior se ocultan
    // en esta versión: continúan en el código hasta completar la migración validada.
    for(const id of ["impCargarBtn","impArchivo"]){
      const b=document.getElementById(id);
      if(b?.closest(".card"))b.closest(".card").hidden=true;
    }
    const archivo=document.getElementById("conciliacionArchivo");
    const comparar=document.getElementById("conciliacionComparar");
    const aplicar=document.getElementById("conciliacionAplicar");
    const mensaje=document.getElementById("conciliacionMensaje");
    const resultados=document.getElementById("conciliacionResultados");
    let revisado=null;
    function reset(){
      revisado=null;
      aplicar.disabled=true;
      resultados.replaceChildren();
      mensaje.textContent="";
    }
    archivo.addEventListener("change",reset);
    async function enviar(accion){
      const form=new FormData();
      form.append("archivo",archivo.files[0]);
      form.append("accion",accion);
      if(accion==="aplicar"&&revisado)form.append("huella",revisado.huella);
      const response=await fetch(API,{method:"POST",body:form,credentials:"same-origin",cache:"no-store"});
      const data=await response.json().catch(()=>({error:"Respuesta inválida del servidor"}));
      if(!response.ok)throw new Error(data.error||"No se pudo completar la operación");
      return data;
    }
    function filaDetalle(a){
      const ubicacion=a.ubicacion||"";
      return '<li style="margin-bottom:6px;">'+escapeHTML([a.fecha,a.tipo,a.detalle,ubicacion].filter(Boolean).join(" · "))+ (a.motivo?'<div style="color:#ffd071;">'+escapeHTML(a.motivo)+'</div>':"")+'</li>';
    }
    function seccion(titulo,items){
      if(!items?.length)return "";
      return '<details style="margin:12px 0;"><summary style="cursor:pointer;min-height:44px;padding:8px 0;">'+
        escapeHTML(titulo)+' ('+items.length+(items.length>=35?" o más":"")+')</summary>'+
        '<ul style="margin:8px 0;padding-left:20px;font-size:13px;">'+items.map(filaDetalle).join("")+'</ul></details>';
    }
    function dibujar(data){
      const t=data.totales||{};
      const valores=[
        ["Filas del archivo",t.filas],["Ya existentes",t.existentes],["Nuevas",t.nuevas],
        ["Diferencias",t.diferencias],["Ambiguas",t.ambiguas],
        ["Duplicadas en archivo",t.duplicadasArchivo],["Errores",t.errores],
        ["Fuera del índice",t.fueraIndice]
      ];
      resultados.innerHTML='<h3 style="margin-top:8px;">Resultado de la comparación</h3>'+
        '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;">'+
        valores.map(([label,n])=>'<div style="border:1px solid var(--line);padding:10px;border-radius:9px;">'+
        '<div style="font-family:Oswald,sans-serif;font-size:23px;color:var(--gold);">'+Number(n||0)+'</div>'+
        '<div style="font-size:13px;">'+escapeHTML(label)+'</div></div>').join("")+'</div>'+
        seccion("Actividades nuevas",data.nuevas)+
        seccion("Diferencias para revisión",data.diferencias)+
        seccion("Actividades ambiguas",data.ambiguas)+
        seccion("Duplicados dentro del archivo",data.duplicadasArchivo)+
        seccion("Filas con errores",data.errores)+
        '<p class="foot-note">El archivo original no se almacena en Germania. Las guardias nocturnas no se incluyen en esta importación.</p>';
      aplicar.disabled=!(data.puedeAplicar&&(t.nuevas||t.fueraIndice));
      if(!data.puedeAplicar)mensaje.textContent="No se aplicarán cambios hasta resolver las discrepancias mostradas.";
      else mensaje.textContent="Comparación completada. Solo se agregarán actividades nuevas y se recuperarán partes existentes fuera del índice.";
    }
    comparar.addEventListener("click",async()=>{
      if(!archivo.files?.length){mensaje.textContent="Selecciona un archivo Excel o CSV.";return;}
      reset();comparar.disabled=true;mensaje.textContent="Comparando el archivo con los registros vigentes...";
      try{revisado=await enviar("vista_previa");dibujar(revisado);}
      catch(e){mensaje.textContent=e.message;}
      finally{comparar.disabled=false;}
    });
    aplicar.addEventListener("click",async()=>{
      if(!revisado||!archivo.files?.length)return;
      if(!window.confirm("¿Confirmar incorporación de actividades nuevas? Los registros existentes no se sobrescribirán."))return;
      comparar.disabled=true;aplicar.disabled=true;mensaje.textContent="Verificando y guardando en Germania...";
      try{
        const res=await enviar("aplicar");
        revisado=null;
        mensaje.textContent="Actualización realizada. Nuevas: "+res.aplicadas+". Recuperadas del índice: "+res.recuperadasIndice+". Actualizando estadísticas...";
        resultados.replaceChildren();
        window.location.reload();
      }catch(e){
        mensaje.textContent=e.message+" Vuelve a pulsar Comparar.";
      }finally{comparar.disabled=false;}
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})(document,window);
