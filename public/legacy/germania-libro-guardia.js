/* Germania · libro físico de guardia: cierre OBAC y ratificación T3.
 * La foto documenta el turno; solamente el T3 confirma la asistencia real.
 */
(function(){
"use strict";
var lugar=document.getElementById("gnLibroCierreInicio");
if(!lugar)return;
var ultimoActor="",ultimaConsulta=0,ocupado=false,visor=0;
function txt(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function actor(){var v=document.getElementById("miVoluntario");return v&&v.value?String(v.value):"";}
function miembros(){return typeof ROSTER==="undefined"?[]:ROSTER;}
function quien(id){return miembros().find(x=>String(x.id)===String(id));}
function nombre(id){var p=quien(id);return p?[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "):"Voluntario "+id;}
function rol(p){var c=String(p&&p.cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return /teniente\s*(tercero|3)/.test(c)?"t3":/capitan/.test(c)?"capitan":"otro";}
function local(){
  var a=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false,hourCycle:"h23"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return {fecha:a.year+"-"+a.month+"-"+a.day,hora:a.hour+":"+a.minute};
}
function mover(fecha,delta){var d=new Date(fecha+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10);}
function miercoles(f){var d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);return d.toISOString().slice(0,10);}
function fotoUrl(f,id){return "/api/guardia/libro?fecha="+encodeURIComponent(f)+"&foto=1&actorId="+encodeURIComponent(id);}
async function estado(k){var r=await fetch("/api/state/"+encodeURIComponent(k),{cache:"no-store"});if(!r.ok)throw Error("lectura");return r.json();}
async function consultar(id){var r=await fetch("/api/guardia/libro?actorId="+encodeURIComponent(id),{cache:"no-store"});if(!r.ok)throw Error("lectura");return (await r.json()).items||[];}
function contenedor(titulo,interior){return '<section class="card" style="margin:10px 0"><h2>'+titulo+'</h2>'+interior+'</section>';}
async function verObac(id,registros){
  var destino=document.getElementById("gnLibroObac")||lugar;
  var tiempo=local(),fecha=mover(tiempo.fecha,tiempo.hora<"06:00"?-2:-1);
  var semana=await estado("guardia-revision:"+miercoles(fecha));
  var rev=semana.value,n=rev?.noches?.[fecha];
  if(!rev||rev.estado!=="aprobada"||String(n?.obac)!==id){destino.innerHTML="";return;}
  if(registros.some(x=>x.fecha===fecha)){
    destino.innerHTML=contenedor("Libro de guardia nocturna",'<p class="sub">Cierre del '+txt(fecha)+' enviado al Teniente Tercero y Capitán. Pendiente de ratificación.</p>');
    return;
  }
  destino.innerHTML=contenedor("Cierre libro guardia nocturna",
    '<p class="sub">Eres OBAC de la noche '+txt(fecha)+'. Después de cerrar el libro físico, toma una fotografía legible y registra las novedades.</p>'
    +'<label class="rv-lbl" for="lgFoto">Fotografía del libro de guardia (obligatoria)</label>'
    +'<input type="file" id="lgFoto" accept="image/jpeg,image/webp,image/*" capture="environment" style="max-width:100%">'
    +'<div id="lgPrevia"></div>'
    +'<label class="rv-lbl" for="lgNovedades">Novedades de la guardia</label>'
    +'<textarea id="lgNovedades" maxlength="2000" rows="3" class="rv-sel" placeholder="Si no hubo, escribe: Sin novedades"></textarea>'
    +'<button type="button" class="btn gr-grande" id="lgGuardar">Enviar cierre del libro y novedades</button>'
    +'<p class="sub">El Capitán recibirá las novedades y el Teniente Tercero revisará la fotografía antes de ratificar asistencia.</p>'
    +'<p id="lgEstado" role="status"></p>');
  var f=document.getElementById("lgFoto"),prev=document.getElementById("lgPrevia");
  f.addEventListener("change",function(){
    prev.innerHTML="";if(!f.files.length)return;
    var foto=document.createElement("img");foto.alt="Fotografía que enviarás";foto.style="max-width:100%;max-height:260px;margin:10px 0;border-radius:8px";
    var tmp=URL.createObjectURL(f.files[0]);foto.src=tmp;foto.onload=()=>URL.revokeObjectURL(tmp);prev.appendChild(foto);
  });
  document.getElementById("lgGuardar").addEventListener("click",async function(){
    var status=document.getElementById("lgEstado"),novedades=document.getElementById("lgNovedades").value.trim();
    if(!f.files.length){status.textContent="Saca o selecciona la fotografía del libro.";return;}
    if(!novedades){status.textContent='Completa las novedades o escribe "Sin novedades".';return;}
    if(!confirm("¿Cerrar el libro de la noche "+fecha+" y enviar foto y novedades a la oficialidad?"))return;
    var boton=this;boton.disabled=true;status.textContent="Preparando la fotografía…";
    try{
      var foto=await comprimir(f.files[0]);status.textContent="Guardando libro y novedades…";
      var r=await fetch("/api/guardia/libro",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({fecha:fecha,actorId:id,foto:foto,novedades:novedades})});
      var j=await r.json();
      if(!r.ok)throw Error(j.error||"No se pudo guardar");
      ultimaConsulta=0;await refrescar(true);
    }catch(e){status.textContent="No se guardó el cierre: "+e.message;boton.disabled=false;}
  });
}
function comprimir(file){
 return new Promise(function(resolve,reject){
  var img=new Image(),u=URL.createObjectURL(file);
  img.onload=function(){
   URL.revokeObjectURL(u);
   try{
    var ratio=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),
      c=document.createElement("canvas");
    c.width=Math.round(img.naturalWidth*ratio);c.height=Math.round(img.naturalHeight*ratio);
    if(!c.width||!c.height)throw Error("Imagen vacía");
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    var data=c.toDataURL("image/webp",0.7);
    if(!data.startsWith("data:image/webp;"))data=c.toDataURL("image/jpeg",0.72);
    if(data.length>1400000)throw Error("La foto pesa demasiado. Acércate al libro y vuelve a tomarla.");
    resolve(data);
   }catch(e){reject(e);}
  };
  img.onerror=function(){URL.revokeObjectURL(u);reject(Error("No se pudo abrir la foto."));};
  img.src=u;
 });
}
function fotoYDetalle(registro,id){
 return '<p><b>OBAC:</b> '+txt(registro.nombre_obac)+' · <b>Fecha:</b> '+txt(registro.fecha)+'</p>'
 +'<p><b>Novedades:</b> '+txt(registro.novedades)+'</p>'
 +'<a href="'+txt(fotoUrl(registro.fecha,id))+'" target="_blank" rel="noopener">Ver fotografía en tamaño completo</a>'
 +'<img src="'+txt(fotoUrl(registro.fecha,id))+'" alt="Fotografía del libro de guardia de '+txt(registro.fecha)+'" loading="lazy" style="display:block;width:100%;max-height:320px;object-fit:contain;margin:10px 0">';
}
async function formRatificar(registro,id,indice){
 var f=registro.fecha,box=document.getElementById("lgRatificar"+indice);if(!box)return;
 try{
   var rev=(await estado("guardia-revision:"+miercoles(f))).value,
       noche=rev?.noches?.[f];
   if(!rev||rev.estado!=="aprobada"||!noche){box.textContent="No hay dotación aprobada disponible.";return;}
   var ac=await estado("guardia-acreditacion:"+f),actual=ac.value||null;
   var ids=[noche.maq,noche.obac,...(noche.vol||[])].filter(Boolean).map(String);
   if(ids.length!==new Set(ids).size){box.textContent="Hay integrantes duplicados; revisar dotación.";return;}
   var filas=ids.map((pid,i)=>{
     var tipo=i===0?"Maquinista":i===1?"OBAC":"Voluntario";
     var valor=actual?.asistencias?.[pid]||"";
     return '<label class="rv-lbl">'+txt(nombre(pid))+' · '+tipo+'</label><select class="rv-sel" data-lg-persona="'+txt(pid)+'">'
     +'<option value="">— comprobar presencia —</option><option value="presente"'+(valor==="presente"?" selected":"")+'>Asistió</option>'
     +'<option value="ausente"'+(valor==="ausente"?" selected":"")+'>No asistió</option></select>';
   }).join("");
   box.innerHTML='<p class="sub">Compara la fotografía con cada integrante. La imagen no confirma asistencia automáticamente.</p>'
      +filas+'<label><input type="checkbox" id="lgRevisado'+indice+'"> Revisé el libro y confirmé cada asistencia</label>'
      +'<button type="button" class="btn gr-grande" id="lgConfirmar'+indice+'">'+(actual?'Corregir ratificación':'Ratificar noche realizada')+'</button>'
      +'<p role="status" id="lgMensaje'+indice+'"></p>';
   document.getElementById("lgConfirmar"+indice).addEventListener("click",async function(){
     var asistencia={},completo=true;
     box.querySelectorAll("[data-lg-persona]").forEach(el=>{asistencia[el.dataset.lgPersona]=el.value;if(!el.value)completo=false;});
     var mensaje=document.getElementById("lgMensaje"+indice);
     if(!completo||!document.getElementById("lgRevisado"+indice).checked){
       mensaje.textContent="Revisa la fotografía y marca la asistencia o ausencia de todos.";return;
     }
     var motivo="";
     if(actual){motivo=prompt("Motivo obligatorio de la corrección:","")||"";if(!motivo.trim())return;}
     if(!confirm("¿Ratificar asistencia real de la noche "+f+"? Se actualizarán las estadísticas individuales."))return;
     this.disabled=true;mensaje.textContent="Ratificando…";
     try{
       var r=await fetch("/api/guardia/acreditacion",{method:"POST",headers:{"Content-Type":"application/json"},
         body:JSON.stringify({fecha:f,actorId:id,asistencias:asistencia,ifVersion:ac.version||0,motivoCorreccion:motivo})});
       var j=await r.json();
       if(!r.ok)throw Error(j.error||"Error al ratificar");
       ultimaConsulta=0;await refrescar(true);
     }catch(e){mensaje.textContent="No se ratificó: "+e.message;this.disabled=false;}
   });
 }catch(e){box.textContent="No se pudo cargar la dotación aprobada.";}
}
async function verOficial(id,registros,esT3){
 var destino=document.getElementById("gnLibroOficial")||lugar;
 if(!registros.length){destino.innerHTML="";return;}
 var pendiente=registros.filter(r=>r.estado_acreditacion!=="acreditada");
 var ordenados=(esT3?pendiente:registros).slice(0,8);
 if(!ordenados.length){destino.innerHTML=contenedor("Libro de guardia nocturna","<p class='sub'>No hay cierres pendientes de ratificación.</p>");return;}
 var subtitulo=esT3?"Cierres recibidos · verifica y ratifica":"Novedades enviadas por los OBAC";
 destino.innerHTML=contenedor(esT3?"Ratificación de guardia nocturna":"Libro de guardia · Capitán",
 '<p class="sub">'+subtitulo+'</p>'+ordenados.map(function(r,i){
  return '<details class="gr-det" '+(i===0?"open":"")+'><summary>'+txt(r.fecha)+' · '+(r.estado_acreditacion==="acreditada"?"Ratificada":"Pendiente")+'</summary>'
    +fotoYDetalle(r,id)+(esT3?'<div id="lgRatificar'+i+'">Cargando integrantes…</div>':"")+'</details>';
 }).join(""));
 if(esT3)for(var i=0;i<ordenados.length;i++)await formRatificar(ordenados[i],id,i);
}
async function refrescar(forzar){
 if(ocupado)return;
 var id=actor(),activo=document.getElementById("panel-germania")?.classList.contains("active");
 if(!id){lugar.innerHTML="";ultimoActor="";return;}
 if(!activo&&!forzar)return;
 if(!forzar&&id===ultimoActor&&Date.now()-ultimaConsulta<30000)return;
 ocupado=true;ultimoActor=id;ultimaConsulta=Date.now();
 try{
  var p=quien(id);if(!p){lugar.innerHTML="";return;}
  var registros=await consultar(id),cargo=rol(p);
  lugar.innerHTML='<div id="gnLibroObac"></div><div id="gnLibroOficial"></div>';
  await verObac(id,registros);
  if(cargo==="t3"||cargo==="capitan")await verOficial(id,registros,cargo==="t3");
 }catch(e){lugar.innerHTML=contenedor("Libro de guardia","<p class='sub'>No se pudo sincronizar el cierre del libro. Comprueba la conexión.</p>");}
 finally{ocupado=false;}
}
setInterval(()=>refrescar(false),10000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){ultimaConsulta=0;refrescar(true);}});
document.addEventListener("click",e=>{if(e.target.closest('[data-go="germania"]'))setTimeout(()=>refrescar(true),150);});
refrescar(true);
})();
