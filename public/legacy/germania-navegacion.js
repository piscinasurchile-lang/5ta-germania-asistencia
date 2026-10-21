/* Navegación ligera para todas las pantallas de Germania. Sin recargar. */
(function(){
"use strict";
var anterior=[],navegando=false;
function activo(){var p=document.querySelector(".panel.active");return p?p.id.replace(/^panel-/,""):"germania";}
function permitido(){return !window.GermaniaAtras||!window.GermaniaAtras.puedeSalir||window.GermaniaAtras.puedeSalir();}
function ir(destino){if(!destino||destino===activo())return;if(!permitido())return;navegando=true;try{window.__mostrarPestana(destino);}finally{navegando=false;}}
function barra(panel){
 if(panel.id==="panel-germania"||panel.querySelector(".g-nav-retorno"))return;
 var nav=document.createElement("nav");nav.className="g-nav-retorno";nav.setAttribute("aria-label","Navegación de pantalla");
 nav.style.cssText="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 12px";
 [["← Atrás","atras"],["⌂ Inicio","inicio"]].forEach(function(item){
 var b=document.createElement("button");b.type="button";b.className="btn small secondary";b.textContent=item[0];
 b.style.cssText="padding:7px 12px;min-height:36px;font-size:13px;flex:0 0 auto";
 b.onclick=function(){if(item[1]==="inicio"){anterior=[];ir("germania");}else{var destino=anterior.length?anterior.pop():"germania";ir(destino);}};
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