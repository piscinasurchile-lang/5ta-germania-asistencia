/* GERMANIA · Menú compacto de Oficiales.
 * Muestra solo una categoría a la vez; conserva los botones, IDs y
 * escuchadores preexistentes de app.js, incluidos sus datos y permisos.
 */
(function(){
  "use strict";
  var raiz=document.getElementById("ofMenuAgrupado");
  if(!raiz)return;
  var grupos=Array.prototype.slice.call(raiz.querySelectorAll("details.of-grupo"));
  var cerrando=false;
  // Acceso administrativo a la planilla fotográfica de guardia, sin agregar
  // un editor duplicado ni tocar el funcionamiento de los botones existentes.
  var guardia=raiz.querySelector('[data-of-grupo="guardias"]');
  if(guardia&&!document.getElementById("ofActualizarPlanillaFoto")){
    var botones=guardia.querySelector(".of-grupo-botones");
    if(botones){
      var enlace=document.createElement("a");
      enlace.id="ofActualizarPlanillaFoto";
      enlace.href="/guardia/actualizar-planilla";
      enlace.textContent="Actualizar guardia semanal";
      enlace.style.cssText="display:inline-flex;align-items:center;justify-content:center;border:1px solid #cead45;border-radius:8px;padding:10px 12px;background:#283238;color:#ffe4a1;text-decoration:none;font-size:13px;font-weight:700;min-height:40px";
      botones.appendChild(enlace);
      var contador=guardia.querySelector(".of-grupo-count");
      if(contador)contador.textContent="5";
    }
  }
  grupos.forEach(function(grupo){
    grupo.addEventListener("toggle",function(){
      if(!grupo.open||cerrando)return;
      cerrando=true;
      grupos.forEach(function(otro){if(otro!==grupo&&otro.open)otro.open=false;});
      cerrando=false;
    });
  });
})();
