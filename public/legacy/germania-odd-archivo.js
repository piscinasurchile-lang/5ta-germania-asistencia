(function(){
 'use strict';
 var datos=[],persona='',epoca=0,identificada=false;
 var $=function(id){return document.getElementById(id);};
 var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
 var normal=function(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();};
 var yo=function(){return String(($('miVoluntario')||{}).value||'');};
 var mensajes={odd_ya_existe_original_inalterable:'Ese número ya existe. El documento original no se puede reemplazar.',resumen_requiere_revision:'Revisa e indica brevemente qué dispone esta ODD.',acceso_oficial_requerido:'Ingresa la clave de Oficialidad para publicar.',solo_puede_dejar_sin_efecto_odd_anteriores:'Solo puedes dejar sin efecto ODD anteriores a la nueva.',no_puede_anularse_a_si_misma:'Una ODD no puede dejarse sin efecto a sí misma.',pdf_invalido:'Selecciona un PDF válido de hasta 1,5 MB.',pdf_supera_30_paginas:'El PDF supera el límite de 30 páginas.',numero_invalido:'Indica el número con formato 065/2026.',titulo_invalido:'Escribe un título breve.',archivo_no_disponible:'No se pudo cargar el archivo. Intenta nuevamente.',selecciona_tu_nombre:'Selecciona tu nombre nuevamente antes de marcar la lectura.'};
 async function api(body){
  var opciones={credentials:'same-origin',cache:'no-store'};
  if(body){opciones.method='POST';if(body instanceof FormData)opciones.body=body;else{opciones.headers={'Content-Type':'application/json'};opciones.body=JSON.stringify(body);}}
  var r=await fetch('/api/odd-archivo',opciones),d=await r.json();
  if(!r.ok)throw Error(mensajes[d.error]||'No fue posible completar la acción. Intenta nuevamente.');
  return d;
 }
 async function cargar(){
  var id=yo(),turno=epoca;
  if(persona!==id){persona=id;identificada=false;datos=[];}
  if(id&&!identificada){await api({accion:'identificar',personaId:id});if(turno!==epoca)return;identificada=true;}
  var d=await api();if(turno!==epoca||id!==yo())return;
  if(id&&d.personaId!==id){identificada=false;throw Error('Selecciona tu nombre nuevamente para consultar tus lecturas.');}
  datos=d.documentos||[];actualizarAvisos();if(typeof renderAvisosOdd==='function')renderAvisosOdd(false).catch(function(){});return datos;
 }
 function cerrar(){var m=$('oddArchivoNuevo');if(m)m._cerrar();}
 function modal(titulo){
  cerrar();var previo=document.activeElement,ov=document.createElement('div');ov.id='oddArchivoNuevo';ov.className='cit-ov';ov.style.alignItems='flex-start';
  ov.innerHTML='<div class="cit-modal" role="dialog" aria-modal="true" aria-labelledby="oaTitulo" style="max-height:92vh;overflow:auto"><h3 id="oaTitulo">'+esc(titulo)+'</h3><div id="oaContenido"></div><div class="cit-acc"><button type="button" class="btn secondary" id="oaCerrar">Cerrar</button></div></div>';
  function teclado(e){if(e.key==='Escape')ov._cerrar();if(e.key==='Tab'){var focos=Array.from(ov.querySelectorAll('button,input,select,textarea,a[href]')).filter(function(n){return !n.disabled&&!n.hidden;});var primero=focos[0],ultimo=focos[focos.length-1];if(e.shiftKey&&document.activeElement===primero){e.preventDefault();ultimo.focus();}else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primero.focus();}}}
  ov._cerrar=function(){document.removeEventListener('keydown',teclado);ov.remove();if(previo&&previo.isConnected)previo.focus();};
  document.body.appendChild(ov);$('oaCerrar').onclick=ov._cerrar;ov.onclick=function(e){if(e.target===ov)ov._cerrar();};document.addEventListener('keydown',teclado);$('oaCerrar').focus();return $('oaContenido');
 }
 function fecha(d){return d.fechaDocumento||'';}
 function enlace(d){
  if(d.url&&/^\/api\/odd-archivo\/pdf\?numero=/.test(d.url))return d.url;
  if(d.driveId&&/^[A-Za-z0-9_-]{10,}$/.test(d.driveId))return 'https://drive.google.com/file/d/'+d.driveId+'/view';
  if(d.pdfDriveUrl){try{var u=new URL(d.pdfDriveUrl);if(u.protocol==='https:'&&u.hostname==='drive.google.com')return u.href;}catch(e){}}
  return '';
 }
 async function abrirArchivo(numero){
  var cont=modal('Archivo de ODD');cont.innerHTML='<p role="status">Cargando ODD…</p>';
  try{await cargar();if(!cont.isConnected)return;
   cont.innerHTML='<label for="oaQ">Buscar palabra o frase</label><input type="search" id="oaQ" placeholder="Buscar palabra o frase…">'+
    '<div class="field-row"><div class="field"><label for="oaA">Año</label><select id="oaA"><option value="">Todos los años</option>'+Array.from(new Set(datos.map(function(d){return d.numero.split('/')[1];}))).sort().reverse().map(function(y){return '<option>'+y+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label for="oaM">Mes de emisión</label><select id="oaM"><option value="">Todos los meses</option>'+Array.from({length:12},function(_,i){return '<option value="'+String(i+1).padStart(2,'0')+'">'+new Intl.DateTimeFormat('es-CL',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,1)))+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label for="oaT">Tipo</label><select id="oaT"><option value="">Todos los tipos</option>'+Array.from(new Set(datos.map(function(d){return d.tipo||'';}).filter(Boolean))).map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+'</option>';}).join('')+'</select></div></div>'+
    '<p id="oaTotal" class="sub" role="status"></p><div id="oaLista"></div>';
   function pintar(){
    var q=normal($('oaQ').value).split(/\s+/).filter(Boolean),a=$('oaA').value,m=$('oaM').value,t=$('oaT').value;
    var lista=datos.filter(function(d){return (!a||d.numero.endsWith('/'+a))&&(!m||fecha(d).slice(5,7)===m)&&(!t||d.tipo===t)&&q.every(function(p){return normal([d.numero,d.titulo,d.asunto,d.resumen,(d.palabrasClave||[]).join(' ')].join(' ')).includes(p);});});
    $('oaTotal').textContent=lista.length+' ODD encontradas. Los meses filtran solo fechas de emisión conocidas.';
    $('oaLista').innerHTML=lista.length?lista.map(function(d){return '<button type="button" class="oa-ficha" data-numero="'+esc(d.numero)+'"><strong>ODD '+esc(d.numero)+' · '+esc(d.titulo||d.asunto||'Orden del Día')+'</strong>'+
     (d.resumen?'<span>'+esc(d.resumen)+'</span>':'<span class="sub">Resumen pendiente de revisión.</span>')+
     '<small>'+esc(fecha(d)||'Fecha de emisión por verificar')+(d.anulada?' · RETIRADA':'')+(d.sinEfectoPor.length?' · SIN EFECTO por ODD '+esc(d.sinEfectoPor.join(', ')):'')+(d.pendiente?' · NO LEÍDA':'')+'</small></button>';}).join(''):'<p class="sub">No hay ODD con ese criterio.</p>';
   }
   ['oaQ','oaA','oaM','oaT'].forEach(function(id){$(id).addEventListener(id==='oaQ'?'input':'change',pintar);});
   $('oaLista').onclick=function(e){var b=e.target.closest('[data-numero]');if(b)detalle(b.dataset.numero,pintar);};pintar();
   if(window.GermaniaArchivoOddLegacy&&datos.some(function(d){return d.pdf;})){
    var buscarPDF=document.createElement('button');buscarPDF.type='button';buscarPDF.className='btn secondary';buscarPDF.textContent='Buscar dentro de los PDF anteriores';buscarPDF.onclick=function(){cerrar();window.GermaniaArchivoOddLegacy();};$('oaLista').before(buscarPDF);
   }
   if(numero)detalle(numero,pintar);else $('oaQ').focus();
  }catch(e){if(cont.isConnected){cont.innerHTML='<p role="alert">'+esc(e.message)+'</p><button type="button" class="btn" id="oaReintentar">Reintentar</button>';$('oaReintentar').onclick=function(){abrirArchivo(numero);};}}
 }
 async function detalle(numero,volver){
  var d=datos.find(function(x){return x.numero===numero;});if(!d)return;
  var lista=$('oaLista');if(!lista)return;
  lista.innerHTML='<h3>ODD '+esc(d.numero)+' · '+esc(d.titulo||d.asunto||'')+'</h3>'+((d.sinEfectoPor||[]).length?'<p><b>SIN EFECTO</b> por '+d.sinEfectoPor.map(function(n){return '<button type="button" class="btn small secondary" data-rel="'+esc(n)+'">ODD '+esc(n)+'</button>';}).join(' ')+'</p>':'')+
   '<p>'+esc(d.resumen||'Resumen pendiente de revisión.')+'</p>'+(d.cuando&&d.cuando.fecha?'<p>'+esc(d.cuando.fecha+' '+(d.cuando.hora||''))+'</p><button type="button" class="btn secondary" id="oaCalendario">Agregar a mi calendario</button>':'')+[d.lugar,d.tema,d.vestimenta].filter(Boolean).map(function(v){return '<p>'+esc(v)+'</p>';}).join('')+((d.dejaSinEfecto||[]).length?'<p>Deja sin efecto: '+d.dejaSinEfecto.map(function(n){return datos.some(function(x){return x.numero===n;})?'<button type="button" class="btn small secondary" data-rel="'+esc(n)+'">ODD '+esc(n)+'</button>':'ODD '+esc(n)+' (fuera de este archivo)';}).join(' ')+'</p>':'')+
   (enlace(d)?'<a class="btn" href="'+esc(enlace(d))+'" target="_blank" rel="noopener noreferrer">'+(d.driveId?'Leer PDF en Google Drive':'Leer PDF original')+'</a>':d.pdf?'<button type="button" class="btn" id="oaPdfLegacy">Leer PDF original</button>':'')+
   '<button type="button" class="btn secondary" id="oaVolver">Volver a la lista</button><p id="oaLectura" class="sub" role="status"></p>';
  $('oaVolver').onclick=volver;if($('oaCalendario'))$('oaCalendario').onclick=function(){if(typeof descargarIcs==='function')descargarIcs(d);};lista.querySelectorAll('[data-rel]').forEach(function(b){b.onclick=function(){detalle(b.dataset.rel,volver);};});
  if($('oaPdfLegacy'))$('oaPdfLegacy').onclick=function(){if(typeof abrirPdfAviso==='function')abrirPdfAviso(d.pdf);};
  if(yo()&&!d.historico&&d.pendiente){var id=yo();try{await api({accion:'leer',numero:d.numero,personaId:id});if(id!==yo())return;d.pendiente=false;d.leidoEn=new Date().toISOString();actualizarAvisos();if($('oaLectura'))$('oaLectura').textContent='Leída.';}catch(e){if($('oaLectura'))$('oaLectura').textContent='No se guardó la lectura. '+e.message;}}
 }
 function actualizarAvisos(){
  var pendientes=persona?datos.filter(function(d){return d.pendiente;}):[];
  var btn=$('avisoArchivoOdd');if(btn)btn.textContent='Archivo de ODD'+(pendientes.length?' · '+pendientes.length+' sin leer':'')+' ›';
  var bloque=$('oddAvisosPersonales');if(!bloque){var ref=$('avisoArchivoOdd');if(!ref)return;bloque=document.createElement('div');bloque.id='oddAvisosPersonales';ref.before(bloque);}
  var visibles=persona?datos.filter(function(d){return !d.historico&&(d.pendiente||d.destacado);}):[];
  bloque.innerHTML=visibles.slice(0,20).map(function(d){return '<button type="button" class="aviso-cit" data-odd-personal="'+esc(d.numero)+'">ODD '+esc(d.numero)+(d.pendiente?' · Sin leer':' · Leída')+((d.sinEfectoPor||[]).length?' · SIN EFECTO por ODD '+esc(d.sinEfectoPor.join(', ')):'')+'<span style="display:block;font-weight:400">'+esc(d.resumen)+'</span></button>';}).join('');
  bloque.querySelectorAll('[data-odd-personal]').forEach(function(b){b.onclick=function(){abrirArchivo(b.dataset.oddPersonal);};});
  try{var nav=window.parent.navigator,turno=epoca;
   Promise.resolve(nav.serviceWorker&&nav.serviceWorker.getRegistration('/')).then(function(reg){return reg&&reg.getNotifications?reg.getNotifications({tag:'germania-informaciones'}):[];}).then(function(avisos){
    if(turno!==epoca)return;
    var otros=(avisos||[]).some(function(n){return !n.data||n.data.clase!=='odd';});
    if(pendientes.length)return nav.setAppBadge&&nav.setAppBadge(pendientes.length);
    if(otros)return nav.setAppBadge&&nav.setAppBadge();
    return nav.clearAppBadge&&nav.clearAppBadge();
   }).catch(function(){});
  }catch(e){}
 }
 async function abrirPublicar(opciones){
  var sinPDF=!!(opciones&&opciones.citacion);
  var cont=modal(sinPDF?'Ayudante informa ODD':'Subir ODD');
  cont.innerHTML='<p>El documento publicado se conserva íntegro. Una nueva ODD puede dejar sin efecto otras anteriores.</p><p role="status">Cargando archivo…</p>';
  try{await cargar();}catch(e){cont.innerHTML='<p role="alert">'+esc(e.message)+'</p>';return;}
  if(!cont.isConnected)return;
  var anio=new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'America/Santiago'}).format(new Date());
  var ultimo=Math.max(0,...datos.filter(function(d){return d.numero.endsWith('/'+anio);}).map(function(d){return Number(d.numero.split('/')[0]);}));
  cont.innerHTML='<form id="oaForm"><label for="opNumero">Número de ODD</label><input id="opNumero" required maxlength="8" value="'+String(ultimo+1).padStart(3,'0')+'/'+anio+'">'+
   '<label for="opTitulo">Título</label><input id="opTitulo" required maxlength="240">'+
   '<label for="opPDF">PDF original (hasta 1,5 MB'+(sinPDF?', opcional':'')+')</label><input id="opPDF" type="file" accept="application/pdf,.pdf" '+(sinPDF?'':'required')+'>'+
   '<label for="opClave">Clave de Oficialidad, si la sesión no está abierta</label><input id="opClave" type="password" autocomplete="current-password">'+
   '<button type="button" class="btn secondary" id="opAnalizar">Obtener resumen del PDF</button>'+
   '<label for="opResumen">Qué dispone esta ODD</label><textarea id="opResumen" required minlength="15" maxlength="600" rows="4"></textarea>'+
   '<details><summary>Datos de citación y calendario (opcional)</summary><label for="opTipo">Tipo</label><select id="opTipo"><option value="disposicion">Disposición</option><option value="citacion">Citación</option><option value="academia">Academia</option><option value="curso">Curso</option><option value="taller">Taller</option><option value="ejercicio">Ejercicio</option><option value="otro">Otro</option></select><label for="opFecha">Fecha de la actividad</label><input id="opFecha" type="date"><label for="opHora">Hora</label><input id="opHora" type="time"><label for="opLugar">Lugar</label><input id="opLugar" maxlength="320"><label for="opTema">Tema</label><input id="opTema" maxlength="320"><label for="opVestimenta">Vestimenta</label><input id="opVestimenta" maxlength="320"><label for="opExcusas">Excusas al correo</label><input id="opExcusas" type="email" maxlength="320"><label><input id="opPuntualidad" type="checkbox" style="width:auto;min-width:44px;min-height:44px">Se exige puntualidad</label></details>'+
   '<label for="opReferencias">ODD que deja sin efecto (números separados por coma)</label><input id="opReferencias" placeholder="045/2026, 039/2026">'+
   '<p class="sub">Comprueba el resumen y las referencias con el PDF antes de publicar.</p><p id="opMensaje" role="status" aria-live="polite"></p>'+
   '<button type="submit" class="btn" id="opPublicar">Publicar nueva ODD</button></form>';
  var analizado=false;
  if(sinPDF)$('opTipo').value='citacion';
  function camposCitacion(){return {tipo:$('opTipo').value,fecha:$('opFecha').value,hora:$('opHora').value,lugar:$('opLugar').value,tema:$('opTema').value,vestimenta:$('opVestimenta').value,excusas:$('opExcusas').value,puntualidad:$('opPuntualidad').checked};}
  async function autenticar(){var pin=$('opClave').value;if(pin){var r=await fetch('/api/auth/officiality',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:pin})});if(!r.ok)throw Error('Clave de Oficialidad incorrecta.');$('opClave').value='';}}
  function form(accion){var f=new FormData();f.set('accion',accion);f.set('numero',$('opNumero').value.trim());var archivo=$('opPDF').files[0];if(!archivo||archivo.size>1536*1024)throw Error('Selecciona un PDF de hasta 1,5 MB.');f.set('archivo',archivo);return f;}
  async function analizar(){var b=$('opAnalizar');b.disabled=true;try{await autenticar();$('opMensaje').textContent='Leyendo el PDF…';var d=await api(form('analizar'));$('opResumen').value=d.resumen||'';$('opReferencias').value=(d.dejaSinEfecto||[]).join(', ');analizado=true;$('opMensaje').textContent=d.requiereRevision?'No se pudo extraer una disposición. Escribe el resumen después de revisar el PDF.':'Revisa qué dispone la ODD y las referencias antes de publicar.';}catch(e){$('opMensaje').textContent=e.message;}finally{b.disabled=false;}}
  $('opAnalizar').onclick=analizar;
  $('opPDF').onchange=function(){analizado=false;$('opResumen').value='';$('opReferencias').value='';var f=this.files[0];if(f&&!$('opTitulo').value)$('opTitulo').value=f.name.replace(/\.pdf$/i,'').replace(/[_]/g,' ').slice(0,240);};
  $('opNumero').oninput=function(){analizado=false;};
  $('oaForm').onsubmit=async function(e){e.preventDefault();var b=$('opPublicar');b.disabled=true;try{await autenticar();var refs=$('opReferencias').value.split(',').map(function(n){return n.trim();}).filter(Boolean);var d;
    if(sinPDF&&!$('opPDF').files.length){$('opMensaje').textContent='Publicando…';d=await api(Object.assign({accion:'publicar_citacion',numero:$('opNumero').value.trim(),titulo:$('opTitulo').value.trim(),resumen:$('opResumen').value.trim(),dejaSinEfecto:refs},camposCitacion()));}
    else{if(!analizado)throw Error('Primero pulsa «Obtener resumen del PDF» y revisa el resultado.');var f=form('publicar');f.set('titulo',$('opTitulo').value.trim());f.set('resumen',$('opResumen').value.trim());f.set('dejaSinEfecto',JSON.stringify(refs));f.set('datosCitacion',JSON.stringify(camposCitacion()));$('opMensaje').textContent='Publicando…';d=await api(f);}await abrirArchivo(d.documento.numero);}catch(err){$('opMensaje').textContent=err.message;b.disabled=false;}};
  $('opNumero').focus();
 }
 function iniciar(){
  var s=$('miVoluntario');if(s)s.addEventListener('change',function(){epoca++;persona='';identificada=false;datos=[];actualizarAvisos();if(!yo())api({accion:'identificar',personaId:''}).catch(function(){});else cargar().catch(function(){});});
  cargar().catch(function(){});setInterval(function(){if(!document.hidden)cargar().catch(function(){});},60000);
  var numero=new URLSearchParams(window.parent.location.search).get('odd');if(numero)abrirArchivo(numero);
 }
 var style=document.createElement('style');style.textContent='#oddArchivoNuevo button,#oddArchivoNuevo a.btn{min-height:48px;min-width:44px;font-size:16px}#oddArchivoNuevo button:focus-visible,#oddArchivoNuevo a:focus-visible{outline:3px solid #ffcc00;outline-offset:2px}.oa-ficha{display:block;width:100%;padding:14px 4px;border:0;border-bottom:1px solid #343b42;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.oa-ficha span,.oa-ficha small{display:block;margin-top:7px;line-height:1.5}.oa-ficha span{font-size:14px;color:#cbd0d5}.oa-ficha small{color:#b8bcc3}#oddArchivoNuevo input,#oddArchivoNuevo select,#oddArchivoNuevo textarea{width:100%;min-height:48px;box-sizing:border-box;margin:5px 0 14px;padding:11px;background:#0b0f12;color:#fff;border:1px solid #414850;border-radius:8px;font:inherit}#oddArchivoNuevo label{display:block;font-size:14px}#oddArchivoNuevo summary{min-height:48px;line-height:48px;cursor:pointer}#oaLista .btn,#oaForm .btn{margin:8px 8px 8px 0}';document.head.appendChild(style);
 window.GermaniaODD={abrirArchivo:abrirArchivo,abrirPublicar:abrirPublicar,actualizar:cargar,estado:function(numero){var p=String(numero||'').trim().split('/');var n=p.length===2?String(Number(p[0])).padStart(3,'0')+'/'+p[1]:'';return datos.find(function(d){return d.numero===n;})||null;}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(iniciar,1000);});else setTimeout(iniciar,1000);
})();
