/* GERMANIA · Barra «Volver» y acceso al menú ☰ en todas las pantallas internas.
   Qué hace:
   - En cada pantalla que no sea Inicio agrega, arriba y fija al desplazar, el botón «← Volver al inicio»
     (y en el celular el botón «☰ Menú»). Mismo lugar y mismo tamaño en todas las pantallas (≥ 48 px).
   - «Volver» hace lo mismo que el botón Atrás del teléfono (germania-atras.js): cierra lo que esté abierto,
     avisa si hay datos escritos sin enviar y, si no, vuelve al Inicio.
   - «☰» abre un mini menú con solo dos opciones: «Volver atrás» y «Volver al inicio». Nada más.
   - Ninguna de las dos recarga la página: solo cambian de pantalla dentro de Germania.
   No toca datos, ODD, Guardia, asistencia, disponibilidad ni app.js; solo agrega botones y estilos. */
(function(){
"use strict";
if(window.GermaniaVolver)return;
var INICIO="germania";

function css(){
  if(document.getElementById("gVolverCss"))return;
  var s=document.createElement("style");s.id="gVolverCss";
  s.textContent=
  ".g-volver-barra{position:sticky;top:0;z-index:850;display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:6px 0;"+
    "background:var(--g-bg,#07090b);border-bottom:1px solid var(--g-line-soft,#222a31);}"+
  ".g-volver-barra button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:48px;min-width:48px;"+
    "padding:0 16px;font:600 16px/1 inherit;color:var(--g-gold,#ffcc00);background:var(--g-card,#10151a);"+
    "border:1px solid var(--g-line,#303840);border-radius:var(--g-radius-sm,10px);cursor:pointer;}"+
  ".g-volver-barra button:active{background:var(--g-card-2,#171d22);}"+
  ".g-volver-barra .g-volver-menu{margin-left:auto;font-size:22px;padding:0 14px;}"+
  ".g-volver-barra{position:sticky}.g-volver-mini{position:absolute;right:0;top:100%;display:flex;flex-direction:column;gap:6px;padding:8px;"+
    "background:var(--g-bg,#07090b);border:1px solid var(--g-line,#303840);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.5);}"+
  ".g-volver-mini[hidden]{display:none;}"+
  "@media print{.g-volver-barra{display:none;}}";
  document.head.appendChild(s);
}

function irAlInicio(){
  /* Con germania-atras.js: se usa el historial para que Atrás y Volver queden equilibrados y compartan sus avisos. */
  var est=null;try{est=history.state;}catch(e){}
  if(window.GermaniaAtras&&est&&est.gAtras===1){history.back();return;}
  if(typeof window.__mostrarPestana==="function")window.__mostrarPestana(INICIO);
}

function cerrarMini(){var x=document.querySelectorAll(".g-volver-mini");for(var i=0;i<x.length;i++)x[i].hidden=true;}
function alInicio(){
  cerrarMini();
  var sc=window.GermaniaAtras&&window.GermaniaAtras._sucios,p=document.querySelector(".panel.active");
  if(sc&&p&&sc[p.id]){
    if(!window.confirm("Tienes datos escritos que no se han enviado. ¿Salir de esta pantalla y perderlos?"))return;
    delete sc[p.id];
  }
  if(typeof window.__mostrarPestana==="function")window.__mostrarPestana(INICIO);
}
function alAtras(){cerrarMini();irAlInicio();}
function mini(){
  var d=document.createElement("div");d.className="g-volver-mini";d.hidden=true;
  var a=document.createElement("button");a.type="button";a.textContent="← Volver atrás";a.addEventListener("click",alAtras);
  var b=document.createElement("button");b.type="button";b.textContent="⌂ Volver al inicio";b.addEventListener("click",alInicio);
  d.appendChild(a);d.appendChild(b);return d;
}
function abrirMenu(e){
  var bar=e.currentTarget.parentNode,m=bar.querySelector(".g-volver-mini"),abrir=m.hidden;
  cerrarMini();m.hidden=!abrir;
}

function barra(){
  var d=document.createElement("div");d.className="g-volver-barra";d.setAttribute("data-gvolver","1");d.setAttribute("data-gatras-ignorar","1");
  var v=document.createElement("button");v.type="button";v.className="g-volver-btn";v.setAttribute("aria-label","Volver al inicio");
  v.textContent="← Volver al inicio";v.addEventListener("click",irAlInicio);
  var m=document.createElement("button");m.type="button";m.className="g-volver-menu";m.setAttribute("aria-label","Opciones de volver");
  m.textContent="☰";m.addEventListener("click",abrirMenu);
  d.appendChild(v);d.appendChild(m);d.appendChild(mini());return d;
}

/* Agrega la barra a cada pantalla interna que todavía no la tenga (también si otra rutina reescribió su contenido). */
function asegurar(){
  var ps=document.querySelectorAll(".panel");
  for(var i=0;i<ps.length;i++){
    var p=ps[i];
    if(p.id==="panel-"+INICIO)continue;
    if(p.firstElementChild&&p.firstElementChild.getAttribute&&p.firstElementChild.getAttribute("data-gvolver")==="1")continue;
    var viejo=p.querySelector(":scope > [data-gvolver]");if(viejo)viejo.remove();
    p.insertBefore(barra(),p.firstChild);
  }
}

function iniciar(){
  css();asegurar();
  if(typeof window.__mostrarPestana==="function"){
    var base=window.__mostrarPestana;
    window.__mostrarPestana=function(){var r=base.apply(this,arguments);try{asegurar();}catch(e){}return r;};
  }
  document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest(".g-volver-barra")))cerrarMini();},true);
  document.addEventListener("keydown",function(e){if(e.key==="Escape")cerrarMini();});
}

window.GermaniaVolver={_asegurar:asegurar,_irAlInicio:irAlInicio};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
})();
