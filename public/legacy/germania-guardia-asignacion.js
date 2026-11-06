
(()=>{'use strict';
const days=['Miércoles','Jueves','Viernes','Sábado','Domingo','Lunes','Martes'];
let persons=[];
const initial=days.map(()=>({ids:[],obac:'',driver:'',saved:false}));
const byId=id=>persons.find(p=>p.id===id)||{name:'Integrante no activo',driver:false},$=id=>document.getElementById(id),copy=v=>JSON.parse(JSON.stringify(v));
let records=copy(initial),day=0,editing=false,publication=null,version=0,busy=false,baseline=null,loaded=false,readOnly=false,loadError='',reloadRequired=false;
const params=new URLSearchParams(location.search);
const current=new Date(new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T12:00:00Z');
current.setUTCDate(current.getUTCDate()-((current.getUTCDay()+4)%7));
const requested=params.get('inicio')||'';
const requestedDate=new Date(requested+'T12:00:00Z');
const inicio=/^\d{4}-\d{2}-\d{2}$/.test(requested)&&Number.isFinite(+requestedDate)&&requestedDate.getUTCDay()===3&&requestedDate.toISOString().slice(0,10)===requested?requested:current.toISOString().slice(0,10);
const fechas=days.map((_,i)=>new Date(Date.parse(inicio+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c.charCodeAt(0)===34?'&quot;':'&#39;');
function valid(n){return n.ids.length>=4&&new Set(n.ids).size===n.ids.length&&n.ids.includes(n.obac)&&n.ids.includes(n.driver)&&n.obac!==n.driver&&byId(n.driver)?.driver&&n.ids.length-2>=2}
function option(id,label){return '<option value="'+esc(id)+'">'+esc(label)+'</option>'}
function role(n,id){return id===n.obac?'OBAC':id===n.driver?'Maquinista':'Voluntario'}
function ordered(n){return [...n.ids].sort((a,b)=>({OBAC:0,Maquinista:1,Voluntario:2}[role(n,a)]-({OBAC:0,Maquinista:1,Voluntario:2}[role(n,b)])))}
function changed(){records[day].saved=false;$('saved').textContent='Cambios pendientes de guardar';draw()}
function draw(){const n=records[day];
$('days').innerHTML=days.map((name,i)=>'<button type="button" data-day="'+i+'" class="'+(i===day?'active':'')+'">'+name+'<div style="font-size:12px;margin-top:5px">'+(!loaded?(loadError?'No disponible':'Cargando…'):records[i].saved?'✓ Guardada':valid(records[i])?'● Completa':'! Incompleta')+'</div></button>').join('');
$('state').textContent=!loaded?(loadError||'Cargando inscritos desde Germania…'):days[day]+' · '+n.ids.length+' integrantes · '+(readOnly?'Inscripción abierta':n.saved?'Guardada':'Sin guardar');
$('people').innerHTML=ordered(n).map(id=>{const p=byId(id),r=role(n,id);return '<div class="person"><div><b>'+esc(p.name)+'</b><small>'+r+(p.driver&&r!=='Maquinista'?' · Habilitado para conducir':'')+'</small></div><div class="row-actions"><button type="button" class="btn-alt" data-change="'+esc(id)+'"'+(busy||readOnly||!loaded?' disabled':'')+'>Cambiar</button>'+(editing?'<button type="button" class="btn-danger" data-remove="'+esc(id)+'">Retirar</button>':'')+'</div></div>'}).join('')||'<p class="muted">'+(!loaded?(loadError?'No se pudieron cargar los inscritos.':'Cargando inscritos…'):'Sin inscritos')+'</p>';
$('editor').classList.toggle('hide',!editing);$('toggle').textContent=editing?'Ocultar modificación':'Modificar integrantes';
$('addPerson').innerHTML='<option value="">Selecciona un integrante</option>'+persons.filter(p=>!n.ids.includes(p.id)&&p.agregable!==false).map(p=>option(p.id,p.name+(p.driver?' · Maquinista habilitado':''))).join('');
$('check').className='notice '+(valid(n)?'ok':'bad');$('check').textContent=!loaded?'':valid(n)?'✓ Dotación mínima completa':'⚠ Se requiere un OBAC, un maquinista habilitado y dos voluntarios distintos';
$('toggle').disabled=busy||!loaded||readOnly;$('add').disabled=busy||!loaded||readOnly;$('save').disabled=busy||!loaded||readOnly||!valid(n);$('publish').disabled=busy||!loaded||readOnly||!records.every(v=>v.saved&&valid(v));$('week').innerHTML=records.map((v,i)=>'<div class="person"><span>'+days[i]+'</span><span class="'+(valid(v)?'ok':'bad')+'">'+(!loaded?(loadError?'No disponible':'Cargando…'):valid(v)?'Completa':'Incompleta')+(loaded?(readOnly?' · Inscripción abierta':v.saved?' · Guardada':' · Sin guardar'):'')+'</span></div>').join('');
}
$('days').onclick=e=>{if(busy)return;const b=e.target.closest('[data-day]');if(!b)return;day=Number(b.dataset.day);editing=false;if(!readOnly)$('saved').textContent='';draw()};
$('toggle').onclick=()=>{if(busy||readOnly||!loaded)return;editing=!editing;draw()};$('done').onclick=()=>{editing=false;draw()};
$('people').onclick=e=>{if(busy||readOnly||!loaded)return;const remove=e.target.closest('[data-remove]');if(remove){const n=records[day],id=remove.dataset.remove;n.ids=n.ids.filter(x=>x!==id);if(n.obac===id)n.obac='';if(n.driver===id)n.driver='';changed();return}const change=e.target.closest('[data-change]');if(!change)return;const id=change.dataset.change,n=records[day],p=byId(id),current=role(n,id);const choices=p.external?['Maquinista']:['OBAC',...(p.driver?['Maquinista']:[]),'Voluntario'];const wrap=document.createElement('div');wrap.className='role-chooser';const label=document.createElement('label');label.textContent='Función de '+p.name;wrap.append(label);for(const choice of choices){const btn=document.createElement('button');btn.type='button';btn.className=choice===current?'':'btn-alt';btn.textContent=choice;btn.onclick=()=>{if(busy||readOnly||!loaded)return;if(choice==='OBAC'){if(n.driver===id)n.driver='';n.obac=id}else if(choice==='Maquinista'){if(n.obac===id)n.obac='';n.driver=id}else{if(n.obac===id)n.obac='';if(n.driver===id)n.driver=''}changed()};wrap.append(btn)}const cancel=document.createElement('button');cancel.type='button';cancel.className='btn-alt';cancel.textContent='Cancelar';cancel.onclick=draw;wrap.append(cancel);const row=change.closest('.person');row.after(wrap)};
$('add').onclick=()=>{if(busy||readOnly||!loaded)return;const id=$('addPerson').value;if(!id)return;const n=records[day];if(!n.ids.includes(id))n.ids.push(id);changed()};
$('save').onclick=async()=>{if(busy||readOnly||!loaded||!valid(records[day]))return;const selected=day;await send('guardar',{[fechas[selected]]:toNight(records[selected])},fechas[selected]);};
$('publish').onclick=()=>{if(!records.every(n=>n.saved&&valid(n))||busy||readOnly||!loaded)return;send('aprobar',Object.fromEntries(fechas.map((f,i)=>[f,toNight(records[i])])))};
function toNight(n){return {obac:n.obac,maq:n.driver,vol:n.ids.filter(id=>id!==n.obac&&id!==n.driver)}}
function fromNight(n,saved){return {ids:[n?.obac,n?.maq,...(n?.vol||[])].filter(Boolean),obac:n?.obac||'',driver:n?.maq||'',saved}}
function failure(error){return ({solo_oficiales:'Ingresa a Oficiales en Germania para abrir esta semana.',base_staging_no_verificada:'La conexión aislada de Staging no está verificada. No se permiten cambios.',conflicto_de_version:'Otra persona guardó cambios. Cierra y vuelve a abrir la preparación para cargar la versión vigente.',conflicto_de_version_o_nomina:'La semana o la nómina cambió. Cierra y vuelve a abrir la preparación para revisar la versión vigente.',guardado_fallido:'No se pudo guardar en Neon. Los cambios siguen pendientes.',lectura_fallida:'No se pudo leer Neon. No se cargaron datos ficticios.'})[error]||String(error||'No se pudo completar la operación').replaceAll('_',' ')}

async function load(){if(busy)return;busy=true;loadError='';draw();try{if(!window.parent.GermaniaAsignacion)throw Error('Abre la preparación de guardia desde Oficiales en Germania');const j=await window.parent.GermaniaAsignacion.cargar(inicio);persons=j.roster.map(p=>({id:p.id,name:p.nombre,driver:p.conductor,external:p.externo,agregable:p.agregable}));version=j.version;readOnly=j.inscripcionAbierta===true;const noches=j.revision?.borradorNoches||j.revision?.noches||j.borrador;records=fechas.map(f=>fromNight(noches[f],(j.revision?.guardadas||[]).includes(f)));baseline=copy(records);loaded=true;reloadRequired=false;publication=j.revision?.estado==='aprobada'?{nights:fechas.map(f=>fromNight(j.revision.noches[f],true))}:null;$('saved').textContent=readOnly?'Inscripción abierta':'';document.querySelector('header > div').textContent='Asignación semanal · '+inicio;document.querySelector('header > p').textContent='Programación institucional';document.querySelector('footer').textContent='';}catch(e){baseline=null;loaded=false;loadError=failure(e.message);$('saved').textContent=loadError;}finally{busy=false;draw();}}
async function send(accion,noches,fecha){if(busy||readOnly||!loaded)return;busy=true;draw();try{const j=await window.parent.GermaniaAsignacion.guardar({inicio,version,accion,noches,...(fecha?{fecha}:{})});version=j.version;if(accion==='guardar'){const i=fechas.indexOf(fecha);records[i].saved=true;baseline[i]=copy(records[i]);$('saved').textContent='✓ Cambios guardados';}else{publication={nights:copy(records)};if(params.get('integrada')==='1'&&window.parent!==window)window.parent.postMessage({tipo:'germania-asignacion-altura',altura:document.querySelector('main').getBoundingClientRect().height,publicada:true},location.origin);$('published').textContent='✓ Semana publicada';}}catch(e){reloadRequired=true;$('saved').textContent=failure(e.message)+' Tus cambios siguen en pantalla. Cierra y vuelve a abrir la preparación para cargar lo guardado en Germania.';}finally{busy=false;draw();}}
if(params.get('integrada')==='1'&&window.parent!==window){
 const informar=()=>window.parent.postMessage({tipo:'germania-asignacion-altura',altura:document.querySelector('main').getBoundingClientRect().height},location.origin);
 new ResizeObserver(informar).observe(document.querySelector('main'));informar();
}
document.querySelector('header > div').textContent='Asignación semanal';
document.querySelector('header > p').textContent='Programación institucional';
document.querySelector('footer').textContent='';
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent||e.data?.tipo!=='germania-asignacion-refrescar')return;if(busy)return;const recuperar=e.data.solicitado===true&&reloadRequired;if(!recuperar&&(editing||loaded&&baseline&&records.some((n,i)=>JSON.stringify(toNight(n))!==JSON.stringify(toNight(baseline[i])))))return;if(recuperar)editing=false;load();});
draw();load();
})();



