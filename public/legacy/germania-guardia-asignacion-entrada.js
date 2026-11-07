(function(){
 'use strict';
 const panel=document.getElementById('gnAsignacionPanel'),frame=document.getElementById('gnAsignacionFrame'),message=document.getElementById('gnGestionEstado');
 if(!panel||!frame)return;
 let actual='';
 const valido=f=>/^\d{4}-\d{2}-\d{2}$/.test(f||'')&&new Date(f+'T12:00:00Z').getUTCDay()===3;
 function seleccion(){return typeof gnTablaSemanaVisible!=='undefined'&&valido(gnTablaSemanaVisible)?gnTablaSemanaVisible:typeof gnPlanDraft!=='undefined'&&valido(gnPlanDraft?.inicio)?gnPlanDraft.inicio:'';}
 function cargar(inicio,refrescar=false,solicitado=false){
  if(typeof window.gnPuedePrepararAsignacion==='function'&&!window.gnPuedePrepararAsignacion(inicio)){panel.style.display='none';frame.hidden=true;actual='';frame.removeAttribute('src');return;}
  panel.style.display='';
  if(!valido(inicio)){message.textContent='La asignación se cargará con la semana programada en el calendario.';frame.hidden=true;actual='';frame.removeAttribute('src');return;}
  message.textContent='Semana del '+inicio.split('-').reverse().join('/')+' · miércoles a martes';
  if(actual!==inicio){actual=inicio;frame.style.height='800px';frame.src='/guardia/asignacion?inicio='+encodeURIComponent(inicio)+'&integrada=1&datos=neon';}
  else if(refrescar)frame.contentWindow?.postMessage({tipo:'germania-asignacion-refrescar',solicitado},location.origin);
  frame.hidden=false;
 }
 const identidad=document.getElementById('miVoluntario');if(identidad)identidad.addEventListener('change',()=>{actual='';cargar(seleccion());});
 cargar(seleccion());
 panel.addEventListener('toggle',()=>{if(panel.open)cargar(seleccion(),true,true);});
 window.gnAbrirAsignacion=inicio=>{panel.open=true;cargar(valido(inicio)?inicio:seleccion());panel.scrollIntoView({behavior:'smooth',block:'start'});};
 const tabla=document.getElementById('gnTablaSemanal');
 if(tabla)new MutationObserver(()=>{if(panel.open)cargar(seleccion(),true);else panel.style.display=typeof window.gnPuedePrepararAsignacion==='function'&&!window.gnPuedePrepararAsignacion(seleccion())?'none':'';}).observe(tabla,{childList:true,subtree:true});
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==frame.contentWindow)return;
  if(e.data?.tipo==='germania-reemplazo-centrar'){const rect=frame.getBoundingClientRect();frame.contentWindow.postMessage({tipo:'germania-reemplazo-viewport',centro:innerHeight/2-rect.top,alto:innerHeight},location.origin);return;}
  if(e.data?.tipo!=='germania-asignacion-altura')return;
  const h=Number(e.data.altura);if(Number.isFinite(h)&&h>0)frame.style.height=Math.min(Math.max(Math.ceil(h),300),24000)+'px';
  if(e.data.publicada&&typeof renderGnTablaSemanal==='function')renderGnTablaSemanal();
 });
})();


