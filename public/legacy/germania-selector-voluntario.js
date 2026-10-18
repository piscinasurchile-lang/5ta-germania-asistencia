/* Selector de voluntario con buscador (reemplaza el desplegable nativo del teléfono).
   El <select id="miVoluntario"> sigue siendo la fuente de verdad: solo se le asigna el valor y se dispara "change". */
(function(){
"use strict";
var sel=document.getElementById("miVoluntario"); if(!sel||sel.__selBuscador) return; sel.__selBuscador=true;
var hoja=null, ultimoFoco=null;
function norm(t){ return String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function opciones(){ return Array.prototype.filter.call(sel.options,function(o){ return o.value!==""; }).map(function(o){
  var m=/^\s*(\d+)\s*[·\-–]\s*(.+)$/.exec(o.text); return {v:o.value,cod:m?m[1]:"",nom:m?m[2]:o.text,txt:norm(o.text)}; }); }
function cerrar(){ if(!hoja) return; document.body.classList.remove("svb-abierto"); hoja.remove(); hoja=null; document.removeEventListener("keydown",tecla,true); if(ultimoFoco&&ultimoFoco.focus&&document.contains(ultimoFoco)) try{ultimoFoco.focus({preventScroll:true});}catch(e){} }
function tecla(e){ if(e.key==="Escape"){ e.preventDefault(); cerrar(); } }
function abrir(origen){
  if(hoja) return; ultimoFoco=origen||null;
  var ops=opciones(); if(!ops.length) return;
  hoja=document.createElement("div"); hoja.className="svb-fondo"; hoja.setAttribute("role","dialog"); hoja.setAttribute("aria-modal","true"); hoja.setAttribute("aria-label","Elige tu nombre");
  hoja.innerHTML='<div class="svb-hoja"><div class="svb-cab"><strong>¿Quién eres?</strong><button type="button" class="svb-x" aria-label="Cerrar">✕</button></div>'
    +'<input type="search" class="svb-buscar" placeholder="Buscar por nombre o número" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Buscar voluntario">'
    +'<div class="svb-lista" role="listbox"></div><p class="svb-vacio" hidden>Nadie coincide con esa búsqueda.</p></div>';
  document.body.appendChild(hoja); document.body.classList.add("svb-abierto");
  var lista=hoja.querySelector(".svb-lista"), vacio=hoja.querySelector(".svb-vacio"), inp=hoja.querySelector(".svb-buscar");
  function pintar(q){
    var n=norm(q).trim(), partes=n.split(/\s+/).filter(Boolean), cur=sel.value, html="", c=0;
    ops.forEach(function(o){
      if(partes.length&&!partes.every(function(p){return o.txt.indexOf(p)>=0;})) return; c++;
      html+='<button type="button" role="option" class="svb-item'+(o.v===cur?' svb-sel':'')+'" data-v="'+String(o.v).replace(/"/g,"&quot;")+'" aria-selected="'+(o.v===cur)+'"><span class="svb-cod">'+(o.cod||"")+'</span><span class="svb-nom"></span>'+(o.v===cur?'<span class="svb-ck">✔</span>':'')+'</button>';
    });
    lista.innerHTML=html; var its=lista.querySelectorAll(".svb-nom"), k=0;
    ops.forEach(function(o){ if(partes.length&&!partes.every(function(p){return o.txt.indexOf(p)>=0;})) return; its[k++].textContent=o.nom; });
    vacio.hidden=c>0;
  }
  pintar("");
  inp.addEventListener("input",function(){ pintar(inp.value); });
  lista.addEventListener("click",function(e){ var b=e.target.closest(".svb-item"); if(!b) return;
    var v=b.getAttribute("data-v"); cerrar(); if(sel.value!==v){ sel.value=v; sel.dispatchEvent(new Event("change",{bubbles:true})); } });
  hoja.querySelector(".svb-x").addEventListener("click",cerrar);
  hoja.addEventListener("click",function(e){ if(e.target===hoja) cerrar(); });
  document.addEventListener("keydown",tecla,true);
  setTimeout(function(){ var s=lista.querySelector(".svb-sel"); if(s&&s.scrollIntoView) s.scrollIntoView({block:"center"}); },30);
}
/* El desplegable nativo no debe abrirse: se abre este selector. */
["mousedown","touchstart"].forEach(function(ev){ sel.addEventListener(ev,function(e){ if(e.cancelable) e.preventDefault(); abrir(sel); },{passive:false}); });
sel.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "||e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); abrir(sel); } });
/* «No soy yo» abre directamente el selector con buscador. */
var no=document.getElementById("cambiarVolBtn");
if(no) no.addEventListener("click",function(e){ e.stopImmediatePropagation(); abrir(no); },true);
window.GermaniaSelectorVoluntario={abrir:abrir,cerrar:cerrar};
})();
