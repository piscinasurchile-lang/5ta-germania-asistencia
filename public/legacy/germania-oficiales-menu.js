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
  grupos.forEach(function(grupo){
    grupo.addEventListener("toggle",function(){
      if(!grupo.open||cerrando)return;
      cerrando=true;
      grupos.forEach(function(otro){if(otro!==grupo&&otro.open)otro.open=false;});
      cerrando=false;
    });
  });
})();
