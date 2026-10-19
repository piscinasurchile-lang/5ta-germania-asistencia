/* GERMANIA · Botón Atrás del teléfono (Android/Chrome).
   Reglas: Atrás cierra lo que esté abierto (ventana, selector, ayuda); si no hay nada abierto vuelve al Inicio;
   estando en Inicio pide una segunda pulsación para salir. Si hay datos escritos sin enviar, pregunta antes de salir de la pantalla.
   No toca datos del servidor ni cambia otras pantallas. */
(function(){
"use strict";
if(window.GermaniaAtras)return;
var INICIO="germania",sucios={},salirHasta=0,toastEl=null,toastT=null;
function panelActivo(){var p=document.querySelector(".panel.active");return p?String(p.id||"").replace(/^panel-/,""):INICIO;}
function visible(el){if(!el||!el.isConnected)return false;var r=el.getClientRects();if(!r.length)return false;var s=getComputedStyle(el);return s.display!=="none"&&s.visibility!=="hidden";}
function aviso(txt){
  try{
    if(!toastEl){toastEl=document.createElement("div");toastEl.id="gAtrasAviso";toastEl.setAttribute("role","status");
      toastEl.style.cssText="position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:100000;background:#222;color:#fff;border:1px solid #555;border-radius:20px;padding:10px 16px;font:14px/1.3 sans-serif;max-width:86vw;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.5)";
      document.body.appendChild(toastEl);}
    toastEl.textContent=txt;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){if(toastEl)toastEl.hidden=true;},2300);
  }catch(e){}
}
/* Cierra la ventana superpuesta que esté arriba. Devuelve true si cerró algo. */
function cerrarSuperpuesto(){
  var sel=document.querySelector(".svb-fondo");
  if(sel&&visible(sel)){document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));if(sel.isConnected)sel.remove();document.body.classList.remove("svb-abierto");return true;}
  var ay=document.getElementById("ayudaSheet");
  if(ay&&ay.classList.contains("on")){ay.classList.remove("on");return true;}
  var ovs=[].slice.call(document.querySelectorAll(".cit-ov")).filter(visible);
  if(ovs.length){ovs[ovs.length-1].remove();return true;}
  var mod=document.getElementById("oddPdfPublicarModal");
  if(mod&&visible(mod)){var c=mod.querySelector("[data-cerrar],.cerrar,button[aria-label='Cerrar']");if(c)c.click();else mod.remove();return true;}
  var menu=document.querySelector("body.menu-abierto,body.g-menu-open");
  if(menu){var b=document.getElementById("mnCerrar")||document.querySelector("[data-menu-cerrar]");if(b){b.click();return true;}}
  return false;
}
function marcarSucio(e){
  var t=e.target;if(!t||!t.closest)return;
  var p=t.closest(".panel");if(!p)return;
  if(t.matches("textarea,input[type=text],input[type=search],input[type=file],input:not([type]),select")&&!t.closest("[data-gatras-ignorar]"))sucios[p.id]=true;
}
function limpiarTrasEnvio(e){
  var b=e.target&&e.target.closest?e.target.closest("button"):null;if(!b)return;
  if(/enviar|guard|ratific|acredit|confirm|publicar|registr/i.test(b.textContent||"")){
    var p=b.closest(".panel");if(!p)return;var id=p.id;
    setTimeout(function(){delete sucios[id];},2500);
  }
}
function hayCambios(){var id="panel-"+panelActivo();return !!sucios[id];}
function centinela(){try{history.pushState({gAtras:1},"",location.href);}catch(e){}}
function alAtras(){
  if(cerrarSuperpuesto()){centinela();return;}
  var p=panelActivo();
  if(p!==INICIO){
    if(hayCambios()&&!window.confirm("Tienes datos escritos que no se han enviado. ¿Salir de esta pantalla y perderlos?")){centinela();return;}
    delete sucios["panel-"+p];
    if(typeof window.__mostrarPestana==="function")window.__mostrarPestana(INICIO);
    centinela();return;
  }
  if(Date.now()<salirHasta){salirHasta=0;history.back();return;}
  salirHasta=Date.now()+2300;aviso("Presiona Atrás otra vez para salir");centinela();
}
function iniciar(){
  try{
    /* Tras una recarga de la página el navegador conserva el historial: si ya estamos sobre el centinela, no se duplica
       (si no, cada recarga agregaría una pulsación extra de Atrás). */
    var est=history.state;
    if(!(est&&est.gAtras===1)){
      if(!(est&&est.gAtras===0))history.replaceState({gAtras:0},"",location.href);
      centinela();
    }
    window.addEventListener("popstate",alAtras);
    document.addEventListener("input",marcarSucio,true);
    document.addEventListener("change",marcarSucio,true);
    document.addEventListener("click",limpiarTrasEnvio,true);
  }catch(e){}
}
window.GermaniaAtras={_alAtras:alAtras,_sucios:sucios};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
})();
