/* GERMANIA · Menú ☰ compacto: cierre al tocar fuera, con Atrás y con Escape.
   No cambia los botones, sus permisos ni su navegación: solo observa si #mobileMenu está abierto.
   - Marca body.menu-abierto (germania-atras.js ya la reconoce y llama a [data-menu-cerrar] con Atrás).
   - El cierre al elegir una sección lo hace app.js (data-go); Reglamentos y Ayuda ya cierran el menú. */
(function(){
"use strict";
var menu=document.getElementById("mobileMenu"),toggle=document.getElementById("menuToggle");
if(!menu||!toggle||menu.getAttribute("data-mc"))return;
menu.setAttribute("data-mc","1");

var fondo=document.createElement("div");
fondo.className="g-menu-fondo";
fondo.setAttribute("aria-hidden","true");
fondo.setAttribute("data-menu-cerrar","1");
document.body.appendChild(fondo);

function abierto(){return menu.classList.contains("open");}
var centinela=false;
function sincronizar(){
  var a=abierto();
  /* Atrás: si la app no trae su propio manejo (germania-atras.js), el menú pone un paso de historial para cerrarse con Atrás. */
  if(a&&!centinela&&!window.GermaniaAtras){try{history.pushState({gMenu:1},"",location.href);centinela=true;}catch(e){}}
  if(!a&&centinela){centinela=false;if(history.state&&history.state.gMenu){try{history.back();}catch(e){}}}
  document.body.classList.toggle("menu-abierto",a);
  toggle.setAttribute("aria-expanded",a?"true":"false");
  if(a)menu.scrollTop=0;
}
function cerrar(){
  if(abierto())menu.classList.remove("open");
  sincronizar();
}

new MutationObserver(sincronizar).observe(menu,{attributes:true,attributeFilter:["class"]});
fondo.addEventListener("click",cerrar);

/* Tocar fuera del menú (y fuera del botón ☰) solo lo cierra: el toque no activa lo que haya debajo. */
document.addEventListener("click",function(ev){
  if(!abierto())return;
  var t=ev.target;
  if(menu.contains(t)||toggle.contains(t))return;
  ev.preventDefault();
  ev.stopPropagation();
  cerrar();
},true);

window.addEventListener("popstate",function(){
  if(centinela&&abierto()){centinela=false;menu.classList.remove("open");sincronizar();}
});

document.addEventListener("keydown",function(ev){
  if(ev.key==="Escape"&&abierto()){cerrar();try{toggle.focus();}catch(e){}}
});

sincronizar();
window.GermaniaMenuCompacto={cerrar:cerrar,abierto:abierto};
})();
