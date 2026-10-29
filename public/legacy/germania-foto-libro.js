/* GERMANIA · Foto del libro de guardia en una capa sobre la misma pantalla.
 * Antes el enlace abría otra pestaña o página y, al volver, Germania se recargaba entera y perdía la noche que se revisaba.
 * Intercepta los enlaces a /api/guardia/libro?foto=1 sin tocar los módulos que los generan. */
(function(){
  "use strict";
  var capa=null,abierta=false,previo="",foco=null,vigia=null;
  function esFoto(a){
    var h=a&&a.getAttribute&&a.getAttribute("href")||"";
    return h.indexOf("/api/guardia/libro?")===0&&h.indexOf("foto=1")>0;
  }
  /* El botón Atrás del teléfono lo atiende germania-atras.js, que cierra las capas con clase cit-ov quitándolas del documento: aquí se limpia en cualquier caso. */
  function cerrar(){
    if(!abierta)return;
    abierta=false;
    if(vigia){vigia.disconnect();vigia=null;}
    if(capa&&capa.parentNode)capa.parentNode.removeChild(capa);
    capa=null;
    document.body.style.overflow=previo;
    document.removeEventListener("keydown",alTeclear,true);
    if(foco&&foco.focus)try{foco.focus();}catch(e){}
  }
  function alTeclear(e){if(e.key==="Escape"){e.preventDefault();cerrar();}}
  function abrir(url){
    if(abierta&&capa&&capa.isConnected)return;
    if(abierta)cerrar();
    foco=document.activeElement;
    abierta=true;
    previo=document.body.style.overflow;
    document.body.style.overflow="hidden";
    capa=document.createElement("div");
    capa.className="cit-ov";capa.setAttribute("role","dialog");capa.setAttribute("aria-modal","true");capa.setAttribute("aria-label","Fotografía del libro de guardia");
    capa.style.cssText="position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.94);display:flex;flex-direction:column;color:#fff;font-family:inherit";
    var barra=document.createElement("div");
    barra.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;padding-top:max(10px,env(safe-area-inset-top,0px))";
    var titulo=document.createElement("strong");titulo.textContent="Fotografía del libro";
    var boton=document.createElement("button");
    boton.type="button";boton.textContent="Cerrar";
    boton.style.cssText="min-height:48px;min-width:96px;padding:0 18px;border-radius:10px;border:2px solid #ffcc00;background:#e30613;color:#fff;font:700 16px inherit;cursor:pointer";
    boton.onclick=function(){cerrar();};
    barra.appendChild(titulo);barra.appendChild(boton);
    var zona=document.createElement("div");
    zona.style.cssText="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:8px;padding-bottom:max(8px,env(safe-area-inset-bottom,0px));text-align:center";
    var estado=document.createElement("p");estado.textContent="Cargando fotografía…";estado.style.cssText="margin:24px 12px";
    var img=document.createElement("img");
    img.alt="Fotografía del libro de guardia";
    img.style.cssText="max-width:100%;height:auto;display:none;margin:0 auto;touch-action:pinch-zoom pan-x pan-y";
    img.onload=function(){estado.style.display="none";img.style.display="block";};
    img.onerror=function(){estado.textContent="No se pudo cargar la fotografía. Cierra e inténtalo de nuevo.";};
    zona.appendChild(estado);zona.appendChild(img);
    capa.appendChild(barra);capa.appendChild(zona);
    capa.addEventListener("click",function(e){if(e.target===capa||e.target===zona)cerrar();});
    document.body.appendChild(capa);
    document.addEventListener("keydown",alTeclear,true);
    vigia=new MutationObserver(function(){if(capa&&!capa.isConnected)cerrar();});
    vigia.observe(document.body,{childList:true});
    img.src=url;
    boton.focus();
  }
  document.addEventListener("click",function(e){
    var a=e.target&&e.target.closest?e.target.closest("a"):null;
    if(!a||!esFoto(a))return;
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.button===1)return;
    e.preventDefault();
    abrir(a.getAttribute("href"));
  },true);
})();
