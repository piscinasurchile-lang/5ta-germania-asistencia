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

  document.addEventListener("click",function(ev){
    var b=ev.target.closest&&ev.target.closest("[data-gn-noche]");if(!b)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    var f=b.getAttribute("data-gn-noche");
    sel=(sel&&sel.f===f)?null:{f:f,rol:rolDe(b)};
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
    else if(st.ok)h+='<span class="gr-chip verde">Guardia confirmada ✓</span>';
    else h+='<span class="gr-chip gris">Sin confirmar</span>';
    h+='</div>';
    if(!st.av){
      h+='<div class="gn-aviso-btns"><button type="button" class="btn" id="gnAvConfirmo"'+(st.ok?' disabled':'')+'>Confirmo mi guardia</button><button type="button" class="btn secondary" id="gnAvNo">No podré asistir</button></div>'+
        '<div id="gnAvForma" hidden><label class="rv-lbl" for="gnAvMotivo">¿Por qué no puedes? (obligatorio)</label><input type="text" id="gnAvMotivo" class="rv-sel" maxlength="140" placeholder="Trabajo, salud, viaje…"><div class="gn-aviso-btns"><button type="button" class="btn" id="gnAvEnviar">Avisar al Teniente Tercero</button><button type="button" class="btn secondary" id="gnAvCan">Cancelar</button></div></div>';
    }
    h+='<p class="status-msg" id="gnAvMsg" role="status"></p><button type="button" class="btn small secondary" id="gnAvCerrar">Cerrar</button></div>';
    sec.insertAdjacentHTML("beforeend",h);
    var msg=$("gnAvMsg");
    $("gnAvCerrar").onclick=function(){sel=null;pintar();};
    var c=$("gnAvConfirmo");if(c)c.onclick=async function(){
      c.disabled=true;msg.classList.remove("err");msg.textContent="Guardando…";
      try{await sSet("guardia-asiste:"+f+":"+yo(),{f:f,id:yo(),rol:sel.rol,en:new Date().toISOString()});msg.textContent="Guardia confirmada. ¡Gracias!";setTimeout(pintar,900);}
      catch(e){c.disabled=false;msg.classList.add("err");msg.textContent="No se pudo confirmar. Intenta de nuevo.";}
    };
    var no=$("gnAvNo");if(no)no.onclick=function(){$("gnAvForma").hidden=false;no.hidden=true;$("gnAvMotivo").focus();};
    var cn=$("gnAvCan");if(cn)cn.onclick=function(){$("gnAvForma").hidden=true;no.hidden=false;};
    var en=$("gnAvEnviar");if(en)en.onclick=async function(){
      var mot=$("gnAvMotivo").value.trim();
      if(!mot){msg.classList.add("err");msg.textContent="Escribe el motivo para avisar al Teniente Tercero.";$("gnAvMotivo").focus();return;}
      en.disabled=true;msg.classList.remove("err");msg.textContent="Enviando…";
      var rec={f:f,id:yo(),rol:sel.rol,motivo:mot,en:new Date().toISOString(),estado:"abierto",reemplazoId:null,por:corto(persona())};
      try{await sSet("guardia-aviso:"+f+":"+yo(),rec,{ifVersion:0});}
      catch(e){if(!e||!e.conflicto){en.disabled=false;msg.classList.add("err");msg.textContent="No se pudo enviar. Inténtalo de nuevo.";return;}}
      msg.textContent="Aviso enviado al Teniente Tercero.";
      if(typeof gnInsToast==="function")gnInsToast("Aviso enviado a la oficialidad");
      setTimeout(pintar,900);
    };
  }
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
