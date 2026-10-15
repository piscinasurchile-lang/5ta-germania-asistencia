/* ODD PDF desde Avisos de Oficiales: reutiliza el registro compartido de ODD.
   No usa el canal de pruebas de "Publicar información". */
(function(){
 "use strict";
 const $=id=>document.getElementById(id);
 function escape(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function fechaChileMasDias(dias){
  const p=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit"})
   .formatToParts(new Date(Date.now()+dias*86400000));
  const d=Object.fromEntries(p.map(x=>[x.type,x.value]));
  return d.year+"-"+d.month+"-"+d.day;
 }
 function cerrar(){const m=$("oddPdfPublicarModal");if(m)m.remove();}
 async function abrir(){
  const yo=infoAvisoQuienSoy();
  if(!yo||!puedeAdministrar(yo)){
   alert("Para publicar una ODD oficial, selecciona el Ayudante, Secretario, Capitán o administrador en Inicio.");
   return;
  }
  const lista=await cargarAvisosOdd(true);
  const anio=fechaChileMasDias(0).slice(0,4);
  const numeraciones=lista.filter(x=>String(x.numero||"").endsWith("/"+anio))
   .map(x=>parseInt(String(x.numero).split("/")[0],10)).filter(Number.isFinite);
  const sugerencia=String(numeraciones.length?Math.max(...numeraciones)+1:1).padStart(3,"0")+"/"+anio;
  cerrar();
  const cont=document.createElement("div");
  cont.id="oddPdfPublicarModal";
  cont.setAttribute("role","dialog");
  cont.setAttribute("aria-modal","true");
  cont.setAttribute("aria-label","Publicar ODD PDF para todos");
  cont.className="odd-pdf-modal";
  cont.innerHTML=[
   '<div class="odd-pdf-modal-contenido">',
   '<h2>Publicar ODD en PDF</h2>',
   '<p class="sub">Selecciona la ODD elaborada en el PC. La publicaremos para todos los voluntarios, sin transcribir su contenido.</p>',
   '<label for="oddPdfNumero">Número de ODD</label>',
   '<input id="oddPdfNumero" value="'+escape(sugerencia)+'" maxlength="8" placeholder="063/'+escape(anio)+'">',
   '<label for="oddPdfTitulo">Título corto</label>',
   '<input id="oddPdfTitulo" maxlength="140" placeholder="Por ejemplo, Citación de compañía">',
   '<label for="oddPdfArchivo">Seleccionar archivo PDF (máximo 1,5 MB)</label>',
   '<input type="file" id="oddPdfArchivo" accept=".pdf,application/pdf">',
   '<label for="oddPdfHasta">Visible en Inicio hasta el día</label>',
   '<input id="oddPdfHasta" type="date" value="'+escape(fechaChileMasDias(7))+'">',
   '<p class="sub">Después de esa fecha, desaparece de Inicio pero queda guardada en el archivo de ODD de Germania.</p>',
   '<p id="oddPdfResultado" role="status" aria-live="polite"></p>',
   '<div class="odd-pdf-acciones"><button type="button" class="btn" id="oddPdfConfirmar">Publicar para todos</button>',
   '<button type="button" class="btn secondary" id="oddPdfCancelar">Cancelar</button></div></div>'
  ].join("");
  document.body.appendChild(cont);
  cont.addEventListener("click",ev=>{if(ev.target===cont)cerrar();});
  $("oddPdfCancelar").onclick=cerrar;
  $("oddPdfArchivo").onchange=()=>{
   const file=$("oddPdfArchivo").files?.[0];
   if(file&&!$("oddPdfTitulo").value.trim())$("oddPdfTitulo").value=file.name.replace(/\.pdf$/i,"").replace(/[_-]/g," ").slice(0,140);
  };
  $("oddPdfConfirmar").onclick=async()=>{
   const numero=$("oddPdfNumero").value.trim(),titulo=$("oddPdfTitulo").value.trim(),
    archivo=$("oddPdfArchivo").files?.[0],hasta=$("oddPdfHasta").value,msg=$("oddPdfResultado"),boton=$("oddPdfConfirmar");
   msg.textContent="";
   if(!/^\d{1,3}\/\d{4}$/.test(numero)){msg.textContent="Número inválido. Ejemplo: 063/2026.";return;}
   if(!titulo){msg.textContent="Indica el título de la ODD.";return;}
   if(!archivo){msg.textContent="Selecciona un archivo PDF.";return;}
   if(archivo.type!=="application/pdf"){msg.textContent="Solo se admiten archivos PDF.";return;}
   if(archivo.size>1536*1024){msg.textContent="El PDF supera 1,5 MB; reduce su tamaño antes de publicarlo.";return;}
   if(!hasta||instanteChile(hasta,"23:59")<=Date.now()){msg.textContent="La fecha de vencimiento debe ser futura.";return;}
   const todos=await cargarAvisosOdd(true);
   const previo=todos.find(x=>x.numero===numero);
   if(previo&&!confirm("La ODD "+numero+" ya existe. ¿Reemplazar su PDF y actualizar el aviso?"))return;
   if(!confirm("¿Publicar la ODD "+numero+" para todos los voluntarios?"))return;
   boton.disabled=true;msg.textContent="Guardando el PDF y publicando la ODD…";
   try{
    await publicarAvisoOdd({editarId:previo?.id||null,tipo:"disposicion",numero,titulo,
     fecha:"",hora:"",lugar:"",tema:"",vestimenta:"",hasta,excusas:"",puntualidad:false,
     archivo,clave:""});
    cerrar();
    avisoGuardado("ok","ODD "+numero+" publicada. Todos la pueden abrir en Inicio.",7000);
   }catch(e){boton.disabled=false;msg.textContent=e?.message||"No fue posible publicar el documento.";}
  };
 }
 const btn=$("oddPdfPublicarBtn");
 if(btn)btn.addEventListener("click",()=>abrir().catch(e=>alert(e?.message||"No fue posible abrir el formulario.")));
})();