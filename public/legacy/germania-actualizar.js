/* GERMANIA · actualización automática total.
   Esta pantalla interna siempre se descarga fresca de la red, así que ella misma
   fuerza la recarga completa de la app (cáscara incluida) cuando hay versión nueva,
   incluso en dispositivos cuya cáscara externa quedó antigua. No toca datos operativos. */
(function(){
  "use strict";
  var CLAVE="germania:version-aplicada";
  var cargada=null, recargando=false;

  function leerVersion(){
    return fetch("/version.json?t="+Date.now(),{cache:"no-store"})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ return d && d.version ? String(d.version) : null; })
      .catch(function(){ return null; });
  }
  function editando(){
    var a=document.activeElement;
    return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  function limpiarCaches(){
    var tareas=[];
    try{
      if(window.caches && caches.keys){
        tareas.push(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); }));
      }
      if(navigator.serviceWorker && navigator.serviceWorker.getRegistrations){
        tareas.push(navigator.serviceWorker.getRegistrations().then(function(rs){ return Promise.all(rs.map(function(r){ return r.update().catch(function(){}); })); }));
      }
    }catch(e){}
    return Promise.all(tareas.map(function(p){ return p.catch(function(){}); }));
  }
  function recargarTodo(){
    if(recargando) return;
    recargando=true;
    limpiarCaches().then(function(){
      try{ (window.top||window).location.reload(); }
      catch(e){ window.location.reload(); }
    });
  }

  function iniciar(){
    leerVersion().then(function(v){
      if(!v) return;
      cargada=v;
      var aplicada=null, almacenamientoOk=true;
      try{ aplicada=localStorage.getItem(CLAVE); }catch(e){ almacenamientoOk=false; }
      if(almacenamientoOk && aplicada!==v){
        // Primera carga con esta versión: se registra antes de recargar para no entrar en bucle.
        try{ localStorage.setItem(CLAVE,v); }catch(e){ return; }
        recargarTodo();
      }
    });
  }

  function revisar(){
    if(recargando || document.visibilityState!=="visible" || !cargada) return;
    leerVersion().then(function(v){
      if(!v || v===cargada || editando()) return;
      try{ localStorage.setItem(CLAVE,v); }catch(e){}
      recargarTodo();
    });
  }

  iniciar();
  setInterval(revisar,30000);
  document.addEventListener("visibilitychange",revisar);
})();
