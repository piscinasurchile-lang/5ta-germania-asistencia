/* GERMANIA · barra inferior: marca la pantalla actual y abre el menú «Más».
   No cambia la lógica: usa __mostrarPestana y el botón de menú que ya existen. */
(function(){
  var nav=document.getElementById("gBottomNav");
  if(!nav) return;
  var PRINCIPALES={germania:1,guardia:1,servicio:1};
  function marcar(nombre){
    nav.querySelectorAll("button[data-nav]").forEach(function(b){
      var activo=b.dataset.nav===nombre || (b.dataset.nav==="mas" && !PRINCIPALES[nombre]);
      if(activo) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
    });
  }
  var mas=document.getElementById("gNavMas");
  if(mas) mas.addEventListener("click",function(){
    var t=document.getElementById("menuToggle"); if(t) t.click();
  });
  if(typeof window.__mostrarPestana==="function"){
    var base=window.__mostrarPestana;
    window.__mostrarPestana=function(nombre){ var r=base.apply(this,arguments); marcar(nombre); return r; };
  }
  /* Pestañas superiores (PC/tablet) también sincronizan la barra. */
  document.querySelectorAll(".tab").forEach(function(t){ t.addEventListener("click",function(){ marcar(t.dataset.tab); }); });
  marcar("germania");
})();
