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
    const destino='/legacy/dashboard-preview.html';
    /* El Dashboard legacy queda fuera del flujo operativo. Informes abre únicamente V2. */
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b) return;
      const on=b.getAttribute('onclick')||'';
      if(/__mostrarPestana\(['\"]panel['\"]\)/.test(on)){
        e.preventDefault(); e.stopImmediatePropagation(); location.href=destino;
      }
    },true);
    const legacy=document.getElementById('panel-panel');
    if(legacy){ legacy.innerHTML=''; legacy.remove(); }
    if(typeof window.__mostrarPestana==='function'){
      const base=window.__mostrarPestana;
      window.__mostrarPestana=function(nombre){ if(nombre==='panel'){ location.href=destino; return; } return base.apply(this,arguments); };
    }
  }
  document.addEventListener("DOMContentLoaded",()=>{
    ajustarEncabezadoMinuta();
    ajustarMinutaMovil();
    instalarDashboardV2();
    /* No volver a consultar disponibilidad aquí: app.js ya hace la carga inicial. */
  });
})();