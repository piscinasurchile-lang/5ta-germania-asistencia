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
  /* OBAC (obligatorios): Capitán y Tenientes 1°, 2° y 3°, y se completan con los siguientes
     voluntarios del orden de precedencia hasta completar OBAC_TOTAL (uno por cada noche de la semana). */
  OBAC={}; var n=0, ya=function(x){ var m=precBuscar(x.nombre); return m?String(m.id):null; };
  lista.forEach(function(x){ if(/^(capit|teniente (primero|segundo|tercero))/i.test(String(x.cargo||""))){ var id=ya(x); if(id&&!OBAC[id]){ OBAC[id]=true; n++; } } });
  lista.forEach(function(x){ if(n>=OBAC_TOTAL) return; if(/^(voluntari)/i.test(String(x.cargo||""))){ var id=ya(x); if(id&&!OBAC[id]){ OBAC[id]=true; n++; } } });
}
var OBAC=null, OBAC_TOTAL=7; /* uno por noche: 7 noches = 7 OBAC */
/* Mientras se prueban las tarjetas: estas claves ven las tarjetas Maquinista y OBAC aunque no les
   correspondan, SOLO para mirarlas (no inscriben nada). Quitar la clave al terminar la prueba. */
var VISTA_PRUEBA=["517"];
function vistaPrueba(m,kind){ return !!m&&VISTA_PRUEBA.indexOf(String(m.clave))>=0&&!(kind==="maq"?esMaquinista(m):rangoObac(m)!=null); }
function rangoPrec(m){ return m&&PREC&&PREC[String(m.id)]!=null?PREC[String(m.id)]:null; }
function porPrec(a,b){ var ra=rangoPrec(a), rb=rangoPrec(b); return (ra==null?9999:ra)-(rb==null?9999:rb); }
function rangoObac(m){ return m&&PREC&&OBAC&&OBAC[String(m.id)]&&PREC[String(m.id)]!=null?PREC[String(m.id)]:null; }
function corto(m){ return m?[m.nombre,m.apellidoPaterno].filter(Boolean).join(" "):"—"; }
function porId(id){ return ROSTER.find(function(x){ return String(x.id)===String(id); })||null; }

/* ---------- Horario permanente ----------
   Todas las noches terminan a las 08:00. Parte a las 23:00; el domingo a las 19:00.
   Queda así semana tras semana. Si hiciera falta cambiarlo, se guarda en guardia-horarios:v1
   ({def:"23:00",dom:"19:00"}) y rige para todas las semanas siguientes. */
var HORARIOS={def:"23:00",dom:"19:00",fin:"08:00"};
var HOR_NOCHE={};   /* cambios puntuales: {"2026-10-18":"20:00"} (guardia-horarios:<inicio>) */
async function cargarHorarios(){
  var h=null; try{ h=await sGet("guardia-horarios:v1",null); }catch(e){}
  if(h&&typeof h==="object"){ ["def","dom","fin"].forEach(function(k){ if(/^\d\d:\d\d$/.test(h[k]||"")) HORARIOS[k]=h[k]; }); }
  try{ var it=await leerPrefijo("guardia-horarios:"), o={}; it.forEach(function(x){ if(/:v1$/.test(x.key)||!x.value||typeof x.value!=="object") return; Object.keys(x.value).forEach(function(f){ if(/^\d\d:\d\d$/.test(x.value[f])) o[f]=x.value[f]; }); }); HOR_NOCHE=o; }catch(e){}
}
function horaNoche(f){ return HOR_NOCHE[f]||(new Date(f+"T12:00").getDay()===0?HORARIOS.dom:HORARIOS.def); }
function finNoche(f){ return instanteChile(gnAdd(f,1),HORARIOS.fin); }

function aplicarRol(){
  var m=miembro(), of=esOficial(m)||esMando(m);
  document.body.setAttribute("data-oficial",of?"1":"0");
  var a=$("novedadesAdmin"); if(a) a.hidden=!of;
  if(!of&&GR.vista!=="mi") ponerVista("mi");
}
function ponerVista(v){
  GR.vista=v; var pg=$("panel-guardia"); if(pg) pg.setAttribute("data-vista",v);
  document.querySelectorAll("#gnVistaSel [data-gv]").forEach(function(b){ var on=b.dataset.gv===v; b.classList.toggle("on",on); b.setAttribute("aria-selected",on); });
  GR.tab=v==="gestion"?"info":"mis";
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
async function planActivo(who){
  var planes=await gnPlanes(), ahora=Date.now(), hoy=todayISO();
  var ab=planes.filter(function(x){ return x.estado==="abierta"&&x.confirmado!==false; }).sort(function(a,b){ return a.inicio.localeCompare(b.inicio); });
  var abiertos=ab.filter(function(x){ return ahora<gnInsCierreMs(x); }), abierto=abiertos[0]||null;
  /* con varias semanas abiertas: la primera que este voluntario aún no confirmó (igual que el aviso de Inicio) */
  if(who) for(var i=0;i<abiertos.length;i++){ var c=null; try{ c=await sGet("guardia-confirmacion:"+abiertos[i].inicio+":"+who,null); }catch(e){} if(!(c&&(c.cumple||c.justificacion))){ abierto=abiertos[i]; break; } }
  var p=abierto||ab.filter(function(x){ return x.fin>=hoy; })[0]||null;
  return {p:p,abierto:!!abierto,lista:ab.filter(function(x){ return x.fin>=hoy; }),ahora:ahora};
}
async function cargarSemana(p){
  var pref=["guardia-inscripcion:","guardia-maq:","guardia-obac:","guardia-confirmacion:"]; /* guardia-obac: solo se lee por compatibilidad; ya no se usa */
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
    var inscritos=maq.map(function(x){ return {id:x.id,maquinista:true}; });
    Object.keys(S.vol).forEach(function(id){ if(!maqIds[id]&&tiene(S.vol[id],f)){ var m=porId(id); if(m&&m.activo!==false) inscritos.push({id:id,habilitadoMaquinista:esMaquinista(m)}); } });
    var r=window.GermaniaObac?window.GermaniaObac.obacDeNoche({inscritos:inscritos,orden:orden}):{obac:null,voluntarios:[],maquinistaPorRespaldo:null,empateSinPosicion:false};
    if(r.maquinistaPorRespaldo&&!maq.length) maq.push({id:r.maquinistaPorRespaldo,t:"",respaldo:true});
    if(r.obac) obac.push({id:r.obac,t:"",n:PREC&&PREC[r.obac]!=null?PREC[r.obac]:9999});
    vol=r.voluntarios.slice();
    var refuerzos=Math.max(0,vol.length-DOT.voluntarios);
    var completa=vol.length>=DOT.voluntarios&&maq.length>=DOT.conductor&&obac.length>=DOT.obac;
    var nada=!vol.length&&!maq.length&&!obac.length;
    return {f:f,vol:vol,maq:maq,obac:obac,refuerzos:refuerzos,completa:completa,nada:nada,empate:!!r.empateSinPosicion};
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
var GR={semana:"",vista:"mi",tab:"mis",D:null,sel:{maq:null,obac:null},selClave:"",cargando:false};
var GR_TABS={mis:["Mis noches","🌙"],vol:["Voluntario","🙋"],maq:["Maquinista","🚒"],obac:["OBAC","🎧"],info:["2 · Inscripciones","📋"],rev:["3 · Revisión","🛠"],rep:["4 · Reemplazos","🔁"]};
/* Mi guardia: mis noches, y las tarjetas de elegir noche solo mientras la elección está abierta.
   Gestión de guardia (Capitán, Teniente 3° y administrador): pasos 2, 3 y 4 (el 1 es el calendario). */
function tabsPermitidas(m,abierto){
  if(GR.vista==="gestion") return esMando(m)?["info","rev","rep"]:[];
  return ["mis"];   /* elegir noches se hace en las tarjetas de Inicio */
}
function guardiaActiva(){ var p=$("panel-guardia"); return !!p&&p.classList.contains("active"); }

async function cargarD(m,p,abierto,lista){
  var who=String(m.id), D={m:m,who:who,p:p,abierto:abierto,S:null,noches:[],cov:[],error:false,lista:lista||[]};
  if(p){
    try{ var S=await cargarSemana(p); D.noches=gnWeek(p.inicio); D.cov=cobertura({vol:S[0],maq:S[1],obac:S[2]},D.noches); D.S={vol:S[0],maq:S[1],obac:S[2],conf:S[3]}; }
    catch(e){ D.error=true; }
  }
  return D;
}
/* Dmi = la semana de este voluntario (tarjetas de Inicio y «Mis noches»); D = la que se muestra en Guardia
   (en Gestión puede ser otra semana, elegida con el selector). */
async function grRender(forzar){
  var box=$("gnRolCard"); if(!box) return;
  var m=miembro();
  if(!m){ box.innerHTML='<h2>Mi guardia nocturna</h2><p class="sub">Primero elige tu nombre en <b>Inicio</b>.</p>'; var ir=$("inicioRoles"); if(ir) ir.innerHTML=""; return; }
  if(GR.cargando&&!forzar) return;
  GR.cargando=true;
  try{
    if(!PREC) await cargarPrec();
    await cargarHorarios();
    var who=String(m.id), pa=await planActivo(who);
    var Dmi=await cargarD(m,pa.p,pa.abierto,pa.lista), D=Dmi;
    if(GR.vista==="gestion"&&pa.lista&&pa.lista.length){
      var elegida=pa.lista.filter(function(x){ return x.inicio===GR.semana; })[0]||pa.lista[0];
      GR.semana=elegida.inicio;
      if(!pa.p||elegida.inicio!==pa.p.inicio) D=await cargarD(m,elegida,Date.now()<gnInsCierreMs(elegida),pa.lista);
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
  pn.innerHTML='<p class="sub"><b>'+ok+' de '+D.cov.length+' noches completas</b> (cada una: '+DOT.voluntarios+' voluntarios + '+DOT.conductor+' maquinista + '+DOT.obac+' OBAC).</p><div class="gr-lista">'+D.cov.map(function(c){
    var n=nombreNoche(c.f); return '<div class="gr-nc'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(n.w)+'</b><i>'+E(n.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+c.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+'</em>':'')+(c.completa?'<span class="gr-chip verde">Completa</span>':'<span class="gr-chip rojo">Incompleta</span>')+'</div><div class="gr-nc-fila">🚒 '+(c.maq[0]?'<b>'+E(corto(porId(c.maq[0].id)))+'</b>':'<span class="falta">falta</span>')+' · 🎧 '+(c.obac[0]?'<b>'+E(corto(porId(c.obac[0].id)))+'</b>':'<span class="falta">falta</span>')+'</div></div></div>'; }).join("")+'</div><button type="button" class="btn secondary gr-grande" id="irGestionar">Gestionar la guardia</button>';
  var g=$("irGestionar"); if(g) g.onclick=function(){ ponerVista("gestion"); window.__mostrarPestana("guardia"); };
}
function pintarInicioRoles(){
  var box=$("inicioRoles"); if(!box) return;
  var D=GR.Dmi, m=miembro();
  if(!m||!D||!D.p||!D.abierto||D.error||!D.S){ box.innerHTML=""; return; }
  var cards=[["vol","Voluntario","🙋"]];
  if(esMaquinista(m)||vistaPrueba(m,"maq")) cards.push(["maq","Maquinista","🚒"]);
  if(esMando(m)) cards.push(["info","Información","📋"]);
  var hasta=new Date(gnInsCierreMs(D.p)).toLocaleString("es-CL",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Santiago"}).replace(".","");
  box.innerHTML=cards.map(function(c){
    return '<details class="card gr-rol-card" data-rol="'+c[0]+'"'+(GR.abiertas[c[0]]?" open":"")+'><summary><span class="gr-rol-ico" aria-hidden="true">'+c[2]+'</span><span class="gr-rol-tit">Guardia nocturna · '+c[1]+'<small>Semana '+E(gnFmt(D.p.inicio))+' · cierra '+E(hasta)+'</small></span></summary><div class="gr-rol-body" id="irp-'+c[0]+'"></div></details>';
  }).join("");
  cards.forEach(function(c){ var pn=$("irp-"+c[0]); if(!pn) return; if(c[0]==="vol") panelVol(pn,D); else if(c[0]==="info") resumenInfo(pn,D); else panelRol(pn,D,c[0]); });
  box.querySelectorAll("details[data-rol]").forEach(function(d){ d.addEventListener("toggle",function(){ GR.abiertas[d.dataset.rol]=d.open; }); });
}

function selectorSemana(D){
  if(GR.vista!=="gestion"||!D.lista||D.lista.length<2) return "";
  return '<label class="rv-lbl" for="grSemana">Semana que gestionas</label><select id="grSemana" class="rv-sel">'+D.lista.map(function(x){ return '<option value="'+E(x.inicio)+'"'+(D.p&&x.inicio===D.p.inicio?" selected":"")+'>'+E(gnFmt(x.inicio))+' → '+E(gnFmt(gnAdd(x.inicio,7)))+(Date.now()<gnInsCierreMs(x)?" · elección abierta":" · elección cerrada")+'</option>'; }).join("")+'</select>';
}
function cabecera(D){
  var m=D.m, p=D.p;
  var sem=p?('Semana '+E(gnFmt(p.inicio))+' → '+E(gnFmt(gnAdd(p.inicio,7)))+' · '+HORARIOS.def+' (domingo '+HORARIOS.dom+') a '+HORARIOS.fin):'';
  return '<div class="gr-quien"><img class="gr-foto" src="'+E(fotoVoluntario(m))+'" alt=""><div><strong>'+E(nombreCompleto(m))+'</strong><span>'+E(sem||"Sin semana abierta")+' · solo presencial</span></div></div>'+selectorSemana(D);
}
function pintarTarjeta(){
  var box=$("gnRolCard"), D=GR.D; if(!box||!D) return;
  var tabs=tabsPermitidas(D.m,D.abierto); if(tabs.indexOf(GR.tab)<0) GR.tab=tabs[0]||"mis";
  var html='<h2>'+(GR.vista==="gestion"?"Gestión de guardia":"Mi guardia nocturna")+'</h2>'+cabecera(D);
  if(!tabs.length) html+='<div class="empty">Esta parte la gestionan el Capitán, el Teniente 3° y el administrador.</div>';
  if(tabs.length>1) html+='<div class="gr-tabs" role="tablist">'+tabs.map(function(t){ return '<button type="button" role="tab" class="gr-tab'+(t===GR.tab?" on":"")+'" data-gr-tab="'+t+'" aria-selected="'+(t===GR.tab)+'"><span aria-hidden="true">'+GR_TABS[t][1]+'</span>'+GR_TABS[t][0]+'</button>'; }).join("")+'</div>';
  if(tabs.length) html+='<div id="grPanel"></div>';
  box.innerHTML=html;
  pintarPanel();
}
function pintarPanel(){
  var pn=$("grPanel"), D=GR.D; if(!pn||!D) return;
  if(GR.tab==="mis"){ panelMis(pn,D); return; }
  if(!D.p){ pn.innerHTML='<div class="empty">No hay una semana con inscripción abierta. Cuando el Capitán la abra, la verás aquí.</div>'; return; }
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
function panelVol(pn,D){
  var who=D.who, saved=Array.isArray(D.S.vol[who])?D.S.vol[who]:[], conf=D.S.conf[who];
  var confirmada=!!conf&&!!(conf.cumple||conf.justificacion||conf.confirmadaEn), editable=D.abierto;
  /* mientras la elección esté abierta se pueden SUMAR noches (nunca quitar las ya confirmadas) */
  var ck=D.p.inicio+":"+who; if(GN_INS_CLAVE!==ck){ GN_INS_CLAVE=ck; GN_INS_SEL=new Set(saved); }
  var cierre=gnInsCierreMs(D.p);
  var cierreTxt=new Date(cierre).toLocaleString("es-CL",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Santiago"}).replace(".","");
  var sel=GN_INS_SEL, n=sel.size;
  var h='<h3 class="gr-t">Elige tus noches</h3>';
  h+='<p class="sub gr-como">Toca cada noche en que puedes venir y al final presiona <b>Confirmar</b>.</p>';
  h+=D.abierto?'<p class="sub">Cierra el <b>'+E(cierreTxt)+'</b> · faltan '+E(avisoRestante(cierre,Date.now()))+'. Elige <b>como mínimo '+GN_NOCHES_MIN+' noches</b>; puedes marcar todas las que quieras.</p>':'<p class="sub">La inscripción de esta semana está cerrada.</p>';
  var rolSet={}; regs(D.S.maq[who]).forEach(function(x){ rolSet[x.f]=1; });
  var nRol=Object.keys(rolSet).length, unionN=Object.keys(Object.assign({},rolSet,(function(){ var o={}; sel.forEach(function(f){ o[f]=1; }); return o; })())).length;
  if(nRol){
    var nomsRol=Object.keys(rolSet).sort().map(function(f){ var q=nombreNoche(f); return q.w+" "+q.d; }).join(", ");
    var falta=Math.max(0,GN_NOCHES_MIN-unionN);
    h+='<div class="gr-semana"><div class="gr-sem-fila ok">✔ <b>Tu noche como maquinista</b> (obligatoria): '+E(nomsRol)+'</div>'
      +(falta?'<div class="gr-sem-fila falta">➕ Te falta <b>'+falta+' noche'+(falta===1?"":"s")+' como voluntario</b> para llegar al mínimo de '+GN_NOCHES_MIN+'. Elígela abajo.</div>':'<div class="gr-sem-fila ok">✔ Ya cumples el mínimo de '+GN_NOCHES_MIN+' noches. Puedes sumar más si quieres.</div>')+'</div>';
  }
  if(confirmada) h+='<p class="gr-ok">✔ Confirmadas: '+saved.length+' noche(s) como voluntario. Puedes <b>agregar más</b> mientras la elección esté abierta.</p>';
  h+='<div class="gr-noches">'+D.cov.map(function(c){
    var nn=nombreNoche(c.f), mia=sel.has(c.f), fija=saved.indexOf(c.f)>=0;
    var otro=tiene(D.S.maq[who],c.f)?"maquinista":"";
    var dis=!editable||!!otro||fija;
    return '<button type="button" class="gr-noche'+(mia?" on":"")+(c.completa?" full":"")+'" data-gr-vol="'+c.f+'"'+(dis?" disabled":"")+' aria-pressed="'+mia+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><span class="gr-info"><span class="gr-hora">'+E(horaNoche(c.f))+' → '+E(HORARIOS.fin)+'</span>'+(otro?'<span class="gr-cupo">Ya la elegiste como '+otro+'</span>':filaCupos(c))+'</span><span class="gr-marca" aria-hidden="true">'+(mia?"✔":"")+'</span></button>';
  }).join("")+'</div>';
  if(editable){
    h+='<div id="giAviso" class="gr-aviso"></div><button type="button" class="btn gr-grande" id="giConfirmar">'+(confirmada?'Agregar estas noches':'Confirmar mis noches')+(n?' ('+n+' seleccionada'+(n===1?"":"s")+')':'')+'</button>'
      +(confirmada?'':'<p class="gr-link"><a href="#" id="giJustificar">No puedo cumplir: justificar por correo</a></p>');
  }
  pn.innerHTML=h;
  pn.querySelectorAll("[data-gr-vol]").forEach(function(b){ b.onclick=function(){ var f=b.dataset.grVol; if(sel.has(f)) sel.delete(f); else sel.add(f); panelVol(pn,D); }; });
  var c=$("giConfirmar"); if(c) c.onclick=function(){ if(confirmada&&sel.size<=saved.length){ var a=$("giAviso"); if(a) a.textContent="Marca al menos una noche nueva para agregar."; return; } gnInsConfirmar(D.p,who); };
  var j=$("giJustificar"); if(j) j.onclick=function(e){ e.preventDefault(); gnInsJustificar(D.p,who); };
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
    var marcada=sel.has(c.f), bloq=prev||!D.abierto||comoVol||comoOtro;
    var chip=comoVol?'<span class="gr-chip gris">Ya voluntario</span>':comoOtro?'<span class="gr-chip gris">Ya '+(esM?"OBAC":"maquinista")+'</span>':marcada?'<span class="gr-chip azul">Seleccionado</span>':'<span class="gr-chip verde">Disponible</span>';
    var cupo=tit?('<b>1 / 1</b> <small>(completo)</small><small class="gr-tit">'+(soyTit?"Titular: tú":"Titular: "+E(corto(porId(tit.id))))+(enLista&&!soyTit?" · tú: reserva":"")+'</small>'):'<b>0 / 1</b><small class="gr-tit falta">Falta '+(esM?"maquinista":"OBAC")+'</small>';
    return '<label class="gr-tr'+(marcada?" on":"")+'" role="row"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><span class="gr-chk"><input type="checkbox" data-gr-rol="'+c.f+'"'+(marcada?" checked":"")+(bloq?" disabled":"")+' aria-label="'+E(nn.w+" "+nn.d)+'">'+chip+'</span><span class="gr-cupo-c">'+cupo+'</span></label>';
  }).join("")+'</div>';
  var n=sel.size;
  h+='<p class="gr-aviso-n">Tienes '+n+' noche'+(n===1?"":"s")+' seleccionada'+(n===1?"":"s")+'.</p>';
  if(D.abierto&&!prev) h+='<button type="button" class="btn gr-grande" id="grGuardar-'+kind+'">Guardar selección</button><div class="status-msg" id="grMsg-'+kind+'"></div>';
  pn.innerHTML=h;
  pn.querySelectorAll("[data-gr-rol]").forEach(function(i){ i.onchange=function(){ if(kind==="obac"){ sel.clear(); if(i.checked) sel.add(i.dataset.grRol); } else if(i.checked) sel.add(i.dataset.grRol); else sel.delete(i.dataset.grRol); GR.sel[kind]=sel; panelRol(pn,D,kind); }; });
  var g=$("grGuardar-"+kind); if(g) g.onclick=function(){ guardarRol(D,kind); };
}
async function guardarRol(D,kind){
  if(vistaPrueba(D.m,kind)) return;
  var msg=$("grMsg-"+kind), sel=GR.sel[kind], previos=regs(D.S[kind][D.who]), ahora=new Date().toISOString();
  var recs=[...sel].sort().map(function(f){ var p=previos.filter(function(x){ return x.f===f; })[0]; return {f:f,t:(p&&p.t)||ahora}; });
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
function panelInfo(pn,D){
  var DOT=GN_DOTACION_MIN, completas=D.cov.filter(function(c){ return c.completa; }).length;
  var activos=ROSTER.filter(function(x){ return x.activo!==false; });
  var sinConf=activos.filter(function(x){ var id=String(x.id), c=D.S.conf[id]; return !(c&&(c.cumple||c.justificacion))&&!regs(D.S.maq[id]).length&&!(Array.isArray(D.S.vol[id])&&D.S.vol[id].length); });
  var h='<h3 class="gr-t">Cobertura de la semana</h3><div class="gr-nota info"><span aria-hidden="true">👥</span><p>Cada noche debe contar con <b>'+DOT.voluntarios+' voluntarios + '+DOT.conductor+' maquinista + '+DOT.obac+' OBAC</b>. El OBAC se calcula solo: es el inscrito de mayor precedencia de esa noche (si no hay maquinista, el Capitán pasa a maquinista y el OBAC es el siguiente). Los voluntarios de más son refuerzos. <b>'+completas+' de '+D.cov.length+' noches completas.</b></p></div>';
  h+='<div class="gr-lista">'+D.cov.map(function(c){
    var nn=nombreNoche(c.f), mt=c.maq[0]?corto(porId(c.maq[0].id)):null, ot=c.obac[0]?corto(porId(c.obac[0].id)):null;
    var est=c.completa?'<span class="gr-chip verde">Completa</span>':c.nada?'<span class="gr-chip gris">Sin asignar</span>':'<span class="gr-chip rojo">Incompleta</span>';
    return '<div class="gr-nc'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><div class="gr-nc-body"><div class="gr-nc-top"><b>'+c.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+est+'</div>'
      +'<div class="gr-nc-fila"><span aria-hidden="true">🚒</span> Maquinista: '+(mt?'<b>'+E(mt)+'</b>':'<span class="falta">falta</span>')+'</div>'
      +'<div class="gr-nc-fila"><span aria-hidden="true">🎧</span> OBAC: '+(ot?'<b>'+E(ot)+'</b>':'<span class="falta">falta</span>')+'</div>'
      +(!c.completa&&!c.nada?'<small class="gr-falta">'+E(faltan(c))+'</small>':'')+'</div></div>';
  }).join("")+'</div>';
  h+='<details class="gr-det"><summary>Sin elegir noches: '+sinConf.length+' voluntario'+(sinConf.length===1?"":"s")+'</summary><p>'+(sinConf.length?sinConf.map(function(x){ return E(corto(x)); }).join(" · "):"Todos eligieron sus noches.")+'</p></details>';
  h+='<details class="gr-det" id="hrDet"><summary>Horario de las noches</summary><p>Por defecto: '+HORARIOS.def+' (domingo '+HORARIOS.dom+') hasta '+HORARIOS.fin+'. Cambia la hora de inicio de una noche si hace falta.</p><div class="gr-lista">'+D.noches.map(function(f){ var n=nombreNoche(f); return '<label class="hr-fila"><span><b>'+E(n.w)+'</b> '+E(n.d)+'</span><input type="time" data-hr="'+f+'" value="'+E(horaNoche(f))+'"></label>'; }).join("")+'</div><label class="hr-perm"><input type="checkbox" id="hrPerm"> Dejar estas horas como habituales (domingo y resto) para las semanas siguientes</label><button type="button" class="btn gr-grande" id="hrGuardar">Guardar horario</button><div class="status-msg" id="hrMsg"></div></details>';
  h+='<p class="gr-nota-pie">Este resumen es solo informativo. La ODD y los cambios los gestionan los oficiales desde Oficiales.</p>';
  pn.innerHTML=h;
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
function revQuitarRoles(n,id){ n.vol=n.vol.filter(function(x){ return x!==id; }); if(n.maq===id) n.maq=null; if(n.obac===id) n.obac=null; }
function revAplicar(doc,D,op){
  var n=doc.noches[op.f]; if(!n) return;
  if(op.t==="addVol"){ revQuitarRoles(n,op.id); n.vol.push(op.id); revLog(doc,D,op.f,"vol","agrega",op.id); }
  else if(op.t==="delVol"){ n.vol=n.vol.filter(function(x){ return x!==op.id; }); revLog(doc,D,op.f,"vol","quita",op.id); }
  else if(op.t==="rol"){
    var antes=n[op.rol]; if(antes===(op.id||null)) return;
    if(op.id){ revQuitarRoles(n,op.id); n[op.rol]=op.id; revLog(doc,D,op.f,op.rol,antes?"cambia":"agrega",op.id,antes); }
    else{ n[op.rol]=null; revLog(doc,D,op.f,op.rol,"quita",null,antes); }
  }
}
function revCov(doc){
  var DOT=GN_DOTACION_MIN;
  return Object.keys(doc.noches).sort().map(function(f){
    var n=doc.noches[f], ok=n.vol.length>=DOT.voluntarios&&!!n.maq&&!!n.obac, nada=!n.vol.length&&!n.maq&&!n.obac;
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
  if(c.accion==="agrega") q="agregó a <b>"+E(nom(c.personaId))+"</b> como "+ROL_TXT[c.rol];
  else if(c.accion==="quita") q="quitó a <b>"+E(nom(c.personaId||c.antesId))+"</b> ("+ROL_TXT[c.rol]+")";
  else if(c.accion==="cambia") q="cambió "+ROL_TXT[c.rol]+": <b>"+E(nom(c.personaId))+"</b> reemplaza a "+E(nom(c.antesId));
  else if(c.accion==="aprueba") return '<b>Aprobó la dotación</b> · '+E(c.por)+' · '+E(h);
  else if(c.accion==="reabre") return '<b>Reabrió la revisión</b> · '+E(c.por)+' · '+E(h);
  else return '<b>Rehízo la propuesta desde las inscripciones</b> · '+E(c.por)+' · '+E(h);
  return '<b>'+E(dia)+'</b> · '+q+' · '+E(c.por)+' · '+E(h);
}
async function panelRev(pn,D){
  if(RV.clave!==D.p.inicio||(RV.doc===null&&!RV.ocupado)){ pn.innerHTML='<p class="sub">Cargando…</p>'; try{ await revCargar(D); }catch(e){ pn.innerHTML='<div class="empty">No se pudo leer la revisión. <button type="button" class="btn small secondary" id="rvReint">Reintentar</button></div>'; var r=$("rvReint"); if(r) r.onclick=function(){ RV.clave=""; panelRev(pn,D); }; return; } }
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
    var chips=c.n.vol.map(function(id){ return '<span class="rv-chip">'+E(nom(id))+(aprobada?'':'<button type="button" data-rv-del="'+c.f+'|'+E(id)+'" aria-label="Quitar a '+E(nom(id))+'">×</button>')+'</span>'; }).join("")||'<span class="falta">sin voluntarios</span>';
    var optV='<option value="">+ Agregar voluntario</option>'+activos.filter(function(x){ return !o[String(x.id)]; }).map(function(x){ return '<option value="'+E(x.id)+'">'+E(corto(x))+'</option>'; }).join("");
    var optM=function(lista,cur,rol){ var l=lista.slice(); if(cur&&!l.some(function(x){ return String(x.id)===cur; })){ var m=porId(cur); if(m) l.unshift(m); } return '<option value="">— sin asignar —</option>'+l.map(function(x){ var id=String(x.id); var bloq=o[id]&&id!==cur; return '<option value="'+E(id)+'"'+(id===cur?" selected":"")+(bloq?" disabled":"")+'>'+(rol==="obac"&&rangoPrec(x)!=null?"N° "+rangoPrec(x)+" · ":"")+E(corto(x))+(bloq?" (ya asignado)":"")+'</option>'; }).join(""); };
    return '<div class="gr-nc rv'+(c.completa?" ok":"")+'"><span class="gr-dia"><b>'+E(nn.w)+'</b><i>'+E(nn.d)+'</i></span><div class="gr-nc-body">'
      +'<div class="gr-nc-top"><b>'+c.n.vol.length+' / '+DOT.voluntarios+' voluntarios</b>'+(c.refuerzos?' <em>+'+c.refuerzos+' refuerzo'+(c.refuerzos===1?"":"s")+'</em>':'')+est+'</div>'
      +'<div class="rv-chips">'+chips+'</div>'
      +(aprobada?'':'<select class="rv-sel" data-rv-add="'+c.f+'" aria-label="Agregar voluntario el '+E(nn.w+" "+nn.d)+'">'+optV+'</select>')
      +'<label class="rv-lbl">🚒 Maquinista</label>'+(aprobada?'<div class="gr-nc-fila">'+(c.n.maq?'<b>'+E(nom(c.n.maq))+'</b>':'<span class="falta">falta</span>')+'</div>':'<select class="rv-sel" data-rv-rol="'+c.f+'|maq">'+optM(maqs,c.n.maq,"maq")+'</select>')
      +'<label class="rv-lbl">🎧 OBAC</label>'+(aprobada?'<div class="gr-nc-fila">'+(c.n.obac?'<b>'+E(nom(c.n.obac))+'</b>':'<span class="falta">falta</span>')+'</div>':'<select class="rv-sel" data-rv-rol="'+c.f+'|obac">'+optM(obacs,c.n.obac,"obac")+'</select>')
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
  else h+='<button type="button" class="btn gr-grande" id="rvAprobar">Aprobar dotación</button><p class="gr-link"><a href="#" id="rvRehacer">Rehacer desde las inscripciones</a></p>';
  pn.innerHTML=h;
  var guardarOp=async function(op){
    if(RV.ocupado) return; RV.ocupado=true; var nuevo=clonar(doc);
    revAplicar(nuevo,D,op);
    try{ await revGuardar(D,nuevo); RV.msg=""; RV.err=false; }
    catch(e){ RV.msg=e.conflicto?"Otra persona cambió la revisión mientras editabas. Se cargó lo último; repite tu cambio.":"No se pudo guardar el cambio."; RV.err=true; try{ await revCargar(D); }catch(x){} }
    RV.ocupado=false; panelRev(pn,D);
  };
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
  var doc=RV.doc, cov=revCov(doc), malas=cov.filter(function(c){ return !c.completa; });
  var aviso=malas.length?"Hay "+malas.length+" noche(s) incompleta(s):\n"+malas.map(function(c){ var n=nombreNoche(c.f); return "• "+n.w+" "+n.d+": "+faltan({vol:c.n.vol,maq:c.n.maq?[1]:[],obac:c.n.obac?[1]:[]}); }).join("\n")+"\n\n":"";
  if(!confirm(aviso+"¿Aprobar la dotación? Se actualizarán las guardias de la semana con este resultado (queda historial de lo anterior).")) return;
  var msg=$("rvMsg"); if(msg){ msg.classList.remove("err"); msg.textContent="Aprobando…"; }
  var p=D.p, n=0;
  try{
    for(var i=0;i<cov.length;i++){
      var c=cov[i]; if(c.nada) continue;
      var hIng=horaNoche(c.f), clave=claveGuardia(c.f,hIng);
      var ex=null; try{ ex=await getGuardia(clave); }catch(e){}
      var previos={}; ((ex&&ex.guardianes)||[]).forEach(function(g){ previos[g.id]=g; });
      var d={fechaIng:c.f,horaIng:hIng,fechaSal:gnAdd(c.f,1),horaSal:HORARIOS.fin,oficial:c.n.obac||"",conductor:c.n.maq||"",
        guardianes:c.n.vol.map(function(id){ return previos[id]||{id:id,estado:"cuartel",motivo:"",correo:false,obs:"",reemplazo:"",reemplazoRegistradoEn:""}; }),
        novedades:(ex&&ex.novedades)||""};
      await setGuardia(clave,d); n++;
    }
    var nuevo=clonar(doc); nuevo.estado="aprobada"; nuevo.aprobadaPorId=String(D.m.id); nuevo.aprobadaPor=corto(D.m); nuevo.aprobadaEn=new Date().toISOString();
    revLog(nuevo,D,D.noches[0],"vol","aprueba");
    await revGuardar(D,nuevo); RV.msg="Dotación aprobada. Guardias actualizadas: "+n+"."; RV.err=false;
  }catch(e){ RV.msg=e&&e.conflicto?"Otra persona cambió la revisión. Se cargó lo último.":"No se pudo aprobar. No se cambió la aprobación; inténtalo de nuevo."; RV.err=true; try{ await revCargar(D); }catch(x){} }
  panelRev(pn,D);
}

/* ---------- Mis noches / avisos / reemplazos ----------
   Mis noches = las noches donde quedé en una dotación APROBADA (guardia-revision:<inicio>), hasta que la noche termina.
   Una noche terminada pasa a «cumplidas» (historial en Mi estado). Si avisé que no podía y otro la cubrió,
   la noche NO cuenta para mí y se acredita a quien la cubrió.
   Aviso: guardia-aviso:<fecha>:<id> = {f,id,rol,motivo,en,estado:abierto|cubierto|sin_reemplazo,reemplazoId,...}. */
var ROL_NOCHE={vol:"Voluntario",maq:"Maquinista",obac:"OBAC"};
var MN={cache:null,who:"",en:0};
function avKey(f,id){ return "guardia-aviso:"+f+":"+id; }
async function misNochesDatos(who,forzar){
  if(!forzar&&MN.cache&&MN.who===who&&Date.now()-MN.en<15000) return MN.cache;
  var rs=await Promise.all([leerPrefijo("guardia-revision:"),leerPrefijo("guardia-aviso:")]);
  var avisos={}; rs[1].forEach(function(it){ if(it.value&&it.value.f) avisos[it.value.f+":"+it.value.id]=it.value; });
  var ahora=Date.now(), prox=[], cumpl=[], vistas={};
  rs[0].forEach(function(it){
    var d=it.value; if(!d||d.estado!=="aprobada"||!d.noches) return;
    Object.keys(d.noches).sort().forEach(function(f){
      var n=d.noches[f], rol=n.maq===who?"maq":n.obac===who?"obac":(n.vol||[]).indexOf(who)>=0?"vol":null;
      var av=avisos[f+":"+who], cubre=null;
      Object.keys(avisos).forEach(function(k){ var a=avisos[k]; if(a.f===f&&a.estado==="cubierto"&&String(a.reemplazoId)===who) cubre=a.id; });
      if(rol){ vistas[f]=1; var e={f:f,rol:rol,hora:horaNoche(f),aviso:av||null,cubre:cubre,cuenta:!(av&&av.estado!=="abierto"?false:false)}; (finNoche(f)>ahora?prox:cumpl).push(e); }
    });
  });
  /* noches que cedí y ya cubrió otro: ya no estoy en la dotación, pero se muestran como «no cuenta» */
  Object.keys(avisos).forEach(function(k){ var a=avisos[k]; if(String(a.id)!==who||a.estado!=="cubierto"||vistas[a.f]) return; var e={f:a.f,rol:a.rol,hora:horaNoche(a.f),aviso:a,cubre:null}; (finNoche(a.f)>ahora?prox:cumpl).push(e); });
  prox.sort(function(a,b){ return a.f.localeCompare(b.f); }); cumpl.sort(function(a,b){ return b.f.localeCompare(a.f); });
  /* ¿esta noche cuenta para mí? Solo si no avisé que no podía */
  cumpl.forEach(function(e){ e.cuenta=!e.aviso; });
  MN.cache={prox:prox,cumpl:cumpl,avisos:avisos}; MN.who=who; MN.en=Date.now();
  return MN.cache;
}
function tarjetaNoche(e,conBoton){
  var n=nombreNoche(e.f), av=e.aviso, est="";
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
  var d; try{ d=await misNochesDatos(String(m.id),forzar); }catch(e){ return; }
  if(!d.prox.length){ box.innerHTML=""; return; }
  box.innerHTML='<div class="card home-pend"><h2>Mis noches de guardia</h2><div class="gr-lista">'+d.prox.map(function(e){ return tarjetaNoche(e,false); }).join("")+'</div><button type="button" class="btn secondary gr-grande" id="mnVer">Ver y avisar si no puedo</button></div>';
  $("mnVer").onclick=function(){ ponerVista("mi"); window.__mostrarPestana("guardia"); };
}
async function misNochesCumplidas(forzar){
  var box=$("misNochesCumplidas"); if(!box) return;
  var m=miembro(); if(!m){ box.innerHTML=""; return; }
  var d; try{ d=await misNochesDatos(String(m.id),forzar); }catch(e){ return; }
  var ok=d.cumpl.filter(function(e){ return e.cuenta; }).length;
  box.innerHTML='<h2>Noches cumplidas</h2><p class="sub">'+ok+' noche'+(ok===1?"":"s")+' cumplida'+(ok===1?"":"s")+' con dotación aprobada.</p>'
   +(d.cumpl.length?'<div class="gr-lista">'+d.cumpl.map(function(e){
      var n=nombreNoche(e.f), nota=e.cubre?'<span class="gr-chip azul">Cubriste a '+E(nom(e.cubre))+' · cuenta a tu favor</span>':e.cuenta?'<span class="gr-chip verde">Cumplida</span>':'<span class="gr-chip gris">No cuenta'+(e.aviso&&e.aviso.estado==="cubierto"?' · la cubrió '+E(nom(e.aviso.reemplazoId)):'')+'</span>';
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
    var av=await sGetV(avKey(f,id),null); if(!av.value) throw new Error("aviso");
    var nuevoAv=Object.assign({},av.value,{estado:repId?"cubierto":"sin_reemplazo",reemplazoId:repId||null,resueltoPorId:String(D.m.id),resueltoPor:corto(D.m),resueltoEn:new Date().toISOString()});
    if(repId){
      /* 1) dotación de la semana (revisión) */
      var revs=await leerPrefijo("guardia-revision:"), it=revs.filter(function(x){ return x.value&&x.value.noches&&x.value.noches[f]; })[0];
      if(it){
        var cur=await sGetV(it.key,null), doc=clonar(cur.value), n=doc.noches[f], rol=av.value.rol;
        revQuitarRoles(n,repId);
        if(rol==="maq"||rol==="obac"){ n[rol]=repId; } else { n.vol=n.vol.filter(function(x){ return x!==id; }); n.vol.push(repId); }
        revLog(doc,{m:D.m},f,rol,"cambia",repId,id);
        await sSet(it.key,doc,{ifVersion:Number.isInteger(cur.version)?cur.version:0});
        /* 2) si ya estaba aprobada, la guardia que usan informes y ODD */
        if(doc.estado==="aprobada"){
          var ck=claveGuardia(f,horaNoche(f)), g=null; try{ g=await getGuardia(ck); }catch(e){}
          if(g){
            if(rol==="maq") g.conductor=repId; else if(rol==="obac") g.oficial=repId;
            else g.guardianes=(g.guardianes||[]).map(function(x){ return String(x.id)===id?Object.assign({},x,{estado:"no",motivo:av.value.motivo||"Aviso",correo:true,reemplazo:repId,reemplazoRegistradoEn:nuevoAv.resueltoEn}):x; });
            g.reemplazos=(g.reemplazos||[]).concat([{rol:rol,sale:id,entra:repId,en:nuevoAv.resueltoEn,por:corto(D.m)}]);
            await setGuardia(ck,g);
          }
        }
      }
    }
    await sSet(avKey(f,id),nuevoAv,{ifVersion:Number.isInteger(av.version)?av.version:0});
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
};

/* ---------- Eventos ---------- */
document.addEventListener("click",function(ev){
  var v=ev.target.closest("#gnVistaSel [data-gv]");
  if(v){ ponerVista(v.dataset.gv); pintarTarjeta(); return; }
  var t=ev.target.closest("[data-gr-tab]"); if(!t||!$("gnRolCard")||!$("gnRolCard").contains(t)) return;
  GR.tab=t.dataset.grTab; pintarTarjeta();
});
if(typeof window.__mostrarPestana==="function"){
  var base=window.__mostrarPestana;
  window.__mostrarPestana=function(nombre){ var r=base.apply(this,arguments); if(nombre==="guardia") grRender(true).catch(function(){}); if(nombre==="germania"){ renderNovedades(); pintarChipEstado(); misNochesInicio(true); } if(nombre==="estado") misNochesCumplidas(true); return r; };
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
/* Al entrar a una pantalla (por pestaña, barra inferior o atajo) se refresca lo que muestra: así Inicio y Guardia
   siempre reflejan la semana recién creada, sin esperar al refresco de 60 s. */
function alActivarPanel(id){
  if(id==="panel-germania"){ MN.cache=null; renderNovedades(); pintarChipEstado(); grRender(true).catch(function(){}); misNochesInicio(true); }
  else if(id==="panel-guardia"){ grRender(true).catch(function(){}); }
  else if(id==="panel-estado"){ misNochesCumplidas(true); }
}
document.querySelectorAll(".panel").forEach(function(pn){
  var antes=pn.classList.contains("active");
  new MutationObserver(function(){ var ahora=pn.classList.contains("active"); if(ahora&&!antes) alActivarPanel(pn.id); antes=ahora; }).observe(pn,{attributes:true,attributeFilter:["class"]});
});
document.addEventListener("change",function(ev){ if(ev.target&&ev.target.id==="grSemana"){ GR.semana=ev.target.value; RV.clave=""; grRender(true).catch(function(){}); } });
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
  aplicarRol(); renderNovedades(); pintarChipEstado(); MN.cache=null; misNochesInicio(true); misNochesCumplidas(true);
  grRender(true).catch(function(){});
}
setInterval(vigilarIdentidad,700);
setInterval(function(){ if((guardiaActiva()||($("panel-germania")&&$("panel-germania").classList.contains("active")))&&!GR.cargando&&document.visibilityState==="visible"&&!document.activeElement.matches("input,select,textarea")) grRender(false).catch(function(){}); },60000);
cargarHorarios().then(function(){ misNochesInicio(false); });
aplicarRol();
})();
