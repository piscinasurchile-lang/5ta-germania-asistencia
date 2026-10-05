/* GERMANIA · minuta dinámica estable + detalle individual de asistencia */
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

  async function detalleVoluntario(id,contenedor){
    if(contenedor.dataset.cargado==="1"){ contenedor.hidden=!contenedor.hidden; return; }
    contenedor.innerHTML='<div class="foot-note">Cargando detalle…</div>';
    contenedor.hidden=false;
    const R=rangoPanel(), {partes}=await datosPanel(R.desde,R.hasta);
    const m=ROSTER.find(x=>String(x.id)===String(id));
    const rows=partes.filter(pt=>m&&miembroVigenteEnFecha(m,pt.date)).slice().sort((a,b)=>a.date<b.date?1:-1).map(pt=>{
      const estado=(pt.records&&pt.records[id])||"ausente";
      const etiqueta=estado==="presente"?"Asistió":estado==="justificado"?"Justificado":"No asistió";
      return `<tr><td>${esc(pt.date||"")}</td><td class="name-col">${esc(pt.tipo||"Sin tipo")}${pt.detalle?" · "+esc(pt.detalle):""}</td><td><b>${etiqueta}</b></td></tr>`;
    }).join("");
    contenedor.innerHTML=`<div class="asistencia-detalle"><b>Detalle · ${esc(nombreCompleto(m))}</b><table><thead><tr><th>Fecha</th><th>Actividad</th><th>Resultado</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Sin actividades en este período.</td></tr>'}</tbody></table></div>`;
    contenedor.dataset.cargado="1";
  }

  function mejorarEstadisticas(){
    const body=document.getElementById("pnDetalle");
    if(body&&!body.dataset.interactivo){
      body.dataset.interactivo="1";
      body.addEventListener("click",async e=>{
        const fila=e.target.closest("tr"); if(!fila||!body.contains(fila)||fila.classList.contains("detalle-extra")) return;
        const idx=[...body.children].indexOf(fila);
        const orden=sortedRoster(false).slice().sort((a,b)=>(a.n||999)-(b.n||999));
        const m=orden[idx/2|0]||orden[idx];
        if(!m)return;
        let extra=fila.nextElementSibling;
        if(!extra||!extra.classList.contains("detalle-extra")){
          extra=document.createElement("tr"); extra.className="detalle-extra";
          extra.innerHTML='<td colspan="7"><div class="detalle-contenido"></div></td>';
          fila.after(extra);
        }
        await detalleVoluntario(String(m.id),extra.querySelector(".detalle-contenido"));
      });
    }
    const rank=document.getElementById("pnRanking");
    if(rank){
      const hs=[...rank.querySelectorAll(":scope > h3")];
      hs.filter(h=>/Mayor asistencia|Menor asistencia/i.test(h.textContent)).forEach(h=>{
        const t=h.nextElementSibling; h.remove(); if(t&&t.tagName==="TABLE")t.remove();
      });
      const card=rank.closest(".card"), title=card?.querySelector("h2");
      if(title) title.textContent="6. Guardia nocturna";
    }
  }

  /* Dashboard Informes: una sola lectura de Guardia por período.
     Si renderPanel se dispara más de una vez mientras la primera carga sigue activa,
     comparte la misma promesa en vez de volver a leer todo el histórico. */
  const guardiaPanelCache=new Map();
  const guardiaPanelTTL=5*60*1000;
  if(typeof guardiasEnRangoPanel==="function"){
    const guardiasEnRangoPanelBase=guardiasEnRangoPanel;
    guardiasEnRangoPanel=async function(desde,hasta,activos){
      const key=desde+"|"+hasta;
      const ahora=Date.now(), cached=guardiaPanelCache.get(key);
      if(cached && (ahora-cached.ts)<guardiaPanelTTL){
        return cached.promise;
      }
      const promise=Promise.resolve().then(()=>guardiasEnRangoPanelBase(desde,hasta,activos));
      guardiaPanelCache.set(key,{ts:ahora,promise});
      try{
        return await promise;
      }catch(e){
        if(guardiaPanelCache.get(key)?.promise===promise) guardiaPanelCache.delete(key);
        throw e;
      }
    };
  }

  const obs=new MutationObserver(()=>mejorarEstadisticas());
  document.addEventListener("DOMContentLoaded",()=>{
    ajustarEncabezadoMinuta();
    ajustarMinutaMovil();
    mejorarEstadisticas();
    const panel=document.getElementById("panel-panel"); if(panel)obs.observe(panel,{childList:true,subtree:true});
    /* No volver a consultar disponibilidad aquí: app.js ya hace la carga inicial.
       Evita una segunda solicitud idéntica al arrancar GERMANIA. */
  });
})();