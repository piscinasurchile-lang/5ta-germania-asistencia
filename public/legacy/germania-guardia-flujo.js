/* GERMANIA · Gestión de guardia nocturna en 7 etapas (Capitán y tenientes; el administrador solo consulta).
   Ficha única y plegable en Inicio: creación semanal → inscripción → revisión de dotación y ODD → libro diario y foto →
   incidencias → ratificación → cierre semanal, estadísticas y PDF.
   No cambia la ODD original ni los datos de otras pantallas. Todo lo que escribe pasa por las rutas /api/guardia/*. */
(function(){
"use strict";
var $=function(i){return document.getElementById(i);};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function ros(){return typeof ROSTER!=="undefined"&&Array.isArray(ROSTER)?ROSTER:[];}
function yo(){var s=$("miVoluntario"),id=s&&s.value?String(s.value):"";return ros().find(function(x){return String(x.id)===id;})||null;}
function norm(c){return String(c||"").normalize("NFD").replace(/[̀-ͯ]/g,"").trim().toLowerCase();}
function esT3(p){return !!p&&/^teniente\s*(tercero|3)/.test(norm(p.cargo));}
function autorizado(p){var c=norm(p&&p.cargo);return !!p&&(/^capitan(\s|$)/.test(c)||/^teniente\s*(primero|segundo|tercero|1|2|3)/.test(c));}
function esAdmin(p){return !!p&&String(p.clave||"")==="517";}
function nom(id){var p=ros().find(function(x){return String(x.id)===String(id);});return p?[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "):"Voluntario "+id;}
function hoyChile(){var p=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(function(x){return [x.type,x.value];}));return p.year+"-"+p.month+"-"+p.day;}
function miercolesDe(f){var d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);return d.toISOString().slice(0,10);}
function sumaDias(f,n){var d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function corta(f){return new Date(f+"T12:00:00Z").toLocaleDateString("es-CL",{timeZone:"UTC",weekday:"short",day:"numeric",month:"short"});}
function larga(f){return new Date(f+"T12:00:00Z").toLocaleDateString("es-CL",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});}
function hora(iso){try{return new Date(iso).toLocaleString("es-CL",{timeZone:"America/Santiago"});}catch(e){return iso||"";}}
var ESTADOS={
  en_curso_o_futura:["Aún no termina","gris"],sin_cierre_de_libro:["Falta cerrar el libro","rojo"],registro_cerrado:["Libro cerrado · falta ratificar","amarillo"],
  ratificada_pendiente_acreditacion:["Ratificada · falta acreditación oficial","naranja"],acreditada_oficial:["Cumplimiento acreditado · oficial","verde"]};
var MOTIVOS={obac_ausente:"OBAC ausente",conductor_ausente:"conductor ausente",voluntarios_insuficientes:"menos de 2 voluntarios",sin_fotografia:"sin fotografía"};
var TIPOS={no_llega:"Voluntario que no llega",obac_ausente:"OBAC ausente",conductor_ausente:"Conductor ausente",retiro_obac_conductor:"OBAC o conductor se retira",llega_tarde:"Voluntario que llega tarde",
  retiro_anticipado:"Voluntario se retira antes",reemplazo_durante:"Reemplazo durante la guardia",refuerzos:"Solicitud de refuerzos",dotacion_insuficiente:"Dotación bajo el mínimo",
  foto_faltante:"Fotografía faltante",falla_conexion:"Falla de conexión",correccion_posterior:"Corrección posterior al cierre",otra:"Otra novedad"};
var S={semana:null,data:null,avisos:[],cargando:false,tok:0,editando:false,noche:null,msg:{}};
function uid(){try{return crypto.randomUUID().replace(/-/g,"");}catch(e){return String(Date.now())+Math.random().toString(16).slice(2,10);}}
function semanasDisponibles(){var base=miercolesDe(hoyChile()),r=[];for(var i=0;i<5;i++)r.push(sumaDias(base,-7*i));return r;}

/* ------------------------------ datos ------------------------------ */
async function cargar(){
  var p=yo();if(!p||!(autorizado(p)||esAdmin(p))){S.data=null;return false;}
  var mi=++S.tok;
  var pedir=async function(w){var r=await fetch("/api/guardia/cierre-semanal?actorId="+encodeURIComponent(p.id)+"&semana="+encodeURIComponent(w),{cache:"no-store"});if(!r.ok)throw Error("http "+r.status);return r.json();};
  try{
    var d;
    if(!S.semana){
      /* Al abrir: si la semana anterior aún no está cerrada (o quedó desactualizada), es la que hay que terminar primero. */
      var actual=semanasDisponibles()[0],previa=semanasDisponibles()[1],dp=await pedir(previa);
      if(dp.aprobada&&(!dp.cierre||!dp.cierreVigente)){S.semana=previa;d=dp;}else{S.semana=actual;d=await pedir(actual);}
    }else d=await pedir(S.semana);
    if(mi!==S.tok)return false;S.data=d;
    var mes=hoyChile().slice(0,7),prev=sumaDias(mes+"-01",-1).slice(0,7),av=[];
    for(var m of [mes,prev]){try{var a=await fetch("/api/state?prefix="+encodeURIComponent("guardia-aviso-oficial:"+m),{cache:"no-store"});if(a.ok){var j=await a.json();(j.items||[]).forEach(function(it){av.push(Object.assign({key:it.key},it.value));});}}catch(e){}}
    av.sort(function(x,y){return String(y.en).localeCompare(String(x.en));});S.avisos=av.slice(0,12);
    return true;
  }catch(e){console.warn("flujo guardia",e);return false;}
}
async function enviar(url,cuerpo){
  var ultimo;
  for(var i=0;i<3;i++){
    try{var r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(cuerpo)});var d=await r.json().catch(function(){return {};});return {status:r.status,d:d};}
    catch(e){ultimo=e;await new Promise(function(ok){setTimeout(ok,1200*(i+1));});}
  }
  return {status:0,d:{error:"sin_conexion"},ultimo:ultimo};
}
var ERR={noches_pendientes:"Hay noches sin ratificar o sin acreditar por un oficial autorizado.",solo_teniente_3:"La acreditación requiere un oficial autorizado.",noche_no_ratificada:"La noche aún no está ratificada.",version_conflict:"Otro oficial modificó la noche. Actualiza y revisa de nuevo.",solo_oficiales_autorizados:"Solo el Capitán y los tenientes pueden hacerlo.",sin_conexion:"Sin conexión. Puedes reintentar: no se duplicará.",
  libro_ya_cerrado:"El libro de esa noche ya estaba cerrado.",noche_no_finalizada:"La noche aún no termina (06:00).",motivo_requerido:"Escribe un motivo (mínimo 8 letras).",novedades_requeridas:"Escribe las novedades.",
  detalle_requerido:"Escribe el detalle.",version_conflict:"Otro oficial modificó esto a la vez. Actualiza e inténtalo de nuevo."};
function err(d){return ERR[d&&d.error]||("No se pudo completar: "+(d&&d.error||"error"));}

/* ------------------------------ pantalla ------------------------------ */
function chip(n){var e=ESTADOS[n.estado]||[n.estado,"gris"];return '<span class="gf-chip gf-'+e[1]+'">'+esc(e[0])+'</span>';}
function resumenLinea(){
  var d=S.data;if(!d)return "Sin datos";if(!d.aprobada)return "Semana sin programación aprobada";
  var rat=d.noches.filter(function(n){return n.estado==="acreditada_oficial";}).length,rt=d.noches.filter(function(n){return !!n.ratificacion;}).length,ab=0;
  d.noches.forEach(function(n){ab+=n.incidencias.abiertas;});
  return rat+"/"+d.noches.length+" acreditadas por oficiales ("+rt+" ratificadas)"+(d.cierre?(d.cierreVigente?" · semana cerrada":" · cierre desactualizado"):"")+(ab?" · "+ab+" incidencia(s) abierta(s)":"");
}
function etapa(n,titulo,estado,cuerpo,abiertas){
  return '<details class="gf-et" data-et="'+n+'"'+(abiertas.indexOf(String(n))>=0?" open":"")+'><summary><b>'+n+'.</b> '+esc(titulo)+'<span class="gf-est">'+esc(estado)+'</span></summary><div class="gf-cuerpo">'+cuerpo+'</div></details>';
}
function render(){
  var p=yo(),ref=$("misNochesInicio"),host=$("flujoGuardia");
  if(!p||!(autorizado(p)||esAdmin(p))){if(host)host.remove();return;}
  if(!ref||!ref.parentNode)return;
  if(!host){host=document.createElement("section");host.id="flujoGuardia";host.className="card";host.style.cssText="grid-column:1 / -1;min-width:0";
    var dot=$("dotacionOficiales");(dot&&dot.parentNode?dot.nextSibling:ref)&&ref.parentNode.insertBefore(host,dot&&dot.parentNode?dot.nextSibling:ref);}
  var d=S.data,puede=autorizado(p);
  var abiertas=[].slice.call(host.querySelectorAll("details.gf-et[open]")).map(function(e){return e.dataset.et;});
  var raiz=host.querySelector("details.gf-raiz"),raizAbierta=raiz?raiz.open:false;
  var semSel='<label class="gf-lbl" for="gfSemana">Semana</label><select id="gfSemana" class="rv-sel">'+semanasDisponibles().map(function(w){return '<option value="'+w+'"'+(w===S.semana?" selected":"")+'>Semana del '+esc(new Date(w+"T12:00:00Z").toLocaleDateString("es-CL",{timeZone:"UTC",day:"numeric",month:"long"}))+'</option>';}).join("")+'</select>';
  var h='<details class="gf-raiz"'+(raizAbierta?" open":"")+'><summary style="cursor:pointer;font-weight:700;font-size:1.05em">Gestión de guardia nocturna<span class="gf-est">'+esc(resumenLinea())+'</span></summary>';
  h+='<div class="gf-barra">'+semSel+'<button type="button" class="btn small secondary" id="gfRefrescar">Actualizar</button></div>';
  if(!d){h+='<p class="sub">No se pudo cargar. Revisa tu conexión y presiona Actualizar.</p></details>';host.innerHTML=h;enlazar(host);return;}
  var avs=S.avisos.length?'<details class="gf-av"><summary>Avisos a oficiales ('+S.avisos.length+')</summary>'+S.avisos.map(function(a){return '<p class="sub"><b>'+esc(a.titulo)+'</b><br>'+esc(hora(a.en))+'</p>';}).join("")+'</details>':"";
  h+=avs;
  var noches=d.noches||[];
  /* 1-3: programación (se administra en su pantalla actual) */
  var e1=d.aprobada?"Aprobada":"Pendiente";
  h+=etapa(1,"Creación semanal",e1,'<p class="sub">Programación de las siete noches (miércoles a martes, 22:45 a 06:00). La administra el Teniente Tercero.</p><button type="button" class="btn small secondary" data-ir="guardia">Abrir programación</button>',abiertas);
  var ins=noches.map(function(n){var t=n.programada;return '<div class="gf-fila"><span>'+esc(corta(n.fecha))+'</span><span>'+t.total+' en dotación</span></div>';}).join("");
  h+=etapa(2,"Inscripción de voluntarios y conductores",noches.length?noches.length+" noches":"Sin datos",(ins||'<p class="sub">Aún no hay dotación aprobada.</p>')+'<button type="button" class="btn small secondary" data-ir="guardia">Ver inscripciones</button>',abiertas);
  h+=etapa(3,"Revisión de dotación y ODD",d.aprobada?"Dotación aprobada":"Sin aprobar",'<p class="sub">La ODD original no se modifica: la asistencia real se registra aparte, al ratificar. Mínimo: 4 (1 conductor, 1 OBAC y 2 voluntarios).</p><button type="button" class="btn small secondary" data-ir="guardia">Revisar dotación</button>',abiertas);
  /* 4: libro */
  var f4=noches.map(function(n){
    var l=n.libro,acc="";
    if(l.cerrado)acc=l.sinFoto?'<span class="sub">Cerrado sin foto · '+esc(l.motivoSinFoto||"")+'</span>':'<a class="gf-lnk" target="_blank" rel="noopener" href="/api/guardia/libro?foto=1&fecha='+n.fecha+'&actorId='+encodeURIComponent(p.id)+'">Ver foto del libro</a>';
    else if(n.finalizada&&puede)acc='<button type="button" class="btn small secondary" data-sinfoto="'+n.fecha+'">Cerrar sin foto</button>';
    else acc='<span class="sub">'+(n.finalizada?"Falta el OBAC":"Aún no termina")+'</span>';
    var form=S.noche==="sf:"+n.fecha?'<div class="gf-form" data-form-sf="'+n.fecha+'"><label class="gf-lbl">Motivo por el que no hay fotografía (obligatorio)</label><input type="text" maxlength="400" data-sf-motivo class="gf-in">'+
      '<label class="gf-lbl">Novedades de la noche (obligatorio)</label><textarea rows="2" maxlength="1800" data-sf-nov class="gf-in"></textarea><button type="button" class="btn small" data-sf-enviar="'+n.fecha+'">Cerrar el libro sin fotografía</button><button type="button" class="btn small secondary" data-sf-cancel>Cancelar</button></div>':"";
    return '<div class="gf-fila"><span>'+esc(corta(n.fecha))+' · '+(l.cerrado?"Libro cerrado":"Libro sin cerrar")+'</span><span>'+acc+'</span></div>'+form;
  }).join("");
  h+=etapa(4,"Registro diario y fotografía del libro",noches.filter(function(n){return n.libro.cerrado;}).length+"/"+noches.length+" cerrados",(f4||'<p class="sub">Sin noches.</p>')+'<p class="sub">El OBAC cierra su libro con foto desde su Inicio. Si no puede, un oficial lo cierra sin foto y queda registrado como incumplimiento.</p><p class="status-msg" data-msg="4" role="status">'+esc(S.msg["4"]||"")+'</p>',abiertas);
  /* 5: incidencias */
  var nSel=S.noche&&S.noche.indexOf("inc:")===0?S.noche.slice(4):(noches.length?noches[noches.length-1].fecha:"");
  var nObj=noches.find(function(n){return n.fecha===nSel;})||noches[0];
  var inc="";
  if(nObj){
    inc='<label class="gf-lbl" for="gfIncNoche">Noche</label><select id="gfIncNoche" class="rv-sel">'+noches.map(function(n){return '<option value="'+n.fecha+'"'+(n.fecha===nObj.fecha?" selected":"")+'>'+esc(corta(n.fecha))+' ('+n.incidencias.total+')</option>';}).join("")+'</select>';
    inc+=(nObj.incidencias.items||[]).map(function(x){
      return '<div class="gf-inc '+(x.estado==="resuelta"?"ok":"ab")+'"><b>'+esc(TIPOS[x.tipo]||x.tipo)+'</b>'+(x.personaId?' · '+esc(nom(x.personaId)):'')+(x.horaSuceso?' · '+esc(x.horaSuceso):'')+'<br><span class="sub">'+esc(x.detalle)+' — '+esc(x.registradaPorNombre||"")+'</span>'+
        (x.estado==="resuelta"?'<br><span class="sub">✔ Resuelta: '+esc(x.resolucion||"")+' ('+esc(x.resueltaPorNombre||"")+')</span>':(puede?'<div class="gf-res"><input type="text" class="gf-in" maxlength="600" placeholder="Cómo se resolvió" data-res-txt="'+esc(x.id)+'"><button type="button" class="btn small secondary" data-resolver="'+esc(x.id)+'" data-f="'+nObj.fecha+'">Resolver</button></div>':''))+'</div>';
    }).join("")||'<p class="sub">Sin incidencias en esta noche.</p>';
    if(puede)inc+='<details class="gf-nuevo"><summary>Registrar incidencia</summary><div class="gf-form"><label class="gf-lbl">Tipo</label><select class="rv-sel" data-inc-tipo>'+Object.keys(TIPOS).filter(function(k){return k!=="correccion_posterior"&&k!=="foto_faltante";}).map(function(k){return '<option value="'+k+'">'+esc(TIPOS[k])+'</option>';}).join("")+'</select>'+
      '<label class="gf-lbl">Persona (opcional)</label><select class="rv-sel" data-inc-persona><option value="">—</option>'+ros().filter(function(x){return x.activo!==false;}).sort(function(a,b){return nom(a.id).localeCompare(nom(b.id),"es");}).map(function(x){return '<option value="'+esc(x.id)+'">'+esc(nom(x.id))+'</option>';}).join("")+'</select>'+
      '<label class="gf-lbl">Hora (opcional)</label><input type="time" class="gf-in" data-inc-hora><label class="gf-lbl">Detalle</label><textarea rows="2" maxlength="600" class="gf-in" data-inc-detalle></textarea>'+
      '<button type="button" class="btn small" data-inc-guardar="'+nObj.fecha+'">Guardar incidencia</button></div></details>';
  }
  var abTot=noches.reduce(function(a,n){return a+n.incidencias.abiertas;},0);
  h+=etapa(5,"Incidencias",abTot?abTot+" abierta(s)":"Sin abiertas",inc+'<p class="status-msg" data-msg="5" role="status">'+esc(S.msg["5"]||"")+'</p>',abiertas);
  /* 6: ratificación */
  var f6=noches.map(function(n){
    var btn=puede&&n.libro.cerrado&&n.finalizada?'<button type="button" class="btn small secondary" data-ratif="'+n.fecha+'">'+(n.ratificacion?"Revisar o corregir":"Revisar y ratificar")+'</button>':"";
    var btnF=autorizado(yo())&&n.ratificacion&&n.estado==="ratificada_pendiente_acreditacion"?'<button type="button" class="btn small" data-final="'+n.fecha+'" data-v="'+(n.ratificacion.version||0)+'">Acreditar cumplimiento</button>':"";
    var r=n.ratificacion?'<br><span class="sub">Ratificó '+esc(n.ratificacion.porNombre||"")+(n.ratificacion.porCargo?' ('+esc(n.ratificacion.porCargo)+')':'')+' · '+esc(hora(n.ratificacion.en))+(n.ratificacion.cumplimiento&&n.ratificacion.cumplimiento.motivos.length?' · '+esc(n.ratificacion.cumplimiento.motivos.map(function(m){return MOTIVOS[m]||m;}).join(", ")):'')+'</span>':"";
    return '<div class="gf-fila gf-col"><span><b>'+esc(corta(n.fecha))+'</b> '+chip(n)+r+'</span>'+btn+btnF+'</div>';
  }).join("");
  var pend=noches.filter(function(n){return n.estado!=="acreditada_oficial";}).length;
  h+=etapa(6,"Ratificación y acreditación",pend?pend+" pendiente(s)":"Todas acreditadas",(f6||'<p class="sub">Sin noches.</p>')+'<p class="sub">Paso 1: ratifica cualquiera (Capitán, Teniente 1°, 2° o 3°). Paso 2: el T3 acredita prioritariamente; si queda pendiente, puede acreditar Capitán, T1 o T2; recién ahí la noche cuenta en estadísticas. Queda registrado quién, cuándo y qué cambió.</p>',abiertas);
  /* 7: cierre semanal, estadísticas y PDF */
  var tabla=noches.map(function(n){var r=n.ratificacion;return '<div class="gf-fila gf-col"><span><b>'+esc(corta(n.fecha))+'</b> '+chip(n)+'<br><span class="sub">Programados '+n.programada.total+(r?' · Presentes '+r.asistentes.length+' · Ausentes '+r.ausentes.length+' · Reemplazos/adicionales '+r.adicionales.length+' · OBAC '+esc(nom(r.obacEfectivoId))+' · Conductor '+esc(nom(r.conductorEfectivoId)):'')+(n.incidencias.total?' · Incidencias '+n.incidencias.total:'')+'</span></span>'+
    '<span class="gf-pdf"><button type="button" class="btn small secondary" data-pdf="d" data-f="'+n.fecha+'" data-a="descargar">PDF</button><button type="button" class="btn small secondary" data-pdf="d" data-f="'+n.fecha+'" data-a="imprimir">Imprimir</button><button type="button" class="btn small secondary" data-pdf="d" data-f="'+n.fecha+'" data-a="whatsapp">WhatsApp</button></span></div>';}).join("");
  var cierre=d.cierre?'<p class="sub"><b>'+(d.cierreVigente?"Semana cerrada":"Cierre desactualizado (hubo correcciones)")+'</b> por '+esc(d.cierre.cerradaPorNombre)+' ('+esc(d.cierre.cerradaPorCargo)+') · '+esc(hora(d.cierre.cerradaEn))+'</p>':'';
  var btnCierre=puede?'<button type="button" class="btn small" id="gfCerrarSemana"'+(d.puedeCerrar?"":" disabled")+'>'+(d.cierre?"Volver a cerrar la semana":"Cerrar la semana")+'</button>'+(d.pendientes.length?'<p class="sub">No se puede cerrar: faltan '+d.pendientes.length+' noche(s) por terminar, ratificar o acreditar (oficial).</p>':''):'';
  h+=etapa(7,"Cierre semanal, estadísticas y PDF",d.cierre?(d.cierreVigente?"Cerrada":"Reabrir"):(d.pendientes.length?"Faltan "+d.pendientes.length:"Lista para cerrar"),
    cierre+(tabla||'<p class="sub">Sin noches.</p>')+(puede?'<label class="gf-lbl" for="gfObs">Observaciones del cierre (opcional)</label><input id="gfObs" type="text" maxlength="600" class="gf-in">':'')+btnCierre+
    (noches.length?'<div class="gf-pdf" style="margin-top:8px"><button type="button" class="btn small secondary" data-pdf="s" data-a="descargar">PDF semana completa</button><button type="button" class="btn small secondary" data-pdf="s" data-a="imprimir">Imprimir</button><button type="button" class="btn small secondary" data-pdf="s" data-a="whatsapp">WhatsApp</button></div>':'')+
    '<p class="sub">Las estadísticas individuales se calculan solo con noches ratificadas y acreditadas por un oficial autorizado (vigentes), una vez por noche.</p><p class="status-msg" data-msg="7" role="status">'+esc(S.msg["7"]||"")+'</p>',abiertas);
  h+='</details>';
  host.innerHTML=h;enlazar(host);
}
function msg(n,t){S.msg[n]=t;var e=document.querySelector('#flujoGuardia [data-msg="'+n+'"]');if(e)e.textContent=t;}
async function recargar(){var ok=await cargar();render();return ok;}

/* ------------------------------ acciones ------------------------------ */
function enlazar(host){
  var q=function(s,f){[].slice.call(host.querySelectorAll(s)).forEach(f);};
  var sem=$("gfSemana");if(sem)sem.onchange=function(){S.semana=sem.value;recargar();};
  var rf=$("gfRefrescar");if(rf)rf.onclick=function(){recargar();};
  q("[data-ir]",function(b){b.onclick=function(){if(typeof window.__mostrarPestana==="function")window.__mostrarPestana(b.dataset.ir);};});
  q("[data-ratif]",function(b){b.onclick=function(){
    if(typeof window.__mostrarPestana==="function")window.__mostrarPestana("acreditacion-guardia");
    setTimeout(function(){if(window.GermaniaLibro)window.GermaniaLibro.abrirNoche(b.dataset.ratif);},400);};});
  q("[data-final]",function(b){b.onclick=async function(){
    if(!confirm("¿Confirmas que revisaste esta noche y acreditas su cumplimiento final? Desde ahora cuenta en las estadísticas."))return;
    b.disabled=true;msg("6","Guardando…");var r=await enviar("/api/guardia/acreditar-final",{fecha:b.dataset.final,actorId:yo().id,ifVersion:Number(b.dataset.v)||0});
    if(r.status===200){S.msg["6"]=r.d.repetida?"Ya estaba acreditado.":"Cumplimiento acreditado.";await recargar();}else{b.disabled=false;msg("6",err(r.d));}};});
  q("[data-sinfoto]",function(b){b.onclick=function(){S.noche="sf:"+b.dataset.sinfoto;S.editando=true;render();var d=document.querySelector('#flujoGuardia details[data-et="4"]');if(d)d.open=true;};});
  q("[data-sf-cancel]",function(b){b.onclick=function(){S.noche=null;S.editando=false;render();};});
  q("[data-sf-enviar]",function(b){b.onclick=async function(){
    var f=b.dataset.sfEnviar,z=host.querySelector('[data-form-sf="'+f+'"]'),m=z.querySelector("[data-sf-motivo]").value.trim(),nv=z.querySelector("[data-sf-nov]").value.trim();
    if(m.length<8){msg("4",ERR.motivo_requerido);return;}if(!nv){msg("4",ERR.novedades_requeridas);return;}
    if(!confirm("¿Cerrar el libro del "+f+" SIN fotografía? Quedará registrado como incumplimiento."))return;
    b.disabled=true;msg("4","Guardando…");var r=await enviar("/api/guardia/cierre-oficial",{fecha:f,actorId:yo().id,motivo:m,novedades:nv});
    b.disabled=false;if(r.status===200){S.noche=null;S.editando=false;S.msg["4"]=(r.d.repetido?"Ya estaba cerrado (no se duplicó).":"Libro cerrado sin fotografía.");await recargar();}else msg("4",err(r.d));};});
  var sn=$("gfIncNoche");if(sn)sn.onchange=function(){S.noche="inc:"+sn.value;render();var d=document.querySelector('#flujoGuardia details[data-et="5"]');if(d)d.open=true;};
  q("[data-inc-guardar]",function(b){b.onclick=async function(){
    var z=b.closest(".gf-form"),det=z.querySelector("[data-inc-detalle]").value.trim();
    if(det.length<3){msg("5",ERR.detalle_requerido);return;}
    b.disabled=true;msg("5","Guardando…");
    var r=await enviar("/api/guardia/incidencias",{fecha:b.dataset.incGuardar,actorId:yo().id,id:uid(),tipo:z.querySelector("[data-inc-tipo]").value,personaId:z.querySelector("[data-inc-persona]").value||null,hora:z.querySelector("[data-inc-hora]").value||null,detalle:det});
    b.disabled=false;if(r.status===200){S.msg["5"]="Incidencia registrada.";S.noche="inc:"+b.dataset.incGuardar;await recargar();}else msg("5",err(r.d));};});
  q("[data-resolver]",function(b){b.onclick=async function(){
    var t=host.querySelector('[data-res-txt="'+b.dataset.resolver+'"]').value.trim();if(t.length<3){msg("5","Escribe cómo se resolvió.");return;}
    b.disabled=true;var r=await enviar("/api/guardia/incidencias",{fecha:b.dataset.f,actorId:yo().id,accion:"resolver",id:b.dataset.resolver,resolucion:t});
    b.disabled=false;if(r.status===200){S.msg["5"]="Incidencia resuelta.";await recargar();}else msg("5",err(r.d));};});
  var cs=$("gfCerrarSemana");if(cs)cs.onclick=async function(){
    if(!confirm("¿Cerrar la semana del "+S.semana+"? Se guardará el resumen de las noches ratificadas."))return;
    cs.disabled=true;msg("7","Cerrando…");var r=await enviar("/api/guardia/cierre-semanal",{semana:S.semana,actorId:yo().id,observaciones:($("gfObs")||{}).value||""});
    if(r.status===200){S.msg["7"]=r.d.repetido?"La semana ya estaba cerrada con estos mismos datos.":"Semana cerrada. Los oficiales fueron avisados.";await recargar();}
    else{cs.disabled=false;msg("7",err(r.d));}};
  q("[data-pdf]",function(b){b.onclick=async function(){
    b.disabled=true;msg("7","Preparando PDF…");
    try{await pdf(b.dataset.pdf,b.dataset.f,b.dataset.a);msg("7","PDF listo.");}catch(e){console.warn(e);msg("7","No se pudo generar el PDF: "+(e.message||"error"));}
    b.disabled=false;};});
  host.oninput=function(){S.editando=true;};
}

/* ------------------------------ PDF ------------------------------ */
function cabecera(doc,titulo){
  if(typeof gnHistorialPdfHeader==="function"){gnHistorialPdfHeader(doc,titulo);return;}
  doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text('Quinta Compañía de Bomberos "Germania" de Villarrica',105,16,{align:"center"});doc.setFontSize(10);doc.text(titulo,105,38,{align:"center"});
}
function pie(doc,quien){
  var n=doc.internal.getNumberOfPages(),w=doc.internal.pageSize.getWidth(),h=doc.internal.pageSize.getHeight();
  for(var i=1;i<=n;i++){doc.setPage(i);doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(90);
    doc.text("Generado por Germania · "+hora(new Date().toISOString())+" · "+quien+" · Página "+i+" de "+n,w/2,h-7,{align:"center"});}
}
async function huella(obj){try{var b=new TextEncoder().encode(JSON.stringify(obj));var h=await crypto.subtle.digest("SHA-256",b);return [].slice.call(new Uint8Array(h)).map(function(x){return x.toString(16).padStart(2,"0");}).join("").slice(0,16);}catch(e){return "no disponible";}}
async function fotoJpeg(f){
  try{
    var r=await fetch("/api/guardia/libro?foto=1&fecha="+f+"&actorId="+encodeURIComponent(yo().id),{cache:"no-store"});if(!r.ok)return null;
    var bl=await r.blob(),bm=await createImageBitmap(bl),k=Math.min(1,1400/Math.max(bm.width,bm.height)),c=document.createElement("canvas");
    c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);c.getContext("2d").drawImage(bm,0,0,c.width,c.height);
    return {data:c.toDataURL("image/jpeg",0.82),w:c.width,h:c.height};
  }catch(e){return null;}
}
function y0(doc,mas){return (doc.lastAutoTable?doc.lastAutoTable.finalY:44)+(mas||6);}
async function seccionNoche(doc,n,nuevaPagina){
  if(nuevaPagina){doc.addPage();cabecera(doc,"GUARDIA NOCTURNA · INFORME DIARIO");}
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(0);doc.text("Noche del "+larga(n.fecha)+" (22:45 a 06:00)",14,nuevaPagina?46:44);
  var r=n.ratificacion,l=n.libro,e=ESTADOS[n.estado]||[n.estado];
  var filas=[["Registro del libro",l.cerrado?(l.sinFoto?"Cerrado SIN fotografía por "+((l.cierrePorOficial&&l.cierrePorOficial.nombre)||"un oficial")+" — "+(l.motivoSinFoto||""):"Cerrado con fotografía por "+(l.obacNombre||nom(n.programada.obac))+" · "+hora(l.enviadoEn)):"Sin cerrar"],
    ["Guardia ratificada",r?"Sí — "+r.porNombre+" ("+(r.porCargo||"oficial")+", código "+r.porId+") · "+hora(r.en):"No"],
    ["Cumplimiento reglamentario",r&&r.cumplimiento?(r.cumplimiento.estado==="acreditado"?"Acreditado":"NO acreditado: "+r.cumplimiento.motivos.map(function(m){return MOTIVOS[m]||m;}).join(", ")):"Sin evaluar"],
    ["Cumplimiento final (oficial)",n.cumplimientoFinal?"Acreditado por "+(n.cumplimientoFinal.porNombre||"T3")+" ("+(n.cumplimientoFinal.porCargo||"Teniente 3°")+") · "+(n.cumplimientoFinal.en?hora(n.cumplimientoFinal.en):"registro anterior al flujo"):(r?"PENDIENTE de acreditación oficial":"No aplica")],
    ["Estado general",e[0]]];
  doc.autoTable({startY:(nuevaPagina?48:46),body:filas,theme:"grid",styles:{fontSize:8,cellPadding:2},columnStyles:{0:{fontStyle:"bold",cellWidth:46}},margin:{left:14,right:14,top:46,bottom:16}});
  var P=n.programada;
  doc.autoTable({startY:y0(doc),head:[["Dotación programada (ODD original)","Nombre"]],body:[["Maquinista",nom(P.maq)],["OBAC",nom(P.obac)]].concat((P.vol||[]).map(function(id){return ["Voluntario",nom(id)];})),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[179,36,28]},margin:{left:14,right:14,top:46,bottom:16}});
  if(r){
    var cuerpo=Object.keys(r.asistentes.concat(r.ausentes).reduce(function(a,id){a[id]=1;return a;},{})).map(function(id){
      var pres=r.asistentes.indexOf(id)>=0,ex=r.excusas&&r.excusas[id],ad=(r.adicionales||[]).some(function(a){return String(a.id)===id;});
      var rol=id===String(r.obacEfectivoId)?"OBAC efectivo":id===String(r.conductorEfectivoId)?"Conductor efectivo":ad?"Asistente adicional":"Voluntario";
      return [nom(id),rol,pres?"Presente":(ex?"Excusado: "+ex:"Ausente")];});
    doc.autoTable({startY:y0(doc),head:[["Asistencia efectiva ratificada","Función","Estado"]],body:cuerpo,styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[179,36,28]},margin:{left:14,right:14,top:46,bottom:16}});
    var de=r.dotacionEfectiva;if(de){doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Dotación efectiva: "+de.total+" presentes ("+de.voluntarios+" voluntarios; mínimo 1 conductor, 1 OBAC y 2 voluntarios: "+(de.minimoCumplido?"cumplido":"NO cumplido")+").",14,y0(doc,5));doc.lastAutoTable.finalY+=6;}
    if(r.motivoPrecedencia){doc.text("Constancia de precedencia del OBAC: "+r.motivoPrecedencia,14,y0(doc,5));doc.lastAutoTable.finalY+=6;}
  }
  var nov=(l&&l.novedades)||"";
  doc.autoTable({startY:y0(doc),head:[["Novedades del libro de guardia"]],body:[[nov||"No registradas"]],styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[90,90,90]},margin:{left:14,right:14,top:46,bottom:16}});
  var its=(n.incidencias&&n.incidencias.items)||[];
  if(its.length)doc.autoTable({startY:y0(doc),head:[["Incidencia","Detalle","Estado"]],body:its.map(function(x){return [(TIPOS[x.tipo]||x.tipo)+(x.personaId?" · "+nom(x.personaId):""),x.detalle,x.estado==="resuelta"?"Resuelta: "+(x.resolucion||""):"ABIERTA"];}),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[179,36,28]},margin:{left:14,right:14,top:46,bottom:16}});
  if(r&&r.historial&&r.historial.length)doc.autoTable({startY:y0(doc),head:[["Corrección","Quién y cuándo","Motivo","Antes → después"]],body:r.historial.map(function(h,i){return ["#"+(i+1),(h.modificadoPorNombre||"")+" ("+(h.modificadoPorCargo||"")+") · "+hora(h.modificadoEn),h.motivo||"",
      "Presentes "+(h.asistentes||[]).length+" → "+((h.despues&&h.despues.asistentes)||[]).length+" · Ausentes "+(h.ausentes||[]).length+" → "+((h.despues&&h.despues.ausentes)||[]).length];}),styles:{fontSize:7,cellPadding:2},headStyles:{fillColor:[90,90,90]},margin:{left:14,right:14,top:46,bottom:16}});
  if(r){var hu=await huella({f:n.fecha,por:r.porId,en:r.en,a:r.asistentes,x:r.ausentes,v:r.version});
    doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(60);doc.text("Identificación verificable: ratificó "+r.porNombre+", código de voluntario "+r.porId+", registro Germania v"+r.version+" del "+hora(r.en)+". Huella del registro: "+hu+".",14,y0(doc,6),{maxWidth:182});doc.setTextColor(0);}
  /* fotografía en página propia */
  doc.addPage();cabecera(doc,"GUARDIA NOCTURNA · FOTOGRAFÍA DEL LIBRO");doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("Libro de guardia · "+larga(n.fecha),14,46);
  var ft=l&&l.cerrado&&!l.sinFoto?await fotoJpeg(n.fecha):null;
  if(ft){var mw=182,mh=225,k=Math.min(mw/ft.w,mh/ft.h);doc.addImage(ft.data,"JPEG",14,50,ft.w*k,ft.h*k);}
  else{doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(l&&l.sinFoto?"Sin fotografía. Motivo: "+(l.motivoSinFoto||""):"Fotografía no disponible.",14,56);}
}
async function pdf(tipo,fecha,accion){
  var d=S.data,p=yo();if(!d||!window.jspdf||!window.jspdf.jsPDF)throw Error("generador de PDF no disponible");
  var doc=new window.jspdf.jsPDF();if(!doc.autoTable)throw Error("módulo de tablas no disponible");
  var archivo,texto;
  if(tipo==="d"){
    var n=d.noches.find(function(x){return x.fecha===fecha;});if(!n)throw Error("noche no encontrada");
    cabecera(doc,"GUARDIA NOCTURNA · INFORME DIARIO");await seccionNoche(doc,n,false);archivo="guardia-"+fecha+".pdf";
    texto="Germania · Guardia nocturna del "+larga(fecha)+": "+(ESTADOS[n.estado]||[n.estado])[0]+".";
  }else{
    cabecera(doc,"GUARDIA NOCTURNA · SEMANA COMPLETA");doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Semana del miércoles "+larga(d.semana),105,44,{align:"center"});
    doc.autoTable({startY:49,head:[["Noche","Prog.","Present.","Ausent.","Adic.","OBAC efectivo","Conductor ef.","Estado","Ratificó"]],
      body:d.noches.map(function(n){var r=n.ratificacion;return [corta(n.fecha),n.programada.total,r?r.asistentes.length:"-",r?r.ausentes.length:"-",r?r.adicionales.length:"-",r?nom(r.obacEfectivoId):"-",r?nom(r.conductorEfectivoId):"-",(ESTADOS[n.estado]||[n.estado])[0],r?r.porNombre:"-"];}),
      styles:{fontSize:7,cellPadding:1.8,overflow:"linebreak"},headStyles:{fillColor:[179,36,28]},margin:{left:11,right:11,top:46,bottom:16}});
    if(d.cierre){doc.setFontSize(8);doc.text("Semana "+(d.cierreVigente?"cerrada":"con cierre desactualizado")+" por "+d.cierre.cerradaPorNombre+" ("+d.cierre.cerradaPorCargo+", código "+d.cierre.cerradaPorId+") el "+hora(d.cierre.cerradaEn)+(d.cierre.observaciones?". Observaciones: "+d.cierre.observaciones:"")+".",14,y0(doc,6),{maxWidth:182});}
    for(var i=0;i<d.noches.length;i++){doc.addPage();cabecera(doc,"GUARDIA NOCTURNA · INFORME DIARIO");await seccionNoche(doc,d.noches[i],false);}
    archivo="guardia-semana-"+d.semana+".pdf";texto="Germania · Guardia nocturna, semana del "+larga(d.semana)+": "+resumenLinea()+".";
  }
  pie(doc,p?nom(p.id):"");
  var blob=doc.output("blob");
  if(accion==="imprimir"){var u=URL.createObjectURL(blob),w=window.open(u,"_blank");if(w){w.addEventListener("load",function(){try{w.print();}catch(e){}});}else doc.save(archivo);return;}
  if(accion==="whatsapp"){
    var file=new File([blob],archivo,{type:"application/pdf"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:archivo,text:texto});return;}catch(e){if(e&&e.name==="AbortError")return;}}
    doc.save(archivo);window.open("https://wa.me/?text="+encodeURIComponent(texto+"\n(Adjunta el PDF que se descargó: "+archivo+")"),"_blank");return;
  }
  doc.save(archivo);
}
window.GermaniaGuardiaFlujo={refrescar:recargar,_pdf:pdf,_estado:function(){return S;}};

var css=".gf-barra{display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin:8px 0}.gf-lbl{display:block;font-size:.85em;margin:6px 0 2px;color:#c3ccd2}.gf-est{display:block;font-weight:400;font-size:.8em;color:#c3ccd2}"+
".gf-et{border-top:1px solid #2c3a44;padding:6px 0}.gf-et>summary{cursor:pointer;min-height:40px;display:flex;flex-direction:column;justify-content:center}.gf-cuerpo{padding:4px 0 8px}"+
".gf-fila{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid #1d272e;align-items:center}.gf-col{align-items:flex-start}"+
".gf-chip{display:inline-block;font-size:.78em;padding:2px 8px;border-radius:12px;border:1px solid #56626b;margin-left:4px}.gf-verde{border-color:#2e9e5b;color:#8ee0ae}.gf-rojo{border-color:#ef4444;color:#ff9a95}.gf-amarillo{border-color:#d9a400;color:#ffd866}.gf-naranja{border-color:#e0782b;color:#ffb27a}.gf-gris{color:#c3ccd2}"+
".gf-in{width:100%;box-sizing:border-box;padding:9px;color:#fff;background:#11171c;border:1px solid #8b959b;border-radius:6px}.gf-form{padding:6px 0}.gf-inc{padding:7px;margin:6px 0;border-radius:6px;border:1px solid #56626b}.gf-inc.ab{border-color:#ef4444}.gf-inc.ok{border-color:#2e9e5b}"+
".gf-pdf{display:flex;flex-wrap:wrap;gap:6px}.gf-lnk{color:#8ec5ff}.gf-av{margin:6px 0}.gf-res{display:flex;gap:6px;margin-top:6px}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

function programar(){
  var ciclo=function(){if(document.visibilityState==="visible"&&!S.editando){var p=yo();if(p&&(autorizado(p)||esAdmin(p)))recargar();}};
  setInterval(ciclo,60000);document.addEventListener("visibilitychange",ciclo);
  window.addEventListener("online",ciclo);
  var sv=$("miVoluntario");if(sv)sv.addEventListener("change",function(){var h=$("flujoGuardia");if(h)h.remove();S.data=null;S.semana=null;S.noche=null;S.editando=false;setTimeout(recargar,900);});
  setTimeout(recargar,3200);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",programar);else programar();
})();
