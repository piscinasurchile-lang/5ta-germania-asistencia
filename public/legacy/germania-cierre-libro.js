/* Germania: cierre del libro por OBAC y ratificación separada por Teniente Tercero.
   La foto es respaldo documental; solo la acreditación T3 modifica estadísticas. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const escHtml=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let actual="",items=[],t3=false,capitan=false,admin=false,cargando=false,formAbierto=false,editando=false,ultimaCarga=0;
function elegido(){
 const id=$("miVoluntario")?.value;
 return typeof ROSTER!=="undefined"&&id ? ROSTER.find(x=>String(x.id)===String(id)) : null;
}
function nombre(id){
 const p=typeof ROSTER!=="undefined"?ROSTER.find(x=>String(x.id)===String(id)):null;
 return p?[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "):"Registro "+String(id);
}
function fechaBonita(fecha){
 const d=new Date(fecha+"T12:00:00Z");
 return d.toLocaleDateString("es-CL",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
function etiquetaGuardia(fecha){return "Guardia del "+fechaBonita(fecha);}
function filaAsistencia(nombrePersona,rolPersona,presente){
 return '<div class="lgn-asistencia-fila '+(presente?"presente":"ausente")+'">'+
   '<span class="lgn-asistencia-nombre">'+escHtml(nombrePersona)+' · '+escHtml(rolPersona)+'</span>'+
   '<strong class="lgn-asistencia-estado">'+(presente?"Asistió":"No asistió")+'</strong></div>';
}
function estadoSeleccionAsistencia(sel){
 if(!sel)return;
 sel.classList.toggle("lgn-asistencia-select-ausente",sel.value==="ausente");
 sel.classList.toggle("lgn-asistencia-select-presente",sel.value==="presente");
}
function rol(m){return String(m?.cargo||"").toLowerCase();}
function esMando(m){return /teniente\s*(tercero|3)/i.test(rol(m))||/^\s*capit[aá]n/i.test(rol(m));}
function fotoUrl(f){return "/api/guardia/libro?foto=1&fecha="+encodeURIComponent(f)+"&actorId="+encodeURIComponent(actual);}
async function cargar(forzar){
 const m=elegido(),id=m?String(m.id):"";
 if(!id){actual="";items=[];admin=false;limpiar();return;}
 if(cargando||(!forzar&&Date.now()-ultimaCarga<12000&&actual===id))return;
 cargando=true;
 try {
  const r=await fetch("/api/guardia/libro?actorId="+encodeURIComponent(id),{cache:"no-store"});
  if(!r.ok)throw Error("No se pudo consultar el libro.");
  const d=await r.json();
  if(elegido()&&String(elegido().id)===id){
   actual=id;items=Array.isArray(d.items)?d.items:[];t3=!!d.esT3;capitan=!!d.esCapitan;admin=!!d.esAdmin;
   ultimaCarga=Date.now();pintarOBAC();pintarOficial();pintarControlAdmin();
  }
 }catch(e){if((esMando(m)||String(m?.clave)==="517")&&$("lgnRatif"))$("lgnRatif").innerHTML='<p class="sub">No fue posible sincronizar los cierres. Intenta actualizar.</p>';}
 finally{cargando=false;}
}
function limpiar(){
 if($("lgnObacHome"))$("lgnObacHome").innerHTML="";
 if($("lgnMandoHome"))$("lgnMandoHome").innerHTML="";
 if($("lgnAdminHome"))$("lgnAdminHome").innerHTML="";
 if($("lgnAdminPanel")){$("lgnAdminPanel").hidden=true;$("lgnAdminPanel").innerHTML="";}
 if($("btnAdminGuardia"))$("btnAdminGuardia").hidden=true;
 if($("lgnRatif")){$("lgnRatif").hidden=true;$("lgnRatif").innerHTML="";}
 if($("btnOficialesAcreditar"))$("btnOficialesAcreditar").hidden=true;
}
function pintarOBAC(){
 const host=$("lgnObacHome");if(!host)return;
 const propia=items.find(x=>String(x.dotacion?.obac)===actual && (x.cierreHabilitado||x.cierre&&x.finalizada&&!x.acreditacionVigente));
 if(!propia){if(!formAbierto)host.innerHTML="";return;}
 const f=propia.fecha;
 if(formAbierto&&host.querySelector("#lgnEnviar"))return;
 if(propia.cierre){
  host.innerHTML='<section class="card" aria-label="Libro de guardia nocturna"><h2>Libro de Guardia Nocturna · '+escHtml(fechaBonita(f))+'</h2><p class="sub">Cierre enviado por el OBAC. '+(propia.acreditacionVigente?'Ratificado por el Teniente Tercero.':'Pendiente de ratificación del Teniente Tercero.')+'</p><p>'+escHtml(propia.cierre.novedades)+'</p></section>';
  return;
 }
 if(!propia.cierreHabilitado){host.innerHTML="";return;}
 host.innerHTML='<section class="card" aria-label="Cierre del libro de guardia nocturna">'+
  '<h2>Cierre libro guardia nocturna</h2><p class="sub">'+escHtml(fechaBonita(f))+' · OBAC: '+escHtml(nombre(actual))+'</p>'+
  '<p class="sub">Disponible desde las 06:00, después de terminar tu noche, hasta las 06:00 del día siguiente.</p>'+
  '<button type="button" class="btn" id="lgnAbrir">Cierre libro guardia nocturna</button>'+
  '<div id="lgnFormulario" hidden style="margin-top:12px">'+
  '<label for="lgnFoto" class="rv-lbl">Fotografía del libro físico de guardia (obligatoria)</label>'+
  '<input id="lgnFoto" type="file" accept="image/*" capture="environment" style="width:100%;margin:8px 0 12px">'+
  '<div id="lgnVistaFoto"></div>'+
  '<label for="lgnNovedades" class="rv-lbl">Novedades de la noche (obligatorio)</label>'+
  '<textarea id="lgnNovedades" rows="3" maxlength="1800" style="width:100%;box-sizing:border-box;padding:10px;color:#fff;background:#11171c;border:1px solid #8b959b;border-radius:6px" placeholder="Escribe Sin novedades, o detalla lo ocurrido."></textarea>'+
  '<p class="sub">El cierre y las novedades llegan primero al Teniente Tercero. Tras su ratificación, el Capitán recibe el informe para consulta, sin editar.</p>'+
  '<button type="button" id="lgnEnviar" class="btn">Enviar cierre del libro</button>'+
  '<p id="lgnMensaje" role="status" aria-live="polite"></p></div></section>';
 $("lgnAbrir").onclick=function(){formAbierto=true;$("lgnFormulario").hidden=false;$("lgnFoto").click();};
 $("lgnFoto").onchange=function(){
  const file=this.files?.[0],box=$("lgnVistaFoto");
  if(box&&file){const src=URL.createObjectURL(file);box.innerHTML='<img alt="Fotografía seleccionada" style="max-width:100%;max-height:300px;border-radius:8px;object-fit:contain;margin:4px 0 10px">';const im=box.querySelector("img");im.onload=()=>URL.revokeObjectURL(src);im.src=src;}
 };
 $("lgnEnviar").onclick=function(){enviar(f);};
}
async function comprimir(foto){
 // Resolución suficiente para que el oficial amplíe las anotaciones manuscritas.
 const url=URL.createObjectURL(foto);
 const img=new Image();
 try {
  await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});
  const max=2200,escala=Math.min(1,max/Math.max(img.width,img.height));
  const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*escala);canvas.height=Math.round(img.height*escala);
  canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
  for(const quality of [0.88,0.82,0.74]){
   const b=await new Promise(ok=>canvas.toBlob(ok,"image/jpeg",quality));
   if(b&&b.size<=1600000)return new File([b],"libro-guardia.jpg",{type:"image/jpeg"});
  }
  throw Error("La foto aún supera el límite. Acerca la cámara al libro y vuelve a fotografiarlo.");
 }finally{URL.revokeObjectURL(url);}
}
async function enviar(fecha){
 const boton=$("lgnEnviar"),msg=$("lgnMensaje"),file=$("lgnFoto")?.files?.[0],nov=$("lgnNovedades")?.value.trim();
 if(!file||!nov){msg.textContent="Necesitas la fotografía y el texto de novedades (puede ser Sin novedades).";return;}
 if(!confirm("¿Enviar el cierre del libro de "+fecha+" al Teniente Tercero para ratificación?"))return;
 boton.disabled=true;msg.textContent="Preparando fotografía y enviando cierre…";
 try{
  const foto=await comprimir(file);
  const fd=new FormData();fd.append("fecha",fecha);fd.append("actorId",actual);fd.append("novedades",nov);fd.append("foto",foto);
  const r=await fetch("/api/guardia/libro",{method:"POST",body:fd});
  const dat=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(dat.error||"No se pudo enviar.");
  formAbierto=false;msg.textContent="Cierre enviado y archivado.";
  await cargar(true);
 }catch(e){boton.disabled=false;msg.textContent="No se guardó: "+(e.message||"Error de conexión");}
}
function participantes(n){
 return [{id:n.maq,rol:"Maquinista"},{id:n.obac,rol:"OBAC"}].concat((n.vol||[]).map(id=>({id,rol:"Voluntario"}))).filter(x=>x.id!=null);
}

/* Vista administrativa independiente. Solo consulta; jamás transmite modificaciones. */
function semanaDe(fecha){
 const d=new Date(fecha+"T12:00:00Z");
 if(Number.isNaN(d.getTime()))return "";
 d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);
 return d.toISOString().slice(0,10);
}
function clasificarControl(x){
 if(x.acreditacionVigente)return {texto:"Acreditada",clase:"ok"};
 if(x.cierre)return {texto:"Pendiente de ratificación T3",clase:"pend"};
 if(x.finalizada)return {texto:"Falta cierre OBAC",clase:"falta"};
 return {texto:"Programada / en curso",clase:""};
}
function abrirControlAdmin(){
 if(!admin)return;
 if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("control-guardia-diaria");
 setTimeout(()=>{const caja=$("lgnAdminPanel");if(caja&&!caja.hidden)caja.scrollIntoView({behavior:"smooth",block:"start"});},80);
}
function pintarControlAdmin(){
 const boton=$("btnAdminGuardia"),home=$("lgnAdminHome"),panel=$("lgnAdminPanel");
 if(boton)boton.hidden=!admin;
 if(!admin){
  if(home)home.innerHTML="";
  if(panel){panel.hidden=true;panel.innerHTML="";}
  return;
 }
 // Cada noche se agrega visualmente al concluir su turno, a las 06:00 del día siguiente.
 // No se muestran turnos futuros como cumplidos, ni se altera el archivo al cambiar de semana.
 const terminadas=items.filter(x=>x.finalizada).slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
 const resumen={falta:0,cerradas:0,pendiente:0,acreditadas:0};
 for(const x of terminadas){
  // Cierre del OBAC y ratificación del T3 son hitos independientes.
  if(x.cierre)resumen.cerradas++;
  if(x.acreditacionVigente)resumen.acreditadas++;
  else if(x.cierre)resumen.pendiente++;
  else resumen.falta++;
 }
 const encabezado='<h2>Control Guardia Diaria</h2>'+
  '<p class="sub">Registro cronológico de las noches terminadas. Se agrega una tarjeta al terminar cada guardia (06:00 del día siguiente). El Teniente Tercero es el único que ratifica.</p>';
 const indicadores='<div class="lgn-control-totales">'+[
  [terminadas.length,"Noches terminadas"],[resumen.cerradas,"Cierres OBAC recibidos"],
  [resumen.pendiente,"Pendientes T3"],[resumen.acreditadas,"Ratificadas T3"],
  [resumen.falta,"Sin cierre OBAC"]
 ].map(([valor,titulo])=>'<div class="lgn-control-cifra"><b>'+valor+'</b><span>'+titulo+'</span></div>').join("")+'</div>';
 if(home){
  home.innerHTML='<section class="card" aria-label="Control Guardia Diaria">'+encabezado+
   indicadores+'<button class="btn secondary" type="button" id="lgnAdminAbrir">Abrir Control Guardia Diaria</button></section>';
  const abrir=$("lgnAdminAbrir");if(abrir)abrir.onclick=abrirControlAdmin;
 }
 if(!panel)return;
 panel.hidden=false;
 let html=encabezado+indicadores+
  '<p class="lgn-control-nota">Cada noche tiene su día y fecha, OBAC, dotación, foto, novedades y estado de acreditación. Las ausencias ratificadas se destacan en rojo. Este módulo es solo de consulta.</p>';
 if(!terminadas.length){
  html+='<p class="sub">Aún no hay noches terminadas. El primer registro aparecerá al concluir la guardia, desde las 06:00.</p>';
 }
 let grupoAnterior="";
 for(const x of terminadas){
  const semana=semanaDe(x.fecha);
  if(semana!==grupoAnterior){
   grupoAnterior=semana;
   html+='<h3 class="lgn-control-semana">Semana del '+escHtml(fechaBonita(semana))+'</h3>';
  }
  const estado=clasificarControl(x),foto=!!x.cierre?.fotoClave;
  html+='<details class="lgn-control-dia"><summary>'+
   '<strong>'+escHtml(etiquetaGuardia(x.fecha))+'</strong>'+
   '<span class="lgn-control-estado '+estado.clase+'">'+escHtml(estado.texto)+'</span>'+
   '</summary><div class="lgn-dia-detalle">';
  html+='<p><strong>Fecha de la guardia:</strong> '+escHtml(fechaBonita(x.fecha))+
   ' · 22:45 a 06:00 del día siguiente.</p>'+
   '<p><strong>OBAC:</strong> '+escHtml(nombre(x.dotacion?.obac))+'</p>'+
   '<p><strong>Maquinista:</strong> '+escHtml(nombre(x.dotacion?.maq))+'</p>'+
   '<p><strong>Voluntarios programados:</strong> '+
   ((x.dotacion?.vol||[]).length?x.dotacion.vol.map(id=>escHtml(nombre(id))).join(", "):"Sin asignar")+'</p>';
  if(x.cierre){
   const fechaEnvio=x.cierre.enviadoEn?new Date(x.cierre.enviadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}):"Sin fecha";
   html+='<p><strong>Cierre OBAC:</strong> '+escHtml(fechaEnvio)+
    ' · por '+escHtml(x.cierre.obacNombre||nombre(x.dotacion?.obac))+'</p>'+
    '<p><strong>Novedades:</strong> '+escHtml(x.cierre.novedades||"No registradas")+'</p>';
   if(foto)html+='<p><a class="btn secondary" href="'+fotoUrl(x.fecha)+
    '" target="_blank" rel="noopener">Ver foto del libro</a></p>';
  }else{
   html+='<p class="sub">Falta el cierre con fotografía y novedades del OBAC.</p>';
  }
  if(x.acreditacionVigente&&x.acreditacion){
   const ratificada=x.acreditacion.acreditadoEn?new Date(x.acreditacion.acreditadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}):"";
   html+='<p><strong>Ratificada por T3:</strong> '+escHtml(x.acreditacion.acreditadoPorNombre||"Teniente Tercero")+
    (ratificada?' · '+escHtml(ratificada):"")+'</p>'+
    '<p><strong>Asistencia confirmada:</strong></p>';
   for(const p of participantes(x.dotacion)){
    const presente=x.acreditacion.asistencias?.[String(p.id)]==="presente";
    html+=filaAsistencia(nombre(p.id),p.rol,presente);
   }
  }else if(x.cierre){
   html+='<p class="sub">Pendiente de ratificación del Teniente Tercero. No suma estadísticas todavía.</p>';
  }
  html+='</div></details>';
 }
 html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+
  '<button type="button" class="btn secondary small" id="lgnAdminActualizar">Actualizar control</button>'+
  '<button type="button" class="btn secondary small" id="lgnAdminInicio">Volver a Inicio</button></div>';
 panel.innerHTML=html;
 const ref=$("lgnAdminActualizar");
 if(ref)ref.onclick=()=>cargar(true);
 const inicio=$("lgnAdminInicio");
 if(inicio)inicio.onclick=()=>{
  if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("germania");
 };
}

function pintarResumenMando(){
 const host=$("lgnMandoHome");if(!host)return;
 if(!t3&&!capitan){host.innerHTML="";return;}
 const terminadas=items.filter(x=>x.finalizada);
 const ratificadas=terminadas.filter(x=>x.acreditacionVigente);
 const cierresPendientes=terminadas.filter(x=>x.cierre&&!x.acreditacionVigente);
 if(!t3&&!ratificadas.length){host.innerHTML="";return;}
 const cabecera=t3?"Acreditación de guardia nocturna":"Informes ratificados · Capitán";
 const mensaje=t3
  ?(cierresPendientes.length
    ?cierresPendientes.length+" cierre(s) del OBAC esperando tu ratificación."
    :"No hay cierres del OBAC pendientes de ratificación.")
  :ratificadas.length+" noche(s) ratificada(s) por el Teniente Tercero. Consulta fotografías, novedades y asistentes.";
 host.innerHTML='<section class="card" aria-label="'+escHtml(cabecera)+'">'+
   '<h2>'+escHtml(cabecera)+'</h2><p class="sub">'+escHtml(mensaje)+'</p>'+
   '<button type="button" class="btn secondary" id="lgnMandoIr">'+
   (t3?"Revisar y ratificar noches":"Ver informes de guardia")+'</button></section>';
 const ir=$("lgnMandoIr");if(ir)ir.onclick=()=>abrirPanelMando();
}
function abrirPanelMando(){
 if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("guardia");
 setTimeout(()=>{const a=$("lgnRatif");if(a)a.scrollIntoView({behavior:"smooth",block:"start"});cargar(true);},100);
}
function pintarOficial(){
 const area=$("lgnRatif"),btn=$("btnOficialesAcreditar");if(!area)return;
 const mando=t3||capitan;area.hidden=!mando;if(btn)btn.hidden=!mando;
 if(!mando){area.innerHTML="";return;}
 const terminadas=items.filter(x=>x.finalizada);
 const pendientes=terminadas.filter(x=>!x.acreditacionVigente);
 const actualizados=(t3?terminadas:terminadas.filter(x=>x.acreditacionVigente)).slice(0,35);
 pintarResumenMando();
 let h='<h2>'+(t3?"Acreditación de guardia nocturna":"Informes de noches ratificadas")+'</h2>'+
 '<p class="sub">'+(t3?"Ratifica cada noche solamente después del cierre del libro por el OBAC.":"Solo consulta: aquí aparecen las noches después de la ratificación del Teniente Tercero. No puedes modificar sus registros.")+'</p>'+
 '<p class="sub">'+(t3?pendientes.length+" noche(s) pendiente(s) de ratificación. El cierre OBAC no suma asistencia por sí solo.":"Informes recibidos: "+actualizados.length+". La información es de solo lectura.")+'</p>'+
 '<button type="button" class="btn small secondary" id="lgnRefrescar">Actualizar cierres</button>';
 for(const [i,x] of actualizados.entries()){
  const fin=x.finalizada,rec=x.cierre,ac=x.acreditacionVigente;
  const titulo=etiquetaGuardia(x.fecha);
  h+='<details class="gr-det" '+(i===0?"open":"")+' style="margin:12px 0;padding:12px;border:1px solid #555;border-radius:8px">'+
    '<summary style="cursor:pointer;font-weight:700">'+escHtml(titulo)+
    ' · '+(ac?"Acreditada":rec?"Cierre recibido / pendiente ratificación":"Falta cierre OBAC")+'</summary>'+
    '<p><strong>Fecha de la guardia:</strong> '+escHtml(fechaBonita(x.fecha))+' · 22:45 a 06:00 del día siguiente.</p>'+ 
    '<p><strong>OBAC:</strong> '+escHtml(nombre(x.dotacion?.obac))+'</p>';
  if(rec){
   h+='<p><strong>Cierre enviado por OBAC:</strong> '+escHtml(new Date(rec.enviadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}))+'</p>'+
      '<p><strong>Novedades:</strong> '+escHtml(rec.novedades)+'</p>'+
      '<a href="'+fotoUrl(x.fecha)+'" target="_blank" rel="noopener" class="btn secondary" style="display:inline-block;margin-bottom:8px">Ver fotografía del libro</a>';
  }else h+='<p class="sub">El OBAC todavía no ha enviado fotografía y novedades. No se puede acreditar.</p>';
  if(ac && x.acreditacion){
    h+='<p><strong>Ratificado por:</strong> '+escHtml(x.acreditacion.acreditadoPorNombre||"Teniente Tercero")+
      ' · '+escHtml(new Date(x.acreditacion.acreditadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}))+'</p>';
  }
  if(capitan && !t3 && ac){
    h+='<div class="gr-lista"><strong>Asistencia ratificada (solo lectura)</strong>';
    for(const p of participantes(x.dotacion)){
      const estado=x.acreditacion?.asistencias?.[String(p.id)]==="presente"?"Asistió":"No asistió";
      h+=filaAsistencia(nombre(p.id),p.rol,estado==="Asistió");
    }
    h+='</div>';
  }
  if(t3 && rec){
   h+='<div class="gr-lista" data-lgn-lista="'+escHtml(x.fecha)+'"><p class="sub">Verifica cada asistencia con el libro físico antes de ratificar.</p>';
   for(const p of participantes(x.dotacion)){
    const estado=ac?x.acreditacion.asistencias?.[String(p.id)]||"":"";
    h+='<label class="rv-lbl">'+escHtml(nombre(p.id))+' · '+escHtml(p.rol)+'</label>'+
       '<select class="rv-sel" data-lgn-id="'+escHtml(p.id)+'" aria-label="Asistencia de '+escHtml(nombre(p.id))+'">'+
       '<option value="">— verificar —</option><option value="presente"'+(estado==="presente"?" selected":"")+'>Asistió</option>'+
       '<option value="ausente"'+(estado==="ausente"?" selected":"")+'>No asistió</option></select>';
   }
   h+='</div><button type="button" class="btn" data-lgn-ratificar="'+escHtml(x.fecha)+'">'+(ac?"Corregir acreditación":"Ratificar noche")+'</button>';
  }
  h+='<p class="status-msg" data-lgn-estado="'+escHtml(x.fecha)+'" role="status"></p></details>';
 }
 area.innerHTML=h+(actualizados.length?"":'<p class="sub">'+(t3?"Todavía no hay noches terminadas.":"No hay informes ratificados por el Teniente Tercero.")+'</p>');
 $("lgnRefrescar").onclick=()=>{editando=false;cargar(true);};
 area.querySelectorAll("[data-lgn-lista] select").forEach(sel=>{
   estadoSeleccionAsistencia(sel);
   sel.addEventListener("change",()=>{editando=true;estadoSeleccionAsistencia(sel);});
 });
 area.querySelectorAll("[data-lgn-ratificar]").forEach(b=>b.onclick=()=>ratificar(b.dataset.lgnRatificar,b));
}
async function ratificar(fecha,boton){
 if(!t3)return;
 const x=items.find(e=>e.fecha===fecha),zona=$("lgnRatif")?.querySelector('[data-lgn-lista="'+fecha+'"]');
 const msg=$("lgnRatif")?.querySelector('[data-lgn-estado="'+fecha+'"]');
 if(!x||!x.cierre||!zona||!msg)return;
 const asistencias={};
 let ok=true;
 zona.querySelectorAll("[data-lgn-id]").forEach(sel=>{if(!sel.value)ok=false;asistencias[sel.dataset.lgnId]=sel.value;});
 if(!ok){msg.textContent="Selecciona Asistió o No asistió para todas las personas.";return;}
 let motivo="";
 if(x.acreditacion){
  motivo=prompt("Motivo obligatorio para corregir la acreditación:","")||"";
  if(!motivo.trim())return;
 }
 if(!confirm("¿Ratificar la asistencia REAL del "+fecha+"? Esta acción actualizará las estadísticas individuales."))return;
 boton.disabled=true;msg.textContent="Guardando acreditación…";
 try{
  const r=await fetch("/api/guardia/acreditacion",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({fecha,actorId:actual,asistencias,ifVersion:x.acreditacionVersion,motivoCorreccion:motivo})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(d.error||"No se pudo acreditar.");
  editando=false;await cargar(true);
 }catch(e){boton.disabled=false;msg.textContent="No se guardó: "+(e.message||"Error de conexión");}
}
function init(){
 const adminBtn=$("btnAdminGuardia");
 if(adminBtn&&!adminBtn.dataset.lgnReady){
  adminBtn.dataset.lgnReady="1";
  adminBtn.onclick=abrirControlAdmin;
 }
 const btn=$("btnOficialesAcreditar");
 if(btn&&!btn.dataset.lgnReady){
  btn.dataset.lgnReady="1";btn.onclick=function(){
   abrirPanelMando();
  };
 }
 const m=elegido(),id=m?String(m.id):"";
 if(id!==actual){formAbierto=false;ultimaCarga=0;cargar(true);}
}
init();
setInterval(()=>{init();const fechaReciente=new Date(Date.now()-3*86400000).toISOString().slice(0,10);const soyObacReciente=items.some(x=>String(x.dotacion?.obac)===actual&&x.fecha>=fechaReciente);if(document.visibilityState==="visible"&&!formAbierto&&!editando&&elegido()&&(esMando(elegido())||admin||soyObacReciente))cargar(false);},5000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!editando&&!formAbierto)cargar(true);});
})();