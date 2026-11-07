
(()=>{'use strict';
const days=['Miércoles','Jueves','Viernes','Sábado','Domingo','Lunes','Martes'];
let persons=[];
const initial=days.map(()=>({ids:[],obac:'',driver:'',saved:false}));
const byId=id=>persons.find(p=>p.id===id)||{name:'Integrante no activo',driver:false},$=id=>document.getElementById(id),copy=v=>JSON.parse(JSON.stringify(v));
let records=copy(initial),day=0,publication=null,version=0,busy=false,baseline=null,reviewMode=false,reviewReady=false,reviewData={},preparation=null,dirty=false,loaded=false,readOnly=true,reloadRequired=false,canApprove=false,accreditationVersions={};
const params=new URLSearchParams(location.search);
const current=new Date(new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T12:00:00Z');
current.setUTCDate(current.getUTCDate()-((current.getUTCDay()+4)%7));
const requested=params.get('inicio')||'';
const requestedDate=new Date(requested+'T12:00:00Z');
const inicio=/^\d{4}-\d{2}-\d{2}$/.test(requested)&&Number.isFinite(+requestedDate)&&requestedDate.getUTCDay()===3&&requestedDate.toISOString().slice(0,10)===requested?requested:current.toISOString().slice(0,10);
const fechas=days.map((_,i)=>new Date(Date.parse(inicio+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c.charCodeAt(0)===34?'&quot;':'&#39;');
function present(n,id){return !['ausente','justificado'].includes(n.attendance?.[id])}
function valid(n){return present(n,n.obac)&&present(n,n.driver)&&n.ids.filter(id=>present(n,id)).length>=4&&new Set(n.ids).size===n.ids.length&&n.ids.includes(n.obac)&&n.ids.includes(n.driver)&&n.obac!==n.driver&&byId(n.driver)?.driver&&n.ids.filter(id=>present(n,id)).length-2>=2}
function option(id,label){return '<option value="'+esc(id)+'">'+esc(label)+'</option>'}
function role(n,id){if(!present(n,id))return n.originalRoles?.[id]||'Voluntario';return id===n.obac?'OBAC':id===n.driver?'Maquinista':'Voluntario'}
function ordered(n){const rank=id=>!present(n,id)?3:({OBAC:0,Maquinista:1,Voluntario:2}[role(n,id)]);return [...n.ids].sort((a,b)=>rank(a)-rank(b))}
function changed(){dirty=true;records[day]._dirty=true;records[day].saved=false;$('saved').textContent='Cambios pendientes de guardar';draw()}
function draw(){const n=records[day],blocked=busy||!baseline||readOnly;
$('days').innerHTML=days.map((name,i)=>'<button type="button" data-day="'+i+'" class="'+(i===day?'active':'')+'">'+name+'<div style="font-size:12px;margin-top:5px">'+(!loaded?'Cargando…':records[i].saved?'✓ Guardada':valid(records[i])?'● Completa':'! Incompleta')+'</div></button>').join('');
$('state').textContent=days[day]+' · '+n.ids.filter(id=>present(n,id)).length+' presentes · '+(!loaded?'Cargando…':readOnly?'Consulta':n.saved?'Guardada':'Sin guardar');
$('people').innerHTML=ordered(n).map(id=>{const p=byId(id),r=role(n,id);return '<div class="person"><div><b>'+esc(p.name)+'</b><small>'+r+(!present(n,id)?' · '+(n.attendance[id]==='justificado'?'Justificado':'Ausente'):'')+(p.driver&&r!=='Maquinista'?' · Habilitado para conducir':'')+'</small></div><div class="row-actions"><button type="button" class="btn-alt" data-change="'+esc(id)+'"'+(blocked?' disabled':'')+'>Cambiar</button>'+'</div></div>'}).join('')||'<p class="muted">Sin inscritos</p><button type="button" class="btn-alt" data-add>Agregar voluntario</button>';
$('check').className='notice '+(valid(n)?'ok':'bad');$('check').textContent=valid(n)?'✓ Dotación mínima completa':'⚠ Se requiere un OBAC, un maquinista habilitado y dos voluntarios distintos';
$('save').disabled=blocked||(!reviewMode&&!valid(n));$('showBook').hidden=!reviewMode;$('publish').hidden=reviewMode||!canApprove;$('reviewMode').hidden=!reviewReady;$('reviewMode').textContent=reviewMode?'Volver a preparación':'Revisión de cumplimiento';$('save').textContent=reviewMode?(canApprove?'Guardar y aprobar revisión':'Guardar revisión'):'Guardar cambios';$('publish').disabled=blocked||!records.every(v=>v.saved&&valid(v));$('week').innerHTML=records.map((v,i)=>'<div class="person"><span>'+days[i]+'</span><span class="'+(valid(v)?'ok':'bad')+'">'+(valid(v)?'Completa':'Incompleta')+(v.saved?' · Guardada':' · Sin guardar')+'</span></div>').join('');
}
$('days').onclick=e=>{if(busy)return;$('bookPhoto').hidden=true;const b=e.target.closest('[data-day]');if(!b)return;day=Number(b.dataset.day);$('saved').textContent='';draw()};
function setRole(n,id,choice){
 n.attendance??={};n.originalRoles??={};
 if(choice==='Ausente'||choice==='Justificado'){
  n.originalRoles[id]=role(n,id);n.attendance[id]=choice==='Ausente'?'ausente':'justificado';
  if(n.obac===id)n.obac='';if(n.driver===id)n.driver='';
 }else{
  n.attendance[id]='presente';for(const key of Object.keys(n.replacements||{})){if(n.replacements[key]===id)delete n.replacements[key];}
  if(choice==='OBAC'){if(n.driver===id)n.driver='';n.obac=id;}
  else if(choice==='Maquinista'){if(n.obac===id)n.obac='';n.driver=id;}
  else{if(n.obac===id)n.obac='';if(n.driver===id)n.driver='';}
 }
 changed();
}
function closeReplacement(){const d=$('replacementDialog');d.close();d.remove();replacementTrigger?.focus();}
let replacementTrigger=null;
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent||e.data?.tipo!=='germania-reemplazo-viewport')return;const d=$('replacementDialog'),centro=Number(e.data.centro),alto=Number(e.data.alto);if(!d||!Number.isFinite(centro)||!Number.isFinite(alto)||alto<100)return;d.style.maxHeight=Math.floor(alto*.8)+'px';d.style.margin='0';d.style.bottom='auto';d.style.left='50%';d.style.transform='translateX(-50%)';d.style.top=Math.max(12,centro-d.getBoundingClientRect().height/2)+'px';});
function openReplacement(id,trigger){
 const adding=id===null;
 if(!adding&&Object.values(records[day].replacements||{}).includes(id)){$('saved').textContent='Este integrante ya tiene un reemplazo registrado';return;}
 replacementTrigger=trigger;const n=records[day],targetDay=day;
 const dialog=document.createElement('dialog');dialog.id='replacementDialog';dialog.className='replacement-dialog';
 dialog.setAttribute('aria-labelledby','replacementTitle');
 dialog.innerHTML='<h3 id="replacementTitle">'+(adding?'Agregar voluntario':'Reemplazo de '+esc(byId(id).name))+'</h3><label for="replacementSearch">Buscar voluntario</label><input id="replacementSearch" type="search" autocomplete="off">'+(reviewMode?'<label for="replacementReason">Motivo</label><input id="replacementReason" type="text" maxlength="300">':'')+'<div id="replacementList" class="replacement-list"></div><button type="button" id="replacementCancel" class="btn-alt">Cancelar</button>';
 document.body.append(dialog);
 const candidates=persons.filter(p=>!n.ids.includes(p.id)&&p.agregable!==false);
 function render(){const q=$('replacementSearch').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();$('replacementList').innerHTML=candidates.filter(p=>p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)).map(p=>'<button type="button" data-replacement="'+esc(p.id)+'">'+esc(p.name)+'</button>').join('')||'<p>Sin coincidencias</p>';}
 $('replacementSearch').oninput=render;render();
 $('replacementCancel').onclick=closeReplacement;
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeReplacement();});
 dialog.onclick=e=>{const b=e.target.closest('[data-replacement]');if(!b||busy||targetDay!==day)return;
 const chosen=b.dataset.replacement,previousRole=adding?'Voluntario':role(n,id);
 const motivo=reviewMode?$('replacementReason').value.trim():'';if(reviewMode&&motivo.length>=8)$('replacementReason').setCustomValidity('');if(reviewMode&&motivo.length<8){$('replacementReason').setCustomValidity('Escribe un motivo de al menos 8 caracteres');$('replacementReason').reportValidity();return;}if(reviewMode){n.motivos??={};n.motivos[chosen]=motivo;}
 if(previousRole==='Maquinista'&&!byId(chosen).driver){$('saved').textContent='El reemplazante debe ser maquinista habilitado';return;}
 if(!adding){
 if(reviewMode){n.originalRoles??={};n.originalRoles[id]=previousRole;n.attendance??={};if(present(n,id))n.attendance[id]='ausente';n.replacements??={};n.replacements[chosen]=id;}
 else n.ids=n.ids.filter(v=>v!==id);
 }
 n.ids.push(chosen);if(n.obac===id)n.obac='';if(n.driver===id)n.driver='';
 if(previousRole==='OBAC')n.obac=chosen;if(previousRole==='Maquinista')n.driver=chosen;
 closeReplacement();changed();};
 dialog.showModal();$('replacementSearch').focus();if(window.parent!==window)window.parent.postMessage({tipo:'germania-reemplazo-centrar'},location.origin);
}
$('people').onclick=e=>{if(busy||!baseline||readOnly)return;
 const addAction=e.target.closest('[data-add]');if(addAction){openReplacement(null,addAction);return;}
 const remove=e.target.closest('[data-remove]');if(remove){const n=records[day],id=remove.dataset.remove;if(reviewMode&&publication?.nights?.[day]?.ids.includes(id))return;delete n.replacements?.[id];delete n.motivos?.[id];delete n.attendance?.[id];delete n.originalRoles?.[id];n.ids=n.ids.filter(x=>x!==id);if(n.obac===id)n.obac='';if(n.driver===id)n.driver='';changed();return;}
 const change=e.target.closest('[data-change]');if(!change)return;
 document.querySelectorAll('.role-chooser').forEach(v=>v.remove());
 const id=change.dataset.change,n=records[day],p=byId(id),current=present(n,id)?role(n,id):n.attendance[id]==='ausente'?'Ausente':'Justificado';
 const choices=p.external?['Maquinista','Ausente','Justificado']:['OBAC',...(p.driver?['Maquinista']:[]),'Voluntario','Ausente','Justificado'];
 const wrap=document.createElement('div');wrap.className='role-chooser';
 const label=document.createElement('label');label.textContent='Función de '+p.name;wrap.append(label);if(reviewMode){const motivo=document.createElement('input');motivo.type='text';motivo.maxLength=300;motivo.placeholder='Motivo';motivo.setAttribute('aria-label','Motivo de '+p.name);motivo.value=n.motivos?.[id]||'';motivo.oninput=()=>{n.motivos??={};n.motivos[id]=motivo.value;dirty=true;n._dirty=true;n.saved=false;};wrap.append(motivo);}
 for(const choice of choices){const btn=document.createElement('button');btn.type='button';btn.className=choice===current?'':'btn-alt';btn.textContent=choice;btn.setAttribute('aria-pressed',String(choice===current));const asistencia=choice==='Ausente'||choice==='Justificado';btn.disabled=asistencia&&!reviewMode;if(btn.disabled)btn.title='Disponible en Revisión de cumplimiento';btn.onclick=()=>{if(!busy&&(!asistencia||reviewMode))setRole(n,id,choice);};wrap.append(btn);}
 const replace=document.createElement('button');replace.type='button';replace.className='btn-alt';replace.textContent='Reemplazo';replace.onclick=()=>openReplacement(id,change);wrap.append(replace);
 if(!reviewMode||!publication?.nights?.[day]?.ids.includes(id)){const remove=document.createElement('button');remove.type='button';remove.className='btn-danger';remove.textContent='Retirar';remove.dataset.remove=id;wrap.append(remove);}
 const add=document.createElement('button');add.type='button';add.className='btn-alt';add.textContent='Agregar voluntario';add.dataset.add='';wrap.append(add);
 const cancel=document.createElement('button');cancel.type='button';cancel.className='btn-alt';cancel.textContent='Cancelar';cancel.onclick=draw;wrap.append(cancel);change.closest('.person').after(wrap);
};
const photoButton=document.createElement('button');photoButton.id='showBook';photoButton.type='button';photoButton.className='btn-alt full';photoButton.textContent='Revisión del día elegido';const photo=document.createElement('img');photo.id='bookPhoto';photo.hidden=true;photo.alt='Fotografía del libro de la noche elegida';photo.style.cssText='max-width:100%;border-radius:8px;margin-top:12px';$('people').before(photoButton,photo);photoButton.onclick=()=>{photo.hidden=!photo.hidden;if(!photo.hidden)photo.src=window.parent.GermaniaAsignacion.foto(fechas[day]);};photo.onerror=()=>{photo.hidden=true;$('saved').textContent='Fotografía no disponible para esta noche';};
const modeButton=document.createElement('button');modeButton.id='reviewMode';modeButton.type='button';modeButton.className='btn-alt full';$('days').parentElement.before(modeButton);
modeButton.onclick=()=>{if(busy)return;if(dirty){$('saved').textContent='Guarda los cambios pendientes antes de cambiar de vista';return;}
 if(!reviewMode){preparation=copy(records);reviewMode=true;const approved=publication?.nights||records;records=fechas.map((f,i)=>fromReview(reviewData[f],approved[i]));}
 else{reviewMode=false;records=copy(preparation);}
 readOnly=reviewMode?false:preparationReadOnly;
 draw();};
function toReview(n){return n.ids.map(id=>({id,funcion:role(n,id),estado:n.attendance?.[id]||'presente',...(n.replacements?.[id]?{reemplaza:n.replacements[id]}:{})}));}
function fromReview(data,original){if(!data?.integrantes)return {...copy(original),saved:false};const members=data.integrantes;return {motivos:data.motivos||{},ids:members.map(v=>v.id),obac:members.find(v=>v.estado==='presente'&&v.funcion==='OBAC')?.id||'',driver:members.find(v=>v.estado==='presente'&&v.funcion==='Maquinista')?.id||'',attendance:Object.fromEntries(members.map(v=>[v.id,v.estado])),originalRoles:Object.fromEntries(members.map(v=>[v.id,v.funcion])),replacements:Object.fromEntries(members.filter(v=>v.reemplaza).map(v=>[v.id,v.reemplaza])),saved:true};}
$('save').onclick=async()=>{if(busy||readOnly||!baseline||(!reviewMode&&!valid(records[day])))return;const selected=day;await send(reviewMode?'revisar':'guardar',{[fechas[selected]]:toNight(records[selected])},fechas[selected]);};
$('publish').onclick=()=>{if(!records.every(n=>n.saved&&valid(n))||busy||readOnly||!canApprove)return;send('aprobar',Object.fromEntries(fechas.map((f,i)=>[f,toNight(records[i])])))};
function toNight(n){return {obac:n.obac,maq:n.driver,vol:n.ids.filter(id=>id!==n.obac&&id!==n.driver)}}
function fromNight(n,saved){return {ids:[n?.obac,n?.maq,...(n?.vol||[])].filter(Boolean),obac:n?.obac||'',driver:n?.maq||'',saved}}
function failure(error){return ({version_conflict:'Otra persona modificó la semana. Cierra y vuelve a abrir el módulo para cargar la versión vigente.',motivo_justificacion_requerido:'Escribe el motivo de la justificación.',motivo_adicional_requerido:'Escribe el motivo del integrante agregado (mínimo 8 caracteres).',motivo_correccion_requerido:'Escribe el motivo de la corrección antes de aprobar.',libro_no_cerrado_o_desactualizado:'Primero debe estar cerrado el libro correspondiente a esta dotación.',solo_oficiales:'Ingresa a Oficiales en Germania para abrir esta semana.',base_staging_no_verificada:'La conexión aislada de Staging no está verificada. No se permiten cambios.',conflicto_de_version:'Otra persona guardó cambios. Restablece los datos para cargar la versión vigente.',conflicto_de_version_o_nomina:'La semana o la nómina cambió. Restablece los datos y vuelve a revisar.',guardado_fallido:'No se pudo guardar en Neon. Los cambios siguen pendientes.',lectura_fallida:'No se pudo leer Neon. No se cargaron datos ficticios.'})[error]||String(error||'No se pudo completar la operación').replaceAll('_',' ')}

let preparationReadOnly=true;
async function load(){
 if(busy)return;busy=true;draw();try{
  if(!window.parent.GermaniaAsignacion)throw Error('Abre la preparación desde Oficiales en Germania');
  const j=await window.parent.GermaniaAsignacion.cargar(inicio);
  persons=j.roster.map(p=>({id:p.id,name:p.nombre,driver:p.conductor,external:p.externo,agregable:p.agregable}));version=j.version;
  canApprove=j.puedeAprobar===true;accreditationVersions=j.acreditacionVersiones||{};
  reviewReady=j.revisionDisponible===true;reviewData=j.cumplimiento||{};preparationReadOnly=j.soloLectura===true;
  const noches={...j.borrador,...j.revision?.noches,...j.revision?.borradorNoches};
  records=fechas.map(f=>fromNight(noches?.[f],(j.revision?.guardadas||[]).includes(f)));
  preparation=copy(records);publication=j.revision?.estado==='aprobada'?{nights:fechas.map(f=>fromNight(j.revision.noches[f],true))}:null;
  if(reviewMode&&!reviewReady)reviewMode=false;
  if(reviewMode)records=fechas.map((f,i)=>fromReview(reviewData[f],publication.nights[i]));
  readOnly=reviewMode?false:preparationReadOnly;baseline=copy(records);dirty=false;loaded=true;reloadRequired=false;
  $('saved').textContent=j.inscripcionAbierta?'Inscripción abierta':'';
  document.querySelector('header > div').textContent='Asignación semanal · '+inicio;
 }catch(e){baseline=null;loaded=false;readOnly=true;$('saved').textContent=failure(e.message);}finally{busy=false;draw();}
}
async function send(accion,noches,fecha){
 if(busy||readOnly||!baseline)return;busy=true;draw();try{
  const selected=fechas.indexOf(fecha),bridge=window.parent.GermaniaAsignacion;
  const j=accion==='revisar'?await bridge.revisar({inicio,version,fecha,accion:canApprove?'aprobar-cumplimiento':'guardar-borrador',integrantes:toReview(records[selected]),motivos:records[selected].motivos||{},acreditacionVersion:accreditationVersions[fecha]||0}):await bridge.guardar({inicio,version,accion,noches,...(fecha?{fecha}:{})});
  if(accion==='revisar'){
   if(canApprove)accreditationVersions[fecha]=j.version;else version=j.version;
   records[selected].saved=true;reviewData[fecha]={integrantes:toReview(records[selected]),motivos:copy(records[selected].motivos||{})};
   $('saved').textContent=canApprove?'✓ Revisión aprobada':'✓ Revisión guardada · Pendiente de aprobación';
  }else{version=j.version;if(accion==='guardar'){records[selected].saved=true;$('saved').textContent='✓ Cambios guardados';}else{publication={nights:copy(records)};$('published').textContent='✓ Semana publicada';window.parent.postMessage({tipo:'germania-asignacion-altura',altura:document.querySelector('main').getBoundingClientRect().height,publicada:true},location.origin);}}
  if(selected>=0){records[selected]._dirty=false;baseline[selected]=copy(records[selected]);}dirty=records.some(n=>n._dirty);
 }catch(e){reloadRequired=true;$('saved').textContent=failure(e.message)+' · Los cambios siguen en pantalla. Cierra y vuelve a abrir el módulo para recargar.';}finally{busy=false;draw();}
}
setInterval(()=>{if(!busy&&!dirty&&!document.hidden&&!document.querySelector('.role-chooser')&&!$('replacementDialog'))load();},30000);
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent||e.data?.tipo!=='germania-asignacion-refrescar'||busy)return;const recuperar=e.data.solicitado===true&&reloadRequired;if(!recuperar&&(dirty||document.querySelector('.role-chooser')||$('replacementDialog')))return;load();});
if(params.get('integrada')==='1'&&window.parent!==window){
 const informar=()=>window.parent.postMessage({tipo:'germania-asignacion-altura',altura:document.querySelector('main').getBoundingClientRect().height},location.origin);
 new ResizeObserver(informar).observe(document.querySelector('main'));informar();
}
document.querySelector('header > div').textContent='Asignación semanal';
document.querySelector('header > p').textContent='Programación institucional';
document.querySelector('footer').textContent='';
draw();load();
})();

