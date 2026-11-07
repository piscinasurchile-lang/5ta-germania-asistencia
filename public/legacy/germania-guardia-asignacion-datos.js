(function(root){
'use strict';
const copiar=v=>JSON.parse(JSON.stringify(v));
const semana=inicio=>{const d=new Date(inicio+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(inicio)||!Number.isFinite(+d)||d.getUTCDay()!==3||d.toISOString().slice(0,10)!==inicio)throw Error('Semana inválida');return Array.from({length:7},(_,i)=>new Date(+d+i*86400000).toISOString().slice(0,10));};
const normal=n=>({obac:String(n?.obac||''),maq:String(n?.maq||''),vol:(Array.isArray(n?.vol)?n.vol:[]).map(String)});
const igual=(a,b)=>JSON.stringify(normal(a))===JSON.stringify(normal(b));
const hoy=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function validar(n,roster){
 if(!n||typeof n.obac!=='string'||typeof n.maq!=='string'||!Array.isArray(n.vol)||n.vol.some(x=>typeof x!=='string'))throw Error('Dotación inválida');
 const ids=[n.obac,n.maq,...n.vol];if(!n.obac||!n.maq||n.vol.length<2||new Set(ids).size!==ids.length)throw Error('Se requiere un OBAC, un maquinista y dos voluntarios distintos');
 const activos=new Map(roster.filter(p=>p.activo!==false).map(p=>[String(p.id),p]));
 if(ids.some(id=>!activos.has(id)))throw Error('Hay integrantes que no están activos en la nómina');
 if(activos.get(n.obac)?.externo||n.vol.some(id=>activos.get(id)?.externo))throw Error('El apoyo del Cuerpo solo puede actuar como maquinista');
 if(activos.get(n.maq).conductor!==true)throw Error('El maquinista no está habilitado');
}
root.GermaniaAsignacionCrear=function(dep){
 async function cargar(inicio){
  const fechas=semana(inicio);
  const [rev,nomina,base,plan]=await Promise.all([dep.leer('guardia-revision:'+inicio,null),dep.leer('roster:v8',[]),dep.base(inicio),dep.leer('guardia-plan:'+inicio,null)]);
  if(!plan.value&&rev.value?.estado!=='aprobada')throw Error(inicio<(dep.hoy?dep.hoy():hoy())?'La semana iniciada no tiene una dotación aprobada':'Programa la semana en el calendario de Germania');
  const inscripcionAbierta=dep.abierta?dep.abierta(plan.value||{}):plan.value?.estado==='abierta';
  if(!Array.isArray(nomina.value)||!Number.isInteger(rev.version))throw Error('No se pudo verificar la nómina o la versión de la semana');
  const revision=rev.value?copiar(rev.value):null;
  const iniciada=inicio<(dep.hoy?dep.hoy():hoy());
  if(iniciada&&revision?.estado!=='aprobada')throw Error('La semana iniciada no tiene una dotación aprobada');
  const apoyo=dep.apoyo?dep.apoyo():null,actor=dep.actor(nomina.value);
  const personas=apoyo?[...nomina.value,apoyo]:nomina.value;
  if(revision&&!Array.isArray(revision.guardadas))revision.guardadas=fechas.filter(f=>revision.noches?.[f]&&(()=>{try{validar(normal(revision.noches[f]),personas);return true;}catch{return false;}})());
  const revisionDatos=dep.revision?await dep.revision(inicio):{};
  return {inicio,revision,version:rev.version,borrador:base,inscripcionAbierta,soloLectura:inscripcionAbierta||iniciada,...revisionDatos,roster:personas.filter(p=>p.activo!==false).map(p=>({id:String(p.id),nombre:[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(' '),conductor:p.conductor===true,externo:p.externo===true,agregable:p.externo!==true||/teniente\s*(tercero|3)/i.test(actor?.cargo||'')})),_roster:nomina.value,_personas:personas};
 }
 async function guardar(body){
  const actorIdInicial=dep.actorId?String(dep.actorId()||''):null;
  const inicio=body?.inicio,fechas=semana(inicio);if(!['guardar','aprobar'].includes(body?.accion)||!Number.isInteger(body.version))throw Error('Solicitud inválida');
  const d=await cargar(inicio);if(d.inscripcionAbierta)throw Error('Cierra las inscripciones antes de preparar la dotación');if(d.version!==body.version)throw Error('Otra persona modificó la semana. Recarga antes de guardar');
  
  const actorInicial=dep.actor(d._roster);if(actorIdInicial!==null&&String(actorInicial?.id||'')!==actorIdInicial)throw Error('Cambió el integrante que opera Germania. Vuelve a cargar la semana');if(!actorInicial?.id)throw Error('Selecciona tu nombre en Germania antes de guardar');
  if(d.puedeAprobar===false){if(body.accion!=='guardar')throw Error('La aprobación corresponde a los oficiales');if(!dep.revisar)throw Error('Preparación no disponible');return dep.revisar({...body,accion:'preparar',noche:body.noches?.[body.fecha]});}
  const prev=d.revision||{};if(prev.cerrada||prev.estado==='cerrada')throw Error('La semana está cerrada');
  const entradas=body.noches;if(!entradas||typeof entradas!=='object'||Array.isArray(entradas)||!Object.keys(entradas).length||Object.keys(entradas).some(f=>!fechas.includes(f)))throw Error('Noches inválidas');
  if(body.accion==='guardar'&&(!body.fecha||Object.keys(entradas).length!==1||!entradas[body.fecha]))throw Error('Guarda una noche a la vez');
  const base={...d.borrador,...prev.noches,...prev.borradorNoches};const noches=Object.fromEntries(fechas.map(f=>[f,{...base?.[f],...normal(base?.[f])}]));
  const guardadas=new Set(prev.guardadas||[]),modificadas=[];
  for(const [f,n] of Object.entries(entradas)){if(f<(dep.hoy?dep.hoy():hoy()))throw Error('Las noches históricas están protegidas');validar(n,d._personas);const apoyo=dep.apoyo?dep.apoyo():null;if(apoyo&&n.maq===String(apoyo.id)&&noches[f].maq!==String(apoyo.id)&&!/teniente\s*(tercero|3)/i.test(actorInicial.cargo||''))throw Error('Solo el Teniente Tercero puede programar al cuartelero');if(!igual(noches[f],n))modificadas.push(f);noches[f]={...noches[f],...normal(n)};if(apoyo&&n.maq===String(apoyo.id)&&dep.metadataApoyo)noches[f].apoyoExterno=dep.metadataApoyo();else delete noches[f].apoyoExterno;if(body.accion==='guardar')guardadas.add(f);}
  if(body.accion==='aprobar'){if(!d.revision||modificadas.length)throw Error('Guarda los cambios antes de publicar');for(const f of fechas){validar(noches[f],d._personas);if(!guardadas.has(f))throw Error('Falta guardar una noche de la semana');}}
  const actor=actorInicial;if(!actor?.id)throw Error('Selecciona tu nombre en Germania antes de guardar');
  const ahora=new Date().toISOString(),aprobar=body.accion==='aprobar',nombre=[actor.nombre,actor.apellidoPaterno,actor.apellidoMaterno].filter(Boolean).join(' ');
  const value={...prev,inicio,base:prev.base||d.borrador,estado:aprobar?'aprobada':prev.estado==='aprobada'?'aprobada':'borrador',noches:aprobar?noches:prev.estado==='aprobada'?prev.noches:noches,guardadas:[...guardadas],modificadaEn:ahora,cambios:[...(prev.cambios||[]),{id:root.crypto?.randomUUID?.()||String(Date.now()),en:ahora,porId:String(actor.id),por:nombre,fecha:body.fecha||inicio,rol:'vol',accion:aprobar?'aprueba':'asignacion',diasModificados:modificadas,antes:Object.fromEntries(modificadas.map(f=>[f,base?.[f]||null])),despues:Object.fromEntries(modificadas.map(f=>[f,noches[f]]))}]};
  if(aprobar){delete value.borradorNoches;value.aprobadaEn=ahora;value.aprobadaPorId=String(actor.id);value.aprobadaPor=nombre;}else value.borradorNoches=noches;
  const cambios=[];
  if(aprobar)for(const f of fechas){
   const h=dep.horario(f),clave=f+'__'+h.entrada.replace(':',''),key='guardia:'+clave,anterior=await dep.leer(key,null),ex=anterior.value||{},n=noches[f];
   if(!Number.isInteger(anterior.version))throw Error('No se pudo verificar la versión de una guardia');
   const personas=new Map((ex.guardianes||[]).map(p=>[String(p.id),p]));
   const registro={...ex,fechaIng:f,horaIng:h.entrada,fechaSal:new Date(Date.parse(f+'T12:00:00Z')+86400000).toISOString().slice(0,10),horaSal:h.salida,oficial:n.obac,conductor:n.maq,apoyoExterno:n.apoyoExterno?.id===n.maq?n.apoyoExterno:null,guardianes:n.vol.map(id=>personas.get(id)||{id,estado:'cuartel',motivo:'',correo:false,obs:'',reemplazo:'',reemplazoRegistradoEn:''}),novedades:ex.novedades||''};
   cambios.push({op:'set',key,value:registro,ifVersion:anterior.version},{op:'add',key:'guardias:index',item:{clave,fecha:f},uniqueBy:'clave'});
  }
  cambios.push({op:'set',key:'guardia-revision:'+inicio,value,ifVersion:d.version});
  if((actorIdInicial!==null&&String(dep.actorId()||'')!==actorIdInicial)||String(dep.actor(d._roster)?.id)!==String(actor.id))throw Error('Cambió el integrante que opera Germania. Vuelve a cargar la semana');
  const resultado=await dep.guardar(cambios);const version=resultado.resultados?.find(x=>x.key==='guardia-revision:'+inicio)?.version;
  if(!Number.isInteger(version))throw Error('No se confirmó la versión guardada. Recarga antes de continuar');
  return {ok:true,version,estado:value.estado};
 }
 return {cargar,guardar,revisar:async body=>{if(!dep.revisar)throw Error('Revisión no disponible');return dep.revisar(body);},foto:fecha=>dep.foto?dep.foto(fecha):''};
};
async function revisionApi(inicio,body){
 const actorId=String(document.getElementById('miVoluntario')?.value||'');
 const r=await fetch('/api/guardia/revision-semanal'+(body?'':'?inicio='+encodeURIComponent(inicio)+'&actorId='+encodeURIComponent(actorId)),{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify({...body,actorId})}:{})});
 const j=await r.json();if(String(document.getElementById('miVoluntario')?.value||'')!==actorId)throw Error('Cambió el integrante que opera Germania');if(!r.ok)throw Error(j.error);return j;
}
if(typeof document!=='undefined'&&typeof sGetV==='function'&&typeof gnGuardarAtomico==='function')root.GermaniaAsignacion=root.GermaniaAsignacionCrear({
 revision:inicio=>revisionApi(inicio),revisar:body=>revisionApi(body.inicio,body),foto:fecha=>'/api/guardia/libro?foto=1&revisionSemanal=1&fecha='+encodeURIComponent(fecha)+'&actorId='+encodeURIComponent(document.getElementById('miVoluntario')?.value||''),
 actorId:()=>document.getElementById('miVoluntario')?.value||'',leer:(key,f)=>sGetV(key,f),base:inicio=>root.gnBaseAsignacion(inicio),horario:f=>root.gnHorarioAsignacion(f),abierta:p=>p.estado==='abierta'&&Date.now()<gnInsCierreMs(p),apoyo:()=>root.GermaniaApoyoGuardia?.david||null,metadataApoyo:()=>root.GermaniaApoyoGuardia.asignar({maq:null}).apoyoExterno,guardar:c=>gnGuardarAtomico(c),actor:roster=>roster.find(p=>String(p.id)===String(document.getElementById('miVoluntario')?.value)&&p.activo!==false)
});
})(typeof window!=='undefined'?window:globalThis);
