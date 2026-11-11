(function(){
 'use strict';
 const panel=document.getElementById('gnAsignacionPanel'),host=document.getElementById('gnAprobacionSemana'),frame=document.getElementById('gnAsignacionFrame');
 if(!panel||!host||!frame)return;
 let resumen=null,solicitud=0,ocupado=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const actor=()=>document.getElementById('miVoluntario')?.value||'';
 const inicio=()=>{try{return new URL(frame.getAttribute('src')||'',location.href).searchParams.get('inicio')||'';}catch{return '';}};
 const fecha=f=>new Date(f+'T12:00:00Z').toLocaleDateString('es-CL',{timeZone:'UTC',weekday:'long',day:'numeric',month:'short'});
 const errores={version_conflict:'Cambió la información. Vuelve a consultar el resumen antes de aprobar.',libro_no_cerrado_o_desactualizado:'Falta el cierre del libro de una noche.',semana_no_finalizada:'La semana aún no termina.',semana_cerrada:'La semana ya está cerrada.',solo_oficiales_autorizados:'La aprobación corresponde a los oficiales autorizados.',aprobacion_desactualizada_revisar_dia:'Revisa la aprobación diaria: cambió el libro de esa noche.',datos_invalidos:'Confirma que revisaste la asistencia de las siete noches.'};
 function pendientesLocales(){
  // La vista diaria no permite volver a preparación mientras haya cualquier día sucio.
  // No se infiere la suciedad global del mensaje del último día guardado.
  try{return !frame.contentDocument||frame.contentDocument.getElementById('reviewMode')?.textContent==='Volver a preparación'||/cambios pendientes de guardar/i.test(frame.contentDocument.getElementById('saved')?.textContent||'');}catch{return true;}
 }
 function dibujar(){
  if(!resumen?.terminada){host.hidden=true;host.innerHTML='';return;}
  host.hidden=false;
  const pendientes=resumen.noches.filter(n=>!n.aprobada),faltas=pendientes.filter(n=>n.error);
  host.innerHTML='<details id="gnResumenAprobacion"><summary style="min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:800">Aprobar toda la semana · '+(7-pendientes.length)+'/7 aprobadas</summary>'+
   (resumen.cerrada?'<p>Semana cerrada.</p>':!pendientes.length?'<p>Las siete noches ya están aprobadas.</p>':
   '<p>Revisa este resumen y los libros. Los días sin ajustes se presentan según la programación; al confirmar acreditarás esas asistencias.</p>'+
   resumen.noches.map(n=>'<details style="margin:10px 0"><summary style="min-height:44px;display:flex;align-items:center;cursor:pointer">'+esc(fecha(n.fecha))+' · '+(n.aprobada?'Aprobada':n.error?'Falta revisar libro':n.fuente==='revision'?'Ajustes guardados':'Según programación')+'</summary>'+n.integrantes.map(p=>'<p style="margin:6px 0">'+esc(p.funcion)+' · '+esc(p.nombre)+' · <b>'+esc(p.estado)+'</b></p>').join('')+(n.tieneFoto?'<a target="_blank" rel="noopener" style="display:inline-flex;align-items:center;min-height:44px" href="/api/guardia/libro?foto=1&revisionSemanal=1&fecha='+encodeURIComponent(n.fecha)+'&actorId='+encodeURIComponent(actor())+'">Ver libro de esta noche</a>':n.sinFoto?'<p>Cierre sin fotografía: constancia registrada.</p>':'')+'</details>').join('')+
   (faltas.length?'<p role="status">Pendiente: '+faltas.map(n=>esc(fecha(n.fecha))).join(', ')+'.</p>':'')+
   '<label style="display:flex;align-items:center;gap:10px;min-height:44px"><input type="checkbox" id="gnConfirmarAsistenciaSemana">Revisé las siete noches y confirmo las asistencias y ajustes indicados.</label>'+
   '<button type="button" class="btn" id="gnAprobarTodaSemana" disabled style="min-height:44px">Aprobar toda la semana</button>')+
   '<button type="button" class="btn secondary" id="gnActualizarAprobacion" style="min-height:44px">Actualizar resumen</button><p id="gnAprobacionSemanaMsg" role="status" aria-live="polite"></p></details>';
  const check=document.getElementById('gnConfirmarAsistenciaSemana'),boton=document.getElementById('gnAprobarTodaSemana');
  if(check)check.onchange=()=>{boton.disabled=!check.checked||!resumen.puedeAprobar||ocupado;};
  if(boton)boton.onclick=aprobar;
  document.getElementById('gnActualizarAprobacion').onclick=()=>cargar(true);
 }
 async function cargar(abrir=false){
  if(!panel.open||ocupado)return;
  const semana=inicio(),id=actor(),turno=++solicitud;
  if(!semana||!id){host.hidden=true;return;}
  try{
   const r=await fetch('/api/guardia/aprobar-semana?inicio='+encodeURIComponent(semana)+'&actorId='+encodeURIComponent(id),{cache:'no-store',credentials:'same-origin'});
   const j=await r.json();
   if(turno!==solicitud||semana!==inicio()||id!==actor())return;
   if(!r.ok){host.hidden=true;return;}
   resumen=j;dibujar();if(abrir&&document.getElementById('gnResumenAprobacion'))document.getElementById('gnResumenAprobacion').open=true;
  }catch{host.hidden=false;host.innerHTML='<p role="status">No se pudo consultar la aprobación semanal. Cierra y vuelve a abrir la asignación.</p>';}
 }
 async function aprobar(){
  if(ocupado||!resumen?.puedeAprobar||!document.getElementById('gnConfirmarAsistenciaSemana')?.checked)return;
  const msg=document.getElementById('gnAprobacionSemanaMsg');
  if(pendientesLocales()){msg.textContent='Termina de guardar los cambios diarios y vuelve a preparación antes de aprobar la semana.';return;}
  const id=actor(),semana=inicio();if(semana!==resumen.inicio){msg.textContent='Cambió la semana. Actualiza el resumen.';return;}
  ocupado=true;document.getElementById('gnAprobarTodaSemana').disabled=true;msg.textContent='Aprobando las siete noches…';
  try{
   const r=await fetch('/api/guardia/aprobar-semana',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({inicio:semana,actorId:id,version:resumen.version,nominaVersion:resumen.nominaVersion,versiones:resumen.versiones,confirmado:true})});
   const j=await r.json();if(!r.ok)throw Error((errores[j.error]||j.error)+(j.fecha?' · '+fecha(j.fecha):''));
   if(id!==actor()||semana!==inicio())return;
   msg.textContent='Semana aprobada: 7 de 7 noches.';
   frame.contentWindow?.postMessage({tipo:'germania-asignacion-refrescar',solicitado:true},location.origin);
   ocupado=false;await cargar(true);
  }catch(e){msg.textContent=e.message||'No se confirmó la aprobación. Actualiza el resumen antes de reintentar.';}
  finally{ocupado=false;}
 }
 panel.addEventListener('toggle',()=>{if(panel.open)cargar();});
 frame.addEventListener('load',()=>cargar());
 document.getElementById('miVoluntario')?.addEventListener('change',()=>{resumen=null;host.hidden=true;++solicitud;});
})();
