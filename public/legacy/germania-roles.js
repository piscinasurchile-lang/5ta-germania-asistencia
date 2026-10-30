/* GERMANIA · roles, novedades y Guardia por rol.
   - Inicio: novedades de la Compañía (las publican oficiales y mando).
   - Guardia: una tarjeta por rol → Voluntario, Maquinista, OBAC e Información (Capitán, Teniente 3° y administrador).
   - Una sola fuente de datos: las mismas claves de la base (guardia-inscripcion / guardia-confirmacion) más
     guardia-maq y guardia-obac. No toca la ODD.
   Noche completa = 2 voluntarios + 1 maquinista + 1 OBAC (GN_DOTACION_MIN, en app.js).
   Un voluntario ocupa UN solo rol por noche (voluntario, maquinista u OBAC). */
(function(){
"use strict";
if(typeof ROSTER==="undefined"||typeof sGet!=="function"||typeof gnPlanes!=="function") return;

/* Configuración institucional de interfaz, compartida con app.js. */
var ADMINISTRADORES=window.GermaniaConfig.administradores;
var NOV_KEY="novedades:v1";

function $(id){ return document.getElementById(id); }
function falloGuardia(texto){return function(error){
 console.warn("Guardia: "+texto,error?.name||"Error");
 const host=$("gnRolCard");if(!host)return;
 let aviso=$("grErrorLectura");if(!aviso){aviso=document.createElement("p");aviso.id="grErrorLectura";aviso.className="status-msg err";aviso.setAttribute("role","alert");host.prepend(aviso);}
 aviso.textContent=texto+" Revisa la conexión y vuelve a abrir esta pantalla. Los datos guardados se conservan.";
};}
var avisoAudio=false;
function falloAudio(){if(!avisoAudio){avisoAudio=true;console.info("Avisos: sonido no disponible en este dispositivo.");}}
function norm(t){ return String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function E(s){ return esc(s); }

/* ---------- Roles ---------- */
function miembro(){ var v=$("miVoluntario"); return v&&v.value?ROSTER.find(function(x){ return String(x.id)===String(v.value); })||null:null; }
function cargoDe(m){ return norm(m&&m.cargo); }
function esOficial(m){ return !!m&&/capitan|teniente|ayudante|director|secretari|tesorer|jefe de maquinas/.test(cargoDe(m)); }
function esMando(m){ return !!m&&(/^capitan/.test(cargoDe(m))||/teniente (tercero|3)/.test(cargoDe(m))||ADMINISTRADORES.indexOf(String(m.clave))>=0); }
function esMaquinista(m){ return !!m&&m.conductor===true; }
function esTenienteTercero(m){ return !!m&&/teniente\s*(tercero|3)/.test(cargoDe(m)); }
function esAdminGuardia(m){ return !!m&&ADMINISTRADORES.indexOf(String(m.clave))>=0; }
var PREC=null;
async function cargarPrec(){
  var d=await sGet(PRECEDENCIA_KEY,null);
  var lista=(d&&Array.isArray(d.lista)&&d.lista.length)?d.lista:PRECEDENCIA_ODD_037.lista.map(function(x,i){ return {n:i+1,cargo:x[0],nombre:x[1]}; });
  PREC={};
  lista.forEach(function(x){ var m=precBuscar(x.nombre); if(m&&PREC[String(m.id)]==null) PREC[String(m.id)]=x.n; });
  /* OBAC (obligatorios): Capitán y Tenientes 1°, 2° y 3°, y se completan con los siguientes
     voluntarios del orden de precedencia hasta completar OBAC_TOTAL (uno por cada noche de la semana). */
  OBAC={}; var n=0, ya=function(x){ var m=precBuscar(x.nombre); return m?String(m.id):null; };
  lista.forEach(function(x){ if(/^(capit|teniente (primero|segundo|tercero))/i.test(String(x.cargo||""))){ var id=ya(x); if(id&&!OBAC[id]){ OBAC[id]=true; n++; } } });
  lista.forEach(function(x){ if(n>=OBAC_TOTAL) return; if(/^(voluntari)/i.test(String(x.cargo||""))){ var id=ya(x); if(id&&!OBAC[id]){ OBAC[id]=true; n++; } } });
}
var OBAC=null, OBAC_TOTAL=7; /* uno por noche: 7 noches = 7 OBAC */
/* Mientras se prueban las tarjetas: estas claves ven las tarjetas Maquinista y OBAC aunque no les
   correspondan, SOLO para mirarlas (no inscriben nada). Quitar la clave al terminar la prueba. */
var VISTA_PRUEBA=window.GermaniaConfig.vistaPrueba;
function vistaPrueba(m,kind){ return !!m&&VISTA_PRUEBA.indexOf(String(m.clave))>=0&&!(kind==="maq"?esMaquinista(m):rangoObac(m)!=null); }
function rangoPrec(m){ return m&&PREC&&PREC[String(m.id)]!=null?PREC[String(m.id)]:null; }
function porPrec(a,b){ var ra=rangoPrec(a), rb=rangoPrec(b); return (ra==null?9999:ra)-(rb==null?9999:rb); }
function rangoObac(m){ return m&&PREC&&OBAC&&OBAC[String(m.id)]&&PREC[String(m.id)]!=null?PREC[String(m.id)]:null; }
function corto(m){ return m?[m.nombre,m.apellidoPaterno].filter(Boolean).join(" "):"—"; }
function porId(id){ return ROSTER.find(function(x){ return String(x.id)===String(id); })||(window.GermaniaApoyoGuardia?window.GermaniaApoyoGuardia.buscar(id):null); }

/* ---------- Horario permanente ----------
   Todas las noches terminan a las 08:00. Parte a las 23:00; el domingo a las 19:00.
   Queda así semana tras semana. Si hiciera falta cambiarlo, se guarda en guardia-horarios:v1
   ({def:"23:00",dom:"19:00"}) y rige para todas las semanas siguientes. */
var HORARIOS={def:"22:45",dom:"22:45",fin:"06:00"};
var HOR_NOCHE={};
async function cargarHorarios(){ HORARIOS={def:"22:45",dom:"22:45",fin:"06:00"}; HOR_NOCHE={}; }
function horaNoche(f){ return HOR_NOCHE[f]||(new Date(f+"T12:00").getDay()===0?HORARIOS.dom:HORARIOS.def); }
function finNoche(f){ return instanteChile(gnAdd(f,1),HORARIOS.fin); }

function aplicarRol(){
  var m=miembro(), of=esOficial(m)||esMando(m);
  document.body.setAttribute("data-oficial",of?"1":"0");
  document.body.setAttribute("data-mando",esMando(m)?"1":"0");
  var a=$("novedadesAdmin"); if(a) a.hidden=!of;
  if(!of&&GR.vista!=="mi") ponerVista("mi");
}
function ponerVista(v){
  GR.vista=v; var pg=$("panel-guardia"); if(pg) pg.setAttribute("data-vista",v);
  document.querySelectorAll("#gnVistaSel [data-gv]").forEach(function(b){ var on=b.dataset.gv===v; b.classList.toggle("on",on); b.setAttribute("aria-selected",on); });
  GR.tab=v==="gestion"?"info":"mis";
}

/* ---------- Novedades (Inicio) ---------- */
var novRendering=false, novVisible=[], novReadPending={};
var NOV_PRUEBA=window.GermaniaInformacionesPrueba||null;

var novExpiryTimer=null, novPrivateTimer=null;
function novProgramarVencimiento(lista,privado){
  const actual=privado?novPrivateTimer:novExpiryTimer;
  if(actual)clearTimeout(actual);
  const ahora=Date.now();
  const plazos=(lista||[]).map(n=>n?.vence?Date.parse(n.vence):Date.parse(n?.en||"")+48*60*60*1000)
    .filter(t=>Number.isFinite(t)&&t>ahora);
  const cercano=plazos.length?Math.min(...plazos):null;
  if(cercano===null)return;
  const espera=Math.max(1,Math.min(cercano-ahora+100,24*60*60*1000));
  const temporizador=setTimeout(function(){
    if(privado)renderInformacionesOficiales();
    else renderNovedades();
  },espera);
  if(privado)novPrivateTimer=temporizador;
  else novExpiryTimer=temporizador;
}
var novSeen=null, novAudio=null;
document.addEventListener("pointerdown",function(){
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC&&!novAudio) novAudio=new AC();if(novAudio&&novAudio.state==="suspended") novAudio.resume().catch(falloAudio);}catch(e){falloAudio();}
});
function novSound(lista){
  var ids=lista.map(function(n){return n.id;});
  var nuevos=novSeen!==null&&ids.some(function(id){return novSeen.indexOf(id)<0;});
  novSeen=ids;
  if(!nuevos||!novAudio||novAudio.state!=="running"||document.visibilityState!=="visible") return;
  try{var o=novAudio.createOscillator(),g=novAudio.createGain(),t=novAudio.currentTime;o.frequency.value=660;g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.connect(g);g.connect(novAudio.destination);o.start(t);o.stop(t+0.3);}catch(e){falloAudio();}
}
function novReadKey(id){ return "novedad-lecturas:"+id; }
function novVigente(n){
  const creado=Date.parse(n&&n.en||"");
  const vence=n&&n.vence?Date.parse(n.vence):creado+48*60*60*1000;
  return Number.isFinite(creado)&&Number.isFinite(vence)&&Date.now()<vence;
}
async function renderNovedades(){
  var box=$("novedadesLista"); if(!box||novRendering) return;
  novRendering=true;
  var m=miembro(), who=m?String(m.id):"";
  try{
    var response=await fetch("/api/informaciones/prueba",{cache:"no-store"});
    if(!response.ok)throw new Error("No se pudieron consultar los avisos compartidos");
    var remoto=await response.json(),lista=Array.isArray(remoto.items)?remoto.items:[];
    if(!Array.isArray(lista)) lista=[];
    lista=lista.filter(function(n){return n&&n.id&&typeof n.texto==="string"&&(!n.destino||n.destino==="compania")&&novVigente(n);}).slice().sort(function(a,b){ return String(b.en||"").localeCompare(String(a.en||"")); });
    var lecturas=lista.map(n=>Array.isArray(n.lecturas)?n.lecturas:[]);
    if((miembro()?String(miembro().id):"")!==who) return;
    novVisible=lista; novSound(lista); novProgramarVencimiento(lista,false);
    var of=esOficial(m)||esMando(m);
    box.innerHTML=lista.length?lista.map(function(n,i){
      var reads=Array.isArray(lecturas[i])?lecturas[i]:[];
      var leido=reads.some(function(r){return r&&String(r.voluntarioId)===who;});
      var f=n.en?new Date(n.en).toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"}):"";
      var control=who?'<button type="button" class="btn small" data-nov-read="'+E(n.id)+'"'+(leido?' disabled':'')+'>'+(leido?'✓ Lectura confirmada':'✓ Leído')+'</button>':'<span>Elige tu nombre para confirmar lectura.</span>';
      var detalle=of?'<details class="nov-confirmaciones"><summary>Lecturas confirmadas · '+reads.filter(function(r){return r&&porId(r.voluntarioId);}).length+'</summary>'+ROSTER.filter(function(v){return v.activo!==false;}).map(function(v){var r=reads.find(function(x){return x&&String(x.voluntarioId)===String(v.id);});return '<div class="nov-persona"><span>'+E(corto(v))+'</span><span>'+(r?'✓ Leído':'Pendiente')+'</span></div>';}).join('')+'</details>':'';
      var venc=n.vence?new Date(n.vence):new Date(Date.parse(n.en)+48*60*60*1000);
      var exp=Number.isFinite(venc.getTime())?venc.toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"America/Santiago"}):"";
      return '<div class="ha-item"><span class="ha-fecha">'+E(f)+' · PRUEBA</span><span class="ha-texto">'+E(n.texto)+'</span><small>Vigente hasta: '+E(exp)+'</small>'+(n.autor?'<small>'+E(n.autor)+'</small>':'')+'<div class="nov-lectura">'+control+detalle+'</div></div>';
    }).join(''):'<div class="ha-vacia">Sin novedades por ahora.</div>';
  }catch(e){
    box.innerHTML='<div class="ha-vacia">No fue posible sincronizar los avisos. Comprueba la conexión.</div>';
  }finally{novRendering=false;}
}
async function confirmarLectura(id,button){
  var m=miembro();
  if(!m||novReadPending[id]||!novVisible.some(function(n){return n.id===id;})) return;
  novReadPending[id]=true; button.disabled=true; button.textContent="Guardando…";
  try{
    const resp=await fetch("/api/informaciones/prueba",{method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id,voluntarioId:String(m.id)})});
    if(!resp.ok)throw new Error("No se pudo guardar la lectura.");
    button.textContent="✓ Lectura confirmada";
    await renderNovedades();
  }catch(e){button.disabled=false;button.textContent="Reintentar confirmar lectura";}
  finally{delete novReadPending[id];}
}
async function publicarNovedad(){
  var inp=$("novedadTexto"),msg=$("novedadMsg"),b=$("novedadAgregar");
  var texto=inp?.value?.trim()||"",destino=$("informacionesDestino")?.value||"compania";
  var venceTexto=$("informacionesVence")?.value||"";
  if(!msg||!inp)return;
  msg.classList.remove("err");
  if(!texto){msg.textContent="Escribe una información antes de publicar.";msg.classList.add("err");return;}
  if(!esOficial(miembro())&&!esMando(miembro())){msg.textContent="Solo oficiales pueden publicar.";msg.classList.add("err");return;}
  var vence=null;
  if(venceTexto){
    var fin=new Date(venceTexto);
    if(!Number.isFinite(fin.getTime())||fin.getTime()<=Date.now()){
      msg.textContent="La fecha y hora de vencimiento deben ser futuras.";msg.classList.add("err");return;
    }
    vence=fin.toISOString();
  }
  if(b)b.disabled=true;
  try{
    const m=miembro();
    if(destino==="oficiales"){
      if(!NOV_PRUEBA)throw new Error("Simulación interna no disponible");
      NOV_PRUEBA.publicar({texto,destino,vence,autor:m?corto(m):"Oficial de prueba"});
      msg.textContent="Mensaje interno SIMULADO en este teléfono; no se envía a otros oficiales.";
      await renderInformacionesOficiales();
    }else{
      const respuesta=await fetch("/api/informaciones/prueba",{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({texto,destino:"compania",vence,emisorId:String(m.id)})});
      if(!respuesta.ok){
        const e=await respuesta.json().catch(()=>({}));
        if(e.error==="limite_de_pruebas_alcanzado")throw new Error("Se alcanzó el límite de avisos de prueba por hora.");
        if(e.error==="vigencia_maxima_30_dias")throw new Error("Durante la prueba, selecciona una fecha de vencimiento dentro de los próximos 30 días.");
        if(e.error==="emisor_no_oficial")throw new Error("Solo una ficha de Oficialidad puede publicar avisos generales.");
        throw new Error("No se pudo compartir el aviso. Verifica la conexión y reintenta.");
      }
      msg.textContent="Aviso de PRUEBA enviado a Germania. Aparecerá en los teléfonos al sincronizar.";
      await renderNovedades();
    }
    inp.value="";if($("informacionesVence"))$("informacionesVence").value="";
  }catch(e){msg.textContent=e.message||"No se pudo simular.";msg.classList.add("err")}
  finally{if(b)b.disabled=false;}
}
async function renderInformacionesOficiales(){
  var box=$("informacionesPrivadas");if(!box)return;
  var m=miembro(),visible=esOficial(m)||esMando(m);
  box.hidden=!visible;
  if(!visible){box.innerHTML="";return}
  box.textContent="Consultando mensajes simulados…";
  try{
    if(!NOV_PRUEBA)throw new Error("Simulación no disponible");
    var items=NOV_PRUEBA.listar("oficiales");
    novProgramarVencimiento(items,true);
    box.innerHTML=items.length?items.map(function(n){
      var exp=new Date(n.vence||Date.parse(n.en)+48*60*60*1000);
      var fecha=Number.isFinite(exp.getTime())?exp.toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"America/Santiago"}):"";
      return '<div class="ha-item"><strong>Solo oficiales</strong><p>'+E(n.texto)+'</p><small>Vence: '+E(fecha)+'</small></div>';
    }).join(""):'<div class="ha-vacia">Sin informaciones internas vigentes.</div>';
  }catch(e){box.textContent=e.message||"No fue posible cargar los avisos.";}
}
if($("novedadAgregar")) $("novedadAgregar").addEventListener("click",publicarNovedad);
if($("novedadesLista")) $("novedadesLista").addEventListener("click",function(ev){ var r=ev.target.closest("[data-nov-read]"); if(r) confirmarLectura(r.dataset.novRead,r); });

/* ---------- Datos de la semana ---------- */
async function leerPrefijo(pref){
  var r=await fetch("/api/state?prefix="+encodeURIComponent(pref),{cache:"no-store"});
  if(!r.ok) throw new Error("lectura");
  var j=await r.json(); return Array.isArray(j.items)?j.items:[];
}
/* Regla de visibilidad: una semana se muestra hasta 48 h después de terminar su última guardia (06:00 del día +9). Después solo se ve al buscarla (historial, sin borrar nada). */
function semanaVigente48(x){ return !!x&&Date.now()<instanteChile(gnAdd(x.inicio,9),"06:00"); }
async function planActivo(who){
  var planes=await gnPlanes(), ahora=Date.now(), hoy=todayISO();
  var ab=planes.filter(function(x){ return x.estado==="abierta"&&x.confirmado!==false; }).sort(function(a,b){ return a.inicio.localeCompare(b.inicio); });
  var abiertos=ab.filter(function(x){ return ahora<gnInsCierreMs(x); }), abierto=abiertos[0]||null;
  /* con varias semanas abiertas: la primera que este voluntario aún no confirmó (igual que el aviso de Inicio) */
  if(who) for(var i=0;i<abiertos.length;i++){ var c=await sGet("guardia-confirmacion:"+abiertos[i].inicio+":"+who,null); if(!(c&&(c.cumple||c.justificacion))){ abierto=abiertos[i]; break; } }
  var esGestion=!!who&&esMando(porId(who));
  /* Historial consultable por oficiales: ventana de 400 días, sin borrar registros. */
  var limite=esGestion?gnAdd(hoy,-400):hoy;
  var lista=ab.filter(function(x){ return x.fin>=limite; });
  var p=abierto||ab.filter(function(x){ return x.fin>=hoy; })[0]||null;
  if(!p&&esGestion){ var vig=lista.filter(semanaVigente48); if(vig.length)p=vig[vig.length-1]; }  /* ya no cae a una semana pasada oculta */
  return {p:p,abierto:!!abierto,lista:lista,ahora:ahora};
}
async function cargarSemana(p){
  var pref=["guardia-inscripcion:","guardia-maq:","guardia-obac:","guardia-confirmacion:","guardia-maq-reserva:"]; /* guardia-obac: solo compatibilidad. Reserva: disponibilidad suplente, NO titular */
  var r=await Promise.all(pref.map(function(x){ return leerPrefijo(x+p.inicio+":"); }));
  return r.map(function(items,i){ var o={}, n=(pref[i]+p.inicio+":").length; items.forEach(function(it){ o[it.key.slice(n)]=it.value; }); return o; });
}
/* un registro puede ser "2026-10-14" o {f,t} */
function regs(v){ return (Array.isArray(v)?v:[]).map(function(x){ return typeof x==="string"?{f:x,t:""}:x; }).filter(function(x){ return x&&x.f; }); }
function tiene(v,f){ return regs(v).some(function(x){ return x.f===f; }); }
/* OBAC automático (ADR 0009): ya no hay ficha de OBAC. Cada noche, el OBAC es el inscrito de mayor precedencia
   (germania-obac.js). Si no hay maquinista inscrito, el inscrito habilitado de mayor precedencia (hoy el Capitán)
   pasa a maquinista y el OBAC es el siguiente. Los registros antiguos guardia-obac:* no se usan ni se borran. */
function ordenPrec(){ return PREC?Object.keys(PREC).sort(function(a,b){ return PREC[a]-PREC[b]; }):[]; }
function cobertura(S,noches){
  var DOT=GN_DOTACION_MIN, orden=ordenPrec();
  return noches.map(function(f){
    var maq=[],obac=[],vol=[],maqIds={};
    Object.keys(S.maq).forEach(function(id){ var r=regs(S.maq[id]).filter(function(x){ return x.f===f; })[0]; if(r){ maq.push({id:id,t:r.t||""}); maqIds[id]=1; } });
    maq.sort(function(a,b){ return a.t.localeCompare(b.t); });
    var candidatosMaquina=Object.keys(S.vol).filter(function(id){return tiene(S.vol[id],f)&&esMaquinista(porId(id));});
    var inscritos=maq.map(function(x){ return {id:x.id,maquinista:true}; });
    Object.keys(S.vol).forEach(function(id){ if(!maqIds[id]&&tiene(S.vol[id],f)){ var m=porId(id); if(m&&m.activo!==false) inscritos.push({id:id,habilitadoMaquinista:esMaquinista(m)&&candidatosMaquina.length===1}); } });
    var r=window.GermaniaObac?window.GermaniaObac.obacDeNoche({inscritos:inscritos,orden:orden}):{obac:null,voluntarios:[],maquinistaPorRespaldo:null,empateSinPosicion:false};
    if(r.maquinistaPorRespaldo&&!maq.length) maq.push({id:r.maquinistaPorRespaldo,t:"",respaldo:true});
    if(r.obac) obac.push({id:r.obac,t:"",n:PREC&&PREC[r.obac]!=null?PREC[r.obac]:9999});
    vol=r.voluntarios.slice();
    var refuerzos=Math.max(0,vol.length-DOT.voluntarios);
    var validacion=window.GermaniaGuardiaReglas&&window.GermaniaGuardiaReglas.evaluarDotacion({vol:vol,maq:maq,obac:obac});
    var completa=!!(validacion&&validacion.completa);
    var nada=!vol.length&&!maq.length&&!obac.length;
    return {f:f,vol:vol,maq:maq,obac:obac,refuerzos:refuerzos,completa:completa,nada:nada,empate:!!r.empateSinPosicion};
  });
}
function nombreNoche(f){ var d=new Date(f+"T12:00"); var w=d.toLocaleDateString("es-CL",{weekday:"short"}).replace(".",""); return {w:w.charAt(0).toUpperCase()+w.slice(1),d:f.slice(8)}; }
function faltan(c){
  var ver=window.GermaniaGuardiaReglas&&window.GermaniaGuardiaReglas.evaluarDotacion(c);
  return ver?ver.razones.join(" · "):"No se pudo verificar la dotación";
}

/* ---------- Estado de la tarjeta ---------- */
var GR={semana:"",vista:"mi",tab:"mis",D:null,sel:{maq:null,obac:null},selClave:"",eligiendo:false,eleccionClave:"",cargando:false};
var GR_TABS={mis:["Mis noches","🌙"],vol:["Voluntario","🙋"],maq:["Maquinista","🚒"],obac:["OBAC","🎧"],info:["Tabla semanal","📋"],rev:["Revisión y aprobación","🛠"],rep:["Reemplazos","🔁"]};
/* Mi guardia: mis noches, y las tarjetas de elegir noche solo mientras la elección está abierta.
   Gestión de guardia (Capitán, Teniente 3° y administrador): pasos 2, 3 y 4 (el 1 es el calendario). */
function tabsPermitidas(m,abierto){
  if(GR.vista==="gestion") return esTenienteTercero(m)?["info","rev","rep"]:esAdminGuardia(m)?["info","rev","rep"]:esMando(m)?["info"]:[];
  return ["mis"];   /* elegir noches se hace en las tarjetas de Inicio */
}
function guardiaActiva(){ var p=$("panel-guardia"); return !!p&&p.classList.contains("active"); }

async function cargarD(m,p,abierto,lista){
  var who=String(m.id), D={m:m,who:who,p:p,abierto:abierto,S:null,noches:[],cov:[],error:false,lista:lista||[]};
  if(p){
    try{ var S=await cargarSemana(p); D.noches=gnWeek(p.inicio); D.cov=cobertura({vol:S[0],maq:S[1],obac:S[2]},D.noches); D.S={vol:S[0],maq:S[1],obac:S[2],conf:S[3],reserva:S[4]||{}};D.revision=await sGet(revKey(p.inicio),null); }
    catch(e){ D.error=true; }
  }
  return D;
}
/* Dmi = la semana de este voluntario (tarjetas de Inicio y «Mis noches»); D = la que se muestra en Guardia
   (en Gestión puede ser otra semana, elegida con el selector). */
async function grRender(forzar){
  var box=$("gnRolCard"); if(!box) return;
  var m=miembro();
  if(!m){ box.innerHTML='<h2>Gestión de guardia</h2><p class="sub">Primero elige tu nombre en <b>Inicio</b>.</p>'; var ir=$("inicioRoles"); if(ir) ir.innerHTML=""; return; }
  if(GR.cargando&&!forzar) return;
  GR.cargando=true;
  try{
    if(!PREC) await cargarPrec();
    await cargarHorarios();
    var who=String(m.id), pa=await planActivo(who);
    var Dmi=await cargarD(m,pa.p,pa.abierto,pa.lista), D=Dmi;
    if(GR.vista==="gestion"&&pa.lista&&pa.lista.length){
      /* La semana pasada solo se muestra si se buscó expresamente; si no, solo las vigentes (48 h). */
      var enLista=function(x){ return x.inicio===GR.semana; };
      var elegida=(GR.buscada&&pa.lista.filter(enLista)[0])||pa.lista.filter(function(x){ return enLista(x)&&semanaVigente48(x); })[0]||pa.lista.filter(function(x){return pa.p&&x.inicio===pa.p.inicio;})[0]||pa.lista.filter(semanaVigente48).pop()||null;
      GR.semana=elegida?elegida.inicio:"";
      if(elegida&&(!pa.p||elegida.inicio!==pa.p.inicio)) D=await cargarD(m,elegida,Date.now()<gnInsCierreMs(elegida),pa.lista);
    }
    GR.D=D; GR.Dmi=Dmi;
    var clave=(Dmi.p?Dmi.p.inicio:"")+":"+who;
    if(GR.selClave!==clave){ GR.selClave=clave; GR.sel.maq=null; GR.sel.obac=null; }
    if(Dmi.S){ ["maq","obac"].forEach(function(k){ if(GR.sel[k]===null) GR.sel[k]=new Set(regs(Dmi.S[k][who]).map(function(x){ return x.f; })); }); }
    if(Dmi.p&&Dmi.S){ var propias=Dmi.S.vol[who]||[]; if(GN_INS_CLAVE!==clave){ GN_INS_CLAVE=clave; GN_INS_SEL=new Set(Array.isArray(propias)?propias:[]); } }
    pintarTarjeta(); pintarInicioRoles();
  }finally{ GR.cargando=false; }
}

/* ---------- Inicio: una tarjeta por cargo, mientras la elección está abierta ----------
   Voluntario (todos) · Maquinista · OBAC · Información (Capitán, Teniente 3° y administrador).
   Al cerrar la elección desaparecen y queda «Mis noches». */
GR.abiertas={vol:true};
function resumenInfo(pn,D){
  var DOT=GN_DOTACION_MIN, ok=D.cov.filter(function(c){ return c.completa; }).length;
  pn.innerHTML='<p class="sub">Los integrantes de cada día están ordenados según la precedencia oficial de la Compañía. La precedencia administrativa no implica mando operativo.</p><p class="sub"><b>'+ok+' de '+D.cov.length+' noches completas</b> (cada una: '+DOT.voluntarios+' voluntarios + '+DOT.conductor+' maquinista + '+DOT.obac+' OBAC).</p><div class="gr-lista">'+D.cov.map(function(c){
    var n=nombreNoche(c.f), ordenados=c.vol.slice().sort(function(a,b){return porPrec(porId(a),porId(b));}), listado=ordenados.map(function(id,i){return '<div class="gr-nc-fila"><small>'+(i+1)+'.</small> '+E(corto(porId(id)))+'</div>';}).join(''); return '<div class="gr-nc'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(n.w)+'</b><i>'+E(n.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+c.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+'</em>':'')+(c.completa?'<span class="gr-chip verde">Completa</span>':'<span class="gr-chip rojo">Incompleta</span>')+'</div><div class="gr-nc-fila">🚒 '+(c.maq[0]?'<b>'+E(corto(porId(c.maq[0].id)))+'</b>':'<span class="falta">falta</span>')+' · 🎧 '+(c.obac[0]?'<b>'+E(corto(porId(c.obac[0].id)))+'</b>':'<span class="falta">falta</span>')+'</div>'+listado+(c.empate?'<div class="gr-nc-fila"><small class="gr-falta">⚠ Hay voluntarios sin posición en la lista de precedencia: el OBAC lo confirma el Teniente 3°.</small></div>':'')+'</div></div>'; }).join("")+'</div><button type="button" class="btn secondary gr-grande" id="irGestionar">Gestionar la guardia</button>';
  var g=$("irGestionar"); if(g) g.onclick=function(){ ponerVista("gestion"); window.__mostrarPestana("guardia"); };
}
function pintarInicioRoles(){
 var box=$("inicioRoles"),D=GR.Dmi,m=miembro();if(!box)return;
 if(!m||!D||!D.p||D.error||!D.S){box.innerHTML="";return;}
 if(D.revision&&D.revision.estado==="aprobada"){box.innerHTML="";return;}
 box.innerHTML='<section class="card gn-inicio-inscripcion" aria-label="Mis días de guardia"><div id="gnInicioVol"></div></section>';
 panelVol($("gnInicioVol"),D);
}

function estadoCandadoInscripcion(D){
 if(!D||!D.p)return "";
 var cerrado=Date.now()>=gnInsCierreMs(D.p),aprobada=!!(D.revision&&D.revision.estado==="aprobada");
 var titulo=cerrado?"🔒 Inscripción cerrada":"🔓 Inscripción abierta";
 var detalle=cerrado?"Plazo finalizado. Los voluntarios no pueden cambiar sus noches; el Teniente Tercero conserva la gestión operativa.":"Los voluntarios pueden inscribirse hasta el cierre programado.";
 return '<div role="status" class="gr-nota info" style="margin:10px 0;overflow-wrap:anywhere"><span aria-hidden="true">'+(cerrado?'🔒':'🔓')+'</span><p><b>'+titulo+'</b><br>'+detalle+(aprobada?' La semana está aprobada.':'')+'</p></div>';
}
function selectorSemana(D){
  if(GR.vista!=="gestion") return "";
  var lista=D.lista||[], ahora=Date.now();
  var visibles=lista.filter(semanaVigente48);
  var anteriores=lista.filter(function(x){return !visibles.some(function(v){return v.inicio===x.inicio;});}).sort(function(a,b){return b.inicio.localeCompare(a.inicio);});
  var buscar='<label class="rv-lbl" for="grBuscar">Buscar otra semana (guardias anteriores)</label><select id="grBuscar" class="rv-sel"><option value="">Elegir una semana…</option>'+anteriores.map(function(x){return '<option value="'+E(x.inicio)+'"'+(GR.buscada&&D.p&&x.inicio===D.p.inicio?" selected":"")+'>'+E(gnFmt(x.inicio))+' → '+E(gnFmt(gnAdd(x.inicio,7)))+'</option>';}).join("")+'</select><p class="sub" id="grBuscarMsg" role="status"></p>';
  if(!visibles.length) return '<p class="sub">No hay guardias recientes. Elige una semana anterior.</p>'+buscar;
  return '<label class="rv-lbl" for="grSemana">Semana que gestionas</label><select id="grSemana" class="rv-sel">'+visibles.map(function(x){return '<option value="'+E(x.inicio)+'"'+(D.p&&x.inicio===D.p.inicio?" selected":"")+'>'+E(gnFmt(x.inicio))+' → '+E(gnFmt(gnAdd(x.inicio,7)))+'</option>';}).join("")+'</select>'+buscar;
}
function cabecera(D){
  var m=D.m, p=D.p;
  var sem=p?('Semana '+E(gnFmt(p.inicio))+' → '+E(gnFmt(gnAdd(p.inicio,7)))+' · '+HORARIOS.def+' (domingo '+HORARIOS.dom+') a '+HORARIOS.fin):'';
  return '<div class="gr-quien"><img class="gr-foto" src="'+E(fotoVoluntario(m))+'" alt=""><div><strong>'+E(nombreCompleto(m))+'</strong><span>'+E(sem||"Sin semana abierta")+' · solo presencial</span></div></div>'+selectorSemana(D);
}
function pintarTarjeta(){
  if(guardiaActiva()&&esMando(miembro())){GR.vista="gestion";$("panel-guardia").setAttribute("data-vista","gestion");if(GR.tab==="mis")GR.tab="info";}
  var box=$("gnRolCard"), D=GR.D; if(!box||!D) return;
  if(GR.vista!=="gestion"){box.innerHTML="";return;}
  var tabs=tabsPermitidas(D.m,D.abierto); if(tabs.indexOf(GR.tab)<0) GR.tab=tabs[0]||"mis";
  var html='<h2>'+(GR.vista==="gestion"?"Gestión de guardia":"Mi guardia nocturna")+'</h2>'+(GR.vista==='gestion'?selectorSemana(D):cabecera(D));
  if(GR.vista==='gestion')html+=estadoCandadoInscripcion(D);
  if(GR.vista==="gestion"&&(esTenienteTercero(D.m)||esAdminGuardia(D.m)))html+='<div class="gr-nota info"><p><b>Administrador / Teniente Tercero:</b> revisa las siete noches en <b>Revisión y aprobación</b>. Allí encontrarás «Modificar dotación / registrar novedad» y «Aprobar guardias de la semana». La aprobación no acredita asistencia.</p></div>';
  if(!tabs.length) html+='<div class="empty">Esta parte la gestionan el Capitán, el Teniente 3° y el administrador.</div>';
  if(tabs.length>1) html+='<div class="gr-tabs" role="tablist">'+tabs.map(function(t){ return '<button type="button" role="tab" class="gr-tab'+(t===GR.tab?" on":"")+'" data-gr-tab="'+t+'" aria-selected="'+(t===GR.tab)+'"><span aria-hidden="true">'+GR_TABS[t][1]+'</span>'+GR_TABS[t][0]+'</button>'; }).join("")+'</div>';
  if(tabs.length) html+='<div id="grPanel"></div>';
  box.innerHTML=html;
  pintarPanel();
}
function pintarPanel(){
  var pn=$("grPanel"), D=GR.D; if(!pn||!D) return;
  if(GR.tab==="mis"){ panelMis(pn,D); return; }
  if(!D.p){ pn.innerHTML='<div class="empty">No hay una semana publicada. Selecciona un miércoles en el calendario para prepararla.</div>'; return; }
  if(D.error||!D.S){ pn.innerHTML='<div class="empty">No se pudo leer la semana. <button type="button" class="btn small secondary" id="grReintentar">Reintentar</button></div>'; var r=$("grReintentar"); if(r) r.onclick=function(){ grRender(true); }; return; }
  if(GR.tab==="vol") panelVol(pn,D); else if(GR.tab==="info") panelInfo(pn,D); else if(GR.tab==="rev") panelRev(pn,D); else if(GR.tab==="rep") panelRep(pn,D); else panelRol(pn,D,GR.tab);
}

/* ---------- Voluntario ---------- */
function filaCupos(c){
  var DOT=GN_DOTACION_MIN, n=c.vol.length, ok=n>=DOT.voluntarios;
  var gente=""; for(var i=0;i<DOT.voluntarios;i++) gente+='<i class="gr-p'+(i<n?" on":"")+'"></i>';
  return '<span class="gr-gente" aria-hidden="true">'+gente+'</span><span class="gr-cupo'+(ok?" ok":"")+'">'+n+' / '+DOT.voluntarios+' voluntarios'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+'</span>'
    +'<span class="gr-mini">MAQ: '+c.maq.length+' · OBAC: '+c.obac.length+'</span>';
}
/* Fin de guardia en hora local de Villarrica: 06:00 del día siguiente.
   Se oculta la tarjeta, no se borra el turno ni su acreditación. */
function guardiaTurnoPendiente(fecha){
 /* Compara la fecha y hora civiles de Chile; no depende de la zona horaria del teléfono. */
 var dia=new Date(fecha+"T12:00:00Z");
 if(!Number.isFinite(dia.getTime()))return false;
 dia.setUTCDate(dia.getUTCDate()+1);
 var limite=dia.toISOString().slice(0,10)+"T06:00";
 var partes=new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
 var val=function(k){var x=partes.find(function(p){return p.type===k;});return x?x.value:"";};
 var ahora=val("year")+"-"+val("month")+"-"+val("day")+"T"+val("hour")+":"+val("minute");
 return ahora<limite;
}
function panelVol(pn,D){
 var who=D.who,saved=Array.isArray(D.S.vol[who])?D.S.vol[who]:[],ck=D.p.inicio+":"+who;
 if(GN_INS_CLAVE!==ck){GN_INS_CLAVE=ck;GN_INS_SEL=new Set(saved);}
 var sel=GN_INS_SEL,aprobada=!!(D.revision&&D.revision.estado==="aprobada"),nochesAprobadas=D.revision&&D.revision.noches||{};
 var asignadas=new Set(Object.keys(nochesAprobadas).filter(function(f){var n=nochesAprobadas[f];return n&&(n.obac===who||n.maq===who||(n.vol||[]).includes(who));}));
 var editable=D.abierto&&!aprobada,pendientes=new Set(saved),proximas=Array.from(asignadas).filter(guardiaTurnoPendiente),soloAsignados=aprobada?proximas.length>0:pendientes.size>0;
 var h='<h3 class="gr-t">'+(soloAsignados?(aprobada?'Mis guardias aprobadas':'Mis noches · Pendientes de revisión') :aprobada?'Sin próximas guardias':'Elige tus noches · '+(editable?'Semana abierta':'En revisión'))+'</h3><p class="sub">Horario de guardia: 22:45 a 06:00</p>'+(aprobada?'':soloAsignados?'':'<p class="sub">Debes elegir mínimo 2 noches.</p>');
 if(soloAsignados&&!aprobada)h+='<div role="status" style="background:#facc15;color:#422006;border:2px solid #ca8a04;border-radius:8px;padding:12px;margin:10px 0;font-weight:800;text-align:center;overflow-wrap:anywhere">ENVIADOS A REVISIÓN DEL TENIENTE TERCERO</div>';
 h+='<div class="gu-dias"'+(soloAsignados?' style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,115px),1fr));gap:10px;width:100%;min-width:0"':'')+'>';
 h+=D.cov.filter(function(c){return aprobada?(asignadas.has(c.f)&&guardiaTurnoPendiente(c.f)):!soloAsignados||pendientes.has(c.f);}).map(function(c){var nn=nombreNoche(c.f),selected=sel.has(c.f),ids=new Set(c.vol.concat(c.maq.map(function(x){return x.id;}),c.obac.map(function(x){return x.id;})));var pendiente=!aprobada&&pendientes.has(c.f),confirmada=aprobada&&asignadas.has(c.f),disponible=editable&&!pendiente&&!selected;return '<button type="button" class="gu-dia'+(selected||confirmada?' elegido':'')+'" data-gr-vol="'+c.f+'" aria-pressed="'+selected+'" '+(!editable?'disabled':'')+' style="'+(confirmada?'background:#991b1b;color:#fff;border:3px solid #ef4444;opacity:1;min-width:0;width:100%;white-space:normal;overflow-wrap:anywhere;padding:12px 6px;':pendiente?'background:#facc15;color:#422006;border:3px solid #ca8a04;opacity:1;min-width:0;width:100%;white-space:normal;overflow-wrap:anywhere;padding:12px 6px;':disponible?'background:#166534;color:#fff;border:3px solid #22c55e;opacity:1;min-width:0;width:100%;white-space:normal;overflow-wrap:anywhere;padding:12px 6px;':'')+'"><b>'+E(nn.w)+'</b><span>'+E(nn.d)+'</span><span>'+ids.size+' insc.</span>'+(confirmada?'<small style="display:block;font-weight:800">'+(nochesAprobadas[c.f]&&String(nochesAprobadas[c.f].obac)===String(who)?'ERES OBAC · ':'')+'✓ TU GUARDIA APROBADA</small>':pendiente?'<small style="display:block;font-weight:800">🔒 PENDIENTE T3</small>':'')+'</button>';}).join('')+'</div>';
 if(editable)h+='<div id="giAviso" role="status" aria-live="polite"></div><button type="button" class="btn" id="giConfirmar">'+(soloAsignados?'Actualizar noches elegidas':'Enviar a revisión')+' ('+sel.size+')</button>';
 else h+='<p class="sub">'+(aprobada?'Rojo: tus guardias aprobadas pendientes. Cada tarjeta desaparece al finalizar su turno a las 06:00; la asistencia la aprueba un oficial autorizado.':'Tus días permanecen amarillos mientras esperan revisión del Teniente Tercero.')+'</p>';
 pn.innerHTML=h;
 pn.querySelectorAll('[data-gr-vol]').forEach(function(b){b.onclick=function(){var f=b.dataset.grVol;if(sel.has(f))sel.delete(f);else sel.add(f);panelVol(pn,D);};});
 var b=$("giConfirmar");if(b)b.onclick=function(){gnInsConfirmar(D.p,who);};
}

/* ---------- Maquinista / OBAC ---------- */
function panelRol(pn,D,kind){
  var who=D.who, esM=kind==="maq", sel=GR.sel[kind]||new Set(), otroK=esM?"obac":"maq";
  var DOT=GN_DOTACION_MIN;
  var rango=rangoObac(D.m), prev=vistaPrueba(D.m,kind);
  var h=prev?'<div class="gr-nota info"><span aria-hidden="true">👁</span><p><b>Vista de prueba.</b> Solo para ver cómo se ve esta tarjeta en el teléfono. No inscribe nada.</p></div>':'';
  h+='<h3 class="gr-t">Mis noches como '+(esM?"maquinista":"OBAC")+'</h3>';
  h+='<div class="gr-nota '+(esM?"maq":"obac")+'"><span aria-hidden="true">'+(esM?"🚒":"🎧")+'</span><p>Solo deben inscribirse '+(esM?"los maquinistas":"los OBAC según la precedencia")+' y su disponibilidad. Se requiere '+(esM?DOT.conductor+" maquinista":DOT.obac+" OBAC")+' por noche.'+(!esM?' <b>Eliges UNA noche como OBAC (obligatoria); las demás las tomas como voluntario.</b>':'')+(!esM&&rango!=null?' <b>Tu lugar en la precedencia: N° '+rango+'.</b>':'')+'</p></div>';
  h+='<div class="gr-tabla" role="table"><div class="gr-tr gr-th" role="row"><span>Día</span><span>Mi disponibilidad</span><span>'+(esM?"Maquinista":"OBAC")+'</span></div>'
  +D.cov.map(function(c){
    var nn=nombreNoche(c.f), lista=esM?c.maq:c.obac, tit=lista[0]||null, soyTit=!!tit&&tit.id===who, enLista=lista.some(function(x){ return x.id===who; });
    var comoVol=tiene(D.S.vol[who],c.f), comoOtro=tiene(D.S[otroK][who],c.f);
    var marcada=sel.has(c.f), ocupada=esM&&!!tit&&!tit.respaldo&&!soyTit, suplente=esM&&tiene(D.S.reserva&&D.S.reserva[who],c.f), bloq=prev||!D.abierto||comoVol||comoOtro||ocupada||(esM&&soyTit);
    var chip=ocupada?'<span class="gr-chip rojo">OCUPADO. ELIGE OTRO DÍA</span>':comoVol?'<span class="gr-chip gris">Ya voluntario</span>':comoOtro?'<span class="gr-chip gris">Ya '+(esM?"OBAC":"maquinista")+'</span>':marcada?'<span class="gr-chip azul">Seleccionado</span>':'<span class="gr-chip verde">Disponible</span>';
    var cupo=tit&&!tit.respaldo?('<b>1 / 1</b> <small>(completo)</small><small class="gr-tit">'+(soyTit?"Titular: tú":"Titular: "+E(corto(porId(tit.id))))+'</small>'):tit&&tit.respaldo?'<b>0 / 1</b><small class="gr-tit">Respaldo provisional: '+E(corto(porId(tit.id)))+'</small>':'<b>0 / 1</b><small class="gr-tit falta">Falta '+(esM?"maquinista":"OBAC")+'</small>';
    return '<label class="gr-tr'+(marcada?" on":"")+'" role="row"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><span class="gr-chk"><input type="checkbox" data-gr-rol="'+c.f+'"'+(marcada?" checked":"")+(bloq?" disabled":"")+' aria-label="'+E(nn.w+" "+nn.d)+'">'+chip+'</span><span class="gr-cupo-c">'+cupo+'</span></label>'+(esM&&ocupada?'<div style="padding:4px 6px 12px"><button type="button" class="btn small secondary" data-gr-suplente="'+c.f+'"'+(prev||!D.abierto?" disabled":"")+' >'+(suplente?"Retirar disponibilidad de suplente":"Ofrecerme como suplente")+'</button><small class="sub" style="display:block">Esta disponibilidad no te inscribe como titular ni cuenta como noche cumplida.</small></div>':"");
  }).join("")+'</div>';
  var n=sel.size;
  h+='<p class="gr-aviso-n">Tienes '+n+' noche'+(n===1?"":"s")+' seleccionada'+(n===1?"":"s")+'.</p>';
  if(D.abierto&&!prev) h+='<button type="button" class="btn gr-grande" id="grGuardar-'+kind+'">Guardar selección</button><div class="status-msg" id="grMsg-'+kind+'"></div>';
  pn.innerHTML=h;
  pn.querySelectorAll("[data-gr-rol]").forEach(function(i){ i.onchange=function(){ if(kind==="obac"){ sel.clear(); if(i.checked) sel.add(i.dataset.grRol); } else if(i.checked) sel.add(i.dataset.grRol); else sel.delete(i.dataset.grRol); GR.sel[kind]=sel; panelRol(pn,D,kind); }; });
  var g=$("grGuardar-"+kind); if(g) g.onclick=function(){ guardarRol(D,kind); };
  pn.querySelectorAll("[data-gr-suplente]").forEach(function(b){ b.onclick=function(){ cambiarSuplente(D,b.dataset.grSuplente,b); }; });
}
async function cambiarSuplente(D,fecha,boton){
  if(!D.p||!D.abierto||!esMaquinista(D.m)||!D.noches.includes(fecha)||vistaPrueba(D.m,"maq")) return;
  boton.disabled=true;
  var key="guardia-maq-reserva:"+D.p.inicio+":"+D.who;
  try{
    // Disponibilidad de respaldo separada de la reserva titular y de la asistencia.
    var lectura=await sGetV(key,[]);
    var registros=regs(lectura.value), ya=registros.some(function(x){return x.f===fecha;});
    var siguiente=ya?registros.filter(function(x){return x.f!==fecha;}):registros.concat([{f:fecha,t:new Date().toISOString()}]);
    await sSet(key,siguiente,{ifVersion:lectura.version});
    if(typeof gnInsToast==="function") gnInsToast(ya?"Disponibilidad de suplente retirada.":"Disponibilidad de suplente anotada. No eres titular.");
    await grRender(true);
  }catch(e){
    boton.disabled=false;
    if(typeof gnInsToast==="function") gnInsToast("No se guardó tu disponibilidad. Recarga y reintenta.");
  }
}
async function guardarRol(D,kind){
  // Validar nuevamente al guardar: la pantalla pudo quedar abierta cuando venció el plazo.
  if(!D||!D.p||Date.now()>=gnInsCierreMs(D.p)||D.revision&&D.revision.estado==="aprobada"){
    var aviso=$("grMsg-"+kind);if(aviso){aviso.textContent="🔒 Inscripción cerrada. No se guardaron cambios.";aviso.classList.add("err");}
    return;
  }
  if(vistaPrueba(D.m,kind)) return;
  var msg=$("grMsg-"+kind), sel=GR.sel[kind]||new Set(), previos=regs(D.S[kind][D.who]), ahora=new Date().toISOString();
  var recs=[...sel].sort().map(function(f){ var p=previos.filter(function(x){ return x.f===f; })[0]; return {f:f,t:(p&&p.t)||ahora}; });
  if(kind==="maq"){
    // Una solicitud por fecha; cada reserva es atómica y escribe en los registros
    // institucionales existentes. No sobrescribe otras noches ya elegidas.
    var nuevas=[...sel].sort().filter(function(f){return !previos.some(function(x){return x.f===f;});});
    if(!nuevas.length){ msg.textContent="Elige una noche libre distinta de las que ya tienes."; return; }
    msg.classList.remove("err");msg.textContent="Reservando noche(s)…";
    var ganadas=[],fallidas=[];
    for(var i=0;i<nuevas.length;i++){
      var f=nuevas[i],resultado=null;
      try{
        var http=await fetch("/api/guardia/reserva-titular",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inicio:D.p.inicio,fecha:f,personaId:D.who})});
        resultado=await http.json();
        if(!http.ok||!resultado.ok){
          fallidas.push({f:f,codigo:resultado.codigo||"ERROR_DE_RED"});
          continue;
        }
        ganadas.push(f);
      }catch(error){fallidas.push({f:f,codigo:"ERROR_DE_RED"});}
    }
    // El mínimo de dos noches se calcula incluyendo otras funciones confirmadas.
    try{
      var conf=D.S.conf[D.who];
      if(conf&&!conf.justificacion&&ganadas.length){
        var maqActual=await sGet("guardia-maq:"+D.p.inicio+":"+D.who,[]);
        var total={};
        regs(D.S.vol[D.who]).concat(regs(D.S.obac[D.who])).concat(regs(maqActual)).forEach(function(x){total[x.f]=true;});
        var cumple=Object.keys(total).length>=GN_NOCHES_MIN;
        if(cumple!==!!conf.cumple) await sSet("guardia-confirmacion:"+D.p.inicio+":"+D.who,Object.assign({},conf,{cumple:cumple}));
      }
    }catch(error){fallidas.push({f:"confirmación",codigo:"REVISAR_CONFIRMACION"});}
    var txt=ganadas.length?"Reservadas "+ganadas.length+" noche(s). ":"";
    if(fallidas.length) txt+=fallidas.map(function(x){
      var fecha=x.f==="confirmación"?"Confirmación":nombreNoche(x.f).w+" "+nombreNoche(x.f).d;
      var causa=x.codigo==="OCUPADO"?"OCUPADO. ELIGE OTRO DÍA":x.codigo==="YA_INSCRITO_COMO_VOLUNTARIO"?"Ya inscrito como voluntario":x.codigo==="INSCRIPCION_CERRADA"?"Inscripción cerrada":"No se pudo reservar ("+x.codigo+")";
      return fecha+": "+causa;
    }).join(" · ");
    if(typeof gnInsToast==="function") gnInsToast(txt||"No se pudo reservar");
    GR.sel.maq=null;
    await grRender(true);
    return;
  }

  if(kind==="obac"&&recs.length>1){ msg.textContent="Como OBAC es una sola noche por persona; las demás noches las tomas como voluntario."; msg.classList.add("err"); return; }
  if(kind==="obac"&&rangoObac(D.m)!=null&&!recs.length){ msg.textContent="Tu noche como OBAC es obligatoria: elige al menos una."; msg.classList.add("err"); return; }
  var otroK=kind==="maq"?"obac":"maq";
  var choca=recs.filter(function(r){ return tiene(D.S.vol[D.who],r.f)||tiene(D.S[otroK][D.who],r.f); });
  if(choca.length){ msg.textContent="Una noche solo puede tener un rol por persona."; msg.classList.add("err"); return; }
  msg.classList.remove("err"); msg.textContent="Guardando…";
  try{
    await sSet("guardia-"+kind+":"+D.p.inicio+":"+D.who,recs);
    var conf=D.S.conf[D.who];
    if(conf&&!conf.justificacion){
      var u={}; regs(D.S.vol[D.who]).concat(regs(D.S[otroK][D.who])).concat(recs).forEach(function(x){ u[x.f]=1; });
      var cumple=Object.keys(u).length>=GN_NOCHES_MIN;
      if(cumple!==!!conf.cumple) await sSet("guardia-confirmacion:"+D.p.inicio+":"+D.who,Object.assign({},conf,{cumple:cumple}));
    }
    msg.textContent="Guardado ✓ "+(typeof horaCorta==="function"?horaCorta():"");
    if(typeof gnInsToast==="function") gnInsToast("Selección guardada: "+recs.length+" noche(s)");
    GR.sel[kind]=null; await grRender(true);
  }catch(e){ msg.textContent=(e&&e.message)||"No se pudo guardar."; msg.classList.add("err"); }
}

/* ---------- Información (Capitán, Teniente 3° y administrador) ---------- */
function alertaConductor(id){
 if(!id)return '<div role="alert" style="margin:8px 0;padding:10px;border:2px solid #dc2626;border-radius:8px;background:#450a0a;color:white;font-weight:800">⚠ SIN MAQUINISTA · Teniente Tercero: asignar cuartelero de apoyo</div>';
 var m=porId(id), nombre=m?corto(m):String(id);
 if(/david\\s+briones/i.test(nombre))return '<div role="status" style="margin:8px 0;padding:10px;border:2px solid #16a34a;border-radius:8px;background:#14532d;color:white;font-weight:800">✓ CUARTELERO DE APOYO ASIGNADO · Pendiente de acreditación</div>';
 return '';
}
async function historialInscripciones(D){
 var out=$("grHistInsRes");if(!out)return;
 out.textContent="Consultando inscripciones históricas…";
 try{
  var planes=(await gnPlanes()).filter(function(p){return p&&p.inicio&&p.confirmado!==false&&p.estado!=="borrador"&&Date.now()>=gnInsCierreMs(p);});
  var semanas=planes.slice().sort(function(a,b){return a.inicio.localeCompare(b.inicio);});
  var datos=await Promise.all([leerPrefijo("guardia-inscripcion:"),leerPrefijo("guardia-maq:")]);
  var ins=new Set(datos[0].map(function(x){return x.key;})),maq=new Set(datos[1].map(function(x){return x.key;}));
  var activos=ROSTER.filter(function(x){return x.activo!==false;});
  var filas=activos.map(function(m){
   var id=String(m.id),si=0,no=0,meses={};
   semanas.forEach(function(p){
    var k=p.inicio+":"+id;
    var participo=ins.has("guardia-inscripcion:"+k)||maq.has("guardia-maq:"+k);
    // Solo se cuenta inscripción con noches efectivamente elegidas.
    var v=datos[0].find(function(x){return x.key==="guardia-inscripcion:"+k;});
    var t=datos[1].find(function(x){return x.key==="guardia-maq:"+k;});
    participo=!!((v&&Array.isArray(v.value)&&v.value.length)||(t&&regs(t.value).length));
    if(participo)si++;else no++;
    var mes=p.inicio.slice(0,7),x=meses[mes]||(meses[mes]={si:0,no:0});x[participo?"si":"no"]++;
   });
   return {m:m,si:si,no:no,meses:meses};
  });
  var tot=filas.reduce(function(a,x){return a+x.no;},0);
  var html='<h4>Historial de inscripción · '+semanas.length+' semana(s) cerrada(s)</h4><p class="sub">Solo semanas con convocatoria cerrada. No mide asistencia ni cumplimiento de guardias.</p>';
  if(!semanas.length){out.innerHTML=html+'<p>No hay convocatorias cerradas disponibles.</p>';return;}
  html+='<details class="gr-det"><summary>Semanas consultadas: '+semanas.length+'</summary>'+semanas.map(function(p){return '<p>'+E(p.inicio)+'</p>';}).join("")+'</details>';
  html+='<div class="gr-lista">'+filas.sort(function(a,b){return b.no-a.no;}).map(function(x){
   var meses=Object.keys(x.meses).sort().reverse().map(function(k){var y=x.meses[k];return k+': '+y.no+' sin inscripción / '+(y.si+y.no)+' semanas';}).join(' · ');
   return '<div class="gr-nc-fila"><b>'+E(nombreCompleto(x.m))+'</b><div>'+x.si+' inscritas · '+x.no+' sin inscripción · '+Math.round(100*x.si/semanas.length)+'% de inscripción</div><small>'+E(meses)+'</small></div>';
  }).join("")+'</div><p class="sub">Consulta informativa. No se envían avisos ni se crean sanciones.</p>';
  out.innerHTML=html;
 }catch(e){out.textContent="No se pudo consultar el historial. No se modificaron registros.";}
}
function panelInfo(pn,D){
  var DOT=GN_DOTACION_MIN, completas=D.cov.filter(function(c){ return c.completa; }).length;
  var activos=ROSTER.filter(function(x){ return x.activo!==false; });
  var sinConf=activos.filter(function(x){ var id=String(x.id); return !regs(D.S.maq[id]).length&&!(Array.isArray(D.S.vol[id])&&D.S.vol[id].length); });
  var h='<h3 class="gr-t">Cobertura de la semana</h3><div class="gr-nota info"><span aria-hidden="true">👥</span><p>Cada noche debe contar con <b>'+DOT.voluntarios+' voluntarios + '+DOT.conductor+' maquinista + '+DOT.obac+' OBAC</b>. El OBAC se calcula solo: es el inscrito de mayor precedencia de esa noche (si no hay maquinista, el Capitán pasa a maquinista y el OBAC es el siguiente). Los voluntarios de más son refuerzos. <b>'+completas+' de '+D.cov.length+' noches completas.</b></p></div>';
  // Tarjetas de cobertura por noche retiradas de esta vista informativa: la programación sigue en Gestión de guardias.
  h+='<details class="gr-det"><summary>No se inscribieron: '+sinConf.length+' voluntario'+(sinConf.length===1?"":"s")+'</summary><div class="gr-lista">'+(sinConf.length?sinConf.map(function(x){var nombre=[x.nombre,x.apellidoPaterno,x.apellidoMaterno].filter(Boolean).join(" ");return '<div class="gr-nc-fila" style="display:flex;align-items:center;gap:10px;min-width:0"><img src="'+E(fotoVoluntario(x))+'" alt="" loading="lazy" style="width:36px;height:36px;min-width:36px;border-radius:50%;object-fit:cover" onerror="this.style.display=\'none\'"><span style="min-width:0"><b>'+E(nombre||corto(x))+'</b><small class="sub" style="display:block">Sin inscripción registrada esta semana</small></span></div>';}).join(""):'<p>Todos registraron inscripción esta semana.</p>')+'</div></details>';
  h+='<div class="gr-nota info"><p><b>Estadística de inscripción:</b> '+(activos.length-sinConf.length)+' de '+activos.length+' voluntarios activos se inscribieron ('+(activos.length?Math.round(100*(activos.length-sinConf.length)/activos.length):0)+'%). '+sinConf.length+' no se inscribieron. Esto no equivale a inasistencia ni incumplimiento.</p></div>';
  h+='<button type="button" class="btn secondary" id="grHistIns">Consultar historial de inscripciones</button><div id="grHistInsRes" aria-live="polite"></div>';
  h+='<details class="gr-det" id="hrDet"><summary>Horario de las noches</summary><p>Por defecto: '+HORARIOS.def+' (domingo '+HORARIOS.dom+') hasta '+HORARIOS.fin+'. Cambia la hora de inicio de una noche si hace falta.</p><div class="gr-lista">'+D.noches.map(function(f){ var n=nombreNoche(f); return '<label class="hr-fila"><span><b>'+E(n.w)+'</b> '+E(n.d)+'</span><input type="time" data-hr="'+f+'" value="'+E(horaNoche(f))+'"></label>'; }).join("")+'</div><label class="hr-perm"><input type="checkbox" id="hrPerm"> Dejar estas horas como habituales (domingo y resto) para las semanas siguientes</label><button type="button" class="btn gr-grande" id="hrGuardar">Guardar horario</button><div class="status-msg" id="hrMsg"></div></details>';
  h+='<p class="gr-nota-pie">Este resumen es solo informativo. La ODD y los cambios los gestionan los oficiales desde Oficiales.</p>';
  pn.innerHTML=h;
  var hi=$("grHistIns"); if(hi) hi.onclick=function(){ historialInscripciones(D); };
  var hg=$("hrGuardar"); if(hg) hg.onclick=function(){ guardarHorario(D); };
}
async function guardarHorario(D){
  var msg=$("hrMsg"), mapa={}, base={};
  document.querySelectorAll("[data-hr]").forEach(function(i){ var f=i.dataset.hr, v=i.value; if(!/^\d\d:\d\d$/.test(v)) return; var dom=new Date(f+"T12:00").getDay()===0; if(v!==(dom?HORARIOS.dom:HORARIOS.def)) mapa[f]=v; base[f]=v; });
  msg.classList.remove("err"); msg.textContent="Guardando…";
  try{
    var k="guardia-horarios:"+D.p.inicio, cur=await sGetV(k,null);
    await sSet(k,mapa,{ifVersion:Number.isInteger(cur.version)?cur.version:0});
    if($("hrPerm")&&$("hrPerm").checked){
      var nv=Object.assign({},HORARIOS), dom=D.noches.filter(function(f){ return new Date(f+"T12:00").getDay()===0; })[0], otra=D.noches.filter(function(f){ return new Date(f+"T12:00").getDay()!==0; })[0];
      if(dom) nv.dom=base[dom]; if(otra) nv.def=base[otra];
      var c2=await sGetV("guardia-horarios:v1",null); await sSet("guardia-horarios:v1",nv,{ifVersion:Number.isInteger(c2.version)?c2.version:0});
    }
    await cargarHorarios(); MN.cache=null;
    var ap=RV.doc&&RV.doc.estado==="aprobada";
    msg.textContent="Horario guardado."+(ap?" La dotación ya estaba aprobada: reábrela y vuelve a aprobar para que la guardia use la hora nueva.":" Rige al aprobar la dotación.");
  }catch(e){ msg.textContent=e&&e.conflicto?"Otra persona cambió el horario. Recarga e inténtalo de nuevo.":"No se pudo guardar."; msg.classList.add("err"); }
}


/* ---------- Revisión de la dotación (Capitán, Teniente 3° y administrador) ----------
   Antes de la ODD: el mando ve lo inscrito, corrige (agrega, quita o cambia voluntarios, maquinista y OBAC),
   ve el resultado y la lista de cambios, y aprueba. Al aprobar se actualizan las guardias de la semana
   (las mismas que usan informes y ODD). Todo cambio queda con quién, cuándo y qué.
   Clave: guardia-revision:<inicio> (la base conserva el historial de lo que se sobrescribe). */
var RV={clave:"",doc:null,ver:0,msg:"",err:false,ocupado:false};
function revKey(ini){ return "guardia-revision:"+ini; }
function propuesta(D){
  var b={}; D.cov.forEach(function(c){ b[c.f]={vol:c.vol.slice(),maq:c.maq[0]?c.maq[0].id:null,obac:c.obac[0]?c.obac[0].id:null}; }); return b;
}
function clonar(o){ return JSON.parse(JSON.stringify(o)); }
function nom(id){ var m=porId(id); return m?corto(m):"(sin nombre)"; }
async function revCargar(D){
  var r=await sGetV(revKey(D.p.inicio),null);
  RV.clave=D.p.inicio; RV.doc=r.value&&r.value.noches?r.value:null; RV.ver=Number.isInteger(r.version)?r.version:0;
}
async function revGuardar(D,doc){
  var k=revKey(D.p.inicio);
  await sSet(k,doc,{ifVersion:RV.doc?RV.ver:0});
  RV.doc=doc; var v=SVER.get(k); RV.ver=Number.isInteger(v)?v:RV.ver+1;
}
function revLog(doc,D,fecha,rol,accion,personaId,antesId){
  var m=D.m; doc.cambios.push({id:uid(),en:new Date().toISOString(),porId:String(m.id),por:corto(m),fecha:fecha,rol:rol,accion:accion,personaId:personaId||null,antesId:antesId||null});
}
function revQuitarRoles(n,id){ n.vol=n.vol.filter(function(x){ return x!==id; }); if(n.maq===id){n.maq=null;delete n.apoyoExterno;} if(n.obac===id) n.obac=null; }
function revAplicar(doc,D,op){
  var n=doc.noches[op.f]; if(!n) return;
  if(op.t==="addVol"){ revQuitarRoles(n,op.id); n.vol.push(op.id); revLog(doc,D,op.f,"vol","agrega",op.id); }
  else if(op.t==="delVol"){ n.vol=n.vol.filter(function(x){ return x!==op.id; }); revLog(doc,D,op.f,"vol","quita",op.id); }
  else if(op.t==="rol"){
    var antes=n[op.rol]; if(antes===(op.id||null)) return;
    if(op.id){ revQuitarRoles(n,op.id); n[op.rol]=op.id; revLog(doc,D,op.f,op.rol,antes?"cambia":"agrega",op.id,antes); }
    else{ n[op.rol]=null; revLog(doc,D,op.f,op.rol,"quita",null,antes); }
  }
  else if(op.t==="apoyoCuerpo"){
    if(!esTenienteTercero(D.m))throw new Error("Solo el Teniente Tercero puede programar al cuartelero.");
    window.GermaniaApoyoGuardia.asignar(n);revLog(doc,D,op.f,"maq","agrega",n.maq);
  }
  else if(op.t==="quitarPersona"){revQuitarRoles(n,op.id);revLog(doc,D,op.f,"vol","quita",op.id);}
  else if(op.t==="cambiarPersona"){
    var conductor=n.maq===op.id;revQuitarRoles(n,op.id);revQuitarRoles(n,op.reemplazo);
    if(conductor){if(!esMaquinista(porId(op.reemplazo)))throw new Error("Elige un maquinista habilitado.");n.maq=op.reemplazo;}else n.vol.push(op.reemplazo);
    revLog(doc,D,op.f,conductor?"maq":"vol","cambia",op.reemplazo,op.id);
  }
  else if(op.t==="moverPersona"){
    var destino=doc.noches[op.destino];if(!destino||op.destino===op.f)throw new Error("Selecciona otra noche.");
    var conductor=n.maq===op.id;if(conductor&&destino.maq)throw new Error("Esa noche ya tiene maquinista.");
    if(destino.vol.includes(op.id)||destino.maq===op.id||destino.obac===op.id)throw new Error("Ya está asignado esa noche.");
    revQuitarRoles(n,op.id);if(conductor){destino.maq=op.id;var apoyo=window.GermaniaApoyoGuardia&&window.GermaniaApoyoGuardia.buscar(op.id);if(apoyo)destino.apoyoExterno={id:apoyo.id,nombre:"David Briones",organismo:"Cuerpo de Bomberos",responsabilidad:"Maquinista de apoyo"};}else destino.vol.push(op.id);
    revLog(doc,D,op.f,"vol","quita",op.id);revLog(doc,D,op.destino,conductor?"maq":"vol","agrega",op.id);
  }

}
function revReordenar(n){if(n.apoyoExterno&&n.apoyoExterno.id!==n.maq)delete n.apoyoExterno;var ids=Array.from(new Set(n.vol.concat(n.obac?[n.obac]:[]))).filter(function(id){return id!==n.maq;});ids.sort(function(a,b){return porPrec(porId(a),porId(b));});n.obac=ids.shift()||null;n.vol=ids;}

function revCov(doc){
  var DOT=GN_DOTACION_MIN;
  return Object.keys(doc.noches).sort().map(function(f){
    var n=doc.noches[f], ver=window.GermaniaGuardiaReglas&&window.GermaniaGuardiaReglas.evaluarDotacion(n);
    var ok=!!(ver&&ver.completa), nada=!n.vol.length&&!n.maq&&!n.obac;
    return {f:f,n:n,completa:ok,nada:nada,refuerzos:Math.max(0,n.vol.length-DOT.voluntarios)};
  });
}
function revDiferencias(doc){
  var k=0; Object.keys(doc.noches).forEach(function(f){
    var a=doc.base[f]||{vol:[],maq:null,obac:null}, b=doc.noches[f];
    var A=a.vol.filter(function(x){ return b.vol.indexOf(x)<0; }).length, B=b.vol.filter(function(x){ return a.vol.indexOf(x)<0; }).length;
    k+=A+B+(a.maq!==b.maq?1:0)+(a.obac!==b.obac?1:0);
  }); return k;
}
var ROL_TXT={vol:"voluntario",maq:"maquinista",obac:"OBAC"};
function textoCambio(c){
  var n=nombreNoche(c.f||c.fecha), dia=n.w+" "+n.d, h=new Date(c.en).toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
  var q;
  if(c.rol==="obac"&&c.motivo&&c.motivo.indexOf("Reasignación automática")===0){
    return "<b>"+E(dia)+"</b> · OBAC recalculado: "+E(nom(c.antesId))+" → "+E(nom(c.personaId))+" · "+E(c.por)+" · "+E(h)+" · "+E(c.motivo);
  }
  if(c.accion==="agrega") q="agregó a <b>"+E(nom(c.personaId))+"</b> como "+ROL_TXT[c.rol];
  else if(c.accion==="quita") q="quitó a <b>"+E(nom(c.personaId||c.antesId))+"</b> ("+ROL_TXT[c.rol]+")";
  else if(c.accion==="cambia") q="cambió "+ROL_TXT[c.rol]+": <b>"+E(nom(c.personaId))+"</b> reemplaza a "+E(nom(c.antesId));
  else if(c.accion==="aprueba") return '<b>Aprobó la dotación</b> · '+E(c.por)+' · '+E(h);
  else if(c.accion==="reabre") return '<b>Reabrió la revisión</b> · '+E(c.por)+' · '+E(h);
  else return '<b>Rehízo la propuesta desde las inscripciones</b> · '+E(c.por)+' · '+E(h);
  return '<b>'+E(dia)+'</b> · '+q+' · '+E(c.por)+' · '+E(h);
}
async function panelRev(pn,D){
  if(!(esTenienteTercero(D.m)||esAdminGuardia(D.m))){pn.innerHTML="<p>Revisión exclusiva del Teniente Tercero y administrador.</p>";return;}
  if(RV.clave!==D.p.inicio||(RV.doc===null&&!RV.ocupado)){ pn.innerHTML='<p class="sub">Cargando…</p>'; try{ await revCargar(D); }catch(e){ pn.innerHTML='<div class="empty">No se pudo leer la revisión. <button type="button" class="btn small secondary" id="rvReint">Reintentar</button></div>'; var r=$("rvReint"); if(r) r.onclick=function(){ RV.clave=""; panelRev(pn,D); }; return; } }
  if(D.abierto){pn.innerHTML="<p>Cierra las inscripciones de esta semana antes de revisarla y aprobarla.</p>";return;}
  var doc=RV.doc, DOT=GN_DOTACION_MIN;
  if(!doc){
    pn.innerHTML='<h3 class="gr-t">Revisión de la dotación</h3><div class="gr-nota info"><span aria-hidden="true">🛠</span><p>Aquí revisas y corriges quién queda cada noche antes de la ODD. Parte de lo que se inscribió; cada cambio queda registrado.</p></div>'
      +'<button type="button" class="btn gr-grande" id="rvCrear">Crear borrador con lo inscrito</button><div class="status-msg" id="rvMsg"></div>';
    $("rvCrear").onclick=async function(){
      var b=propuesta(D), d={inicio:D.p.inicio,estado:"borrador",creadaEn:new Date().toISOString(),base:clonar(b),noches:clonar(b),cambios:[]};
      try{ await revGuardar(D,d); panelRev(pn,D); }catch(e){ var m=$("rvMsg"); m.textContent=e.conflicto?"Otra persona acaba de crear el borrador. Toca Pestaña Revisión de nuevo.":"No se pudo crear. Inténtalo de nuevo."; m.classList.add("err"); RV.clave=""; }
    };
    return;
  }
  var aprobada=doc.estado==="aprobada", cov=revCov(doc), completas=cov.filter(function(c){ return c.completa; }).length, dif=revDiferencias(doc);
  var ocup=function(f){ var n=doc.noches[f],o={}; n.vol.forEach(function(x){ o[x]=1; }); if(n.maq) o[n.maq]=1; if(n.obac) o[n.obac]=1; return o; };
  var activos=ROSTER.filter(function(x){ return x.activo!==false; }).sort(function(a,b){ return nombreCompleto(a).localeCompare(nombreCompleto(b),"es"); });
  var maqs=activos.filter(esMaquinista);
  var obacs=activos.slice().sort(porPrec); /* corrección manual del OBAC: cualquier voluntario, ordenado por precedencia */
  var h='<h3 class="gr-t">Revisión de la dotación</h3>';
  h+='<div class="gr-nota '+(aprobada?"maq":"info")+'"><span aria-hidden="true">'+(aprobada?"🔒":"🛠")+'</span><p>'+(aprobada?'<b>Aprobada</b> por '+E(doc.aprobadaPor)+' el '+E(new Date(doc.aprobadaEn).toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}))+'. Lista para la ODD. Para cambiar algo, reabre la revisión.':'<b>Borrador.</b> Corrige lo que haga falta y aprueba. '+completas+' de '+cov.length+' noches completas · '+dif+' cambio'+(dif===1?"":"s")+' sobre lo inscrito.')+'</p></div>';
  h+='<div class="gr-lista">'+cov.map(function(c){
    var nn=nombreNoche(c.f), o=ocup(c.f);
    var est=c.completa?'<span class="gr-chip verde">Completa</span>':c.nada?'<span class="gr-chip gris">Sin asignar</span>':'<span class="gr-chip rojo">Incompleta</span>';
    var personas=(c.n.maq?[{id:c.n.maq,rol:"Maquinista"}]:[]).concat(c.n.obac?[{id:c.n.obac,rol:"OBAC"}]:[],c.n.vol.map(function(id){return {id:id,rol:"Voluntario"};}));
    var chips=personas.map(function(x){var attr='data-rv-persona="'+c.f+'|'+E(x.id)+'"';return '<div class="gu-persona"><b>'+E(nom(x.id))+'</b><span>'+x.rol+' · '+(aprobada?'Aprobado':'Pendiente')+'</span>'+(aprobada?'':'<div class="gu-acciones" style="display:block;width:100%;max-width:100%"><button type="button" class="btn secondary" style="width:100%;max-width:100%;white-space:normal;overflow-wrap:anywhere" '+attr+' data-operacion="gestionar">Gestionar</button></div>')+'</div>';}).join('')||'<span class="falta">Sin asignar</span>';

    var optV='<option value="">+ Agregar voluntario</option>'+activos.filter(function(x){ return !o[String(x.id)]; }).map(function(x){ return '<option value="'+E(x.id)+'">'+E(corto(x))+'</option>'; }).join("");
    var optM=function(lista,cur,rol){ var l=lista.slice(); if(cur&&!l.some(function(x){ return String(x.id)===cur; })){ var m=porId(cur); if(m) l.unshift(m); } return '<option value="">— sin asignar —</option>'+l.map(function(x){ var id=String(x.id); var bloq=o[id]&&id!==cur&&rol!=="maq"; return '<option value="'+E(id)+'"'+(id===cur?" selected":"")+(bloq?" disabled":"")+'>'+(rol==="obac"&&rangoPrec(x)!=null?"N° "+rangoPrec(x)+" · ":"")+E(corto(x))+(bloq?" (ya asignado)":"")+'</option>'; }).join(""); };
    return '<div class="gr-nc rv'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><div class="gr-nc-body">'
      +'<div class="gr-nc-top"><b>'+c.n.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+est+'</div>'
      +'<div class="rv-chips">'+chips+'</div>'
      +(aprobada?'':'<button type="button" class="btn secondary" data-rv-novedad="'+c.f+'">Modificar dotación / registrar novedad</button>')
      +(aprobada?'':'<select class="rv-sel" data-rv-add="'+c.f+'" aria-label="Agregar voluntario el '+E(nn.w+" "+nn.d)+'">'+optV+'</select>')
      +'<label class="rv-lbl">🚒 Maquinista</label>'+(aprobada?'<div class="gr-nc-fila">'+(c.n.maq?'<b>'+E(nom(c.n.maq))+'</b>':'<span class="falta">falta</span>')+'</div>':'<select class="rv-sel" data-rv-rol="'+c.f+'|maq">'+optM(maqs,c.n.maq,"maq")+'</select>')
      +(!aprobada&&!c.n.maq?'<button type="button" class="btn secondary" data-rv-david="'+c.f+'">Programar a David Briones · cuartelero del Cuerpo</button>':'')
      +'<label class="rv-lbl">🎧 OBAC</label>'+(aprobada?'<div class="gr-nc-fila">'+(c.n.obac?'<b>'+E(nom(c.n.obac))+'</b>':'<span class="falta">falta</span>')+'</div>':'<div class="gr-nc-fila">'+E(nom(c.n.obac))+' · por precedencia</div>')
      +alertaConductor(c.n.maq)
       +(!c.completa&&!c.nada?'<small class="gr-falta">'+E(faltan({vol:c.n.vol,maq:c.n.maq?[1]:[],obac:c.n.obac?[1]:[]}))+'</small>':'')
      +'</div></div>';
  }).join("")+'</div>';
  /* Resultado (así quedará, en el orden de la ODD) */
  h+='<h3 class="gr-t">Resultado</h3><div class="rv-res" role="table"><div class="rv-r rv-h" role="row"><span>Día</span><span>Nombre</span><span>Cargo</span></div>'
   +cov.map(function(c){ var nn=nombreNoche(c.f), filas=[]; if(c.n.maq) filas.push([c.n.maq,"Maquinista"]); if(c.n.obac) filas.push([c.n.obac,"OBAC"]); c.n.vol.forEach(function(id){ filas.push([id,"Voluntario"]); });
     if(!filas.length) filas.push([null,""]);
     return filas.map(function(f,i){ return '<div class="rv-r" role="row"><span>'+(i===0?E(nn.w+" "+nn.d):"")+'</span><span>'+(f[0]?E(nom(f[0])):'<small class="falta">sin asignar</small>')+'</span><span>'+E(f[1])+'</span></div>'; }).join(""); }).join("")+'</div>';
  /* Cambios */
  var cam=doc.cambios.slice().reverse();
  h+='<details class="gr-det" '+(cam.length?"open":"")+'><summary>Cambios hechos: '+cam.length+'</summary>'+(cam.length?'<ul class="rv-cambios">'+cam.map(function(c){ return '<li>'+textoCambio(c)+'</li>'; }).join("")+'</ul>':'<p>Todavía no hay cambios.</p>')+'</details>';
  h+='<div class="status-msg'+(RV.err?" err":"")+'" id="rvMsg">'+E(RV.msg)+'</div>';
  if(aprobada) h+='<button type="button" class="btn secondary gr-grande" id="rvReabrir">Reabrir revisión</button>';
  else h+='<div class="gr-nota info"><p><b>Último paso del Teniente Tercero:</b> revisa las siete noches y aprueba la dotación. Esta aprobación no acredita asistencia.</p></div><button type="button" class="btn gr-grande" id="rvAprobar">✓ APROBAR GUARDIAS DE LA SEMANA</button><p class="gr-link"><a href="#" id="rvRehacer">Rehacer desde las inscripciones</a></p>';
  // La aprobación de la asistencia es una acción propia de los oficiales (Control Guardia Diaria), no parte de la aprobación semanal.
  pn.innerHTML=h;

  var guardarOp=async function(op){
    if(RV.ocupado) return; RV.ocupado=true; var nuevo=clonar(doc);
    try{revAplicar(nuevo,D,op);}catch(e){RV.msg=e.message;RV.err=true;RV.ocupado=false;panelRev(pn,D);return;}
    if(op.motivo && nuevo.cambios.length>doc.cambios.length){
      var registro=nuevo.cambios[nuevo.cambios.length-1];
      registro.motivo=op.motivo;registro.horaEfectiva=op.horaEfectiva;
    }
    Object.keys(nuevo.noches).forEach(function(f){
      var anterior=doc.noches[f]&&doc.noches[f].obac||null;
      revReordenar(nuevo.noches[f]);
      var actual=nuevo.noches[f].obac||null;
      if(anterior!==actual){
        revLog(nuevo,D,f,"obac",actual?(anterior?"cambia":"agrega"):"quita",actual,anterior);
        nuevo.cambios[nuevo.cambios.length-1].motivo="Reasignación automática por precedencia tras modificar la dotación";
      }
    });
    try{ await revGuardar(D,nuevo); RV.msg=""; RV.err=false; }
    catch(e){ RV.msg=e.conflicto?"Otra persona cambió la revisión mientras editabas. El cambio no se guardó; vuelve a abrir la semana para comparar.":"No se pudo guardar el cambio."; RV.err=true; try{ await revCargar(D); }catch(x){RV.msg+=" No se pudo recargar: vuelve a abrir la semana antes de guardar.";} }
    RV.ocupado=false; panelRev(pn,D);
  };
  pn.querySelectorAll('[data-rv-novedad]').forEach(function(b){b.onclick=function(){
    var f=b.dataset.rvNovedad,n=doc.noches[f],personas=n.vol.concat(n.obac?[n.obac]:[],n.maq?[n.maq]:[]);
    var opciones=personas.map(function(id){return '<option value="'+E(id)+'">'+E(nom(id))+(n.maq===id?' · Maquinista':n.obac===id?' · OBAC':' · Voluntario')+'</option>';}).join('');
    var modal=modalOdd('<h2>Registrar novedad de guardia</h2><p>'+E(gnFmt(f))+'</p><label for="rvSale">¿Quién sale?</label><select id="rvSale" class="rv-sel">'+opciones+'</select><label for="rvMotivo">¿Por qué?</label><select id="rvMotivo" class="rv-sel"><option>No se presentó</option><option>Se retiró durante el servicio</option><option>Motivo personal</option><option>Motivo de salud</option><option>Necesidad del servicio</option></select><label for="rvEntra">¿Quién reemplaza?</label><select id="rvEntra" class="rv-sel"><option value="">Sin reemplazante por ahora</option></select><label for="rvHora">Hora efectiva (HH:MM)</label><input id="rvHora" type="time" class="rv-sel" required><p class="sub">El OBAC se recalcula por precedencia entre los presentes. Una ausencia sin reemplazo puede dejar la dotación incompleta.</p><button type="button" class="btn" id="rvConfirmarNovedad">Guardar novedad</button><button type="button" class="btn secondary" id="rvCancelarNovedad">Cancelar</button>');
    if(!personas.length){modal.querySelector('#rvConfirmarNovedad').disabled=true;}
    var sale=modal.querySelector('#rvSale'),entra=modal.querySelector('#rvEntra'),hora=modal.querySelector('#rvHora');
    var now=new Date();hora.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    function refrescar(){
      var id=sale.value,esConductor=n.maq===id,ocupados=personas.filter(function(x){return x!==id;});
      entra.innerHTML='<option value="">Sin reemplazante por ahora</option>'+activos.filter(function(m){return !ocupados.includes(String(m.id))&&String(m.id)!==id&&(!esConductor||esMaquinista(m));}).map(function(m){return '<option value="'+E(m.id)+'">'+E(corto(m))+'</option>';}).join('');
    }
    sale.onchange=refrescar;refrescar();
    modal.querySelector('#rvCancelarNovedad').onclick=cerrarModalOdd;
    modal.querySelector('#rvConfirmarNovedad').onclick=function(){
      var id=sale.value,reemplazo=entra.value,motivo=modal.querySelector('#rvMotivo').value,h=hora.value;
      if(!id||!/^[0-2][0-9]:[0-5][0-9]$/.test(h)||Number(h.slice(0,2))>23){alert('Indica la persona y una hora válida.');return;}
      if(!confirm('¿Registrar la novedad de '+nom(id)+' el '+gnFmt(f)+'?'))return;
      cerrarModalOdd();
      guardarOp({t:reemplazo?'cambiarPersona':'quitarPersona',f:f,id:id,reemplazo:reemplazo,motivo:motivo,horaEfectiva:h});
    };
  };});
  pn.querySelectorAll('[data-rv-david]').forEach(function(b){b.onclick=function(){if(confirm('¿Programar a David Briones como maquinista de apoyo del Cuerpo el '+gnFmt(b.dataset.rvDavid)+'?'))guardarOp({t:'apoyoCuerpo',f:b.dataset.rvDavid});};});
  pn.querySelectorAll('[data-rv-persona]').forEach(function(b){b.onclick=function(){
    var v=b.dataset.rvPersona.split('|'),f=v[0],id=v[1],op=b.dataset.operacion;
    if(op==='gestionar'){var eleccion=prompt('Gestionar '+nom(id)+'\\n1. Modificar día\\n2. Eliminar de la noche\\n3. Cambiar por otra persona\\nCancelar: dejar vacío','');if(eleccion==='1')op='mover';else if(eleccion==='2')op='quitar';else if(eleccion==='3')op='cambiar';else return;}
    if(op==='quitar'){if(confirm('¿Quitar a '+nom(id)+' de '+gnFmt(f)+'?'))guardarOp({t:'quitarPersona',f:f,id:id});return;}
    var n=doc.noches[f],conductor=n.maq===id,ocupados=n.vol.concat(n.obac?[n.obac]:[],n.maq?[n.maq]:[]);
    var opciones=op==='mover'?D.noches.filter(function(d){var t=doc.noches[d];return d!==f&&!t.vol.includes(id)&&t.obac!==id&&t.maq!==id&&(!conductor||!t.maq);}):activos.filter(function(m){return !ocupados.includes(String(m.id))&&(!conductor||esMaquinista(m));}).map(function(m){return String(m.id);});
    var modal=modalOdd('<h2>'+E(op==='mover'?'Modificar noche':'Cambiar persona')+'</h2><p>'+E(nom(id))+' · '+E(gnFmt(f))+'</p><label for="guDestino">'+(op==='mover'?'Noche de destino':'Reemplazante')+'</label><select id="guDestino" class="rv-sel">'+opciones.map(function(x){return '<option value="'+E(x)+'">'+E(op==='mover'?gnFmt(x):nom(x))+'</option>';}).join('')+'</select><button type="button" class="btn" id="guGuardar">Guardar cambio</button><button type="button" class="btn secondary" id="guCancelar">Cancelar</button>');
    modal.querySelector('#guCancelar').onclick=cerrarModalOdd;var g=modal.querySelector('#guGuardar');g.disabled=!opciones.length;g.onclick=function(){var valor=modal.querySelector('#guDestino').value;cerrarModalOdd();guardarOp(op==='mover'?{t:'moverPersona',f:f,id:id,destino:valor}:{t:'cambiarPersona',f:f,id:id,reemplazo:valor});};
  };});
  pn.querySelectorAll("[data-rv-del]").forEach(function(b){ b.onclick=function(){ var p=b.dataset.rvDel.split("|"); guardarOp({t:"delVol",f:p[0],id:p[1]}); }; });
  pn.querySelectorAll("[data-rv-add]").forEach(function(sel){ sel.onchange=function(){ if(sel.value) guardarOp({t:"addVol",f:sel.dataset.rvAdd,id:sel.value}); }; });
  pn.querySelectorAll("[data-rv-rol]").forEach(function(sel){ sel.onchange=function(){ var p=sel.dataset.rvRol.split("|"); guardarOp({t:"rol",f:p[0],rol:p[1],id:sel.value||null}); }; });
  var ap=$("rvAprobar"); if(ap) ap.onclick=function(){ aprobarRevision(pn,D); };
  var rb=$("rvReabrir"); if(rb) rb.onclick=async function(){
    if(!confirm("¿Reabrir la revisión? Podrás volver a corregir y aprobar.")) return;
    var nuevo=clonar(doc); nuevo.estado="borrador"; revLog(nuevo,D,D.noches[0],"vol","reabre");
    try{ await revGuardar(D,nuevo); RV.msg=""; RV.err=false; }catch(e){ RV.msg="No se pudo reabrir."; RV.err=true; }
    panelRev(pn,D);
  };
  var rh=$("rvRehacer"); if(rh) rh.onclick=async function(e){
    e.preventDefault();
    if(!confirm("¿Rehacer desde las inscripciones? Se pierden las correcciones hechas a mano (queda anotado en la lista de cambios).")) return;
    var b=propuesta(D), nuevo=clonar(doc); nuevo.base=clonar(b); nuevo.noches=clonar(b); revLog(nuevo,D,D.noches[0],"vol","reinicia");
    try{ await revGuardar(D,nuevo); RV.msg=""; RV.err=false; }catch(x){ RV.msg="No se pudo rehacer."; RV.err=true; }
    panelRev(pn,D);
  };
}
async function aprobarRevision(pn,D){
  if(!(esTenienteTercero(D.m)||esAdminGuardia(D.m)))return;
  var doc=clonar(RV.doc),baseRevision=RV.doc?RV.ver:0,cov=revCov(doc),malas=cov.filter(function(c){ return !c.completa; });
  if(malas.length){RV.msg="Completa las siete noches antes de aprobar (1 OBAC, 1 maquinista y 2 voluntarios).";RV.err=true;panelRev(pn,D);return;}
  var aviso=malas.length?"Hay "+malas.length+" noche(s) incompleta(s):\n"+malas.map(function(c){ var n=nombreNoche(c.f); return "• "+n.w+" "+n.d+": "+faltan({vol:c.n.vol,maq:c.n.maq?[1]:[],obac:c.n.obac?[1]:[]}); }).join("\n")+"\n\n":"";
  if(!confirm(aviso+"¿Aprobar la dotación? Se actualizarán las guardias de la semana con este resultado (queda historial de lo anterior).")) return;
  var msg=$("rvMsg"); if(msg){ msg.classList.remove("err"); msg.textContent="Aprobando…"; }
  var p=D.p, n=0,cambios=[];
  try{
    for(var i=0;i<cov.length;i++){
      var c=cov[i]; if(c.nada) continue;
      var hIng=horaNoche(c.f), clave=claveGuardia(c.f,hIng);
      var lecturaGuardia=await sGetV("guardia:"+clave,null),ex=lecturaGuardia.value;
      var previos={}; ((ex&&ex.guardianes)||[]).forEach(function(g){ previos[g.id]=g; });
      var d={fechaIng:c.f,horaIng:hIng,fechaSal:gnAdd(c.f,1),horaSal:HORARIOS.fin,oficial:c.n.obac||"",conductor:c.n.maq||"",apoyoExterno:c.n.apoyoExterno||null,
        guardianes:c.n.vol.map(function(id){ return previos[id]||{id:id,estado:"cuartel",motivo:"",correo:false,obs:"",reemplazo:"",reemplazoRegistradoEn:""}; }),
        novedades:(ex&&ex.novedades)||""};
      cambios.push({op:"set",key:"guardia:"+clave,value:d,ifVersion:lecturaGuardia.version},{op:"add",key:GUARDIA_IDX,item:{clave:clave,fecha:d.fechaIng},uniqueBy:"clave"});n++;
    }
    var nuevo=clonar(doc); nuevo.estado="aprobada"; nuevo.aprobadaPorId=String(D.m.id); nuevo.aprobadaPor=corto(D.m); nuevo.aprobadaEn=new Date().toISOString();
    revLog(nuevo,D,D.noches[0],"vol","aprueba");
    cambios.push({op:"set",key:revKey(D.p.inicio),value:nuevo,ifVersion:baseRevision});
    await gnGuardarAtomico(cambios);RV.doc=nuevo;RV.ver=SVER.get(revKey(D.p.inicio));RV.msg="Dotación aprobada. Guardias actualizadas: "+n+".";RV.err=false;
  }catch(e){ RV.msg=e&&e.conflicto?"Otra persona cambió la revisión. No se guardó ningún cambio.":"No se pudo aprobar. No se cambió la aprobación; inténtalo de nuevo."; RV.err=true; try{ await revCargar(D); }catch(x){RV.msg+=" No se pudo recargar: vuelve a abrir la semana antes de guardar.";} }
  panelRev(pn,D);
}

/* ---------- Mis noches / avisos / reemplazos ----------
   Mis noches = las noches donde quedé en una dotación APROBADA (guardia-revision:<inicio>), hasta que la noche termina.
   Una noche terminada pasa a «cumplidas» (historial en Mi estado). Si avisé que no podía y otro la cubrió,
   la noche NO cuenta para mí y se acredita a quien la cubrió.
   Aviso: guardia-aviso:<fecha>:<id> = {f,id,rol,motivo,en,estado:abierto|cubierto|sin_reemplazo,reemplazoId,...}. */
var ROL_NOCHE={vol:"Voluntario",maq:"Maquinista",obac:"OBAC"};
/* Miércoles de inicio de la semana que contiene la noche. */
function inicioSemanaDe(f){ var d=new Date(f+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+4)%7)); return d.toISOString().slice(0,10); }
var MN={cache:null,who:"",en:0};
function avKey(f,id){ return "guardia-aviso:"+f+":"+id; }
async function misNochesDatos(who,forzar){
  if(!forzar&&MN.cache&&MN.who===who&&Date.now()-MN.en<15000) return MN.cache;
  var rs=await Promise.all([leerPrefijo("guardia-revision:"),leerPrefijo("guardia-aviso:"),leerPrefijo("guardia-acreditacion:")]);
  var acreditaciones={}; rs[2].forEach(function(it){ if(it.value && it.value.fecha) acreditaciones[it.value.fecha]=it.value; });
  var avisos={}; rs[1].forEach(function(it){ if(it.value&&it.value.f) avisos[it.value.f+":"+it.value.id]=it.value; });
  var ahora=Date.now(), prox=[], cumpl=[], vistas={};
  rs[0].forEach(function(it){
    var d=it.value; if(!d||d.estado!=="aprobada"||!d.noches) return;
    Object.keys(d.noches).sort().forEach(function(f){
      var n=d.noches[f], rol=n.maq===who?"maq":n.obac===who?"obac":(n.vol||[]).indexOf(who)>=0?"vol":null;
      var av=avisos[f+":"+who], cubre=null;
      Object.keys(avisos).forEach(function(k){ var a=avisos[k]; if(a.f===f&&a.estado==="cubierto"&&String(a.reemplazoId)===who) cubre=a.id; });
      if(rol){ vistas[f]=1; var e={f:f,rol:rol,hora:horaNoche(f),aviso:av||null,cubre:cubre,revision:d,cuenta:false}; (finNoche(f)>ahora?prox:cumpl).push(e); }
    });
  });
  // Asistentes extra aprobados también aparecen en su historial de guardia.
  rs[0].forEach(function(it){
    var d=it.value;if(!d||d.estado!=="aprobada"||!d.noches)return;
    Object.keys(d.noches).forEach(function(f){
      var ac=acreditaciones[f];
      if(vistas[f]||!ac||!(ac.adicionales||[]).some(function(p){return String(p.id)===who;}))return;
      if(!window.GermaniaGuardiaReglas?.acreditacionVigente(ac,d,f)||
         ac.asistencias?.[who]!=="presente")return;
      vistas[f]=1;
      cumpl.push({f:f,rol:"vol",hora:horaNoche(f),aviso:null,cubre:null,revision:d,
        adicional:true,cuenta:true,pendiente:false});
    });
  });
  /* noches que cedí y ya cubrió otro: ya no estoy en la dotación, pero se muestran como «no cuenta» */
  Object.keys(avisos).forEach(function(k){ var a=avisos[k]; if(String(a.id)!==who||a.estado!=="cubierto"||vistas[a.f]) return; var e={f:a.f,rol:a.rol,hora:horaNoche(a.f),aviso:a,cubre:null}; (finNoche(a.f)>ahora?prox:cumpl).push(e); });
  prox.sort(function(a,b){ return a.f.localeCompare(b.f); }); cumpl.sort(function(a,b){ return b.f.localeCompare(a.f); });
  /* SOLO cuenta si un oficial autorizado aprobó la asistencia, con la última aprobación de dotación. */
  cumpl.forEach(function(e){
    var ac=acreditaciones[e.f], valida=!!(window.GermaniaGuardiaReglas &&
      window.GermaniaGuardiaReglas.acreditacionVigente(ac,e.revision,e.f));
    e.pendiente=!valida && !(e.aviso&&e.aviso.estado==="cubierto");
    e.cuenta=valida && ac.asistentes.map(String).includes(who) && ac.asistencias[who]==="presente";
  });
  /* Visibilidad hasta el viernes 06:00 local posterior a la semana miércoles-martes. */
  var recientes=cumpl.filter(function(e){return ahora<instanteChile(gnAdd(inicioSemanaDe(e.f),9),"06:00");}).sort(function(a,b){return a.f.localeCompare(b.f);});
  MN.cache={prox:prox,cumpl:cumpl,recientes:recientes,avisos:avisos}; MN.who=who; MN.en=Date.now();
  return MN.cache;
}
function tarjetaNoche(e,conBoton){
  var n=nombreNoche(e.f), av=e.aviso, est="";
  if(e.adicional) est='<span class="gr-chip azul">Asistencia adicional aprobada</span>';
  if(e.cubre) est='<span class="gr-chip azul">Cubres a '+E(nom(e.cubre))+'</span>';
  if(av){
    if(av.estado==="cubierto") est='<span class="gr-chip gris">Cubrió '+E(nom(av.reemplazoId))+'</span>';
    else if(av.estado==="sin_reemplazo") est='<span class="gr-chip rojo">Sin reemplazo · lo ve la oficialidad</span>';
    else est='<span class="gr-chip rojo">Avisaste que no puedes · esperando reemplazo</span>';
  }
  var btn=conBoton&&!av&&e.f&&finNoche(e.f)>Date.now()?'<button type="button" class="btn small secondary gr-nopuedo" data-nopuedo="'+e.f+'|'+e.rol+'">No puedo esta noche</button>':"";
  return '<div class="gr-nc mn'+(av?" aviso":"")+'"><span class="gr-dia"><b>'+E(n.w)+'</b><i>'+E(n.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+E(ROL_NOCHE[e.rol]||"Voluntario")+'</b>'+est+'</div><div class="gr-nc-fila">'+E(e.hora)+' → '+E(HORARIOS.fin)+'</div>'+btn+'<div class="gr-forma" data-forma="'+e.f+'"></div></div></div>';
}
async function panelMis(pn,D){
  pn.innerHTML='<p class="sub">Cargando…</p>';
  var d; try{ d=await misNochesDatos(D.who,true); }catch(e){ pn.innerHTML='<div class="empty">No se pudieron leer tus noches. <button type="button" class="btn small secondary" id="mnReint">Reintentar</button></div>'; $("mnReint").onclick=function(){ panelMis(pn,D); }; return; }
  var h='<h3 class="gr-t">Mis noches</h3>';
  if(D.abierto&&GR.Dmi&&GR.Dmi.p) h+='<p class="gr-aviso-n">La elección de noches está abierta. <a href="#" id="mnIrInicio">Elegir mis noches en Inicio</a></p>';
  if(!d.prox.length) h+='<div class="empty">No tienes noches pendientes. Cuando la oficialidad apruebe la dotación, tu noche aparecerá aquí.</div>';
  else h+='<p class="sub">Cada noche desaparece de esta lista cuando termina (a las '+E(HORARIOS.fin)+'). Si ya no puedes, avisa para que la oficialidad busque reemplazo.</p><div class="gr-lista">'+d.prox.map(function(e){ return tarjetaNoche(e,true); }).join("")+'</div>';
  if(d.recientes&&d.recientes.length) h+='<h3 class="gr-t">Terminadas esta semana</h3><p class="sub">Visibles hasta 48 horas después del cierre de la semana; luego permanecen en el historial.</p><div class="gr-lista">'+d.recientes.map(function(e){return tarjetaNoche(e,false);}).join("")+'</div>';
  pn.innerHTML=h;
  pn.querySelectorAll("[data-nopuedo]").forEach(function(b){ b.onclick=function(){ abrirAviso(pn,D,b.dataset.nopuedo); }; });
  var ii=$("mnIrInicio"); if(ii) ii.onclick=function(e){ e.preventDefault(); window.__mostrarPestana("germania"); };
}
function abrirAviso(pn,D,v){
  var p=v.split("|"), f=p[0], rol=p[1], box=pn.querySelector('[data-forma="'+f+'"]'); if(!box) return;
  box.innerHTML='<label class="rv-lbl" for="avMotivo">¿Por qué no puedes? (opcional)</label><input type="text" id="avMotivo" class="rv-sel" maxlength="140" placeholder="Trabajo, salud, viaje…"><div class="gr-fila-btn"><button type="button" class="btn gr-grande" id="avEnviar">Avisar que no puedo</button><button type="button" class="btn secondary" id="avCancelar">Cancelar</button></div><div class="status-msg" id="avMsg"></div>';
  $("avCancelar").onclick=function(){ box.innerHTML=""; };
  $("avEnviar").onclick=async function(){
    var msg=$("avMsg"); msg.classList.remove("err"); msg.textContent="Enviando…";
    var rec={f:f,id:D.who,rol:rol,motivo:$("avMotivo").value.trim(),en:new Date().toISOString(),estado:"abierto",reemplazoId:null,por:corto(D.m)};
    try{ await sSet(avKey(f,D.who),rec,{ifVersion:0}); }catch(e){ if(!e||!e.conflicto){ msg.textContent="No se pudo enviar. Inténtalo de nuevo."; msg.classList.add("err"); return; } }
    MN.cache=null; if(typeof gnInsToast==="function") gnInsToast("Aviso enviado a la oficialidad"); panelMis(pn,D); misNochesInicio(true);
  };
}
async function misNochesInicio(forzar){
  var box=$("misNochesInicio"); if(!box) return;
  var m=miembro(); if(!m){ box.innerHTML=""; return; }
  var d;
  try{ d=await misNochesDatos(String(m.id),forzar); }
  catch(e){ return; }
  if(!window.GermaniaGuardiaFranja){ box.innerHTML=""; return; }
  // Solo de guardia-revision APROBADA, sin contar sustituidos ni otras semanas.
  // finNoche se usa exclusivamente para VISIBILIDAD, no acredita asistencia.
  if(d.prox.length){var pending=$("inicioRoles");if(pending)pending.innerHTML="";}
  var entradas=d.prox.map(function(e){
    return Object.assign({},e,{finMs:finNoche(e.f)});
  });
  var activas=entradas.filter(function(e){return e.finMs>Date.now();});
  if(!activas.length){ box.innerHTML=""; return; }
  var icono='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18M8 14h3M14 14h3M8 18h3"/></svg>';
  box.innerHTML='<section class="card gn-franja" aria-label="Mis próximas guardias">'
    +'<div class="gn-franja-cab"><h2>'+icono+' Próximas guardias</h2><small>Se actualiza automáticamente</small></div>'
    +'<p class="gn-franja-nota">Horario de guardia: 22:45 a 06:00</p><div class="gn-franja-lista">'
    +activas.map(function(e){
      var n=nombreNoche(e.f),rol=ROL_NOCHE[e.rol]||"Voluntario";
      var aviso=e.aviso&&e.aviso.estado!=="cubierto"?' <span class="gn-franja-aviso">Avisaste que no puedes</span>':"";
      return '<button type="button" class="gn-franja-dia" data-gn-noche="'+E(e.f)+'"'
        +' style="background:#991b1b;color:#fff;border:2px solid #ef4444" aria-label="'+E(n.w+" "+n.d+", "+rol+". Guardia aprobada. Ver detalles y avisar si no puedes")+'">'
        +'<span class="gn-franja-semana">'+E(n.w)+'</span><strong>'+E(n.d)+'</strong>'
        +'<span class="gn-franja-cargo">'+(e.rol==="obac"?"ERES OBAC · ":"")+E(rol)+'</span>'+aviso+'</button>';
    }).join("")
    +'</div><p class="gn-franja-nota">Solo tus noches asignadas. Toca una fecha para ver detalles.</p></section>';
  box.querySelectorAll("[data-gn-noche]").forEach(function(b){
    b.onclick=function(){
      ponerVista("mi"); GR.tab="mis";
      if(typeof window.__mostrarPestana==="function") window.__mostrarPestana("guardia");
    };
  });
}

async function misNochesCumplidas(forzar){
  var box=$("misNochesCumplidas"); if(!box) return;
  var m=miembro(); if(!m){ box.innerHTML=""; return; }
  var d; try{ d=await misNochesDatos(String(m.id),forzar); }catch(e){ return; }
  var ok=d.cumpl.filter(function(e){ return e.cuenta; }).length;
  box.innerHTML='<h2>Noches cumplidas</h2><p class="sub">'+ok+' noche'+(ok===1?"":"s")+' cumplida'+(ok===1?"":"s")+' con asistencia real aprobada por los oficiales.</p>'
   +(d.cumpl.length?'<div class="gr-lista">'+d.cumpl.map(function(e){
      var n=nombreNoche(e.f), nota=e.cuenta?'<span class="gr-chip verde">Aprobada por los oficiales</span>':e.pendiente?'<span class="gr-chip gris">Pendiente de aprobación</span>':'<span class="gr-chip gris">No cumplida'+(e.aviso&&e.aviso.estado==="cubierto"?' · la cubrió '+E(nom(e.aviso.reemplazoId)):'')+'</span>';
      return '<div class="gr-nc"><span class="gr-dia"><b>'+E(n.w)+'</b><i>'+E(n.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+E(ROL_NOCHE[e.rol]||"Voluntario")+'</b>'+nota+'</div></div></div>';
    }).join("")+'</div>':'<div class="empty">Aún no hay noches cumplidas.</div>');
}

/* ---------- Reemplazos (mando) ---------- */
async function panelRep(pn,D){
  pn.innerHTML='<p class="sub">Cargando…</p>';
  var avs, revs; try{ var r=await Promise.all([leerPrefijo("guardia-aviso:"),leerPrefijo("guardia-revision:")]); avs=r[0].map(function(x){ return x.value; }).filter(Boolean); revs=r[1]; }catch(e){ pn.innerHTML='<div class="empty">No se pudo leer. <button type="button" class="btn small secondary" id="rpReint">Reintentar</button></div>'; $("rpReint").onclick=function(){ panelRep(pn,D); }; return; }
  var pend=avs.filter(function(a){ return a.estado!=="cubierto"&&finNoche(a.f)>Date.now(); }).sort(function(a,b){ return a.f.localeCompare(b.f); });
  var hechos=avs.filter(function(a){ return a.estado==="cubierto"; }).sort(function(a,b){ return b.f.localeCompare(a.f); }).slice(0,10);
  var activos=ROSTER.filter(function(x){ return x.activo!==false; }).sort(function(a,b){ return nombreCompleto(a).localeCompare(nombreCompleto(b),"es"); });
  var h='<h3 class="gr-t">Reemplazos</h3><div class="gr-nota info"><span aria-hidden="true">🔁</span><p>Aquí llegan los avisos «No puedo esta noche». Al asignar un reemplazo, la noche <b>no cuenta</b> para quien avisó y se <b>acredita</b> a quien la cubre.</p></div>';
  h+=pend.length?'<div class="gr-lista">'+pend.map(function(a){
    var n=nombreNoche(a.f), dot=revs.map(function(x){ return x.value; }).filter(function(d){ return d&&d.noches&&d.noches[a.f]; })[0], nn=dot?dot.noches[a.f]:null;
    var ocup={}; if(nn){ (nn.vol||[]).forEach(function(x){ ocup[x]=1; }); if(nn.maq) ocup[nn.maq]=1; if(nn.obac) ocup[nn.obac]=1; }
    var lista=a.rol==="maq"?activos.filter(esMaquinista):a.rol==="obac"?activos.slice().sort(porPrec):activos;
    var opts='<option value="">— elegir reemplazo —</option>'+lista.filter(function(x){ return !ocup[String(x.id)]; }).map(function(x){ return '<option value="'+E(x.id)+'">'+(a.rol==="obac"&&rangoPrec(x)!=null?"N° "+rangoPrec(x)+" · ":"")+E(corto(x))+'</option>'; }).join("");
    return '<div class="gr-nc aviso"><span class="gr-dia"><b>'+E(n.w)+'</b><i>'+E(n.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+E(nom(a.id))+'</b><span class="gr-chip rojo">No puede · '+E(ROL_NOCHE[a.rol]||"")+'</span></div>'+(a.motivo?'<div class="gr-nc-fila">Motivo: '+E(a.motivo)+'</div>':'')+(dot&&dot.estado==="aprobada"?'':'<small class="gr-falta">La dotación de esa semana aún no está aprobada.</small>')+'<select class="rv-sel" data-rp-sel="'+E(a.f+"|"+a.id)+'" aria-label="Reemplazo para '+E(nom(a.id))+'">'+opts+'</select><div class="gr-fila-btn"><button type="button" class="btn" data-rp-ok="'+E(a.f+"|"+a.id)+'">Asignar reemplazo</button><button type="button" class="btn secondary" data-rp-no="'+E(a.f+"|"+a.id)+'">Sin reemplazo</button></div></div></div>';
  }).join("")+'</div>':'<div class="empty">No hay avisos pendientes.</div>';
  if(hechos.length) h+='<details class="gr-det"><summary>Reemplazos hechos: '+hechos.length+'</summary><ul class="rv-cambios">'+hechos.map(function(a){ var n=nombreNoche(a.f); return '<li><b>'+E(n.w+" "+n.d)+'</b> · '+E(nom(a.reemplazoId))+' cubre a '+E(nom(a.id))+' ('+E(ROL_NOCHE[a.rol]||"")+')</li>'; }).join("")+'</ul></details>';
  h+='<div class="status-msg" id="rpMsg"></div>';
  pn.innerHTML=h;
  pn.querySelectorAll("[data-rp-ok]").forEach(function(b){ b.onclick=function(){ var k=b.dataset.rpOk, s=pn.querySelector('[data-rp-sel="'+k+'"]'); if(!s||!s.value){ var m=$("rpMsg"); m.textContent="Elige primero quién reemplaza."; m.classList.add("err"); return; } resolverAviso(pn,D,k,s.value); }; });
  pn.querySelectorAll("[data-rp-no]").forEach(function(b){ b.onclick=function(){ resolverAviso(pn,D,b.dataset.rpNo,null); }; });
}
async function resolverAviso(pn,D,k,repId){
  var p=k.split("|"), f=p[0], id=p[1], msg=$("rpMsg"); msg.classList.remove("err"); msg.textContent="Guardando…";
  try{
    var cambios=[],av=await sGetV(avKey(f,id),null); if(!av.value) throw new Error("aviso");
    var nuevoAv=Object.assign({},av.value,{estado:repId?"cubierto":"sin_reemplazo",reemplazoId:repId||null,resueltoPorId:String(D.m.id),resueltoPor:corto(D.m),resueltoEn:new Date().toISOString()});
    if(repId){
      /* 1) dotación de la semana (revisión) */
      var revs=await leerPrefijo("guardia-revision:"), it=revs.filter(function(x){ return x.value&&x.value.noches&&x.value.noches[f]; })[0];
      if(it){
        var cur=await sGetV(it.key,null), doc=clonar(cur.value), n=doc.noches[f], rol=av.value.rol;
        revQuitarRoles(n,repId);
        if(rol==="maq"||rol==="obac"){ n[rol]=repId; } else { n.vol=n.vol.filter(function(x){ return x!==id; }); n.vol.push(repId); }
        revLog(doc,{m:D.m},f,rol,"cambia",repId,id);
        cambios.push({op:"set",key:it.key,value:doc,ifVersion:cur.version});
        /* 2) si ya estaba aprobada, la guardia que usan informes y ODD */
        if(doc.estado==="aprobada"){
          var ck=claveGuardia(f,horaNoche(f)),lecturaGuardia=await sGetV("guardia:"+ck,null),g=lecturaGuardia.value;
          if(g){
            if(rol==="maq") g.conductor=repId; else if(rol==="obac") g.oficial=repId;
            else g.guardianes=(g.guardianes||[]).map(function(x){ return String(x.id)===id?Object.assign({},x,{estado:"no",motivo:av.value.motivo||"Aviso",correo:true,reemplazo:repId,reemplazoRegistradoEn:nuevoAv.resueltoEn}):x; });
            g.reemplazos=(g.reemplazos||[]).concat([{rol:rol,sale:id,entra:repId,en:nuevoAv.resueltoEn,por:corto(D.m)}]);
            cambios.push({op:"set",key:"guardia:"+ck,value:g,ifVersion:lecturaGuardia.version});
          }
        }
      }
    }
    cambios.push({op:"set",key:avKey(f,id),value:nuevoAv,ifVersion:av.version});
    await gnGuardarAtomico(cambios);
    MN.cache=null; if(RV.clave) RV.clave="";
    panelRep(pn,D);
  }catch(e){ msg.textContent=e&&e.conflicto?"Otra persona cambió esto. Se recargó la lista.":"No se pudo guardar. Inténtalo de nuevo."; msg.classList.add("err"); if(e&&e.conflicto) setTimeout(function(){ panelRep(pn,D); },900); }
}

/* ---------- Inicio: recordatorio de inscripción (la selección vive en Guardia) ---------- */
async function inicioInscripcion(forzar){
  var box=$("gnInscripcionCard"); if(box) box.innerHTML=""; return;   /* ahora lo cubren las tarjetas por cargo (pintarInicioRoles) */
  var who=$("miVoluntario")&&$("miVoluntario").value;
  if(!who){ box.innerHTML=""; return; }
  var d; try{ d=await gnInsDatos(who,forzar); }catch(e){ return; }
  var p=d.p, saved=d.saved, conf=d.conf;
  if(p&&conf&&(conf.cumple||conf.justificacion)){
    var dias=Array.isArray(saved)?saved:[];
    box.innerHTML='<div class="card"><h2>Guardia nocturna · inscripción confirmada</h2><p class="sub">Semana '+E(gnFmt(p.inicio))+' · '+dias.length+' noche(s) registrada(s).</p><p>'+E(dias.map(function(f){ var n=nombreNoche(f); return n.w+" "+n.d; }).join(" · "))+'</p></div>';
    return;
  }
  if(!p||Date.now()>=gnInsCierreMs(p)){ box.innerHTML=""; return; }
  var hasta=gnInsCierreMs(p), txt=new Date(hasta).toLocaleString("es-CL",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Santiago"}).replace(".","");
  box.innerHTML='<div class="card home-pend"><h2>Guardia nocturna · elige tus noches</h2><p class="sub">Semana '+E(gnFmt(p.inicio))+'. Cierra el <b>'+E(txt)+'</b> · faltan '+E(avisoRestante(hasta,Date.now()))+'.</p><button type="button" class="btn gr-grande" id="inicioElegir">Elegir mis noches</button></div>';
  var b=$("inicioElegir"); if(b) b.onclick=function(){ ponerVista("mi"); GR.tab="vol"; window.__mostrarPestana("guardia"); };
}
var _renderOriginal=window.renderGnInscripcionCard;
window.renderGnInscripcionCard=async function(forzar){
  misNochesInicio(!!forzar);
  await grRender(!!forzar);
  await misNochesInicio(!!forzar);
};

/* ---------- Eventos ---------- */
var botonGestion=$("btnOficialesGuardia");
if(botonGestion) botonGestion.addEventListener("click",function(){
  if(!esMando(miembro())) return;
  ponerVista("gestion");
  if(typeof window.__mostrarPestana==="function") window.__mostrarPestana("guardia");
});
document.addEventListener("click",function(ev){
  var noticia=ev.target.closest("[data-home-novedades]");
  if(noticia){ var destino=$("inicioNovedades"); if(destino) destino.scrollIntoView({behavior:"smooth",block:"start"}); return; }
  var v=ev.target.closest("#gnVistaSel [data-gv]");
  if(v){ ponerVista(v.dataset.gv); pintarTarjeta(); return; }
  var t=ev.target.closest("[data-gr-tab]"); if(!t||!$("gnRolCard")||!$("gnRolCard").contains(t)) return;
  GR.tab=t.dataset.grTab; pintarTarjeta();
});
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible"){
    renderNovedades();
    if(esOficial(miembro())||esMando(miembro()))renderInformacionesOficiales();
  }
});
if(typeof window.__mostrarPestana==="function"){
  var base=window.__mostrarPestana;
  window.__mostrarPestana=function(nombre){ if(nombre==="guardia"&&esMando(miembro()))ponerVista("gestion");var r=base.apply(this,arguments); if(nombre==="guardia"){if(esMando(miembro()))ponerVista("gestion");grRender(true).catch(falloGuardia("No se pudo actualizar la guardia."));} if(nombre==="germania"){ renderNovedades(); pintarChipEstado(); misNochesInicio(true); } if(nombre==="config"){ renderInformacionesOficiales(); } if(nombre==="estado") misNochesCumplidas(true); return r; };
}
/* ---------- Estado actual en la tarjeta de identidad ---------- */
async function pintarChipEstado(){
  var c=$("miEstadoChip"); if(!c) return;
  var v=$("miVoluntario"), who=v?v.value:"";
  if(!who){ c.hidden=true; return; }
  var d;try{d=await getDisponibilidadVigente();}catch(e){c.hidden=false;c.textContent="Sin conexión: no se pudo consultar tu estado.";return;}
  var e=d&&d[who]&&d[who].estado;
  c.hidden=false;
  c.innerHTML=e?'<span class="dot '+E(e)+'"></span>'+E(DISP_LABELS[e]):'<span class="dot sin"></span>Marca tu estado';
}
if(typeof window.marcarMiEstado==="function"){
  var _marcar=window.marcarMiEstado;
  window.marcarMiEstado=async function(){ var r=await _marcar.apply(this,arguments); pintarChipEstado(); return r; };
}
/* Al entrar a una pantalla (por pestaña, barra inferior o atajo) se refresca lo que muestra: así Inicio y Guardia
   siempre reflejan la semana recién creada, sin esperar al refresco de 60 s. */
function alActivarPanel(id){
  if(id==="panel-germania"){ MN.cache=null; renderNovedades(); pintarChipEstado(); grRender(true).catch(falloGuardia("No se pudo actualizar la guardia.")); misNochesInicio(true); }
  else if(id==="panel-guardia"){ grRender(true).catch(falloGuardia("No se pudo actualizar la guardia.")); }
  else if(id==="panel-estado"){ misNochesCumplidas(true); }
}
document.querySelectorAll(".panel").forEach(function(pn){
  var antes=pn.classList.contains("active");
  new MutationObserver(function(){ var ahora=pn.classList.contains("active"); if(ahora&&!antes) alActivarPanel(pn.id); antes=ahora; }).observe(pn,{attributes:true,attributeFilter:["class"]});
});
document.addEventListener("change",function(ev){
  if(!ev.target)return;
  if(ev.target.id==="grSemana"){ GR.semana=ev.target.value; GR.buscada=false; RV.clave=""; grRender(true).catch(falloGuardia("No se pudo actualizar la guardia.")); }
  if(ev.target.id==="grBuscar"){
    var inicio=ev.target.value, lista=(GR.D&&GR.D.lista)||[];
    if(!inicio)return;
    var semana=lista.filter(function(x){return x.inicio===inicio;})[0];
    if(!semana){var msg=document.getElementById("grBuscarMsg");if(msg)msg.textContent="No se encontró esa semana.";return;}
    GR.semana=semana.inicio; GR.buscada=true; RV.clave=""; grRender(true).catch(falloGuardia("No se pudo actualizar la guardia."));
  }
});
var ultimo="__";
/* El nombre ya sale arriba: el selector se esconde una vez elegido (se vuelve a abrir con «No soy yo») */
function ocultarSelector(abrir){
  var v=$("miVoluntario"), b=$("cambiarVolBtn"); if(!v) return;
  var elegido=!!v.value; v.classList.toggle("sel-oculto",elegido&&!abrir);
  if(b) b.hidden=!elegido||!!abrir;
}
if($("cambiarVolBtn")) $("cambiarVolBtn").addEventListener("click",function(){ ocultarSelector(true); var v=$("miVoluntario"); if(v) v.focus(); });
function vigilarIdentidad(){
  var v=$("miVoluntario"); var id=v?v.value:"";
  if(id===ultimo) return; ultimo=id;
  ocultarSelector(false);
  aplicarRol(); renderNovedades(); renderInformacionesOficiales(); pintarChipEstado(); MN.cache=null; misNochesInicio(true); misNochesCumplidas(true);
  grRender(true).catch(falloGuardia("No se pudo actualizar la guardia."));
}
setInterval(vigilarIdentidad,700);
setInterval(function(){
  var inicio=$("panel-germania");
  var enInicio=!!inicio&&inicio.classList.contains("active");
  if((guardiaActiva()||enInicio)&&!GR.cargando&&document.visibilityState==="visible"&&!document.activeElement.matches("input,select,textarea")){
    grRender(false).catch(falloGuardia("No se pudo actualizar la guardia."));
    if(enInicio){ misNochesInicio(false).catch(falloGuardia("No se pudo actualizar la guardia.")); renderNovedades(); }
  }
},60000);
cargarHorarios().then(function(){ misNochesInicio(false); });
aplicarRol();
})();

