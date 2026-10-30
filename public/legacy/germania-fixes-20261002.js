/* GERMANIA · minuta dinámica estable + Dashboard V2 */
(function(){
  /* La minuta se renderiza únicamente desde app.js para evitar carreras entre dos renderizadores. */
  function ajustarMinutaMovil(){
    if(document.getElementById("germania-minuta-mobile-css")) return;
    const s=document.createElement("style"); s.id="germania-minuta-mobile-css";
    s.textContent=`#dispBody{font-size:14px}#dispBody td{vertical-align:middle}@media(max-width:640px){#dispBody.closest{} #dispBody tr td{padding:9px 5px}#dispBody tr td:first-child img{width:32px!important;height:32px!important}#dispBody td:nth-child(2){min-width:118px}#dispBody td:nth-child(3){min-width:92px}#dispBody td:nth-child(4){min-width:62px}#dispBody td:nth-child(5),#dispBody td:nth-child(6){min-width:58px}.table-wrap:has(#dispBody){overflow-x:auto;-webkit-overflow-scrolling:touch}.table-wrap:has(#dispBody) table{min-width:560px}}`;
    document.head.appendChild(s);
  }
  function ajustarEncabezadoMinuta(){
    const th=document.querySelector("#dispBody")?.closest("table")?.querySelector("thead tr");
    if(th) th.innerHTML="<th>Foto</th><th>Voluntario</th><th>Estado</th><th>Hora</th><th>◉ Maquinista</th><th>🛡 Guardia</th>";
  }
  function instalarDashboardV2(){
    let dialogo=null, marco=null, scroll=0, foco=null, overflow='';
    function volver(){
      if(!dialogo?.open)return;
      dialogo.close();document.body.style.overflow=overflow;
      window.scrollTo(0,scroll);
      if(foco?.isConnected)foco.focus({preventScroll:true});
    }
    function ir(nombre){if(nombre==='panel')return;volver();window.__mostrarPestana(nombre);}
    function abrir(){
      if(dialogo?.open)return;
      foco=document.activeElement;scroll=window.scrollY;
      const menu=document.getElementById('mobileMenu');
      if(menu?.classList.contains('open')){
        foco=document.getElementById('menuToggle');
        if(window.GermaniaMenuCompacto)window.GermaniaMenuCompacto.cerrar();
        else{menu.classList.remove('open');foco?.setAttribute('aria-expanded','false');}
      }
      if(!dialogo){
        const estilo=document.createElement('style');
        estilo.textContent='#germaniaEstadisticasDialog{position:fixed;inset:0;width:100%;height:100%;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:var(--g-bg,#07090b);color:#fff}#germaniaEstadisticasDialog::backdrop{background:#07090b}#germaniaEstadisticasDialog iframe{display:block;width:100%;height:100%;border:0}';
        document.head.appendChild(estilo);
        dialogo=document.createElement('dialog');dialogo.id='germaniaEstadisticasDialog';
        dialogo.setAttribute('aria-label','Estadísticas de Germania');
        marco=document.createElement('iframe');marco.title='Estadísticas de Germania';
        marco.src='/legacy/dashboard-preview.html';marco.setAttribute('allow','web-share');
        dialogo.appendChild(marco);document.body.appendChild(dialogo);
        dialogo.addEventListener('cancel',e=>{e.preventDefault();volver();});
      }
      overflow=document.body.style.overflow;document.body.style.overflow='hidden';
      dialogo.showModal();marco.focus();
    }
    window.GermaniaEstadisticasNavegacion={volver,ir,estaAbierto:()=>!!dialogo?.open};
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      const accion=b.getAttribute('onclick')||'';
      if(b.dataset.go==='panel'||b.dataset.tab==='panel'||/__mostrarPestana\(['"]panel['"]\)/.test(accion)){
        e.preventDefault();e.stopImmediatePropagation();abrir();
      }
    },true);
    const legacy=document.getElementById('panel-panel');if(legacy)legacy.remove();
    if(typeof window.__mostrarPestana==='function'){
      const base=window.__mostrarPestana;
      window.__mostrarPestana=function(nombre){
        if(nombre==='panel'){abrir();return;}
        volver();return base.apply(this,arguments);
      };
    }
  }
  document.addEventListener("DOMContentLoaded",()=>{
    ajustarEncabezadoMinuta();
    ajustarMinutaMovil();
    instalarDashboardV2();
    try{var ir=new URLSearchParams(location.search).get('ir');if(ir&&/^(germania|estado|lista|servicio|historial|config)$/.test(ir)){var n=0,iv=setInterval(function(){n++;if(typeof window.__mostrarPestana==='function'){clearInterval(iv);window.__mostrarPestana(ir);}else if(n>40)clearInterval(iv);},150);}}catch(e){}
    /* No volver a consultar disponibilidad aquí: app.js ya hace la carga inicial. */
  });
})();
