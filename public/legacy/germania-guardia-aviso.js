/* GERMANIA · Próximas guardias (Inicio): cada voluntario toca SOLO sus noches y puede
 * "Confirmo mi guardia" o "No podré asistir" (motivo obligatorio → aviso al Teniente Tercero).
 * Ya no navega a Gestión de guardia. El aviso usa la misma clave y forma que "No puedo esta noche"
 * (guardia-aviso:<fecha>:<voluntario>), así el flujo de reemplazo del T3 no cambia.
 * La confirmación guarda guardia-asiste:<fecha>:<voluntario>.
 */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i);};
  function e2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  var sel=null; /* {f, rol} noche abierta */
  var NOTA="¿No puedes ir? Toca tu noche y avísale al Teniente Tercero desde aquí.";
  function yo(){var s=$("miVoluntario");return s&&s.value?String(s.value):"";}
  function persona(){var id=yo();return (typeof ROSTER!=="undefined"?ROSTER:[]).find(function(x){return String(x.id)===id;})||null;}
  function corto(p){return p?[p.nombre,p.apellidoPaterno].filter(Boolean).join(" "):"";}
  function rolDe(btn){var t=btn.textContent||"";return /OBAC/i.test(t)?"obac":/Maquinista/i.test(t)?"maq":"vol";}
  var ROLTXT={vol:"Voluntario",maq:"Maquinista",obac:"OBAC"};
  /* Tiempos en hora de Chile (la noche f va de f 22:45 a f+1 06:00). */
  function inicioNoche(f){return instanteChile(f,"22:45");}
  function finNoche(f){return instanteChile(gnAdd(f,1),"06:00");}
  function nocheTerminada(f){return Date.now()>=finNoche(f);}
  function horasParaInicio(f){return (inicioNoche(f)-Date.now())/36e5;}
  /* Urgente = faltan menos de 24 h para que empiece la noche, o ya está en curso. */
  function esUrgente(f){return horasParaInicio(f)<24;}
  function cargo(p){return String(p&&p.cargo||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function esT3(p){return !!p&&/teniente\s*(tercero|3)/.test(cargo(p));}

  document.addEventListener("click",function(ev){
    var b=ev.target.closest&&ev.target.closest("[data-gn-noche]");if(!b)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    var f=b.getAttribute("data-gn-noche");
    sel=(sel&&sel.f===f)?null:{f:f,rol:rolDe(b),who:yo()};
    pintar();
  },true);

  async function estado(f){
    var who=yo();if(!who)return {};
    var av=null,ok=null;
    try{av=await sGet("guardia-aviso:"+f+":"+who,null);}catch(e){}
    try{ok=await sGet("guardia-asiste:"+f+":"+who,null);}catch(e){}
    return {av:av,ok:ok};
  }
  var tok=0;
  async function pintar(){
    var mi=++tok;
    var sec=document.querySelector("#misNochesInicio .gn-franja");if(!sec)return;
    sec.setAttribute("data-ga","1");
    /* texto fijo bajo los días */
    sec.querySelectorAll(".gn-franja-nota").forEach(function(n,i,all){if(i===all.length-1&&/Solo tus noches|Toca una fecha|avísale/.test(n.textContent))n.textContent=NOTA;});
    sec.querySelectorAll("[data-gn-noche]").forEach(function(b){b.classList.toggle("gn-sel",!!sel&&sel.f===b.getAttribute("data-gn-noche"));b.setAttribute("aria-expanded",String(!!sel&&sel.f===b.getAttribute("data-gn-noche")));});
    var old=sec.querySelector(".gn-aviso-panel");if(old)old.remove();
    if(!sel)return;
    var f=sel.f,st=await estado(f);
    if(mi!==tok||!sel||sel.f!==f)return;
    sec.querySelectorAll('.gn-aviso-panel').forEach(function(x){x.remove();});
    var d=new Date(f+"T12:00"),tit=d.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});
    var h='<div class="gn-aviso-panel" role="region" aria-label="Mi guardia"><b>'+e2(tit.charAt(0).toUpperCase()+tit.slice(1))+' · '+e2(ROLTXT[sel.rol])+'</b><div class="gn-aviso-est">';
    if(st.av&&st.av.estado==="cubierto")h+='<span class="gr-chip gris">Tu noche fue cubierta por otro voluntario</span>';
    else if(st.av&&st.av.estado==="sin_reemplazo")h+='<span class="gr-chip rojo">Avisaste · sin reemplazo todavía (lo ve la oficialidad)</span>';
    else if(st.av)h+='<span class="gr-chip rojo">Avisaste que no puedes · esperando reemplazo</span>';
    else if(st.ok)h+='<span class="gr-chip verde">Confirmaste que irás ✓ (la asistencia la aprueba un oficial después de la guardia)</span>';
    else h+='<span class="gr-chip gris">Sin confirmar</span>';
    h+='</div>';
    if(!st.av){
      h+='<div class="gn-aviso-btns"><button type="button" class="btn" id="gnAvConfirmo"'+(st.ok?' disabled':'')+'>Confirmo mi guardia</button><button type="button" class="btn secondary" id="gnAvNo">No podré asistir</button></div>'+
        '<div id="gnAvForma" hidden><label class="rv-lbl" for="gnAvMotivo">¿Por qué no puedes? (obligatorio)</label><input type="text" id="gnAvMotivo" class="rv-sel" maxlength="140" placeholder="Trabajo, salud, viaje…"><div class="gn-aviso-btns"><button type="button" class="btn" id="gnAvEnviar">Avisar al Teniente Tercero y Capitán</button><button type="button" class="btn secondary" id="gnAvCan">Cancelar</button></div></div>';
    }
    h+='<p class="status-msg" id="gnAvMsg" role="status"></p><button type="button" class="btn small secondary" id="gnAvCerrar">Cerrar</button></div>';
    sec.insertAdjacentHTML("beforeend",h);
    var msg=$("gnAvMsg");
    $("gnAvCerrar").onclick=function(){sel=null;pintar();};
    var c=$("gnAvConfirmo");if(c)c.onclick=async function(){
      if(!sel||sel.who!==yo()){msg.classList.add("err");msg.textContent="Cambió el voluntario seleccionado. Vuelve a abrir tu noche.";sel=null;return;}
      if(nocheTerminada(f)){msg.classList.add("err");msg.textContent="Esta noche ya terminó.";return;}
      c.disabled=true;msg.classList.remove("err");msg.textContent="Guardando…";
      try{await sSet("guardia-asiste:"+f+":"+yo(),{f:f,id:yo(),rol:sel.rol,en:new Date().toISOString()});msg.textContent="Guardia confirmada. ¡Gracias!";setTimeout(pintar,900);}
      catch(e){c.disabled=false;msg.classList.add("err");msg.textContent="No se pudo confirmar. Intenta de nuevo.";}
    };
    var no=$("gnAvNo");if(no)no.onclick=function(){$("gnAvForma").hidden=false;no.hidden=true;$("gnAvMotivo").focus();};
    var cn=$("gnAvCan");if(cn)cn.onclick=function(){$("gnAvForma").hidden=true;no.hidden=false;};
    var en=$("gnAvEnviar");if(en)en.onclick=async function(){
      var mot=$("gnAvMotivo").value.trim();
      if(!mot){msg.classList.add("err");msg.textContent="Escribe el motivo para avisar al Teniente Tercero.";$("gnAvMotivo").focus();return;}
      if(!sel||sel.who!==yo()){msg.classList.add("err");msg.textContent="Cambió el voluntario seleccionado. Vuelve a abrir tu noche.";sel=null;return;}
      if(nocheTerminada(f)){msg.classList.add("err");msg.textContent="Esta noche ya terminó; no se puede avisar.";return;}
      en.disabled=true;msg.classList.remove("err");msg.textContent="Enviando…";
      var urg=esUrgente(f);
      var rec={f:f,id:yo(),rol:sel.rol,motivo:mot,en:new Date().toISOString(),estado:"abierto",reemplazoId:null,por:corto(persona()),urgente:urg};
      try{await sSet("guardia-aviso:"+f+":"+yo(),rec,{ifVersion:0});}
      catch(e){if(!e||!e.conflicto){en.disabled=false;msg.classList.add("err");msg.textContent="No se pudo enviar. Inténtalo de nuevo.";return;}}
      msg.textContent=urg?"Aviso URGENTE enviado al Teniente Tercero y al Capitán (faltan menos de 24 h).":"Aviso enviado al Teniente Tercero y al Capitán.";
      alertaOficiales();
      if(typeof gnInsToast==="function")gnInsToast("Aviso enviado a la oficialidad");
      setTimeout(pintar,900);
    };
  }
  /* ---- Alerta en el Inicio de los mandos: avisos de ausencia pendientes ----
     Los ven SOLO Capitán, Teniente Tercero y administrador (body[data-mando=1]); el resto de los
     voluntarios no ve motivos ni quién avisó. El Teniente Tercero/administrador además puede abrir
     «Reemplazos»; el Capitán solo mira (la reasignación la hace el T3). */
  var tokA=0;
  async function alertaOficiales(){
    var mi=++tokA,host=$("avisosAusenciaOfi");
    if(document.body.getAttribute("data-mando")!=="1"){if(host)host.remove();return;}
    var lista=[];
    try{var r=await fetch("/api/state?prefix="+encodeURIComponent("guardia-aviso:"),{cache:"no-store"});if(!r.ok)throw 0;var j=await r.json();lista=(Array.isArray(j.items)?j.items:[]).map(function(x){return x.value;}).filter(Boolean);}
    catch(e){return;}
    if(mi!==tokA)return;
    var pend=lista.filter(function(a){return a.f&&a.estado!=="cubierto"&&!nocheTerminada(a.f);}).sort(function(a,b){return String(a.f).localeCompare(String(b.f))||String(a.en).localeCompare(String(b.en));});
    if(!pend.length){if(host)host.remove();return;}
    var ref=$("misNochesInicio");if(!ref||!ref.parentNode)return;
    if(!host){host=document.createElement("section");host.id="avisosAusenciaOfi";host.className="card";host.style.cssText="grid-column:1 / -1;min-width:0;border:2px solid #ef4444;background:#1b0f10;color:#fff";ref.parentNode.insertBefore(host,ref);}
    var yoP=persona(),puedeReemplazar=esT3(yoP)||(typeof ADMINISTRADORES!=="undefined"&&yoP&&ADMINISTRADORES.indexOf(String(yoP.clave))>=0)||(yoP&&String(yoP.clave)==="517");
    var urg=pend.filter(function(a){return esUrgente(a.f);}).length;
    host.innerHTML='<h2 style="margin:0 0 6px">Avisos de ausencia en guardia: '+pend.length+(urg?' · <span style="color:#ff8a80">'+urg+' URGENTE'+(urg>1?'S':'')+'</span>':'')+'</h2><div class="gn-aus-lista">'+pend.map(function(a){
      var d=new Date(a.f+"T12:00"),dia=d.toLocaleDateString("es-CL",{weekday:"short",day:"numeric",month:"short"});
      var p=(typeof ROSTER!=="undefined"?ROSTER:[]).find(function(x){return String(x.id)===String(a.id);});
      var nom=a.por||corto(p)||"Voluntario";
      return '<div style="padding:8px 0;border-top:1px solid #4a2a2a"><b>'+e2(nom)+'</b> · '+e2(dia)+' · '+e2(ROLTXT[a.rol]||"")+(esUrgente(a.f)?' <span class="gr-chip rojo">URGENTE</span>':'')+(a.estado==="sin_reemplazo"?' <span class="gr-chip rojo">sin reemplazo</span>':' <span class="gr-chip gris">falta reemplazo</span>')+(a.motivo?'<div style="opacity:.85">'+e2(a.motivo)+'</div>':'')+'</div>';
    }).join("")+'</div>'+(puedeReemplazar?'<button type="button" class="btn" id="gnAusIr" style="min-height:48px;margin-top:8px">Asignar reemplazo</button>':'<p class="sub" style="margin:8px 0 0">El Teniente Tercero asigna el reemplazo.</p>');
    var ir=$("gnAusIr");if(ir)ir.onclick=function(){var g=$("btnOficialesGuardia");if(g)g.click();setTimeout(function(){var t=document.querySelector('[data-gr-tab="rep"]');if(t)t.click();},350);};
  }
  setInterval(function(){if(document.visibilityState==="visible")alertaOficiales();},60000);
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")alertaOficiales();});
  var sv=$("miVoluntario");if(sv)sv.addEventListener("change",function(){setTimeout(alertaOficiales,800);});
  setTimeout(alertaOficiales,2500);
  window.GermaniaAvisoAusencia={refrescar:alertaOficiales};

  /* roles.js vuelve a dibujar la franja cada cierto tiempo: se vuelve a poner el panel y el texto fijo */
  function observar(){
    var host=$("misNochesInicio");if(!host)return;
    new MutationObserver(function(){
      var f=host.querySelector(".gn-franja");
      if(f&&!f.hasAttribute("data-ga"))pintar();
    }).observe(host,{childList:true,subtree:true});
    pintar();
  }
  var css=".gn-aviso-panel{margin-top:12px;padding:12px;border:1px solid #d4a82a;border-radius:10px;background:#101418;color:#fff}.gn-aviso-est{margin:8px 0}.gn-aviso-btns{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0}.gn-aviso-btns .btn{min-height:48px;flex:1 1 150px}#gnAvMotivo{width:100%;min-height:44px;box-sizing:border-box}.gn-franja-dia.gn-sel{outline:3px solid #ffcc00}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(observar,700);});else setTimeout(observar,700);
})();
