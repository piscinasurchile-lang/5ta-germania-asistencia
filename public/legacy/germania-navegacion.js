/* Navegación ligera para todas las pantallas de Germania. Sin recargar. */
(function(){
"use strict";
var anterior=[],navegando=false;
function activo(){var p=document.querySelector(".panel.active");return p?p.id.replace(/^panel-/,""):"germania";}
function permitido(){return !window.GermaniaAtras||!window.GermaniaAtras.puedeSalir||window.GermaniaAtras.puedeSalir();}
function ir(destino){if(!destino||destino===activo())return false;if(!permitido())return false;navegando=true;try{window.__mostrarPestana(destino);return true;}finally{navegando=false;}}
function barra(panel){
 if(panel.id==="panel-germania"||panel.querySelector(".g-nav-retorno"))return;
 var nav=document.createElement("nav");nav.className="g-nav-retorno";nav.setAttribute("aria-label","Navegación de pantalla");
 nav.style.cssText="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 12px";
 [["Atrás","atras"],["Inicio","inicio"]].forEach(function(item){
 var b=document.createElement("button");b.type="button";b.className="btn small secondary g-nav-btn";b.setAttribute("aria-label",item[0]);
 var svg=item[1]==="atras"?'<path d="M15 18l-6-6 6-6"/>':'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>';
 b.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+svg+'</svg><span>'+item[0]+'</span>';
 b.style.cssText="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;min-height:34px;font-size:12px;font-weight:700;flex:0 0 auto;border-radius:7px";
 b.onclick=function(){if(item[1]==="inicio"){if(ir("germania"))anterior=[];}else{var destino=anterior.length?anterior[anterior.length-1]:"germania";if(ir(destino)&&anterior.length)anterior.pop();}};
 nav.appendChild(b);
 });panel.insertBefore(nav,panel.firstChild);
}
function iniciar(){
 document.querySelectorAll(".panel").forEach(barra);
 var original=window.__mostrarPestana;if(typeof original!=="function")return;
 window.__mostrarPestana=function(destino){
 var antes=activo();
 if(!navegando&&destino!==antes&&destino!=="germania")anterior.push(antes);
 if(!navegando&&destino==="germania")anterior=[];
 return original.apply(this,arguments);
 };
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
})();