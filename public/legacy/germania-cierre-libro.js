/* Germania: cierre del libro por OBAC y aprobación en un único paso por un oficial autorizado (ADR 0012).
   La foto es respaldo documental; la aprobación del oficial es lo que actualiza las estadísticas.
   Nota: la variable `t3` conserva su nombre histórico; significa «autorizado a aprobar» (Capitán, T1, T2, T3 y administrador del proyecto, ADR 0013). */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const escHtml=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let semanaBuscada="",actual="",items=[],t3=false,puedeExternos=false,esT3Real=false,capitan=false,admin=false,oficial=false,semanaActual="",historial=null,anioElegido=String(new Date().getFullYear()),historialCargando=false,cargando=false,formAbierto=false,editando=false,fotoSeleccionada=null,ultimaCarga=0,ultimaRatificacion="";
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
function filaAsistencia(nombrePersona,rolPersona,presente,excusado=false){
 return '<div class="lgn-asistencia-fila '+(presente?"presente":excusado?"excusado":"ausente")+'">'+
   '<span class="lgn-asistencia-nombre">'+escHtml(nombrePersona)+' · '+escHtml(rolPersona)+'</span>'+
   '<strong class="lgn-asistencia-estado">'+(presente?"Asistió":excusado?"Excusado":"No asistió")+'</strong></div>';
}
function estadoSeleccionAsistencia(sel){
 if(!sel)return;
 sel.classList.toggle("lgn-asistencia-select-ausente",sel.value==="ausente"||sel.value==="excusado");
 sel.classList.toggle("lgn-asistencia-select-presente",sel.value==="presente");
}
function rol(m){return String(m?.cargo||"").toLowerCase();}
function esMando(m){return /teniente\s*(tercero|3)/i.test(rol(m))||/^\s*capit[aá]n/i.test(rol(m));}
function fotoUrl(f){return "/api/guardia/libro?foto=1&fecha="+encodeURIComponent(f)+"&actorId="+encodeURIComponent(actual);}
async function cargar(forzar){
 const m=elegido(),id=m?String(m.id):"";
 if(!id){actual="";items=[];admin=false;oficial=false;historial=null;limpiar();return;}
 // No reconstruir el formulario del oficial mientras edita asistencia sin guardar.
 if(editando&&actual===id)return;
 if(cargando||(!forzar&&Date.now()-ultimaCarga<12000&&actual===id))return;
 cargando=true;
 try {
  const r=await fetch("/api/guardia/libro?actorId="+encodeURIComponent(id),{cache:"no-store"});
  if(!r.ok)throw Error("No se pudo consultar el libro.");
  const d=await r.json();
  if(elegido()&&String(elegido().id)===id){
   if(actual!==id){historial=null;anioElegido=String(new Date().getFullYear());}
   actual=id;items=Array.isArray(d.items)?d.items:[];t3=!!d.puedeRatificar;puedeExternos=!!d.puedeExternos;capitan=!!d.esCapitan;admin=!!d.esAdmin;
   oficial=!!d.esOficial;semanaActual=d.semanaActual||semanaDe(d.items?.[0]?.fecha||"");
   ultimaCarga=Date.now();pintarOBAC();pintarOficial();pintarControlAdmin();
   return true;
  }
  return false;
 }catch(e){
  // Conservar las fichas y formularios existentes ante una caída temporal de red.
  // Una sincronización fallida no equivale a ausencia de guardias ni a datos descartados.
  console.warn("No fue posible sincronizar cierres de guardia",e);
  const area=$("lgnRatif");
  if(area&&!area.querySelector("[data-lgn-dia]")&&!area.querySelector("[data-lgn-lista]"))
   area.innerHTML='<p class="sub" role="alert">No fue posible sincronizar los cierres. Intenta actualizar cuando vuelva la conexión.</p>';
  return false;
 }
 finally{cargando=false;}
}
function limpiar(){
 fotoSeleccionada=null;formAbierto=false;
 if($("lgnObacHome"))$("lgnObacHome").innerHTML="";
 if($("lgnMandoHome"))$("lgnMandoHome").innerHTML="";
 if($("lgnAdminHome"))$("lgnAdminHome").innerHTML="";
 if($("lgnAdminPanel")){$("lgnAdminPanel").hidden=true;$("lgnAdminPanel").innerHTML="";}
 if($("btnAdminGuardia"))$("btnAdminGuardia").hidden=true;
 if($("lgnRatif")){$("lgnRatif").hidden=true;$("lgnRatif").innerHTML="";}
 if($("btnOficialesAcreditar"))$("btnOficialesAcreditar").hidden=true;
 historial=null;
}
function claveBorradorObac(fecha){return "germania:obac:novedades:v1:"+String(actual)+":"+fecha;}
function leerBorradorObac(fecha){
 try{
  const clave=claveBorradorObac(fecha);
  const raw=localStorage.getItem(clave);
  if(!raw)return "";
  const dato=JSON.parse(raw);
  if(!dato||dato.fecha!==fecha||dato.actor!==String(actual)||typeof dato.texto!=="string"){localStorage.removeItem(clave);return "";}
  if(Date.now()-dato.guardadoEn>14*86400000){localStorage.removeItem(clave);return "";}
  return dato.texto;
 }catch{return "";}
}
function guardarBorradorObac(fecha,texto){
 try{
  if(texto)localStorage.setItem(claveBorradorObac(fecha),JSON.stringify({fecha,actor:String(actual),texto,guardadoEn:Date.now()}));
  else localStorage.removeItem(claveBorradorObac(fecha));
 }catch{}
}
function pintarOBAC(){
 const host=$("lgnObacHome");if(!host)return;
 const motor=window.GermaniaObacAvisos;
 if(!motor){host.innerHTML="";return;}
 const result=motor.seleccionar(items,actual);
 const parte=result.principal;
 // No interrumpir al OBAC mientras escribe novedades o selecciona la fotografía.
 if(formAbierto&&host.querySelector("#lgnEnviar"))return;
 let html="";
 if(parte){
  const f=parte.fecha,habilitado=parte.cierreHabilitado===true;
  html+='<section class="card" aria-label="'+(habilitado?"Cierre libro guardia nocturna":"Turno OBAC programado")+'">'+
   '<h2>'+(habilitado?"Cierre libro guardia nocturna":"Guardia nocturna · OBAC")+'</h2>'+
   '<p class="sub">'+escHtml(fechaBonita(f))+' · OBAC: '+escHtml(nombre(actual))+'</p>';
  if(!habilitado){
   html+='<p class="sub"><strong>Tu guardia comienza hoy a las 22:45.</strong> Esta ficha está visible desde las 22:30.</p>'+
    '<p class="sub">Al finalizar tu guardia, desde las 06:00 podrás fotografiar el libro y enviarlo a los oficiales.</p>';
  }else{
   html+='<p class="sub">La guardia finalizó. Envía la fotografía del libro a los oficiales para su aprobación.</p>'+
    '<button type="button" class="btn" id="lgnAbrir">Cierre libro guardia nocturna</button>'+
    '<div id="lgnFormulario" hidden style="margin-top:12px">'+
    '<label for="lgnFoto" class="rv-lbl">Fotografía del libro físico de guardia (obligatoria)</label>'+
    '<div style="display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 12px"><button type="button" id="lgnAdjuntar" class="btn small secondary" style="min-height:44px">Elegir foto guardada</button><button type="button" id="lgnTomarFoto" class="btn small secondary" style="min-height:44px">Tomar foto ahora</button></div><input id="lgnFoto" type="file" accept="image/*" style="display:none"><input id="lgnCamara" type="file" accept="image/*" capture="environment" style="display:none"><p class="sub">Puedes seleccionar una foto guardada o tomar una nueva. Revisa la vista previa antes de enviar.</p>'+
    '<div id="lgnVistaFoto"></div>'+
    '<p class="sub">El cierre con fotografía llega a los oficiales autorizados para su aprobación.</p>'+
    '<button type="button" id="lgnEnviar" class="btn">Enviar cierre del libro</button>'+ 
    '<button type="button" id="lgnObacAtras" class="btn secondary small">Atrás</button>'+
    '<p id="lgnMensaje" role="status" aria-live="polite"></p></div>';
  }
  html+='</section>';
 }
 // Si un OBAC tiene dos noches consecutivas, el aviso anterior no oculta su nuevo turno.
 for(const x of result.proximas){
  if(x===parte)continue;
  html+='<p class="lgn-obac-aviso-previo"><strong>Próxima guardia OBAC:</strong> '+escHtml(fechaBonita(x.fecha))+
   ' · desde las 22:30. Cierre habilitado al terminar, desde las 06:00.</p>';
 }
 for(const x of result.confirmaciones){
  const hora=x.cierre?.enviadoEn?new Date(x.cierre.enviadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}):"";
  html+='<div class="lgn-obac-confirmacion" role="status">'+
   '<strong>✓ Libro de guardia enviado correctamente a los oficiales</strong>'+
   '<span>'+escHtml(fechaBonita(x.fecha))+(hora?' · Enviado '+escHtml(hora):"")+'</span>'+
   '<small>Confirmación visible durante 24 horas desde el envío.</small></div>';
 }
 host.innerHTML=html;
 if(!parte||!parte.cierreHabilitado)return;
 $("lgnAbrir").onclick=function(){formAbierto=true;$("lgnFormulario").hidden=false;this.hidden=true;this.style.display="none";};
 $("lgnAdjuntar").onclick=function(){$("lgnFoto").value="";$("lgnFoto").click();};
 $("lgnTomarFoto").onclick=function(){$("lgnCamara").value="";$("lgnCamara").click();};
 function alSeleccionarFoto(file){
  if(!file)return;
  fotoSeleccionada=file;
  const box=$("lgnVistaFoto");
  if(box){const src=URL.createObjectURL(file);box.innerHTML='<img alt="Fotografía seleccionada" style="max-width:100%;max-height:300px;border-radius:8px;object-fit:contain;margin:4px 0 10px">';const im=box.querySelector("img");im.onload=()=>URL.revokeObjectURL(src);im.src=src;}
 }
 $("lgnFoto").onchange=function(){alSeleccionarFoto(this.files?.[0]);};
 $("lgnCamara").onchange=function(){alSeleccionarFoto(this.files?.[0]);};
 $("lgnEnviar").onclick=function(){enviar(parte.fecha);};
 $("lgnObacAtras").onclick=function(){
  // Atrás solo oculta el formulario: mantiene foto y novedades en memoria.
  const formulario=$("lgnFormulario"),abrir=$("lgnAbrir");
  if(formulario)formulario.hidden=true;
  if(abrir){abrir.hidden=false;abrir.style.display="";}
 };
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
/* ADR 0014: el administrador puede subir la fotografía del libro de una noche ya terminada que no tiene cierre. */
function htmlSubidaAdmin(x){
 if(!admin||x.cierre||!x.finalizada)return "";
 return '<div class="lgn-adm-subida" style="margin:8px 0;padding:10px;border:1px dashed #888;border-radius:8px"><p class="sub"><strong>Subir la foto del libro (administrador).</strong> Toma o elige la fotografía del libro de esta noche; queda registrada con tu nombre y luego se puede aprobar.</p>'+
  '<input type="file" accept="image/*" data-lgn-adm-foto="'+escHtml(x.fecha)+'"> <button type="button" class="btn small" data-lgn-adm-subir="'+escHtml(x.fecha)+'">Subir foto del libro</button>'+
  '<p class="status-msg" data-lgn-adm-msg="'+escHtml(x.fecha)+'" role="status"></p></div>';
}
async function subirFotoAdmin(fecha,boton){
 const caja=boton.parentElement,input=caja.querySelector("[data-lgn-adm-foto]"),msg=caja.querySelector("[data-lgn-adm-msg]");
 const file=input&&input.files&&input.files[0];
 if(!file){msg.textContent="Elige primero la fotografía del libro.";return;}
 if(!confirm("¿Subir esta fotografía como libro de la guardia del "+fecha+"? Quedará registrada a tu nombre y no se podrá reemplazar."))return;
 boton.disabled=true;msg.textContent="Preparando fotografía y subiendo…";
 try{
  const foto=await comprimir(file);
  const fd=new FormData();fd.append("fecha",fecha);fd.append("actorId",actual);fd.append("novedades","Fotografía del libro subida por el administrador del proyecto (cierre tardío).");fd.append("foto",foto);
  const r=await fetch("/api/guardia/libro",{method:"POST",body:fd});
  const d=await r.json().catch(()=>({}));
  if(r.status===409){boton.disabled=false;msg.textContent="Esta noche ya tiene un cierre registrado o aún no termina. Actualiza la pantalla.";return;}
  if(!r.ok)throw Error(d.error||"No se pudo subir.");
  msg.textContent="Foto subida y archivada. Actualizando…";
  await cargar(true);historial=null;
  if(typeof pintarControlAdmin==="function")pintarControlAdmin();
 }catch(e){boton.disabled=false;msg.textContent="No se confirmó la subida: "+(e.message||"error de conexión")+". Actualiza el expediente antes de reintentar.";}
}
document.addEventListener("click",ev=>{
 const b=ev.target&&ev.target.closest?ev.target.closest("[data-lgn-adm-subir]"):null;
 if(b)subirFotoAdmin(b.dataset.lgnAdmSubir,b);
});
async function enviar(fecha){
 const boton=$("lgnEnviar"),msg=$("lgnMensaje"),file=fotoSeleccionada,nov="Sin novedades";
 if(!file){msg.textContent="Debes adjuntar una fotografía del libro de guardia.";return;}
 if(!confirm("¿Enviar el cierre del libro de "+fecha+" a los oficiales para aprobación?"))return;
 boton.disabled=true;msg.textContent="Preparando fotografía y enviando cierre…";
 try{
  const foto=await comprimir(file);
  const fd=new FormData();fd.append("fecha",fecha);fd.append("actorId",actual);fd.append("novedades",nov);fd.append("foto",foto);
  const r=await fetch("/api/guardia/libro",{method:"POST",body:fd});
  const dat=await r.json().catch(()=>({}));
  if(r.status===409){
   boton.disabled=false;
   msg.textContent="Esta noche ya tiene un cierre registrado o existe un conflicto. Consulta el expediente antes de volver a enviar.";
   return;
  }
  if(!r.ok)throw Error(dat.error||"No se pudo enviar.");
  guardarBorradorObac(fecha,"");
  formAbierto=false;fotoSeleccionada=null;msg.textContent="Cierre enviado y archivado.";
  const sincronizado=await cargar(true);
  if(!sincronizado){
   const aviso=$("lgnMensaje");
   if(aviso)aviso.textContent="Cierre enviado y archivado. La pantalla aún no se sincroniza; consulta el expediente antes de intentar otro envío.";
  }
 }catch(e){
  boton.disabled=false;
  msg.textContent="No se confirmó el envío: "+(e.message||"Error de conexión")+". Revisa el expediente antes de reintentar para evitar duplicados.";
 }
}
function participantes(n){
 return [{id:n.maq,rol:"Maquinista"},{id:n.obac,rol:"OBAC"}].concat((n.vol||[]).map(id=>({id,rol:"Voluntario"}))).filter(x=>x.id!=null);
}

function participantesEfectivos(x){
 const vistos=new Set();
 return participantes(x.dotacion).concat((x.acreditacion?.adicionales||[]).map(p=>({id:String(p.id),rol:"Asistente adicional"})))
  .filter(p=>{const id=String(p.id);if(vistos.has(id))return false;vistos.add(id);return true;});
}
/** Una sola fuente de asistencia efectiva: acta vigente aprobada por un oficial, nunca la ODD. */
function htmlAsistenciaRatificada(x){
 if(!x.acreditacionVigente||!x.acreditacion)return "";
 const ac=x.acreditacion,personas=participantesEfectivos(x);
 const presentes=personas.filter(p=>ac.asistencias?.[String(p.id)]==="presente").length;
 const excusados=personas.filter(p=>!!ac.excusas?.[String(p.id)]).length;
 const ausentes=personas.length-presentes-excusados;
 let h='<section class="lgn-acta-efectiva" data-lgn-acta-fecha="'+escHtml(x.fecha)+'">'+
  '<h3>Asistencia real aprobada · '+escHtml(fechaBonita(x.fecha))+'</h3>'+
  '<p class="sub"><strong>'+presentes+' asistieron · '+excusados+' excusados · '+ausentes+' ausentes</strong>. Esta lista es la utilizada para las estadísticas y el informe del Capitán.</p>'+
  (ac.t3Participante?'<p class="sub lgn-t3-participo"><strong>Trazabilidad:</strong> aprobada por '+escHtml(ac.acreditadoPorNombre||'un oficial')+', quien participó en esta guardia como '+escHtml(ac.t3Participante.rol)+' ('+(ac.t3Participante.asistencia==="presente"?"presente":"ausente")+').</p>':'')+
  '<p class="sub gf-estado"><strong>Registro del libro:</strong> cerrado'+(x.cierre?.sinFoto?' sin fotografía (cierre de oficial)':' con fotografía')+' · <strong>Guardia:</strong> aprobada · <strong>Cumplimiento reglamentario:</strong> '+(ac.cumplimiento?(ac.cumplimiento.estado==='acreditado'?'cumple':'NO cumple ('+escHtml((ac.cumplimiento.motivos||[]).map(m=>({obac_ausente:'OBAC ausente',conductor_ausente:'conductor ausente',voluntarios_insuficientes:'menos de 2 voluntarios',sin_fotografia:'sin fotografía'}[m]||m)).join(', '))+')'):'sin evaluar')+'</p>'+
  ((ac.obacEfectivoId&&String(ac.obacEfectivoId)!==String(x.dotacion?.obac))||(ac.conductorEfectivoId&&String(ac.conductorEfectivoId)!==String(x.dotacion?.maq))?'<p class="sub"><strong>Cambios durante la guardia:</strong> OBAC efectivo '+escHtml(nombre(ac.obacEfectivoId||x.dotacion?.obac))+' · Conductor efectivo '+escHtml(nombre(ac.conductorEfectivoId||x.dotacion?.maq))+(ac.motivoPrecedencia?' · Constancia de precedencia: '+escHtml(ac.motivoPrecedencia):'')+'</p>':'')+
  (ac.dotacionEfectiva?'<p class="sub"><strong>Dotación efectiva: '+(ac.dotacionEfectiva.minimoCumplido?'mínimo cumplido':'INCOMPLETA')+'</strong> · '+ac.dotacionEfectiva.total+' presentes; '+ac.dotacionEfectiva.voluntarios+' voluntarios, '+(ac.dotacionEfectiva.maquinista?'maquinista presente':'sin maquinista')+', '+(ac.dotacionEfectiva.obac?'OBAC presente':'sin OBAC')+'. La ausencia se registra aunque no requiera reemplazo.</p>':'');
 for(const p of personas){
  const id=String(p.id),presente=ac.asistencias?.[id]==="presente",excusa=ac.excusas?.[id];
  const adicional=p.rol==="Asistente adicional";
  h+='<div class="'+(adicional?"lgn-acta-adicional":"")+'">'+filaAsistencia(nombre(id),
   adicional?"Asistente adicional · verificado en libro":p.rol,presente,!!excusa);
  if(excusa)h+='<p class="lgn-excusa-detalle">Motivo de excusa: '+escHtml(excusa)+'</p>';
  h+='</div>';
 }
 if((ac.adicionales||[]).length){
  h+='<p class="lgn-control-nota">Asistentes adicionales incorporados por el oficial que aprobó con respaldo de la fotografía del libro físico.</p>';
 }
 return h+'</section>';
}
function opcionesPersonas(sel){
 if(typeof ROSTER==="undefined")return '';
 return ROSTER.filter(p=>p.activo!==false).sort((a,b)=>nombre(a.id).localeCompare(nombre(b.id),"es"))
  .map(p=>'<option value="'+escHtml(p.id)+'"'+(String(p.id)===String(sel)?' selected':'')+'>'+escHtml(nombre(p.id))+'</option>').join('');
}
/* Cambios durante la noche: OBAC o conductor efectivo distintos de los programados (deben figurar presentes). */
function htmlRolesEfectivos(x){
 const ac=x.acreditacion||{},obac=ac.obacEfectivoId||x.dotacion?.obac,cond=ac.conductorEfectivoId||x.dotacion?.maq;
 return '<div class="lgn-rezagados gf-roles"><h3>OBAC y conductor efectivos</h3>'+
  '<p class="sub">Si cambió alguno durante la noche, elige quién cumplió la función. Debe figurar presente (agrégalo como rezagado si no estaba programado). El conductor reemplazante debe estar habilitado. El Capitán puede conducir, pero no ser OBAC a la vez.</p>'+
  '<label class="rv-lbl" for="gfObac'+escHtml(x.fecha)+'">OBAC efectivo</label><select class="rv-sel" id="gfObac'+escHtml(x.fecha)+'" data-lgn-obac-ef data-prog="'+escHtml(x.dotacion?.obac)+'">'+opcionesPersonas(obac)+'</select>'+
  '<label class="rv-lbl" for="gfCond'+escHtml(x.fecha)+'">Conductor efectivo</label><select class="rv-sel" id="gfCond'+escHtml(x.fecha)+'" data-lgn-cond-ef data-prog="'+escHtml(x.dotacion?.maq)+'">'+opcionesPersonas(cond)+'</select>'+
  '<input type="text" maxlength="300" class="lgn-excusa-input" data-lgn-precedencia placeholder="Constancia de precedencia (opcional; no bloquea)" value="'+escHtml(ac.motivoPrecedencia||"")+'"></div>';
}
const ERRORES_RATIF={solo_oficiales_autorizados:"Solo el Capitán y los tenientes pueden aprobar.",conductor_no_habilitado:"El conductor reemplazante no está habilitado en la nómina.",
 obac_y_conductor_deben_ser_distintos:"Una misma persona no puede ser OBAC y conductor.",precedencia_obac_requiere_motivo:"El OBAC reemplazante no es el más antiguo presente: escribe la constancia de precedencia.",
 reemplazo_debe_estar_presente:"El OBAC o conductor reemplazante debe figurar presente.",noche_no_finalizada:"La noche aún no termina (06:00).",libro_no_cerrado_o_desactualizado:"El libro no está cerrado o cambió la dotación."};
function seleccionarRez(ocupados){
 if(typeof ROSTER==="undefined")return '<option value="">Nómina no disponible</option>';
 return '<option value="">Seleccionar asistente no programado…</option>'+
 ROSTER.filter(p=>p.activo!==false&&!ocupados.has(String(p.id)))
 .sort((a,b)=>nombre(a.id).localeCompare(nombre(b.id),"es"))
 .map(p=>'<option value="'+escHtml(p.id)+'">'+escHtml(nombre(p.id))+'</option>').join("");
}
function htmlRez(id,motivo){
 return '<div class="lgn-rezagado-row" data-lgn-rezagado="'+escHtml(id)+'"><b>'+escHtml(nombre(id))+'</b> · Asistió (verificado en libro)'+
  '<button type="button" class="btn small secondary" data-lgn-quitar>Quitar</button><input type="hidden" data-lgn-motivo-rez value="'+escHtml(motivo)+'"></div>';
}

/* Vista administrativa independiente. Solo consulta; jamás transmite modificaciones. */
function semanaDe(fecha){
 const d=new Date(fecha+"T12:00:00Z");
 if(Number.isNaN(d.getTime()))return "";
 d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);
 return d.toISOString().slice(0,10);
}
/* Estados de presentación del flujo nuevo de Guardia Nocturna.
   Los datos históricos se conservan para trazabilidad y estadísticas. */
/* Ventana de consulta reciente: todas las noches de miércoles a martes
   se retiran juntas el viernes siguiente a las 06:00 de Chile. */
function etiquetaSemana(inicio){
 const d=new Date(inicio+"T12:00:00Z");
 if(Number.isNaN(d.getTime()))return "Semana inválida";
 d.setUTCDate(d.getUTCDate()+7);
 return fechaBonita(inicio)+" → "+fechaBonita(d.toISOString().slice(0,10));
}
function semanaVigente48(fecha){
 const inicio=semanaDe(fecha);
 if(!inicio)return false;
 const d=new Date(inicio+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+9);
 const limite=d.toISOString().slice(0,10)+"T06:00";
 const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
 const v=k=>(p.find(x=>x.type===k)||{}).value||"";
 return [v("year"),v("month"),v("day")].join("-")+"T"+v("hour")+":"+v("minute")<limite;
}
function clasificarControl(x){
 if(x.acreditacionVigente)return {texto:"Guardia aprobada",clase:"ok"};
 if(x.cierre)return {texto:"Libro cerrado · falta aprobar",clase:"pend"};
 if(x.finalizada)return {texto:"Falta cierre OBAC",clase:"falta"};
 return {texto:"Programada / en curso",clase:""};
}
async function abrirControlAdmin(fecha){
 if(!admin&&!oficial)return;
 if(editando&&!confirm("Tienes cambios de asistencia sin guardar. ¿Salir y descartarlos?"))return;
 if(editando){editando=false;pintarOficial();pintarControlAdmin();}
 const elegida=typeof fecha==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(fecha)?fecha:"";
 if(elegida)semanaBuscada=semanaVigente48(elegida)?"":elegida;
 const anioDestino=elegida?elegida.slice(0,4):anioElegido;
 const cambiaAnio=anioElegido!==anioDestino;
 if(cambiaAnio){anioElegido=anioDestino;historial=null;}
 if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("control-guardia-diaria");
 if(!historial||elegida&&!historial.some(x=>x.fecha===elegida))await cargarHistorial();
 const caja=$("lgnAdminPanel");
 const ficha=elegida?Array.from(caja?.querySelectorAll(".lgn-control-dia")||[]).find(el=>el.dataset.fecha===elegida):null;
 if(ficha){
  caja.querySelectorAll(".lgn-control-dia").forEach(otra=>{otra.open=otra===ficha;});
  ficha.scrollIntoView({behavior:"smooth",block:"start"});
 }
 else if(caja&&!caja.hidden)caja.scrollIntoView({behavior:"smooth",block:"start"});
}
async function cargarHistorial(){
 if(historialCargando||!actual||(!admin&&!oficial))return;
 historialCargando=true;
 const actorId=actual,anio=anioElegido,host=$("lgnAdminPanel");
 if(host&&!historial&&!host.querySelector(".lgn-control-dia"))
  host.innerHTML='<h2>Control Guardia Diaria</h2><p class="sub">Cargando las guardias del año '+escHtml(anio)+'…</p>';
 try{
  const r=await fetch("/api/guardia/libro?historial=1&anio="+encodeURIComponent(anio)+"&actorId="+encodeURIComponent(actorId),{cache:"no-store"});
  if(!r.ok)throw Error("No fue posible cargar el historial.");
  const d=await r.json();
  if(actual===actorId&&anioElegido===anio){historial=Array.isArray(d.items)?d.items:[];pintarControlAdmin();}
 }catch(e){
  // Una respuesta tardía de otro usuario o año no debe modificar el panel actual.
  if(actual!==actorId||anioElegido!==anio)return;
  if(host&&!host.querySelector(".lgn-control-dia")){
   host.innerHTML='<h2>Control Guardia Diaria</h2><p role="alert">'+escHtml(e.message||"Error al cargar guardias")+'</p><button type="button" class="btn small secondary" id="lgnReintentar">Reintentar</button>';
   const retry=$("lgnReintentar");if(retry)retry.onclick=cargarHistorial;
  }else console.warn("No se actualizó el historial; se conservan las fichas cargadas",e);
 }
 finally{
  historialCargando=false;
  // Si se cambió de año mientras llegaba una respuesta, consultar el año nuevo.
  if(actual===actorId&&anioElegido!==anio&&historial===null)void cargarHistorial();
 }
}
function pintarControlAdmin(){
 const boton=$("btnAdminGuardia"),home=$("lgnAdminHome"),panel=$("lgnAdminPanel");
 const autorizado=admin||oficial;
 if(boton)boton.hidden=!autorizado;
 if(!autorizado){
  if(home)home.innerHTML="";
  if(panel){panel.hidden=true;panel.innerHTML="";}
  return;
 }
 // Los oficiales consultan solo guardias aprobadas; el administrador y quienes aprueban ven también las pendientes.
 const fuente=historial===null?items:historial;
 const visibles=fuente.filter(x=>x.finalizada&&(admin||t3||x.acreditacionVigente));
 const terminadas=visibles.filter(x=>semanaBuscada?semanaDe(x.fecha)===semanaDe(semanaBuscada):semanaVigente48(x.fecha))
   .slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
 const semanasLista=[...new Set(visibles.map(x=>semanaDe(x.fecha)))].filter(Boolean).sort().reverse();
 const resumen={falta:0,cerradas:0,pendiente:0,acreditadas:0};
 for(const x of terminadas){
  if(x.cierre)resumen.cerradas++;
  if(x.acreditacionVigente)resumen.acreditadas++;
  else if(x.cierre)resumen.pendiente++;
  else resumen.falta++;
 }
 const encabezado='<h2>Control Guardia Diaria</h2>'+
  '<p class="sub">Consulta cronológica de guardias. Pueden aprobar el Capitán, los tenientes 1°, 2° y 3° y el administrador del proyecto. Los demás oficiales ven exclusivamente las guardias aprobadas.</p>';
 const indicadores='<div class="lgn-control-totales">'+
  (admin||t3?[[terminadas.length,"Noches terminadas"],[resumen.cerradas,"Cierres OBAC recibidos"],
    [resumen.pendiente,"Pendientes de aprobar"],[resumen.acreditadas,"Aprobadas"],
    [resumen.falta,"Sin cierre OBAC"]]:[[resumen.acreditadas,"Guardias aprobadas"]])
  .map(([valor,titulo])=>'<div class="lgn-control-cifra"><b>'+valor+'</b><span>'+titulo+'</span></div>').join("")+'</div>';
 if(home){
  if(admin){
   home.innerHTML='<section class="card" aria-label="Control Guardia Diaria">'+encabezado+
    indicadores+'<button class="btn secondary" type="button" id="lgnAdminAbrir">Abrir Control Guardia Diaria</button></section>';
   const abrir=$("lgnAdminAbrir");if(abrir)abrir.onclick=abrirControlAdmin;
  }else home.innerHTML="";
 }
 if(!panel)return;
 panel.hidden=false;
 const abiertos=new Set([...panel.querySelectorAll(".lgn-control-dia[open]")].map(el=>el.dataset.fecha));
 const maxAnio=new Date().getFullYear(),anios=[];
 for(let y=maxAnio;y>=2026;y--)anios.push('<option value="'+y+'"'+(String(y)===anioElegido?" selected":"")+'>'+y+'</option>');
 let html=encabezado+
  '<div class="field" style="max-width:230px;margin:10px 0"><label for="lgnAnioControl">Año de las guardias</label>'+
  '<select id="lgnAnioControl">'+anios.join("")+'</select></div>'+
  '<div class="field" style="max-width:340px;margin:10px 0"><label for="lgnSemanaControl">Buscar semana de guardia</label><select id="lgnSemanaControl"><option value="">Últimas 48 h</option>'+
  semanasLista.map(s=>'<option value="'+escHtml(s)+'"'+(semanaDe(semanaBuscada)===s?" selected":"")+'>'+escHtml(etiquetaSemana(s))+'</option>').join("")+'</select></div>'+indicadores+
  '<p class="lgn-control-nota">La dotación programada corresponde a la ODD original. La asistencia real aprobada aparece por separado, incluyendo los asistentes adicionales. Pueden corregir el acta el Capitán y los tenientes, con motivo y quedando el historial.</p>';
 if(!terminadas.length)html+='<p class="sub">'+(semanaBuscada?"No hay guardias en esa semana.":"No hay guardias recientes. Busca otra semana en el selector.")+'</p>';
 let grupoAnterior="";
 for(const x of terminadas){
  const semana=semanaDe(x.fecha);
  if(semana!==grupoAnterior){
   grupoAnterior=semana;
   html+='<h3 class="lgn-control-semana">Semana del '+escHtml(fechaBonita(semana))+'</h3>';
  }
  const estado=clasificarControl(x),foto=!!x.cierre?.fotoClave;
  html+='<details class="lgn-control-dia" data-fecha="'+escHtml(x.fecha)+'"'+(abiertos.has(x.fecha)?' open':'')+'><summary>'+
   '<strong>'+escHtml(etiquetaGuardia(x.fecha))+'</strong>'+
   '<span class="lgn-control-estado '+estado.clase+'">'+escHtml(estado.texto)+'</span>'+
   '</summary><div class="lgn-dia-detalle">';
  html+='<p><strong>Fecha de la guardia:</strong> '+escHtml(fechaBonita(x.fecha))+
   ' · 22:45 a 06:00 del día siguiente.</p>'+
   '<p><strong>OBAC:</strong> '+escHtml(nombre(x.dotacion?.obac))+'</p>'+
   '<p><strong>Maquinista:</strong> '+escHtml(nombre(x.dotacion?.maq))+'</p>'+
   '<p><strong>Voluntarios programados en la ODD original (no implica asistencia):</strong> '+
   ((x.dotacion?.vol||[]).length?x.dotacion.vol.map(id=>escHtml(nombre(id))).join(", "):"Sin asignar")+'</p>';
  if(x.cierre){
   const fechaEnvio=x.cierre.enviadoEn?new Date(x.cierre.enviadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}):"Sin fecha";
   html+='<p><strong>Cierre OBAC:</strong> '+escHtml(fechaEnvio)+
    ' · por '+escHtml(x.cierre.obacNombre||nombre(x.dotacion?.obac))+'</p>'+
    '<p><strong>Novedades:</strong> '+escHtml(x.cierre.novedades||"No registradas")+'</p>';
   if(foto)html+='<p><a class="btn secondary" href="'+fotoUrl(x.fecha)+
    '" target="_blank" rel="noopener">Ver foto del libro</a></p>';
  }else html+='<p class="sub">Falta el cierre con fotografía y novedades del OBAC.</p>'+htmlSubidaAdmin(x);
  if(x.acreditacionVigente&&x.acreditacion){
    const aprobadaEn=x.acreditacion.acreditadoEn?new Date(x.acreditacion.acreditadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}):"";
    html+='<p><strong>Aprobada por:</strong> '+escHtml(x.acreditacion.acreditadoPorNombre||"Oficial")+(x.acreditacion.acreditadoPorCargo?' ('+escHtml(x.acreditacion.acreditadoPorCargo)+')':'')+
     (aprobadaEn?' · '+escHtml(aprobadaEn):"")+'</p>';
    html+=htmlAsistenciaRatificada(x);
   }else if(x.cierre){
    html+='<p class="sub">Pendiente de aprobación por un oficial autorizado. La programación original no acredita presencia.</p>';
   }
   if(t3 || (capitan&&x.acreditacionVigente)){
    html+='<div class="lgn-externos" data-lgn-externos="'+escHtml(x.fecha)+'"><p><strong>Reemplazantes externos:</strong> registro documental independiente de asistencia y estadísticas.</p><div data-lgn-externos-lista>Consulta pendiente.</div><button type="button" class="btn small secondary" data-lgn-ver-externos>Consultar externos</button></div>';
   }
   if(t3&&x.cierre){
    html+='<button class="btn small secondary lgn-correccion-ir" type="button" data-lgn-corregir="'+escHtml(x.fecha)+'">'+
     (x.acreditacionVigente?"Corregir asistencia aprobada":"Revisar y aprobar esta guardia")+'</button>';
   }
   if(capitan&&x.acreditacionVigente){
    const version=Number(x.acreditacionVersion||0);
    html+='<p class="sub"><strong>Informe vigente</strong>'+(version>0?' · Versión '+version:'')+'</p>';
    if(x.vistoCapitan)html+='<p class="lgn-control-confirmacion" role="status"><strong>Visto bueno registrado · Capitán</strong></p>';
    else html+='<p class="sub">Pendiente de revisión del Capitán para esta versión.</p>'+
      '<button type="button" class="btn secondary small" data-lgn-visto="'+escHtml(x.fecha)+'">Dar visto bueno · Capitán</button>';
   }
  html+='<button type="button" class="btn secondary small" data-lgn-atras-ficha="'+escHtml(x.fecha)+'">Atrás · Lista de noches</button>';
  html+='</div></details>';
 }
 html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">'+
  '<button type="button" class="btn secondary small" id="lgnAdminActualizar">Actualizar control</button>'+
  '<button type="button" class="btn secondary small" id="lgnAdminInicio">Volver a mi espacio</button></div>';
 panel.innerHTML=html;
 const anio=$("lgnAnioControl");
 if(anio)anio.onchange=()=>{anioElegido=anio.value;semanaBuscada="";historial=null;cargarHistorial();};
 const selector=$("lgnSemanaControl");
 if(selector)selector.onchange=()=>{semanaBuscada=selector.value;pintarControlAdmin();};
 const ref=$("lgnAdminActualizar");
 if(ref)ref.onclick=async()=>{
  if(editando&&!confirm("Hay cambios de asistencia sin guardar. ¿Descartarlos y actualizar el control?"))return;
  const fechasAbiertas=[...panel.querySelectorAll(".lgn-control-dia[open]")].map(el=>el.dataset.fecha);
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();}
  historial=null;
  await cargarHistorial();
  await cargar(true);
  const nuevas=$("lgnAdminPanel");
  if(nuevas){
   for(const fecha of fechasAbiertas){
    const ficha=[...nuevas.querySelectorAll(".lgn-control-dia")].find(el=>el.dataset.fecha===fecha);
    if(ficha)ficha.open=true;
   }
  }
 };
 const inicio=$("lgnAdminInicio");
 if(inicio)inicio.onclick=()=>{
  if(editando&&!confirm("Hay cambios sin guardar. ¿Volver a tu espacio y descartarlos?"))return;
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();}
  if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("germania");
 };
 panel.querySelectorAll("[data-lgn-atras-ficha]").forEach(btn=>btn.onclick=()=>{
  if(editando&&!confirm("Hay cambios de asistencia sin guardar. ¿Volver a la lista y descartarlos?"))return;
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();return;}
  const ficha=btn.closest(".lgn-control-dia");
  if(ficha){ficha.open=false;ficha.scrollIntoView({behavior:"smooth",block:"start"});}
 });
 panel.querySelectorAll("[data-lgn-visto]").forEach(btn=>btn.onclick=()=>marcarVisto(btn.dataset.lgnVisto,btn));
 panel.querySelectorAll("[data-lgn-ver-externos]").forEach(btn=>btn.onclick=()=>consultarExternos(btn));
 panel.querySelectorAll("[data-lgn-corregir]").forEach(btn=>btn.onclick=()=>abrirPanelMando(btn.dataset.lgnCorregir));
}

function pintarResumenMando(){
 const host=$("lgnMandoHome");if(!host)return;
 if(!t3&&!capitan){host.innerHTML="";return;}
 const terminadas=items.filter(x=>x.finalizada);
 const actuales=terminadas.filter(x=>semanaDe(x.fecha)===semanaActual);
 if(capitan&&!t3){
  // Avisar todas las aprobaciones recientes sin visto, incluso de semanas anteriores.
  const ratificadas=terminadas.filter(x=>x.acreditacionVigente);
  if(!ratificadas.length){host.innerHTML="";return;}
  const nuevas=ratificadas.filter(x=>!x.vistoCapitan).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const visibles=nuevas.slice(0,5);
  if(!nuevas.length){
   host.innerHTML='<button class="btn secondary small" type="button" id="lgnMandoIr">'+
    'Guardias aprobadas · '+ratificadas.length+'</button>';
   $("lgnMandoIr").onclick=abrirControlAdmin;
   return;
  }
  host.innerHTML='<section class="card" aria-label="Informes de guardias aprobadas para el Capitán">'+
   '<h2>Informe de guardia · Capitán</h2>'+
   '<p class="sub">'+nuevas.length+' noche(s) aprobada(s) por los oficiales pendientes de Visto.</p>'+
   visibles.map(x=>'<div class="lgn-control-dia" style="padding:10px;margin:7px 0">'+
     '<strong>'+escHtml(etiquetaGuardia(x.fecha))+'</strong>'+
     '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+
     '<button type="button" class="btn small secondary" data-lgn-consultar="'+escHtml(x.fecha)+'">Ver informe y dar visto bueno</button></div></div>').join("")+
   (nuevas.length>visibles.length?'<p class="sub">Hay '+(nuevas.length-visibles.length)+' informe(s) pendiente(s) adicional(es). Revísalos en Control de Guardia Diaria.</p>':'')+
   '<button type="button" class="btn secondary small" id="lgnMandoIr">Ver todos los informes</button>'+
   '</section>';
  host.querySelectorAll("[data-lgn-consultar]").forEach(btn=>btn.onclick=()=>abrirControlAdmin(btn.dataset.lgnConsultar));
  const verTodos=$("lgnMandoIr");if(verTodos)verTodos.onclick=()=>abrirControlAdmin();
  host.querySelectorAll("[data-lgn-visto]").forEach(btn=>btn.onclick=()=>marcarVisto(btn.dataset.lgnVisto,btn));
  return;
 }
 const pendientes=terminadas.filter(x=>!x.acreditacionVigente);
 const porVisto=capitan?terminadas.filter(x=>x.acreditacionVigente&&!x.vistoCapitan):[];
 const textoVisto=porVisto.length?'<p class="sub"><strong>'+porVisto.length+' informe(s) de guardias aprobadas pendiente(s) de tu visto bueno.</strong> Ábrelos en «Ver guardias aprobadas».</p>':'';
 const semanaEnCurso=items.some(x=>semanaDe(x.fecha)===semanaActual);
 // Mantener un resumen de cierre cuando todas las noches ya fueron aprobadas.
 if(!semanaEnCurso&&!pendientes.length&&terminadas.length){
  host.innerHTML='<section class="card" aria-label="Guardias aprobadas">'+
   '<h2>Control de guardia · Oficiales</h2>'+
   '<p class="sub">No tienes noches pendientes de aprobación. Los informes quedan disponibles en Control Guardia Diaria para consulta y para el Capitán.</p>'+textoVisto+
   '<button type="button" class="btn small secondary" id="lgnMandoIr">Ver guardias aprobadas</button></section>';
  const ir=$("lgnMandoIr");if(ir)ir.onclick=()=>abrirPanelMando();
  return;
 }
 if(!semanaEnCurso&&!pendientes.length){host.innerHTML="";return;}
 const conCierre=pendientes.filter(x=>x.cierre).length;
 const sinCierre=pendientes.filter(x=>!x.cierre).length;
 const mensaje=pendientes.length?
  conCierre+' cierre(s) OBAC por aprobar. '+sinCierre+' noche(s) sin cierre del OBAC.':
  'Sin noches pendientes de aprobación. Revisa la semana en curso.';
 // Priorizar tareas ejecutables: primero cierres OBAC recibidos, después noches bloqueadas.
 const tareas=pendientes.slice().sort((a,b)=>Number(!!b.cierre)-Number(!!a.cierre)||a.fecha.localeCompare(b.fecha));
 const visibles=tareas.slice(0,7);
 host.innerHTML='<section class="card" aria-label="Aprobación de guardia nocturna">'+
   '<h2>Control de guardia · Oficiales</h2><p class="sub">'+escHtml(mensaje)+'</p>'+textoVisto+
   visibles.map(x=>'<div class="lgn-control-dia" style="padding:10px;margin:7px 0">'+
    '<strong>'+escHtml(etiquetaGuardia(x.fecha))+'</strong>'+
    '<p class="sub">'+(x.cierre?'Cierre OBAC recibido · pendiente de aprobación':'Falta cierre del OBAC · aprobación bloqueada')+'</p>'+
    '<button type="button" class="btn small secondary" data-lgn-t3-noche="'+escHtml(x.fecha)+'">'+
     (x.cierre?'Revisar y aprobar':'Ver guardia pendiente')+'</button></div>').join("")+
   (tareas.length>visibles.length?'<p class="sub">Hay '+(tareas.length-visibles.length)+' noche(s) pendiente(s) adicionales.</p>':'')+
   '<button type="button" class="btn secondary small" id="lgnMandoIr">Ver todas las guardias</button></section>';
 host.querySelectorAll("[data-lgn-t3-noche]").forEach(btn=>btn.onclick=()=>abrirPanelMando(btn.dataset.lgnT3Noche));
 const ir=$("lgnMandoIr");if(ir)ir.onclick=()=>abrirPanelMando();
}
async function marcarVisto(fecha,boton){
 if(!capitan||!actual||!boton||boton.disabled)return;
 if(!confirm("¿Confirmas que revisaste la asistencia, novedades, reemplazos y fotografía del libro de esta noche antes de dar tu visto bueno?"))return;
 boton.disabled=true;
 const rotulo=boton.textContent;
 boton.textContent="Guardando Visto…";
 try{
  const r=await fetch("/api/guardia/visto",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({fecha,actorId:actual})});
  const d=await r.json().catch(()=>({}));
  if(r.status===409){
   boton.disabled=false;boton.textContent=rotulo;
   alert("El informe cambió mientras lo revisabas. Actualiza Control Guardia Diaria y confirma la versión vigente antes de dar el visto bueno.");
   return;
  }
  if(!r.ok)throw Error(d.error||"No se pudo guardar el Visto.");
  const item=items.find(x=>x.fecha===fecha);
  if(item)item.vistoCapitan=true;
  if(historial){const anterior=historial.find(x=>x.fecha===fecha);if(anterior)anterior.vistoCapitan=true;}
  pintarResumenMando();pintarControlAdmin();
  const ficha=Array.from($("lgnAdminPanel")?.querySelectorAll(".lgn-control-dia")||[]).find(el=>el.dataset.fecha===fecha);
  if(ficha){ficha.open=true;ficha.scrollIntoView({behavior:"smooth",block:"start"});}
 }catch(e){
  boton.disabled=false;boton.textContent=rotulo;
  alert("No se confirmó el visto bueno: "+(e.message||"Error de conexión")+". Antes de reintentar, actualiza el informe para comprobar si ya quedó registrado.");
 }
}

function abrirPanelMando(fecha){
 if(editando&&!confirm("Tienes cambios de asistencia sin guardar. ¿Descartarlos para abrir otra guardia?"))return;
 if(editando){editando=false;pintarOficial();pintarControlAdmin();}
 if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("acreditacion-guardia");
 const elegida=typeof fecha==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(fecha)?fecha:"";
 setTimeout(async()=>{
  const actorAlAbrir=actual;
  await cargar(true);
  // Evitar abrir un expediente en la sesión de otro voluntario tras una recarga.
  if(!actorAlAbrir||actual!==actorAlAbrir||!t3&&!capitan)return;
  // Para corregir guardias antiguas, no depender de las 8 semanas recientes del Inicio.
  if(t3&&elegida&&!items.some(x=>x.fecha===elegida)){
   try{
    const r=await fetch("/api/guardia/libro?historial=1&anio="+elegida.slice(0,4)+"&actorId="+encodeURIComponent(actual),{cache:"no-store"});
    if(r.ok){
     const d=await r.json(),buscada=d.items?.find(x=>x.fecha===elegida);
     if(buscada){items=[buscada,...items].sort((a,b)=>b.fecha.localeCompare(a.fecha));pintarOficial();}
    }
   }catch(e){console.warn("guardia histórica no disponible",e);}
  }
  const area=$("lgnRatif"),dia=elegida?area?.querySelector('[data-lgn-dia="'+elegida+'"]'):null;
  if(dia){dia.open=true;dia.scrollIntoView({behavior:"smooth",block:"start"});}
  else area?.scrollIntoView({behavior:"smooth",block:"start"});
 },100);
}
function pintarOficial(){
 const area=$("lgnRatif"),btn=$("btnOficialesAcreditar");if(!area)return;
 const mando=t3||capitan;area.hidden=!mando;
 if(btn){btn.hidden=!mando;btn.textContent=t3?"Control Guardia Diaria · Aprobar":"Control Guardia Diaria · Informes";}
 if(!mando){area.innerHTML="";return;}
 const terminadas=items.filter(x=>x.finalizada);
 const pendientes=terminadas.filter(x=>!x.acreditacionVigente);
 const actualizados=(t3?terminadas:terminadas.filter(x=>x.acreditacionVigente)).slice(0,35);
 const diasDisponibles=actualizados.map(x=>x.fecha);
 pintarResumenMando();
 let h='<h2>'+(t3?"Aprobación de guardia nocturna":"Informes de guardias aprobadas")+'</h2>'+
 '<p class="sub">'+(t3?"Aprueba cada noche solamente después del cierre del libro por el OBAC.":"Solo consulta: aquí aparecen las guardias después de la aprobación de un oficial autorizado. No puedes modificar sus registros.")+'</p>'+
 '<p class="sub">'+(t3?pendientes.length+" noche(s) pendiente(s) de aprobación. El cierre OBAC no suma asistencia por sí solo.":"Informes recibidos: "+actualizados.length+". La información es de solo lectura.")+'</p>'+
 '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
 (t3&&diasDisponibles.length>1?'<label class="sub" for="lgnIrNoche">Ir a noche: <select id="lgnIrNoche" class="rv-sel"><option value="">Seleccionar…</option>'+diasDisponibles.map(f=>'<option value="'+escHtml(f)+'">'+escHtml(fechaBonita(f))+'</option>').join("")+'</select></label>':"")+
 '<button type="button" class="btn small secondary" id="lgnRefrescar">Actualizar cierres</button>'+
 '<button type="button" class="btn small secondary" id="lgnVolverInicio">Volver a mi espacio</button></div>'+
 (ultimaRatificacion?'<p class="lgn-control-estado ok" role="status">Guardia del '+escHtml(fechaBonita(ultimaRatificacion))+' aprobada correctamente.</p>':"");
 for(const [i,x] of actualizados.entries()){
  const fin=x.finalizada,rec=x.cierre,ac=x.acreditacionVigente;
  const titulo=etiquetaGuardia(x.fecha);
  h+='<details class="gr-det" data-lgn-dia="'+escHtml(x.fecha)+'" '+(i===0?"open":"")+' style="margin:12px 0;padding:12px;border:1px solid #555;border-radius:8px">'+
    '<summary style="cursor:pointer;font-weight:700">'+escHtml(titulo)+
    ' · '+(ac?"Aprobada":rec?"Cierre recibido / pendiente de aprobación":"Falta cierre OBAC")+'</summary>'+
    '<p><strong>Fecha de la guardia:</strong> '+escHtml(fechaBonita(x.fecha))+' · 22:45 a 06:00 del día siguiente.</p>'+ 
    '<p><strong>OBAC:</strong> '+escHtml(nombre(x.dotacion?.obac))+'</p>';
  if(rec){
   h+='<p><strong>Cierre enviado por OBAC:</strong> '+escHtml(new Date(rec.enviadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}))+'</p>'+
      '<p><strong>Novedades:</strong> '+escHtml(rec.novedades)+'</p>'+
      '<a href="'+fotoUrl(x.fecha)+'" target="_blank" rel="noopener" class="btn secondary" style="display:inline-block;margin-bottom:8px">Ver fotografía del libro</a>';
  }else h+='<p class="sub">El OBAC todavía no ha enviado fotografía y novedades. No se puede aprobar.</p>'+htmlSubidaAdmin(x);
  if(ac && x.acreditacion){
    h+='<p><strong>Aprobado por:</strong> '+escHtml(x.acreditacion.acreditadoPorNombre||"Oficial")+(x.acreditacion.acreditadoPorCargo?' ('+escHtml(x.acreditacion.acreditadoPorCargo)+')':'')+
      ' · '+escHtml(new Date(x.acreditacion.acreditadoEn).toLocaleString("es-CL",{timeZone:"America/Santiago"}))+'</p>';
  }
  if(ac){h+=htmlAsistenciaRatificada(x);} // Los oficiales leen una única acta efectiva.
  if(t3 && rec){
    if(ac)h+='<details class="lgn-corregir-det" style="margin:10px 0"><summary><strong>Corregir esta aprobación</strong> (solo si hay un error; ya está aprobada)</summary><p class="sub">Esta guardia ya fue aprobada. Cambiar algo aquí reemplaza la aprobación vigente y queda en el historial con tu motivo.</p>';
    h+='<div class="gr-lista" data-lgn-lista="'+escHtml(x.fecha)+'"><p class="sub">Compara todos los nombres con la foto del libro. Si asistió alguien no programado, usa «+ Agregar rezagado». La ODD original no cambia.</p>';
    const propio=participantes(x.dotacion).find(p=>String(p.id)===String(actual));
    if(propio)h+='<p class="sub lgn-aviso-propio" role="note"><strong>Participaste en esta guardia como '+escHtml(propio.rol)+'.</strong> Puedes aprobarla; quedará registrado en el informe que el oficial que aprobó participó en esta guardia.</p>';
    for(const p of participantes(x.dotacion)){
      const id=String(p.id),motivo=x.acreditacion?.excusas?.[id]||"";
      const estado=motivo?"excusado":ac?x.acreditacion.asistencias?.[id]||"":"";
      h+='<div class="lgn-fila-edicion"><label class="rv-lbl">'+escHtml(nombre(id))+' · '+escHtml(p.rol)+'</label>'+
      '<select class="rv-sel" data-lgn-id="'+escHtml(id)+'">'+
      '<option value="">— verificar —</option>'+
      '<option value="presente"'+(estado==="presente"?" selected":"")+'>Asistió</option>'+
      '<option value="ausente"'+(estado==="ausente"?" selected":"")+'>No asistió</option>'+
      '<option value="excusado"'+(estado==="excusado"?" selected":"")+'>Excusado</option></select>'+
      '<button type="button" class="btn small secondary lgn-boton-excusa" data-lgn-excusar>Excusar</button>'+
      '<input data-lgn-excusa="'+escHtml(id)+'" type="text" maxlength="400" class="lgn-excusa-input" placeholder="Motivo obligatorio de la excusa" value="'+escHtml(motivo)+'"'+(estado==="excusado"?"":" hidden")+'></div>';
    }
    const ocupados=new Set(participantesEfectivos(x).map(p=>String(p.id)));
    h+='<div class="lgn-rezagados"><h3>Asistentes adicionales</h3>'+
      '<p class="sub">Agregar solo si figura en la foto del libro. No modifica la dotación programada.</p>'+
      '<div class="lgn-rezagados-lista">'+(x.acreditacion?.adicionales||[]).map(p=>htmlRez(p.id,p.motivo)).join("")+'</div>'+
      '<select class="rv-sel lgn-rezagado-seleccion" aria-label="Seleccionar asistente rezagado">'+seleccionarRez(ocupados)+'</select>'+
      '<button type="button" class="btn secondary small" data-lgn-agregar>+ Agregar rezagado</button></div>'+
      (puedeExternos?'<div class="lgn-externos" data-lgn-externos="'+escHtml(x.fecha)+'"><h3>Reemplazantes externos</h3><p class="sub">Registro documental para T3. No acredita asistencia ni incorpora a la nómina.</p><div data-lgn-externos-lista>Selecciona «Consultar externos» para cargar registros.</div><button type="button" class="btn secondary small" data-lgn-ver-externos>Consultar externos</button> <button type="button" class="btn secondary small" data-lgn-nuevo-externo>+ Registrar externo</button></div>':'')+ 
      htmlRolesEfectivos(x)+
      '<label class="lgn-comprobacion"><input type="checkbox" data-lgn-comprobado> <span>Revisé la foto del libro y comprobé que todas las personas que asistieron figuran en esta lista, incluidos los no programados.</span></label>';
    h+='</div><button type="button" class="btn" data-lgn-ratificar="'+escHtml(x.fecha)+'">'+(ac?"Guardar corrección de la aprobación":"Aprobar guardia")+'</button>'+(ac?'</details>':'');
  }
  h+='<p class="status-msg" data-lgn-estado="'+escHtml(x.fecha)+'" role="status"></p></details>';
 }
 area.innerHTML=h+(actualizados.length?"":'<p class="sub">'+(t3?"Todavía no hay noches terminadas.":"No hay guardias aprobadas.")+'</p>');
 const irNoche=$("lgnIrNoche");
 if(irNoche)irNoche.onchange=()=>{
  const fecha=irNoche.value;if(!fecha)return;
  if(editando&&!confirm("Hay cambios sin guardar. ¿Descartarlos y abrir otra noche?")){irNoche.value="";return;}
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();}
  const panelActual=$("lgnRatif");
  const dia=panelActual?.querySelector('[data-lgn-dia="'+fecha+'"]');
  if(dia){
   panelActual.querySelectorAll("[data-lgn-dia]").forEach(otra=>{otra.open=otra===dia;});
   dia.scrollIntoView({behavior:"smooth",block:"start"});
  }
 };
 $("lgnRefrescar").onclick=()=>{
  if(editando&&!confirm("Hay cambios de asistencia sin guardar. ¿Descartarlos y actualizar?"))return;
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();}
  cargar(true);
 };
 $("lgnVolverInicio").onclick=()=>{
  if(editando&&!confirm("Hay cambios de asistencia sin guardar. ¿Salir y descartarlos?"))return;
  const descartado=editando;
  editando=false;
  if(descartado){pintarOficial();pintarControlAdmin();}
  if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("germania");
 };
 area.querySelectorAll("[data-lgn-id]").forEach(sel=>{
   estadoSeleccionAsistencia(sel);
   sel.addEventListener("change",()=>{
     editando=true;estadoSeleccionAsistencia(sel);
     const input=sel.parentElement.querySelector("[data-lgn-excusa]");
     if(input)input.hidden=sel.value!=="excusado";
   });
 });
 area.querySelectorAll("[data-lgn-excusar]").forEach(btn=>btn.onclick=()=>{
   const sel=btn.parentElement.querySelector("[data-lgn-id]");
   if(sel){sel.value="excusado";sel.dispatchEvent(new Event("change"));}
 });
 area.querySelectorAll("[data-lgn-excusa]").forEach(el=>el.addEventListener("input",()=>{editando=true;}));
 // La confirmación de lectura no modifica por sí sola la dotación.
 area.querySelectorAll("[data-lgn-comprobado]").forEach(el=>el.addEventListener("change",()=>{}));
 area.querySelectorAll("[data-lgn-agregar]").forEach(btn=>btn.onclick=()=>agregarRez(btn));
 area.querySelectorAll("[data-lgn-ver-externos]").forEach(btn=>btn.onclick=()=>consultarExternos(btn));
 area.querySelectorAll("[data-lgn-nuevo-externo]").forEach(btn=>btn.onclick=()=>registrarExterno(btn));
 area.querySelectorAll("[data-lgn-quitar]").forEach(btn=>btn.onclick=()=>quitarRez(btn));
 area.querySelectorAll("[data-lgn-ratificar]").forEach(b=>b.onclick=()=>ratificar(b.dataset.lgnRatificar,b));
}

async function consultarExternos(btn){
 const zona=btn.closest("[data-lgn-externos]"),fecha=zona?.dataset.lgnExternos;
 const lista=zona?.querySelector("[data-lgn-externos-lista]");if(!fecha||!lista||!(t3||capitan))return;
 lista.textContent="Consultando registros…";
 try{
  const r=await fetch("/api/guardia/externos?fecha="+encodeURIComponent(fecha)+"&actorId="+encodeURIComponent(actual),{cache:"no-store"});
  const d=await r.json();if(!r.ok)throw Error(d.error||"No disponible");
  zona.dataset.lgnVersion=String(d.version);
  lista.innerHTML=(d.items||[]).length?(d.items||[]).map(p=>'<div class="lgn-asistencia-fila"><strong>'+escHtml(p.nombre)+'</strong> · '+escHtml(p.funcion)+' · '+escHtml(p.procedencia)+'<p class="sub">Autoriza: '+escHtml(p.autorizadoPor)+' · Libro: '+escHtml(p.referenciaLibro)+' · No acreditado</p></div>').join(""):'<p class="sub">No hay externos documentados.</p>';
 }catch(e){lista.textContent="No se pudo consultar: "+e.message;}
}
async function registrarExterno(btn){
 const zona=btn.closest("[data-lgn-externos]"),fecha=zona?.dataset.lgnExternos;
 if(!fecha||!t3)return;
 if(!navigator.onLine){alert("Sin conexión: no se puede confirmar el registro externo.");return;}
 await consultarExternos(zona.querySelector("[data-lgn-ver-externos]"));
 if(!zona.dataset.lgnVersion)return;
 const ask=(etiqueta)=>{const v=prompt(etiqueta,"");return v===null?null:v.trim();};
 const nombre=ask("Nombre completo del reemplazante externo");if(!nombre)return;
 const procedencia=ask("Compañía de origen o Cuartel Central");if(!procedencia)return;
 const funcion=ask("Función: maquinista, obac o voluntario");if(!["maquinista","obac","voluntario"].includes(funcion))return alert("Función no válida.");
 const motivo=ask("Motivo del reemplazo");if(!motivo)return;
 const autorizadoPor=ask("Nombre/cargo de quien autorizó");if(!autorizadoPor)return;
 const habilitacionVerificadaPor=ask("Nombre/cargo de quien verificó la habilitación");if(!habilitacionVerificadaPor)return;
 const referenciaLibro=ask("Referencia al libro físico de guardia");if(!referenciaLibro)return;
 const horaIngreso=ask("Hora real de ingreso (HH:MM)");if(!horaIngreso)return;
 const pernocta=confirm("¿Es persona ajena a la guardia que pernoctará? Aceptar: sí; Cancelar: no.");
 let referenciaAutorizacionEscrita="",autorizacionPernoctacionEscrita=false;
 if(pernocta){referenciaAutorizacionEscrita=ask("Referencia a la autorización ESCRITA de Comandancia");if(!referenciaAutorizacionEscrita)return;autorizacionPernoctacionEscrita=confirm("¿Comprobaste la autorización escrita?");if(!autorizacionPernoctacionEscrita)return;}
 if(!confirm("¿Confirmas que verificaste personalmente la habilitación y autorización de "+nombre+"?"))return;
 const externo={nombre,procedencia,funcion,motivo,autorizadoPor,habilitacionVerificadaPor,referenciaLibro,horaIngreso,pernocta,referenciaAutorizacionEscrita,autorizacionPernoctacionEscrita,habilitacionConfirmada:true,autorizacionConfirmada:true};
 if(!confirm("Registrar en expediente "+fecha+" como DOCUMENTADO, NO ACREDITADO. ¿Continuar?"))return;
 btn.disabled=true;
 try{
  const r=await fetch("/api/guardia/externos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fecha,actorId:actual,ifVersion:Number(zona.dataset.lgnVersion),externo})});
  const d=await r.json();if(!r.ok)throw Error(d.error||"No se guardó");
  await consultarExternos(zona.querySelector("[data-lgn-ver-externos]"));
  alert("Externo documentado. No se ha acreditado asistencia.");
 }catch(e){alert("No se guardó: "+e.message)}finally{btn.disabled=false;}
}

function refrescarRez(zona){
 const ocupados=new Set([
  ...[...zona.querySelectorAll("[data-lgn-id]")].map(e=>e.dataset.lgnId),
  ...[...zona.querySelectorAll("[data-lgn-rezagado]")].map(e=>e.dataset.lgnRezagado)
 ]);
 const s=zona.querySelector(".lgn-rezagado-seleccion");if(s)s.innerHTML=seleccionarRez(ocupados);
}
function quitarRez(boton){
 const zona=boton.closest("[data-lgn-lista]"),fila=boton.closest("[data-lgn-rezagado]");
 if(!zona||!fila)return;
 if(!confirm("¿Quitar del acta a "+nombre(fila.dataset.lgnRezagado)+"?"))return;
 fila.remove();editando=true;refrescarRez(zona);
}
function agregarRez(boton){
 const zona=boton.closest("[data-lgn-lista]"),sel=zona?.querySelector(".lgn-rezagado-seleccion");
 if(!sel?.value)return;
 const id=sel.value;
 if(zona.querySelector('[data-lgn-id="'+id+'"]')||zona.querySelector('[data-lgn-rezagado="'+id+'"]')){
  alert("Esta persona ya figura en la guardia.");return;
 }
 const fecha=zona.dataset.lgnLista;
 if(!confirm("¿Confirmas que "+nombre(id)+" está en la fotografía del libro del "+fecha+" y realmente asistió?"))return;
 const motivo="Presencia corroborada en la fotografía del libro físico";
 zona.querySelector(".lgn-rezagados-lista").insertAdjacentHTML("beforeend",htmlRez(id,motivo));
 zona.querySelectorAll("[data-lgn-quitar]").forEach(b=>b.onclick=()=>quitarRez(b));
 editando=true;refrescarRez(zona);
}
/* Fallas de conexión: el servidor trata un envío repetido con el mismo contenido como el mismo acto, así que reintentar es seguro. */
async function fetchReintento(url,opts,intentos=3){
 let ultimo;
 for(let i=0;i<intentos;i++){
  try{return await fetch(url,opts);}catch(e){ultimo=e;await new Promise(r=>setTimeout(r,1200*(i+1)));}
 }
 throw ultimo;
}
function diferenciasCorreccion(x,asistencias,excusas,adicionales){
 const ac=x.acreditacion||{},antes=ac.asistencias||{},ex=ac.excusas||{},out=[];
 const eti=(a,e)=>e?"Excusado":a==="presente"?"Asistió":a==="ausente"?"No asistió":"—";
 const ids=new Set([...Object.keys(antes),...Object.keys(asistencias)]);
 for(const id of ids){
  const a=eti(antes[id],ex[id]),b=eti(asistencias[id],excusas[id]);
  if(a!==b||(ex[id]||"")!==(excusas[id]||""))out.push("• "+nombre(id)+": "+a+" → "+b);
 }
 const ad0=new Set((ac.adicionales||[]).map(p=>String(p.id))),ad1=new Set(adicionales.map(p=>String(p.id)));
 for(const id of ad1)if(!ad0.has(id)&&!(id in antes))out.push("• "+nombre(id)+": se agrega como asistente adicional");
 return out;
}
async function ratificar(fecha,boton){
 if(!t3)return;
 const x=items.find(e=>e.fecha===fecha),zona=$("lgnRatif")?.querySelector('[data-lgn-lista="'+fecha+'"]');
 const msg=$("lgnRatif")?.querySelector('[data-lgn-estado="'+fecha+'"]');
 if(!x||!x.cierre||!zona||!msg)return;
 const asistencias={},excusas={},adicionales=[];
 let ok=true;
 zona.querySelectorAll("[data-lgn-id]").forEach(sel=>{
  if(!sel.value){ok=false;return;}
  const id=sel.dataset.lgnId;
  asistencias[id]=sel.value==="excusado"?"ausente":sel.value;
  if(sel.value==="excusado"){
   const razon=sel.parentElement.querySelector("[data-lgn-excusa]")?.value.trim()||"";
   if(razon.length<3)ok=false;else excusas[id]=razon;
  }
 });
 zona.querySelectorAll("[data-lgn-rezagado]").forEach(fila=>{
   const id=fila.dataset.lgnRezagado;
   if(asistencias[id]){ok=false;return;}
   asistencias[id]="presente";
   adicionales.push({id,motivo:fila.querySelector("[data-lgn-motivo-rez]")?.value||""});
 });
 if(!ok){msg.textContent="Verifica cada estado y escribe los motivos de las excusas.";return;}
 if(!zona.querySelector("[data-lgn-comprobado]")?.checked){
  msg.textContent="Confirma que revisaste la fotografía del libro y agregaste a todos los asistentes, aunque no estuvieran programados.";
  return;
 }
 let motivo="";
 if(x.acreditacion){
  const cambios=diferenciasCorreccion(x,asistencias,excusas,adicionales);
  if(!cambios.length){msg.textContent="No hay cambios respecto de la aprobación vigente: no se guardó nada.";return;}
  if(!confirm("Esta guardia YA ESTÁ APROBADA. Vas a reemplazar la aprobación con estos cambios:\n\n"+cambios.join("\n")+"\n\n¿Continuar?"))return;
  motivo=prompt("Motivo de la corrección (obligatorio). Explica por qué cambia la aprobación:","")||"";
  if(motivo.trim().length<5){msg.textContent="La corrección necesita un motivo claro (mínimo 5 letras). No se guardó nada.";return;}
 }
 const selO=zona.querySelector("[data-lgn-obac-ef]"),selC=zona.querySelector("[data-lgn-cond-ef]"),prec=zona.querySelector("[data-lgn-precedencia]");
 const obacEf=selO?.value||"",condEf=selC?.value||"";
 if(selO&&selC){
  for(const [id,rol,sl] of [[obacEf,"OBAC",selO],[condEf,"conductor",selC]]){
   if(id&&String(id)!==String(sl.dataset.prog)&&asistencias[id]!=="presente"){
    msg.textContent="El "+rol+" efectivo ("+nombre(id)+") debe figurar presente. Agrégalo como rezagado si no estaba programado.";return;}
  }
  if(obacEf&&obacEf===condEf){msg.textContent="Una misma persona no puede ser OBAC y conductor.";return;}
 }
 const payload={fecha,actorId:actual,asistencias,excusas,adicionales,ifVersion:x.acreditacionVersion,motivoCorreccion:motivo};
 if(selO&&obacEf&&obacEf!==selO.dataset.prog)payload.obacEfectivoId=obacEf;
 if(selC&&condEf&&condEf!==selC.dataset.prog)payload.conductorEfectivoId=condEf;
 if(prec&&prec.value.trim())payload.motivoPrecedencia=prec.value.trim();
 const total=Object.values(asistencias).filter(v=>v==="presente").length;
 const advertencia=(x.acreditacion?"¿Guardar corrección de la guardia ":"¿Aprobar la guardia ")+fecha+
  "?\nPresentes: "+total+" · Nuevos asistentes: "+adicionales.length+" · Excusados: "+Object.keys(excusas).length+
  "\nEstos datos actualizan las estadísticas y el informe del Capitán. La ODD original permanece intacta.";
 if(!confirm(advertencia))return;
 boton.disabled=true;msg.textContent="Guardando aprobación…";
 try{
  const r=await fetchReintento("/api/guardia/acreditacion",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)});
  const d=await r.json().catch(()=>({}));
  if(r.status===409&&d.error==="version_conflict"){
   boton.disabled=false;
   msg.textContent="Otro oficial modificó esta aprobación mientras la revisabas. Actualiza el expediente antes de guardar otra corrección.";
   return;
  }
  if(!r.ok){boton.disabled=false;msg.textContent=ERRORES_RATIF[d.error]||("No se pudo aprobar: "+(d.error||r.status));return;}
  // La confirmación HTTP es el punto de guardado: no confundir un fallo de recarga con fallo de aprobación.
  ultimaRatificacion=fecha;
  historial=null;
  editando=false;
  msg.textContent=(d.repetida?"Esta noche ya estaba aprobada con los mismos datos (no se duplicó). ":"Aprobación guardada. El Capitán fue informado automáticamente. ")+"Actualizando expediente…";
  try{
   const sincronizado=await cargar(true);
   if(!sincronizado){
    const aviso=$("lgnRatif")?.querySelector('[data-lgn-estado="'+fecha+'"]');
    if(aviso)aviso.textContent="Aprobación guardada. No se pudo sincronizar la pantalla; usa Actualizar cierres.";
    return;
   }
   // Después de aprobar, llevar al oficial a la próxima noche con cierre pendiente.
   const siguiente=items.filter(x=>x.finalizada&&x.cierre&&!x.acreditacionVigente)
     .sort((a,b)=>a.fecha.localeCompare(b.fecha))[0];
   const destino=siguiente?.fecha||fecha;
   const dia=Array.from($("lgnRatif")?.querySelectorAll("[data-lgn-dia]")||[]).find(el=>el.dataset.lgnDia===destino);
   if(dia){
    $("lgnRatif").querySelectorAll("[data-lgn-dia]").forEach(otra=>{otra.open=otra===dia;});
    dia.scrollIntoView({behavior:"smooth",block:"start"});
   }
  }catch(error){
   msg.textContent="Aprobación guardada, pero no se pudo actualizar la pantalla. Usa Actualizar cierres.";
  }
 }catch(e){boton.disabled=false;msg.textContent="Sin conexión: no se confirmó el guardado. Puedes volver a presionar el botón cuando haya señal; si la aprobación ya se había guardado, no se duplicará.";}
}
window.GermaniaLibro={abrirNoche:(f)=>abrirPanelMando(f),refrescar:()=>cargar(true)};
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
 if(id!==actual){formAbierto=false;fotoSeleccionada=null;ultimaRatificacion="";ultimaCarga=0;cargar(true);}
}
init();
setInterval(()=>{init();const fechaReciente=new Date(Date.now()-3*86400000).toISOString().slice(0,10);const soyObacReciente=items.some(x=>String(x.dotacion?.obac)===actual&&x.fecha>=fechaReciente);if(document.visibilityState==="visible"&&!formAbierto&&!editando&&elegido()&&(esMando(elegido())||admin||oficial||soyObacReciente))cargar(false);},5000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!editando&&!formAbierto)cargar(true);});
})();