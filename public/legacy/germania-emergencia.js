/* GERMANIA · Mejoras de Emergencia B-5 / Hoja de servicio (STAGING).
 * Horas automáticas, botones "Salida" y "Llegué al cuartel", contador de concurrentes arriba y abajo,
 * Recuperar hojas anteriores, Inicio, eliminar tipo de actividad y envío a Investigación de Incendios (previa consulta).
 */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i);};
  function e2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function ahora(){var d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
  function setHora(id,v){var el=$(id);if(el){el.value=v;el.dispatchEvent(new Event("change",{bubbles:true}));}}
  function msg(t,err){var m=$("svMsg");if(!m)return;m.classList.toggle("err",!!err);m.textContent=t;}

  function montar(){
    var panel=$("panel-servicio");if(!panel||$("svSalidaAhora"))return;
    /* botones junto a las horas */
    var hs=$("svHoraSalida"),hl=$("svHoraLlegada");
    var b1=document.createElement("button");b1.type="button";b1.id="svSalidaAhora";b1.className="btn small secondary sv-hbtn";b1.textContent="Salida ahora";
    var b2=document.createElement("button");b2.type="button";b2.id="svLlegadaAhora";b2.className="btn small gold sv-hbtn";b2.textContent="Llegué al cuartel";
    hs.parentNode.appendChild(b1);hl.parentNode.appendChild(b2);
    b1.onclick=function(){setHora("svHoraSalida",ahora());};
    b2.onclick=function(){setHora("svHoraLlegada",ahora());msg("Llegada registrada a las "+ahora()+".");};
    /* contador arriba de la lista */
    var tabla=$("svBody").closest("table");
    var top=document.createElement("div");top.id="svConteoTop";top.className="cit-conteo";tabla.parentNode.insertBefore(top,tabla);
    new MutationObserver(conteo).observe($("svResumen"),{childList:true,subtree:true});
    conteo();
    /* botones extra */
    var barra=$("svGuardarBtn").parentNode;
    function btn(id,txt,cls,fn){var b=document.createElement("button");b.type="button";b.id=id;b.className="btn "+cls;b.textContent=txt;b.onclick=fn;barra.appendChild(b);return b;}
    btn("svNuevaBtn","Nueva hoja","secondary",nueva);
    btn("svRecuperarBtn","Recuperar","secondary",recuperar);
    btn("svInvestBtn","Enviar a Investigación de Incendios","secondary",investigacion);
    btn("svInicioBtn","Inicio","secondary",function(){if(window.__mostrarPestana)window.__mostrarPestana("germania");});
    /* eliminar tipo de actividad */
    var add=$("svTipoActAgregarBtn");
    var del=document.createElement("button");del.type="button";del.id="svTipoActEliminarBtn";del.className="btn small secondary";del.textContent="Eliminar tipo";
    add.parentNode.appendChild(del);del.onclick=eliminarTipo;
    /* al abrir una hoja nueva: fecha y hora de salida ya llenas */
    new MutationObserver(function(){if(panel.classList.contains("active"))prellenar();}).observe(panel,{attributes:true,attributeFilter:["class"]});
    if(panel.classList.contains("active"))prellenar();
  }
  var prellenado=false;
  function prellenar(){
    if(!$("svFecha").value)$("svFecha").value=(typeof todayISO==="function"?todayISO():new Date().toISOString().slice(0,10));
    if(!$("svHoraSalida").value&&!prellenado){prellenado=true;setHora("svHoraSalida",ahora());}
    else if(typeof cargarServicio==="function"&&!prellenado){prellenado=true;cargarServicio();}
  }
  function conteo(){
    var t=$("svConteoTop");if(!t||typeof svConteo!=="function")return;
    var c=svConteo();
    t.innerHTML='<span class="p"><b>'+c.concurrentes+'</b> Concurren</span><span class="a"><b>'+c.no+'</b> No concurren</span>';
  }
  function overlay(html){
    var ov=document.createElement("div");ov.className="cit-ov";ov.style.alignItems="flex-start";
    ov.innerHTML='<div class="cit-modal" style="max-height:92vh;overflow:auto">'+html+'</div>';document.body.appendChild(ov);return ov;
  }
  async function recuperar(){
    var idx=await sGet("servicio:index:v1",[]);idx=Array.isArray(idx)?idx:[];
    idx=idx.slice().sort(function(a,b){return String(b.clave).localeCompare(String(a.clave));}).slice(0,60);
    var ov=overlay('<h3>Recuperar hoja de servicio</h3><div id="svRecL">'+(idx.length?idx.map(function(x,i){
      var m=/servicio:(\d{4}-\d{2}-\d{2})__(\d{2})(\d{2})/.exec(x.clave||"");
      var f=m?m[1]:(x.fecha||""),h=m?m[2]+":"+m[3]:"";
      return '<div class="ant-fila"><button type="button" class="ant-abrir" data-i="'+i+'">'+e2(x.tipo||"Servicio")+' – '+e2(f)+(h?' – '+h:'')+'</button></div>';
    }).join(""):'<p class="sub">Aún no hay hojas guardadas.</p>')+'</div><div class="cit-acc"><button type="button" class="btn small secondary" id="svRecC">Cerrar</button></div>');
    ov.querySelector("#svRecC").onclick=function(){ov.remove();};
    ov.querySelector("#svRecL").addEventListener("click",function(ev){
      var b=ev.target.closest("[data-i]");if(!b)return;var x=idx[+b.dataset.i];
      var m=/servicio:(\d{4}-\d{2}-\d{2})__(\d{2})(\d{2})/.exec(x.clave||"");
      if(m){$("svFecha").value=m[1];$("svHoraSalida").value=m[2]+":"+m[3];prellenado=true;cargarServicio();}
      ov.remove();msg("Hoja recuperada. Puedes modificarla y volver a guardar, enviar o generar el PDF.");
    });
  }
  function nueva(){
    if(!confirm("¿Empezar una hoja nueva? Lo que no guardaste en esta pantalla se borra."))return;
    SV_CAMPOS.forEach(function(id){var el=$(id);if(el&&id!=="svTipoAct")el.value="";});
    $("svFecha").value=todayISO();prellenado=true;setHora("svHoraSalida",ahora());
    msg("Hoja nueva: fecha y hora de salida ya están llenas.");
  }
  async function eliminarTipo(){
    var sel=$("svTipoAct"),t=sel.value;if(!t)return;
    var base=["Emergencia","Acto de servicio"];
    if(base.indexOf(t)>=0){alert("«"+t+"» es un tipo base y no se puede eliminar.");return;}
    if(!confirm("¿Eliminar el tipo «"+t+"» de la lista? Las hojas ya guardadas no se modifican."))return;
    SV_TIPOS=SV_TIPOS.filter(function(x){return x!==t;});
    await sSet(SV_TIPOS_KEY,SV_TIPOS);renderSvTipoOptions();actualizarFichaCombustible();
  }
  /* Investigación de Incendios: solo con consulta previa, sin las novedades de oficiales. */
  async function investigacion(){
    var ov=overlay('<h3>Enviar a Investigación de Incendios</h3><p class="sub">Este parte solo se envía al Departamento de Investigación de Incendios cuando ellos lo solicitan. Se envía el PDF para compartir, <b>sin</b> las novedades de oficiales.</p><label class="cit-chk"><input type="checkbox" id="invOk"> Confirmo que el Departamento lo solicitó</label><div class="field"><input type="text" id="invQuien" placeholder="Quien solicita / quien envía"></div><div class="cit-acc"><button type="button" class="btn small" id="invEnv">Enviar</button><button type="button" class="btn small secondary" id="invCan">Cancelar</button></div><div class="status-msg" id="invMsg"></div>');
    ov.querySelector("#invCan").onclick=function(){ov.remove();};
    ov.querySelector("#invEnv").onclick=async function(){
      var m=ov.querySelector("#invMsg");
      if(!ov.querySelector("#invOk").checked||!ov.querySelector("#invQuien").value.trim()){m.textContent="Marca la confirmación e indica quién envía.";m.classList.add("err");return;}
      var g=function(id){return $(id).value||"";};
      var texto="PARTE DE EMERGENCIA B-5 · Quinta Compañía \"Germania\"\n"+g("svTipoAct")+" · "+g("svFecha")+" "+g("svHoraSalida")+"\nEnviado a solicitud del Departamento de Investigación de Incendios.";
      var doc=buildServicioPdf(false),nombre="Investigacion_"+svNombrePdf();
      var shared=await sharePdfDoc(doc,nombre,texto);
      if(!shared){
        window.open("mailto:?subject="+encodeURIComponent("Parte de emergencia B-5 – "+g("svFecha"))+"&body="+encodeURIComponent(texto+"\n\n(Adjunta el PDF descargado. Remitente: "+(typeof CORREO_COMPANIA!=="undefined"?CORREO_COMPANIA:"germaniacbv@gmail.com")+")"));
      }
      try{
        var clave=svClave(),r=await sGet(clave,null);
        if(r){r.enviosInvestigacion=(r.enviosInvestigacion||[]).concat([{en:new Date().toISOString(),por:ov.querySelector("#invQuien").value.trim()}]);await sSet(clave,r);}
      }catch(e){}
      ov.remove();msg("Enviado a Investigación de Incendios (queda registrado quién y cuándo).");
    };
  }
  var st=document.createElement("style");
  st.textContent=".sv-hbtn{margin-top:6px;min-height:44px}#svBody .seg button{min-height:44px}#panel-servicio .card:last-child .btn{min-height:48px}";
  document.head.appendChild(st);
  function iniciar(){montar();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(iniciar,400);});else setTimeout(iniciar,400);
})();
