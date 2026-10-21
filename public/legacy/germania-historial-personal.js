/* Módulo independiente: el historial personal no depende de que termine de inicializar app.js. */
/* Historial personal: vista de solo lectura; el historial institucional permanece intacto. */
(function iniciarHistorialPersonal(){
  const panel=document.getElementById("panel-historial");
  if(!panel)return;
  const vista=document.createElement("section");
  vista.id="historialPersonalVista";
  vista.hidden=true;
  vista.innerHTML='<div class="card"><h2>Mi historial de asistencia</h2><div id="historialPersonalContenido" role="status" aria-live="polite"></div><button type="button" id="hpInstitucional" class="btn small secondary">Ver historial institucional</button></div>';
  panel.prepend(vista);
  const estilo=document.createElement("style");
  estilo.textContent='#historialPersonalVista .hp-resumen{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}#historialPersonalVista .hp-kpi{flex:1;min-width:95px;border:1px solid #40454d;border-radius:9px;padding:12px;text-align:center}#historialPersonalVista .hp-kpi strong{display:block;font-size:23px}#historialPersonalVista .hp-fila{display:grid;grid-template-columns:minmax(0,1fr) 70px 70px;align-items:center;gap:8px;border-bottom:1px solid #343940;padding:9px 0}#historialPersonalVista .hp-fila button{padding:8px 3px;border:1px solid #666;border-radius:7px;background:#222a31;color:#fff;cursor:pointer}#historialPersonalVista .hp-fila button:focus-visible{outline:2px solid #f0bd55}#historialPersonalVista .hp-detalle{padding:8px 12px;margin:6px 0 12px;border-left:3px solid #bc3131;background:#1d242b}#historialPersonalVista .hp-detalle p{margin:7px 0;font-size:13px}';
  document.head.appendChild(estilo);
  const general=Array.from(panel.children).filter(el=>el!==vista);
  const activar=(personal)=>{
    window.__historialPersonalActivo=personal;
    vista.hidden=!personal;
    vista.style.setProperty("display",personal?"block":"none","important");
    general.forEach(el=>{el.hidden=personal;el.style.setProperty("display",personal?"none":"","important");if(!personal)el.style.removeProperty("display");});
  };
  window.__abrirHistorialPersonal=function(){activar(true);void cargarPersonal();};
  document.addEventListener("click",function(e){
    const enlace=e.target.closest('[data-go="historial"],[data-tab="historial"]');
    if(!enlace)return;
    if(!window.__historialPersonalActivo)window.__abrirHistorialPersonal();
  },true);
  const institucional=document.getElementById("hpInstitucional");
  institucional.addEventListener("click",function(){activar(false);renderHistorial();});


  let secuencia=0;
  async function cargarPersonal(){
    const turno=++secuencia,contenedor=document.getElementById("historialPersonalContenido");
    contenedor.textContent="Cargando tu información...";
    const persona=leerVoluntarioDispositivo();
    if(!persona){contenedor.textContent="Identifícate como voluntario en Inicio para consultar tu historial.";return;}
    try{
      const partes=await leerPartesDelIndice();
      if(turno!==secuencia)return;
      const categorias=new Map(),vistos=new Set();
      let presentes=0,ausentes=0,justificados=0;
      for(const {it,p} of partes){
        if(!p||!parteCuentaAsistencia(p)||!voluntarioAplicaParte(p,persona.id)||!miembroVigenteEnFecha(persona,p.date))continue;
        const clave=String(it.clave||p.date+"|"+p.tipo);
        if(vistos.has(clave))continue;
        vistos.add(clave);
        const estado=p.records?.[persona.id];
        if(!["presente","ausente","justificado"].includes(estado))continue;
        const cat=origenAsistencia(p).categoria||"Otras";
        if(!categorias.has(cat))categorias.set(cat,{presente:[],ausente:[],justificado:[]});
        const item={fecha:p.date||it.date||"",detalle:p.detalle||p.tipo||cat};
        categorias.get(cat)[estado].push(item);
        if(estado==="presente")presentes++;else if(estado==="ausente")ausentes++;else justificados++;
      }
      const total=presentes+ausentes+justificados;
      const porcentaje=total?(100*presentes/total).toFixed(1):"—";
      contenedor.innerHTML='<p>'+esc(nombreCompleto(persona))+'</p><div class="hp-resumen"><div class="hp-kpi"><strong>'+presentes+'</strong>Asistidas</div><div class="hp-kpi"><strong>'+ausentes+'</strong>No asistidas</div><div class="hp-kpi"><strong>'+porcentaje+(total?"%":"")+'</strong>Asistencia total</div></div><small>Excusas: '+justificados+' · No se consideran como asistencia efectiva.</small><div class="hp-fila"><b>Actividad</b><b>Asistió</b><b>No asistió</b></div><div id="hpFilas"></div>';
      const filas=contenedor.querySelector("#hpFilas");
      if(!categorias.size){filas.textContent="No hay asistencias personales registradas.";return;}
      for(const [cat,datos] of categorias){
        const fila=document.createElement("div");fila.className="hp-fila";
        const nombre=document.createElement("span");nombre.textContent=cat;fila.appendChild(nombre);
        for(const estado of ["presente","ausente"]){
          const boton=document.createElement("button");boton.type="button";boton.textContent=String(datos[estado].length);
          boton.setAttribute("aria-label",cat+": "+datos[estado].length+" "+(estado==="presente"?"asistidas":"no asistidas"));
          fila.appendChild(boton);
          boton.addEventListener("click",()=>{
            const previo=fila.nextElementSibling;
            if(previo?.classList.contains("hp-detalle")){previo.remove();return;}
            const caja=document.createElement("div");caja.className="hp-detalle";
            if(!datos[estado].length)caja.textContent="Sin registros.";
            for(const item of datos[estado].slice().sort((a,b)=>b.fecha.localeCompare(a.fecha))){
              const p=document.createElement("p");p.textContent=item.fecha+" · "+item.detalle;caja.appendChild(p);
            }
            fila.after(caja);
          });
        }
        filas.appendChild(fila);
      }
    }catch(error){
      console.error("Historial personal:",error);
      if(turno===secuencia)contenedor.textContent="No fue posible cargar tu información. Intenta nuevamente.";
    }
  }
})();
