/* GERMANIA · minuta dinámica estable + detalle individual de asistencia */
(function(){
  const prioridad={cuartel:0,disponible:1,no:2,fuera:3,"":4};

  async function minutaDinamica(){
    const body=document.getElementById("dispBody"), resumen=document.getElementById("dispResumen");
    if(!body||!resumen) return;
    const d=await getDisponibilidadHoy(), guardia=await guardiaDeHoy();
    const guardianes=new Set((guardia?.guardianes||[]).filter(g=>g.estado!=="no").map(g=>String(g.id)));
    const cuenta={cuartel:0,disponible:0,fuera:0,no:0,conductores:0};
    const apellido=p=>[p.apellidoPaterno||"",p.apellidoMaterno||"",p.nombre||""].join(" ").trim();
    const lista=sortedRoster(false).slice().sort((a,b)=>{
      const ea=d[a.id]?.estado||"", eb=d[b.id]?.estado||"";
      const pa=prioridad[ea]??4, pb=prioridad[eb]??4;
      if(pa!==pb) return pa-pb;
      return apellido(a).localeCompare(apellido(b),"es",{sensitivity:"base"})||
        nombreCompleto(a).localeCompare(nombreCompleto(b),"es",{sensitivity:"base"});
    });
    const html=lista.map(p=>{
      const r=d[p.id]||{}, e=r.estado||"";
      if(e) cuenta[e]=(cuenta[e]||0)+1;
      if((e==="cuartel"||e==="disponible")&&p.conductor) cuenta.conductores++;
      const hora=r.desde?new Date(r.desde).toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"}):"—";
      return `<tr data-voluntario-id="${esc(String(p.id))}">
        <td style="text-align:center"><img src="${fotoVoluntario(p)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid #c9a227;display:block;margin:auto"></td>
        <td class="name-col">${esc(nombreCompleto(p))}</td>
        <td>${e?'<span class="dot '+esc(e)+'"></span>'+esc(DISP_LABELS[e]):'<span style="color:var(--muted)">Sin informar</span>'}</td>
        <td>${hora}</td>
        <td style="text-align:center">${p.conductor?"◉":"—"}</td>
        <td style="text-align:center">${guardianes.has(String(p.id))?"🛡":"—"}</td>
      </tr>`;
    }).join("");
    if(body.innerHTML!==html) body.innerHTML=html;
    const sum=`
      <div class="summary-item"><div class="big">${cuenta.cuartel}</div><div class="lbl">En cuartel</div></div>
      <div class="summary-item"><div class="big">${cuenta.disponible}</div><div class="lbl">Disponibles</div></div>
      <div class="summary-item"><div class="big">${cuenta.no}</div><div class="lbl">No disponibles</div></div>
      <div class="summary-item"><div class="big">${cuenta.fuera}</div><div class="lbl">Fuera de Villarrica</div></div>
      <div class="summary-item"><div class="big">${cuenta.conductores}</div><div class="lbl">Maquinistas disponibles</div></div>`;
    if(resumen.innerHTML!==sum) resumen.innerHTML=sum;
    const sel=document.getElementById("miVoluntario"), actual=sel&&sel.value?d[sel.value]:null;
    document.querySelectorAll(".status-choice").forEach(b=>b.classList.toggle("active",!!actual&&b.dataset.estado===actual.estado));
  }
  renderDisponibilidad=minutaDinamica;

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

  const obs=new MutationObserver(()=>mejorarEstadisticas());
  document.addEventListener("DOMContentLoaded",()=>{
    ajustarEncabezadoMinuta();
    mejorarEstadisticas();
    const panel=document.getElementById("panel-panel"); if(panel)obs.observe(panel,{childList:true,subtree:true});
    minutaDinamica().catch(console.error);
  });
})();