/* GERMANIA · roles, novedades y Guardia por rol.
   - Inicio: novedades de la Compañía (las publican oficiales y mando).
   - Guardia: una tarjeta por rol → Voluntario, Maquinista, OBAC e Información (Capitán, Teniente 3° y administrador).
   - Una sola fuente de datos: las mismas claves de la base (guardia-inscripcion / guardia-confirmacion) más
     guardia-maq y guardia-obac. No toca la ODD.
   Noche completa = 3 voluntarios + 1 maquinista + 1 OBAC (GN_DOTACION_MIN, en app.js).
   Un voluntario ocupa UN solo rol por noche (voluntario, maquinista u OBAC). */
(function(){
"use strict";
if(typeof ROSTER==="undefined"||typeof sGet!=="function"||typeof gnPlanes!=="function") return;

/* Administradores mientras dura la prueba (claves de voluntario). Se cambia aquí. */
var ADMINISTRADORES=["517"];
var NOV_KEY="novedades:v1", NOV_MAX=5;

function $(id){ return document.getElementById(id); }
function norm(t){ return String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function E(s){ return esc(s); }

/* ---------- Roles ---------- */
function miembro(){ var v=$("miVoluntario"); return v&&v.value?ROSTER.find(function(x){ return String(x.id)===String(v.value); })||null:null; }
function cargoDe(m){ return norm(m&&m.cargo); }
function esOficial(m){ return !!m&&/capitan|teniente|ayudante|director|secretari|tesorer|jefe de maquinas/.test(cargoDe(m)); }
function esMando(m){ return !!m&&(/^capitan/.test(cargoDe(m))||/teniente (tercero|3)/.test(cargoDe(m))||ADMINISTRADORES.indexOf(String(m.clave))>=0); }
function esMaquinista(m){ return !!m&&m.conductor===true; }
var PREC=null;
async function cargarPrec(){
  var d=null; try{ d=await sGet(PRECEDENCIA_KEY,null); }catch(e){}
  var lista=(d&&Array.isArray(d.lista)&&d.lista.length)?d.lista:PRECEDENCIA_ODD_037.lista.map(function(x,i){ return {n:i+1,cargo:x[0],nombre:x[1]}; });
  PREC={};
  lista.forEach(function(x){ var m=precBuscar(x.nombre); if(m&&PREC[String(m.id)]==null) PREC[String(m.id)]=x.n; });
}
function rangoObac(m){ return m&&PREC&&PREC[String(m.id)]!=null?PREC[String(m.id)]:null; }
function corto(m){ return m?[m.nombre,m.apellidoPaterno].filter(Boolean).join(" "):"—"; }
function porId(id){ return ROSTER.find(function(x){ return String(x.id)===String(id); })||null; }

function aplicarRol(){
  var m=miembro(), of=esOficial(m)||esMando(m);
  document.body.setAttribute("data-oficial",of?"1":"0");
  var a=$("novedadesAdmin"); if(a) a.hidden=!of;
}

/* ---------- Novedades (Inicio) ---------- */
async function renderNovedades(){
  var box=$("novedadesLista"); if(!box) return;
  var lista=[]; try{ lista=await sGet(NOV_KEY,[]); }catch(e){}
  if(!Array.isArray(lista)) lista=[];
  lista=lista.slice().sort(function(a,b){ return String(b.en||"").localeCompare(String(a.en||"")); }).slice(0,NOV_MAX);
  var of=esOficial(miembro())||esMando(miembro());
  box.innerHTML=lista.length?lista.map(function(n){
    var f=n.en?new Date(n.en).toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"}):"";
    return '<div class="ha-item"><span class="ha-fecha">'+E(f)+'</span><span class="ha-texto">'+E(n.texto)+'</span>'+(n.autor?'<small>'+E(n.autor)+'</small>':"")+(of?'<button type="button" class="ha-del" data-nov-del="'+E(n.id)+'" aria-label="Quitar novedad">×</button>':"")+'</div>';
  }).join(""):'<div class="ha-vacia">Sin novedades por ahora.</div>';
}
async function publicarNovedad(){
  var inp=$("novedadTexto"), msg=$("novedadMsg"), texto=inp.value.trim();
  msg.classList.remove("err");
  if(!texto){ msg.textContent="Escribe la novedad."; msg.classList.add("err"); return; }
  var m=miembro();
  try{
    await sAddToList(NOV_KEY,{id:uid(),texto:texto.slice(0,280),en:new Date().toISOString(),autor:m?corto(m):""},{uniqueBy:"id"});
    inp.value=""; msg.textContent="Publicada."; await renderNovedades();
  }catch(e){ msg.textContent="No se pudo publicar. Inténtalo de nuevo."; msg.classList.add("err"); }
}
async function quitarNovedad(id){
  if(!confirm("¿Quitar esta novedad?")) return;
  try{ var l=await sGet(NOV_KEY,[]); await sSet(NOV_KEY,(Array.isArray(l)?l:[]).filter(function(n){ return n.id!==id; })); await renderNovedades(); }catch(e){}
}
if($("novedadAgregar")) $("novedadAgregar").addEventListener("click",publicarNovedad);
if($("novedadesLista")) $("novedadesLista").addEventListener("click",function(ev){ var b=ev.target.closest("[data-nov-del]"); if(b) quitarNovedad(b.dataset.novDel); });

/* ---------- Datos de la semana ---------- */
async function leerPrefijo(pref){
  var r=await fetch("/api/state?prefix="+encodeURIComponent(pref),{cache:"no-store"});
  if(!r.ok) throw new Error("lectura");
  var j=await r.json(); return Array.isArray(j.items)?j.items:[];
}
async function planActivo(){
  var planes=await gnPlanes(), ahora=Date.now(), hoy=todayISO();
  var ab=planes.filter(function(x){ return x.estado==="abierta"&&x.confirmado!==false; }).sort(function(a,b){ return a.inicio.localeCompare(b.inicio); });
  var abierto=ab.filter(function(x){ return ahora<gnInsCierreMs(x); })[0]||null;
  var p=abierto||ab.filter(function(x){ return x.fin>=hoy; })[0]||null;
  return {p:p,abierto:!!abierto};
}
async function cargarSemana(p){
  var pref=["guardia-inscripcion:","guardia-maq:","guardia-obac:","guardia-confirmacion:"];
  var r=await Promise.all(pref.map(function(x){ return leerPrefijo(x+p.inicio+":"); }));
  return r.map(function(items,i){ var o={}, n=(pref[i]+p.inicio+":").length; items.forEach(function(it){ o[it.key.slice(n)]=it.value; }); return o; });
}
/* un registro puede ser "2026-10-14" o {f,t} */
function regs(v){ return (Array.isArray(v)?v:[]).map(function(x){ return typeof x==="string"?{f:x,t:""}:x; }).filter(function(x){ return x&&x.f; }); }
function tiene(v,f){ return regs(v).some(function(x){ return x.f===f; }); }
function cobertura(S,noches){
  var DOT=GN_DOTACION_MIN;
  return noches.map(function(f){
    var maq=[],obac=[],vol=[],ocupado={};
    Object.keys(S.maq).forEach(function(id){ var r=regs(S.maq[id]).filter(function(x){ return x.f===f; })[0]; if(r) maq.push({id:id,t:r.t||""}); });
    Object.keys(S.obac).forEach(function(id){ var r=regs(S.obac[id]).filter(function(x){ return x.f===f; })[0]; if(r) obac.push({id:id,t:r.t||"",n:PREC&&PREC[id]!=null?PREC[id]:9999}); });
    maq.sort(function(a,b){ return a.t.localeCompare(b.t); });
    obac.sort(function(a,b){ return a.n-b.n||a.t.localeCompare(b.t); });
    maq.forEach(function(x){ ocupado[x.id]=1; }); obac.forEach(function(x){ ocupado[x.id]=1; });
    Object.keys(S.vol).forEach(function(id){ if(!ocupado[id]&&tiene(S.vol[id],f)){ var m=porId(id); if(m&&m.activo!==false) vol.push(id); } });
    var refuerzos=Math.max(0,vol.length-DOT.voluntarios);
    var completa=vol.length>=DOT.voluntarios&&maq.length>=DOT.conductor&&obac.length>=DOT.obac;
    var nada=!vol.length&&!maq.length&&!obac.length;
    return {f:f,vol:vol,maq:maq,obac:obac,refuerzos:refuerzos,completa:completa,nada:nada};
  });
}
function nombreNoche(f){ var d=new Date(f+"T12:00"); var w=d.toLocaleDateString("es-CL",{weekday:"short"}).replace(".",""); return {w:w.charAt(0).toUpperCase()+w.slice(1),d:f.slice(8)}; }
function faltan(c){
  var DOT=GN_DOTACION_MIN, t=[];
  if(c.vol.length<DOT.voluntarios) t.push("faltan "+(DOT.voluntarios-c.vol.length)+" voluntario"+((DOT.voluntarios-c.vol.length)===1?"":"s"));
  if(c.maq.length<DOT.conductor) t.push("falta maquinista");
  if(c.obac.length<DOT.obac) t.push("falta OBAC");
  return t.join(" · ");
}

/* ---------- Estado de la tarjeta ---------- */
var GR={tab:"vol",D:null,sel:{maq:null,obac:null},selClave:"",cargando:false};
var GR_TABS={vol:["Voluntario","🙋"],maq:["Maquinista","🚒"],obac:["OBAC","🎧"],info:["Información","📋"]};
function tabsPermitidas(m){
  var t=["vol"]; if(esMaquinista(m)) t.push("maq"); if(rangoObac(m)!=null) t.push("obac"); if(esMando(m)) t.push("info"); return t;
}
function guardiaActiva(){ var p=$("panel-guardia"); return !!p&&p.classList.contains("active"); }

async function grRender(forzar){
  var box=$("gnRolCard"); if(!box) return;
  var m=miembro();
  if(!m){ box.innerHTML='<h2>Mi guardia nocturna</h2><p class="sub">Primero elige tu nombre en <b>Inicio</b>.</p>'; return; }
  if(GR.cargando&&!forzar) return;
  GR.cargando=true;
  try{
    if(!PREC) await cargarPrec();
    var pa=await planActivo(), who=String(m.id), D={m:m,who:who,p:pa.p,abierto:pa.abierto,S:null,noches:[],cov:[],error:false};
    if(pa.p){
      try{ D.S=await cargarSemana(pa.p); D.noches=gnWeek(pa.p.inicio); D.cov=cobertura({vol:D.S[0],maq:D.S[1],obac:D.S[2]},D.noches); D.S={vol:D.S[0],maq:D.S[1],obac:D.S[2],conf:D.S[3]}; }
      catch(e){ D.error=true; }
    }
    GR.D=D;
    var clave=(pa.p?pa.p.inicio:"")+":"+who;
    if(GR.selClave!==clave){ GR.selClave=clave; GR.sel.maq=null; GR.sel.obac=null; }
    if(D.S){ ["maq","obac"].forEach(function(k){ if(GR.sel[k]===null) GR.sel[k]=new Set(regs(D.S[k][who]).map(function(x){ return x.f; })); }); }
    if(pa.p&&D.S){ var propias=D.S.vol[who]||[]; if(GN_INS_CLAVE!==clave){ GN_INS_CLAVE=clave; GN_INS_SEL=new Set(Array.isArray(propias)?propias:[]); } }
    pintarTarjeta();
  }finally{ GR.cargando=false; }
}

function cabecera(D){
  var m=D.m, p=D.p;
  var sem=p?('Semana '+E(gnFmt(p.inicio))+' 23:00 → '+E(gnFmt(gnAdd(p.inicio,7)))+' 08:00'):'';
  return '<div class="gr-quien"><img class="gr-foto" src="'+E(fotoVoluntario(m))+'" alt=""><div><strong>'+E(nombreCompleto(m))+'</strong><span>'+E(sem||"Sin semana abierta")+' · solo presencial, en el cuartel</span></div></div>';
}
function pintarTarjeta(){
  var box=$("gnRolCard"), D=GR.D; if(!box||!D) return;
  var tabs=tabsPermitidas(D.m); if(tabs.indexOf(GR.tab)<0) GR.tab="vol";
  var html='<h2>Mi guardia nocturna</h2>'+cabecera(D);
  if(tabs.length>1) html+='<div class="gr-tabs" role="tablist">'+tabs.map(function(t){ return '<button type="button" role="tab" class="gr-tab'+(t===GR.tab?" on":"")+'" data-gr-tab="'+t+'" aria-selected="'+(t===GR.tab)+'"><span aria-hidden="true">'+GR_TABS[t][1]+'</span>'+GR_TABS[t][0]+'</button>'; }).join("")+'</div>';
  html+='<div id="grPanel"></div>';
  box.innerHTML=html;
  pintarPanel();
}
function pintarPanel(){
  var pn=$("grPanel"), D=GR.D; if(!pn||!D) return;
  if(!D.p){ pn.innerHTML='<div class="empty">No hay una semana con inscripción abierta. Cuando el Capitán la abra, la verás aquí.</div>'; return; }
  if(D.error||!D.S){ pn.innerHTML='<div class="empty">No se pudo leer la semana. <button type="button" class="btn small secondary" id="grReintentar">Reintentar</button></div>'; var r=$("grReintentar"); if(r) r.onclick=function(){ grRender(true); }; return; }
  if(GR.tab==="vol") panelVol(pn,D); else if(GR.tab==="info") panelInfo(pn,D); else panelRol(pn,D,GR.tab);
}

/* ---------- Voluntario ---------- */
function filaCupos(c){
  var DOT=GN_DOTACION_MIN, n=c.vol.length, ok=n>=DOT.voluntarios;
  var gente=""; for(var i=0;i<DOT.voluntarios;i++) gente+='<i class="gr-p'+(i<n?" on":"")+'"></i>';
  return '<span class="gr-gente" aria-hidden="true">'+gente+'</span><span class="gr-cupo'+(ok?" ok":"")+'">'+n+' / '+DOT.voluntarios+' voluntarios'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+'</span>'
    +'<span class="gr-mini">MAQ: '+c.maq.length+' · OBAC: '+c.obac.length+'</span>';
}
function panelVol(pn,D){
  var who=D.who, saved=Array.isArray(D.S.vol[who])?D.S.vol[who]:[], conf=D.S.conf[who];
  var confirmada=!!conf&&(conf.cumple||conf.justificacion), editable=D.abierto&&!confirmada;
  var cierre=gnInsCierreMs(D.p);
  var cierreTxt=new Date(cierre).toLocaleString("es-CL",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Santiago"}).replace(".","");
  var sel=GN_INS_SEL, n=sel.size;
  var h='<h3 class="gr-t">Elige tus noches</h3>';
  h+=D.abierto?'<p class="sub">Cierra el <b>'+E(cierreTxt)+'</b> · faltan '+E(avisoRestante(cierre,Date.now()))+'. Mínimo sugerido: '+GN_NOCHES_MIN+' noches.</p>':'<p class="sub">La inscripción de esta semana está cerrada.</p>';
  if(confirmada) h+='<p class="gr-ok">✔ Inscripción confirmada: '+saved.length+' noche(s).</p>';
  h+='<div class="gr-noches">'+D.cov.map(function(c){
    var nn=nombreNoche(c.f), mia=confirmada?saved.indexOf(c.f)>=0:sel.has(c.f);
    var otro=tiene(D.S.maq[who],c.f)?"maquinista":tiene(D.S.obac[who],c.f)?"OBAC":"";
    var dis=!editable||!!otro;
    return '<button type="button" class="gr-noche'+(mia?" on":"")+(c.completa?" full":"")+'" data-gr-vol="'+c.f+'"'+(dis?" disabled":"")+' aria-pressed="'+mia+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><span class="gr-info">'+(otro?'<span class="gr-cupo">Ya la elegiste como '+otro+'</span>':filaCupos(c))+'</span><span class="gr-marca" aria-hidden="true">'+(mia?"✔":"")+'</span></button>';
  }).join("")+'</div>';
  if(editable){
    h+='<div id="giAviso" class="gr-aviso"></div><button type="button" class="btn gr-grande" id="giConfirmar">Confirmar mis noches'+(n?' ('+n+' seleccionada'+(n===1?"":"s")+')':'')+'</button>'
      +'<p class="gr-link"><a href="#" id="giJustificar">No puedo cumplir: justificar por correo</a></p>';
  }
  pn.innerHTML=h;
  pn.querySelectorAll("[data-gr-vol]").forEach(function(b){ b.onclick=function(){ var f=b.dataset.grVol; if(sel.has(f)) sel.delete(f); else sel.add(f); panelVol(pn,D); }; });
  var c=$("giConfirmar"); if(c) c.onclick=function(){ gnInsConfirmar(D.p,who); };
  var j=$("giJustificar"); if(j) j.onclick=function(e){ e.preventDefault(); gnInsJustificar(D.p,who); };
}

/* ---------- Maquinista / OBAC ---------- */
function panelRol(pn,D,kind){
  var who=D.who, esM=kind==="maq", sel=GR.sel[kind]||new Set(), otroK=esM?"obac":"maq";
  var DOT=GN_DOTACION_MIN;
  var rango=rangoObac(D.m);
  var h='<h3 class="gr-t">Mis noches como '+(esM?"maquinista":"OBAC")+'</h3>';
  h+='<div class="gr-nota '+(esM?"maq":"obac")+'"><span aria-hidden="true">'+(esM?"🚒":"🎧")+'</span><p>Solo deben inscribirse '+(esM?"los maquinistas":"los OBAC según la precedencia")+' y su disponibilidad. Se requiere '+(esM?DOT.conductor+" maquinista":DOT.obac+" OBAC")+' por noche.'+(!esM&&rango!=null?' <b>Tu lugar en la precedencia: N° '+rango+'.</b>':'')+'</p></div>';
  h+='<div class="gr-tabla" role="table"><div class="gr-tr gr-th" role="row"><span>Día</span><span>Mi disponibilidad</span><span>'+(esM?"Maquinista":"OBAC")+'</span></div>'
  +D.cov.map(function(c){
    var nn=nombreNoche(c.f), lista=esM?c.maq:c.obac, tit=lista[0]||null, soyTit=!!tit&&tit.id===who, enLista=lista.some(function(x){ return x.id===who; });
    var comoVol=tiene(D.S.vol[who],c.f), comoOtro=tiene(D.S[otroK][who],c.f);
    var marcada=sel.has(c.f), bloq=!D.abierto||comoVol||comoOtro;
    var chip=comoVol?'<span class="gr-chip gris">Ya voluntario</span>':comoOtro?'<span class="gr-chip gris">Ya '+(esM?"OBAC":"maquinista")+'</span>':marcada?'<span class="gr-chip azul">Seleccionado</span>':'<span class="gr-chip verde">Disponible</span>';
    var cupo=tit?('<b>1 / 1</b> <small>(completo)</small><small class="gr-tit">'+(soyTit?"Titular: tú":"Titular: "+E(corto(porId(tit.id))))+(enLista&&!soyTit?" · tú: reserva":"")+'</small>'):'<b>0 / 1</b><small class="gr-tit falta">Falta '+(esM?"maquinista":"OBAC")+'</small>';
    return '<label class="gr-tr'+(marcada?" on":"")+'" role="row"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><span class="gr-chk"><input type="checkbox" data-gr-rol="'+c.f+'"'+(marcada?" checked":"")+(bloq?" disabled":"")+' aria-label="'+E(nn.w+" "+nn.d)+'">'+chip+'</span><span class="gr-cupo-c">'+cupo+'</span></label>';
  }).join("")+'</div>';
  var n=sel.size;
  h+='<p class="gr-aviso-n">Tienes '+n+' noche'+(n===1?"":"s")+' seleccionada'+(n===1?"":"s")+'.</p>';
  if(D.abierto) h+='<button type="button" class="btn gr-grande" id="grGuardar">Guardar selección</button><div class="status-msg" id="grMsg"></div>';
  pn.innerHTML=h;
  pn.querySelectorAll("[data-gr-rol]").forEach(function(i){ i.onchange=function(){ if(i.checked) sel.add(i.dataset.grRol); else sel.delete(i.dataset.grRol); GR.sel[kind]=sel; panelRol(pn,D,kind); }; });
  var g=$("grGuardar"); if(g) g.onclick=function(){ guardarRol(D,kind); };
}
async function guardarRol(D,kind){
  var msg=$("grMsg"), sel=GR.sel[kind], previos=regs(D.S[kind][D.who]), ahora=new Date().toISOString();
  var recs=[...sel].sort().map(function(f){ var p=previos.filter(function(x){ return x.f===f; })[0]; return {f:f,t:(p&&p.t)||ahora}; });
  var otroK=kind==="maq"?"obac":"maq";
  var choca=recs.filter(function(r){ return tiene(D.S.vol[D.who],r.f)||tiene(D.S[otroK][D.who],r.f); });
  if(choca.length){ msg.textContent="Una noche solo puede tener un rol por persona."; msg.classList.add("err"); return; }
  msg.classList.remove("err"); msg.textContent="Guardando…";
  try{
    await sSet("guardia-"+kind+":"+D.p.inicio+":"+D.who,recs);
    msg.textContent="Guardado ✓ "+(typeof horaCorta==="function"?horaCorta():"");
    if(typeof gnInsToast==="function") gnInsToast("Selección guardada: "+recs.length+" noche(s)");
    GR.sel[kind]=null; await grRender(true);
  }catch(e){ msg.textContent=(e&&e.message)||"No se pudo guardar."; msg.classList.add("err"); }
}

/* ---------- Información (Capitán, Teniente 3° y administrador) ---------- */
function panelInfo(pn,D){
  var DOT=GN_DOTACION_MIN, completas=D.cov.filter(function(c){ return c.completa; }).length;
  var activos=ROSTER.filter(function(x){ return x.activo!==false; });
  var sinConf=activos.filter(function(x){ var id=String(x.id), c=D.S.conf[id]; return !(c&&(c.cumple||c.justificacion))&&!regs(D.S.maq[id]).length&&!regs(D.S.obac[id]).length&&!(Array.isArray(D.S.vol[id])&&D.S.vol[id].length); });
  var h='<h3 class="gr-t">Cobertura de la semana</h3><div class="gr-nota info"><span aria-hidden="true">👥</span><p>Cada noche debe contar con <b>'+DOT.voluntarios+' voluntarios + '+DOT.conductor+' maquinista + '+DOT.obac+' OBAC</b>. El OBAC titular se asigna según la precedencia; los voluntarios de más son refuerzos. <b>'+completas+' de '+D.cov.length+' noches completas.</b></p></div>';
  h+='<div class="gr-lista">'+D.cov.map(function(c){
    var nn=nombreNoche(c.f), mt=c.maq[0]?corto(porId(c.maq[0].id)):null, ot=c.obac[0]?corto(porId(c.obac[0].id)):null;
    var est=c.completa?'<span class="gr-chip verde">Completa</span>':c.nada?'<span class="gr-chip gris">Sin asignar</span>':'<span class="gr-chip rojo">Incompleta</span>';
    return '<div class="gr-nc'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+c.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+est+'</div>'
      +'<div class="gr-nc-fila"><span aria-hidden="true">🚒</span> Maquinista: '+(mt?'<b>'+E(mt)+'</b>':'<span class="falta">falta</span>')+'</div>'
      +'<div class="gr-nc-fila"><span aria-hidden="true">🎧</span> OBAC: '+(ot?'<b>'+E(ot)+'</b>':'<span class="falta">falta</span>')+'</div>'
      +(!c.completa&&!c.nada?'<small class="gr-falta">'+E(faltan(c))+'</small>':'')+'</div></div>';
  }).join("")+'</div>';
  h+='<details class="gr-det"><summary>Sin elegir noches: '+sinConf.length+' voluntario'+(sinConf.length===1?"":"s")+'</summary><p>'+(sinConf.length?sinConf.map(function(x){ return E(corto(x)); }).join(" · "):"Todos eligieron sus noches.")+'</p></details>';
  h+='<p class="gr-nota-pie">Este resumen es solo informativo. La ODD y los cambios los gestionan los oficiales desde Oficiales.</p>';
  pn.innerHTML=h;
}

/* ---------- Inicio: recordatorio de inscripción (la selección vive en Guardia) ---------- */
async function inicioInscripcion(forzar){
  var box=$("gnInscripcionCard"); if(!box) return;
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
  var b=$("inicioElegir"); if(b) b.onclick=function(){ GR.tab="vol"; window.__mostrarPestana("guardia"); };
}
var _renderOriginal=window.renderGnInscripcionCard;
window.renderGnInscripcionCard=async function(forzar){
  await inicioInscripcion(forzar);
  if(forzar||guardiaActiva()) await grRender(!!forzar);
};

/* ---------- Eventos ---------- */
document.addEventListener("click",function(ev){
  var t=ev.target.closest("[data-gr-tab]"); if(!t||!$("gnRolCard")||!$("gnRolCard").contains(t)) return;
  GR.tab=t.dataset.grTab; pintarTarjeta();
});
if(typeof window.__mostrarPestana==="function"){
  var base=window.__mostrarPestana;
  window.__mostrarPestana=function(nombre){ var r=base.apply(this,arguments); if(nombre==="guardia") grRender(true).catch(function(){}); if(nombre==="germania"){ renderNovedades(); pintarChipEstado(); } return r; };
}
/* ---------- Estado actual en la tarjeta de identidad ---------- */
async function pintarChipEstado(){
  var c=$("miEstadoChip"); if(!c) return;
  var v=$("miVoluntario"), who=v?v.value:"";
  if(!who){ c.hidden=true; return; }
  var d={}; try{ d=await getDisponibilidadVigente(); }catch(e){}
  var e=d&&d[who]&&d[who].estado;
  c.hidden=false;
  c.innerHTML=e?'<span class="dot '+E(e)+'"></span>'+E(DISP_LABELS[e]):'<span class="dot sin"></span>Marca tu estado';
}
if(typeof window.marcarMiEstado==="function"){
  var _marcar=window.marcarMiEstado;
  window.marcarMiEstado=async function(){ var r=await _marcar.apply(this,arguments); pintarChipEstado(); return r; };
}
var ultimo="__";
function vigilarIdentidad(){
  var v=$("miVoluntario"); var id=v?v.value:"";
  if(id===ultimo) return; ultimo=id;
  aplicarRol(); renderNovedades(); pintarChipEstado();
  if(guardiaActiva()) grRender(true).catch(function(){});
}
setInterval(vigilarIdentidad,700);
setInterval(function(){ if(guardiaActiva()&&!GR.cargando&&document.visibilityState==="visible"&&!document.activeElement.matches("input,select,textarea")) grRender(false).catch(function(){}); },60000);
aplicarRol();
})();
