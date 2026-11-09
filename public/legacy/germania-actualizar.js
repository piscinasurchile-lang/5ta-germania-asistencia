/* GERMANIA · actualización automática total.
   Esta pantalla interna siempre se descarga fresca de la red, así que ella misma
   registra su versión al arrancar y recarga la app completa solo si cambia durante el uso,
   incluso en dispositivos cuya cáscara externa quedó antigua. No toca datos operativos. */
(function(){
  "use strict";
  var CLAVE="germania:version-aplicada";
  var cargada=null, recargando=false, comprobando=false;

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

  function iniciar(){ revisar(); }

  function revisar(){
    if(recargando || comprobando || document.visibilityState!=="visible") return;
    comprobando=true;
    leerVersion().then(function(v){
      if(!v) return;
      if(!cargada){
        // La primera respuesta válida es la base de esta sesión, incluso después de un fallo de red.
        cargada=v;
        try{ localStorage.setItem(CLAVE,v); }catch(e){}
        return;
      }
      if(v===cargada || editando()) return;
      try{ localStorage.setItem(CLAVE,v); }catch(e){}
      recargarTodo();
    }).finally(function(){comprobando=false;});
  }

  iniciar();
  setInterval(revisar,30000);
  document.addEventListener("visibilitychange",revisar);
})();

// Resumen independiente de Asistencia. La carga diferida no afecta el actualizador PWA.
(function(){
  if(!document.getElementById("panel-lista"))return;
  var script=document.createElement("script");
  script.src="/legacy/germania-resumen-asistencia.js?v=20261030a";
  script.onerror=function(){console.error("No se pudo cargar el resumen de asistencia.");};
  document.body.appendChild(script);
})();

// Selector de perfil de dispositivo B-5 (independiente de la nómina).
(function(){
  if(!document.getElementById("miVoluntario"))return;
  var script=document.createElement("script");
  script.src="/legacy/germania-tablet-b5-selector.js?v=20261014a";
  script.onerror=function(){console.error("No se pudo cargar el selector de Tablet B-5.");};
  document.body.appendChild(script);
})();

