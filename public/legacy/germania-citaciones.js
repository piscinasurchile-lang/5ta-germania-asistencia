/* GERMANIA · Citaciones, pre-asistencia, Anteriores y Anular (STAGING).
 * Spec: docs/02-especificaciones (Inicio, Avisos y Citaciones) + Maestro v0.6.
 * Claves nuevas (no tocan las existentes):
 *   citaciones:index:v1            -> lista de citaciones {id,tipo,fecha,hora,detalle,urgente,creadaPor,estado,...}
 *   citacion-resp:<id>:<voluntario> -> {vol,r:'asistire'|'no'|'excusa',motivo,en,hist:[]}
 * Los partes existentes siguen con su clave fecha__tipo; las listas ligadas a una citación usan
 * fecha__tipo--HHMM para que dos citaciones del mismo tipo el mismo día no se pisen.
 */
(function(){
  "use strict";
  var IDX="citaciones:index:v1";
  var $=function(id){return document.getElementById(id);};
  var MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var tab="citaciones", cache=null, respuestas={};
  function esc2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function esOficial(){return document.body&&document.body.getAttribute("data-oficial")==="1";}
  function yo(){var s=$("miVoluntario");return s&&s.value?String(s.value):"";}
  function fechaCorta(f){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(f||"");return m?(parseInt(m[3],10)+"-"+MESES[parseInt(m[2],10)-1]):(f||"");}
  function nombreCit(c){return c.tipo+" – "+fechaCorta(c.fecha)+(c.hora?" – "+c.hora:"");}
  function nombreDe(id){var p=(window.ROSTER||ROSTER||[]).find(function(x){return String(x.id)===String(id);});return p?nombreCompleto(p):("Voluntario "+id);}
  function ahoraTxt(){return new Date().toISOString();}

  async function leerIdx(){var v=await sGet(IDX,[]);return Array.isArray(v)?v:[];}
  async function guardarIdx(a){return await sSet(IDX,a);}
  async function leerResp(id){
    try{
      var items=await gnHistorialLeerPrefijo("citacion-resp:"+id+":");
      var m={};items.forEach(function(x){var v=x&&x.value;if(v&&v.vol!=null)m[String(v.vol)]=v;});
      return m;
    }catch(e){return respuestas[id]||{};}
  }

  /* ---------- Estructura de pestañas dentro de Pasar lista ---------- */
  function montar(){
    var panel=$("panel-lista");if(!panel||$("citTabs"))return;
    var pasar=panel.querySelector(":scope > .card");if(!pasar)return;
    pasar.id="pasarListaCard";
    var tabs=document.createElement("div");tabs.id="citTabs";tabs.className="cit-tabs";
    tabs.innerHTML='<button type="button" data-t="citaciones">Citaciones<i class="cit-dot" id="citDot" hidden></i></button><button type="button" data-t="pasar">Pasar lista</button><button type="button" data-t="anteriores">Anteriores</button>';
    var c1=document.createElement("div");c1.id="citCard";c1.className="card";
    var c2=document.createElement("div");c2.id="antCard";c2.className="card";
    panel.insertBefore(tabs,pasar);panel.insertBefore(c1,pasar);panel.insertBefore(c2,pasar);
    tabs.addEventListener("click",function(e){var b=e.target.closest("button[data-t]");if(b)irTab(b.dataset.t);});
    /* conteo en vivo + botón anular dentro de Pasar lista */
    var barra=document.createElement("div");barra.id="citConteo";barra.className="cit-conteo";
    var ref=pasar.querySelector("table");ref.parentElement.insertBefore(barra,ref);
    var aviso=document.createElement("div");aviso.id="citVinculo";aviso.className="cit-vinculo";aviso.hidden=true;
    barra.parentElement.insertBefore(aviso,barra);
    var anul=document.createElement("button");anul.type="button";anul.id="anularListaBtn";anul.className="btn secondary";anul.textContent="Anular esta lista";
    var gb=$("guardarBtn");gb.parentElement.appendChild(anul);
    anul.addEventListener("click",anularLista);
    pasar.querySelector("#listaBody").addEventListener("click",function(){setTimeout(conteo,0);});
    new MutationObserver(function(){conteo();}).observe(pasar.querySelector("#listaBody"),{childList:true});
    ["fecha","tipoSelect"].forEach(function(id){var el=$(id);if(el)el.addEventListener("change",function(){setTimeout(function(){vinculo();anularEstado();},50);});});
    irTab("citaciones");etiquetaCat();var ts=$("tipoSelect");if(ts)ts.addEventListener("change",etiquetaCat);
    var visto=panel.classList.contains("active");
    new MutationObserver(function(){var v=panel.classList.contains("active");if(v&&!visto&&tab==="citaciones")renderCit();visto=v;}).observe(panel,{attributes:true,attributeFilter:["class"]});
  }
  function irTab(t){
    tab=t;
    document.querySelectorAll("#citTabs button").forEach(function(b){b.classList.toggle("on",b.dataset.t===t);});
    $("citCard").style.display=t==="citaciones"?"":"none";
    $("pasarListaCard").style.display=t==="pasar"?"":"none";
    $("antCard").style.display=t==="anteriores"?"":"none";
    if(t==="citaciones")renderCit();
    if(t==="anteriores")renderAnteriores();
    if(t==="pasar"){conteo();vinculo();anularEstado();}
  }

  /* ---------- Conteo en vivo ---------- */
  function conteo(){
    var b=$("citConteo");if(!b||typeof countStatuses!=="function")return;
    var c=countStatuses(currentRecord);
    b.innerHTML='<span class="p"><b>'+c.presente+'</b> Presentes</span><span class="j"><b>'+c.justificado+'</b> Excusas</span><span class="a"><b>'+c.ausente+'</b> Ausentes</span>';
  }
  function etiquetaCat(){
    var e=$("tipoCategoria"),t=$("tipoSelect");if(!e||!t||!window.GermaniaCategorias)return;
    e.textContent="Categoría de estadística: "+window.GermaniaCategorias.dePorTipo(t.value);
  }
  function vinculo(){etiquetaCat();
    var a=$("citVinculo");if(!a)return;
    var o=window.__claveOverride,c=o&&o.cit;
    if(c&&$("fecha").value===o.fecha&&$("tipoSelect").value===o.tipo){a.hidden=false;a.textContent="Lista de la citación: "+nombreCit(c);}
    else{a.hidden=true;a.textContent="";}
  }

  /* ---------- Citaciones ---------- */
  async function renderCit(){
    var box=$("citCard");if(!box)return;
    box.innerHTML='<h2>Citaciones</h2><div class="sub">Cargando…</div>';
    cache=await leerIdx();
    var hoy=todayISO();
    var ab=cache.filter(function(c){return c.estado!=="anulada"&&c.fecha>=addDias(hoy,-1);}).sort(function(a,b){return (a.fecha+(a.hora||"")).localeCompare(b.fecha+(b.hora||""));});
    var html='<div class="cit-head"><h2>Citaciones</h2>'+(esOficial()?'<button type="button" class="btn small gold" id="citNueva">+ Nueva citación</button>':'')+'</div>';
    html+='<div id="citForm" hidden></div>';
    var hoyAb=ab.filter(function(c){return c.fecha===hoy;});
    if(hoyAb.length>1&&yo())html+='<button type="button" class="btn small secondary" id="citExcTodas">Excusarme de todas las de hoy</button>';
    if(!ab.length)html+='<p class="sub">No hay citaciones abiertas. Cuando un oficial cree una, aparecerá aquí y podrás responder.</p>';
    var tarjetas=[];
    for(var i=0;i<ab.length;i++){respuestas[ab[i].id]=await leerResp(ab[i].id);tarjetas.push(tarjeta(ab[i]));}
    box.innerHTML=html+tarjetas.join("");
    var sinResp=0,exc=0;
    ab.forEach(function(c){var r=respuestas[c.id]||{};if(esOficial()){Object.keys(r).forEach(function(k){if(r[k].r==="excusa")exc++;});}else if(yo()&&!r[yo()])sinResp++;});
    var dot=$("citDot");if(dot){var n=esOficial()?exc:sinResp;dot.hidden=!n;dot.textContent=n||"";}
    enlazar(box,ab);
  }
  function addDias(f,n){var d=new Date(f+"T12:00:00");d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function tarjeta(c){
    var r=respuestas[c.id]||{},mia=r[yo()]||null,h='<div class="cit-card'+(c.urgente?' urgente':'')+'" data-id="'+esc2(c.id)+'">';
    h+='<div class="cit-tit">'+(c.urgente?'<span class="cit-urg">URGENTE</span> ':'')+esc2(nombreCit(c))+'</div>';
    if(c.detalle)h+='<div class="cit-det">'+esc2(c.detalle)+'</div>';
    h+='<div class="seg cit-resp"><button class="on-presente'+(mia&&mia.r==="asistire"?" active":"")+'" data-r="asistire">Asistiré</button><button class="on-ausente'+(mia&&mia.r==="no"?" active":"")+'" data-r="no">No asistiré</button><button class="on-justificado'+(mia&&mia.r==="excusa"?" active":"")+'" data-r="excusa">Me excuso</button></div>';
    if(mia&&mia.r==="excusa"&&mia.motivo)h+='<div class="cit-mot">Tu excusa: '+esc2(mia.motivo)+'</div>';
    h+='<div class="cit-motbox" hidden><input type="text" class="cit-motivo" placeholder="Motivo de la excusa (obligatorio)"><button type="button" class="btn small cit-motok">Enviar excusa</button></div>';
    if(esOficial()){
      var ros=sortedRoster(false),cnt={asistire:0,no:0,excusa:0,sin:0};
      ros.forEach(function(p){var x=r[String(p.id)];if(x)cnt[x.r]++;else cnt.sin++;});
      h+='<div class="cit-ofi"><span class="g">Asistirán <b>'+cnt.asistire+'</b></span><span class="r">No <b>'+cnt.no+'</b></span><button type="button" class="cit-exc" data-ver="1">Excusas <b class="cit-badge"'+(cnt.excusa?'':' hidden')+'>'+cnt.excusa+'</b></button><span>Sin responder <b>'+cnt.sin+'</b></span></div>';
      h+='<div class="cit-nomina" hidden>'+ros.map(function(p){var x=r[String(p.id)];var t=x?(x.r==="asistire"?"Asistirá":x.r==="no"?"No asistirá":"Excusa: "+esc2(x.motivo||"")):"Sin responder";return '<div class="cit-fila '+(x?x.r:"sin")+'"><span>'+esc2(nombreCompleto(p))+'</span><em>'+t+'</em></div>';}).join("")+'</div>';
      h+='<div class="cit-acc"><button type="button" class="btn small" data-a="lista">Pasar lista</button><button type="button" class="btn small secondary" data-a="recordar">Recordar a los sin responder</button><button type="button" class="btn small secondary" data-a="anular">Anular</button></div>';
    }
    return h+'</div>';
  }
  function enlazar(box,ab){
    var nv=$("citNueva");if(nv)nv.onclick=function(){formNueva();};
    var ex=$("citExcTodas");if(ex)ex.onclick=function(){excusarTodas(ab.filter(function(c){return c.fecha===todayISO();}));};
    box.querySelectorAll(".cit-card").forEach(function(card){
      var id=card.dataset.id,c=cache.find(function(x){return x.id===id;});
      card.querySelectorAll(".cit-resp button").forEach(function(b){b.onclick=function(){
        if(!yo()){alert("Elige tu nombre en el Inicio antes de responder.");return;}
        if(b.dataset.r==="excusa"){var mb=card.querySelector(".cit-motbox");mb.hidden=false;mb.querySelector("input").focus();}
        else responder(c,b.dataset.r,"");
      };});
      var ok=card.querySelector(".cit-motok");if(ok)ok.onclick=function(){
        var m=card.querySelector(".cit-motivo").value.trim();
        if(!m){card.querySelector(".cit-motivo").focus();return;}
        responder(c,"excusa",m);
      };
      var ver=card.querySelector("[data-ver]");if(ver)ver.onclick=function(){var n=card.querySelector(".cit-nomina");n.hidden=!n.hidden;};
      card.querySelectorAll("[data-a]").forEach(function(b){b.onclick=function(){
        if(b.dataset.a==="lista")abrirLista(c);
        if(b.dataset.a==="recordar")recordar(c);
        if(b.dataset.a==="anular")anularCit(c);
      };});
    });
  }
  async function responder(c,r,motivo,sinRefrescar){
    var v=yo(),prev=(respuestas[c.id]||{})[v],hist=(prev&&prev.hist)||[];
    if(prev)hist=hist.concat([{r:prev.r,motivo:prev.motivo||"",en:prev.en}]);
    var d={vol:v,r:r,motivo:motivo||"",en:ahoraTxt(),hist:hist};
    var ok=await sSet("citacion-resp:"+c.id+":"+v,d);
    if(!ok){alert("No se pudo guardar tu respuesta. Intenta de nuevo.");return;}
    if(!respuestas[c.id])respuestas[c.id]={};respuestas[c.id][v]=d;
    if(!sinRefrescar)renderCit();
  }
  async function excusarTodas(lista){
    var m=prompt("Motivo (se usará en todas las citaciones de hoy):");
    if(!m||!m.trim())return;
    for(var i=0;i<lista.length;i++)await responder(lista[i],"excusa",m.trim(),true);
    renderCit();
  }
  function formNueva(){
    var f=$("citForm");f.hidden=false;
    var tipos=(typeof TIPOS!=="undefined"?TIPOS:[]).map(function(t){return '<option>'+esc2(t)+'</option>';}).join("");
    var d=new Date(),hh=String(d.getHours()).padStart(2,"0")+":"+String(Math.ceil(d.getMinutes()/5)*5%60).padStart(2,"0");
    f.innerHTML='<div class="field-row"><div class="field"><label>Tipo de citación</label><select id="cnTipo">'+tipos+'</select></div><div class="field"><label>Fecha</label><input type="date" id="cnFecha" value="'+todayISO()+'"></div><div class="field"><label>Hora</label><input type="time" id="cnHora" value="'+hh+'"></div></div><div class="field"><label>Detalle (opcional)</label><input type="text" id="cnDet" placeholder="Tema, lugar, uniforme…"></div><div class="field"><label>Citó (oficial presente)</label><input type="text" id="cnPor" list="registradoPorOptions" placeholder="Nombre del oficial"></div><label class="cit-chk"><input type="checkbox" id="cnUrg"> Urgente (extraordinaria)</label><div class="cit-acc"><button type="button" class="btn small" id="cnOk">Crear citación</button><button type="button" class="btn small secondary" id="cnCan">Cancelar</button></div><div class="status-msg" id="cnMsg"></div>';
    var cat=document.createElement("small");cat.className="tipo-cat";f.querySelector("#cnTipo").parentNode.appendChild(cat);
    var pc=function(){cat.textContent="Categoría de estadística: "+(window.GermaniaCategorias?window.GermaniaCategorias.dePorTipo($("cnTipo").value):"");};
    $("cnTipo").addEventListener("change",pc);pc();
    $("cnCan").onclick=function(){f.hidden=true;f.innerHTML="";};
    $("cnOk").onclick=async function(){
      var por=$("cnPor").value.trim(),hora=$("cnHora").value,fecha=$("cnFecha").value;
      if(!por||!fecha||!hora){$("cnMsg").textContent="Completa fecha, hora y quién cita.";$("cnMsg").classList.add("err");return;}
      var c={id:"c"+Date.now().toString(36),tipo:$("cnTipo").value,fecha:fecha,hora:hora,detalle:$("cnDet").value.trim(),urgente:$("cnUrg").checked,creadaPor:por,estado:"abierta",categoria:window.GermaniaCategorias?window.GermaniaCategorias.dePorTipo($("cnTipo").value):"",creada:ahoraTxt()};
      var idx=await leerIdx();idx.push(c);
      if(await guardarIdx(idx))renderCit();else{$("cnMsg").textContent="No se pudo guardar.";$("cnMsg").classList.add("err");}
    };
  }
  function recordar(c){
    var r=respuestas[c.id]||{};
    var sin=sortedRoster(false).filter(function(p){return !r[String(p.id)];}).map(function(p){return nombreCompleto(p);});
    if(!sin.length){alert("Todos respondieron.");return;}
    var t="RECORDATORIO · "+nombreCit(c)+". Aún sin responder en GERMANIA: "+sin.join(", ")+". Por favor responde Asistiré / No asistiré / Me excuso.";
    c.recordado=ahoraTxt();
    leerIdx().then(function(idx){var x=idx.find(function(z){return z.id===c.id;});if(x){x.recordado=c.recordado;guardarIdx(idx);}});
    window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank");
  }

  /* ---------- Pasar lista desde una citación (pre-asistencia) ---------- */
  async function abrirLista(c){
    var base=(typeof claveFor==="function")?claveFor(c.fecha,c.tipo):c.fecha+"__"+c.tipo;
    window.__claveOverride={fecha:c.fecha,tipo:c.tipo,clave:base+"--"+String(c.hora||"0000").replace(":",""),citacionId:c.id,hora:c.hora||"",cit:c};
    $("fecha").value=c.fecha;
    var sel=$("tipoSelect");if(![].some.call(sel.options,function(o){return o.value===c.tipo;})){var o=document.createElement("option");o.value=o.textContent=c.tipo;sel.appendChild(o);}
    sel.value=c.tipo;
    await loadListaForSelection();
    if(parteEsNuevo){
      var r=await leerResp(c.id);respuestas[c.id]=r;
      sortedRoster(false).forEach(function(p){var x=r[String(p.id)];currentRecord[p.id]=x?(x.r==="asistire"?"presente":x.r==="excusa"?"justificado":"ausente"):"ausente";});
      var det=$("detalle");if(det&&!det.value)det.value=c.detalle||"";
      var msg=$("statusMsg");msg.classList.remove("err");msg.textContent="Pre-asistencia cargada desde las respuestas: Asistiré = Presente, Me excuso = Excusa, sin respuesta = Ausente. Corrige a medida que llegan.";
      renderListaRows();
    }
    irTab("pasar");
  }

  /* ---------- Anteriores ---------- */
  async function renderAnteriores(){
    var box=$("antCard");box.innerHTML='<h2>Listas anteriores</h2><div class="sub">Cargando…</div>';
    var idx=await getIndex();
    var items=idx.slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))||String(b.clave).localeCompare(String(a.clave));}).slice(0,60);
    var datos=await Promise.all(items.map(function(it){return getParte(it.clave);}));
    var h='<h2>Listas anteriores</h2><p class="sub">Toca una lista para abrirla en Pasar lista, modificarla y volver a enviarla.</p>';
    if(!items.length)h+='<p class="sub">Aún no hay listas guardadas.</p>';
    items.forEach(function(it,i){
      var p=datos[i]||{};var hora=(/--(\d{4})$/.exec(it.clave)||[])[1];
      var nom=(it.tipo||p.tipo||"Lista")+" – "+fechaCorta(it.date||p.date||(it.clave||"").slice(0,10))+(hora?" – "+hora.slice(0,2)+":"+hora.slice(2):"");
      h+='<div class="ant-fila'+(p.anulado?' anul':'')+'" data-k="'+esc2(it.clave)+'"><button type="button" class="ant-abrir">'+esc2(nom)+(p.numero?' · N° '+String(p.numero).padStart(3,"0")+'/'+p.anio:'')+(p.anulado?' <span class="badge">ANULADA</span>':'')+'</button>'+(p.anulado?'<button type="button" class="btn small secondary ant-rest">Restaurar</button>':'')+'</div>';
    });
    box.innerHTML=h;
    box.querySelectorAll(".ant-fila").forEach(function(row,i){
      var it=items[i];
      row.querySelector(".ant-abrir").onclick=async function(){
        window.__claveOverride={fecha:it.date,tipo:it.tipo,clave:it.clave,citacionId:(datos[i]||{}).citacionId||"",hora:(datos[i]||{}).hora||""};
        $("fecha").value=it.date;var sel=$("tipoSelect");
        if(![].some.call(sel.options,function(o){return o.value===it.tipo;})){var o=document.createElement("option");o.value=o.textContent=it.tipo;sel.appendChild(o);}
        sel.value=it.tipo;await loadListaForSelection();irTab("pasar");
      };
      var rs=row.querySelector(".ant-rest");if(rs)rs.onclick=function(){restaurarParte(it.clave);};
    });
  }

  /* ---------- Anular / restaurar (doble pregunta + nombre y apellido) ---------- */
  function pedirAnulacion(titulo){
    return new Promise(function(res){
      var ov=document.createElement("div");ov.className="cit-ov";
      var opts=sortedRoster(false).map(function(p){return '<option value="'+esc2(String(p.id))+'">'+esc2(nombreCompleto(p))+'</option>';}).join("");
      ov.innerHTML='<div class="cit-modal"><h3>'+esc2(titulo)+'</h3><p class="sub" id="anP">Se conserva el registro y se puede restaurar. Elige tu nombre y apellido y escribe el motivo.</p><select id="anQ"><option value="">— ¿Quién anula? —</option>'+opts+'</select><input type="text" id="anM" placeholder="Motivo"><div class="cit-acc"><button type="button" class="btn small" id="anOk">Anular</button><button type="button" class="btn small secondary" id="anNo">Cancelar</button></div></div>';
      document.body.appendChild(ov);var paso=1;
      $("anNo").onclick=function(){ov.remove();res(null);};
      $("anOk").onclick=function(){
        var q=$("anQ").value,m=$("anM").value.trim();
        if(!q||!m){$("anP").textContent="Falta elegir quién anula y escribir el motivo.";return;}
        if(paso===1){paso=2;$("anP").textContent="¿Seguro? Confirma otra vez para anular.";$("anOk").textContent="Sí, anular definitivamente";return;}
        ov.remove();res({por:nombreDe(q),porId:q,motivo:m,en:ahoraTxt()});
      };
    });
  }
  async function anularCit(c){
    var a=await pedirAnulacion("Anular citación: "+nombreCit(c));if(!a)return;
    var idx=await leerIdx();var x=idx.find(function(z){return z.id===c.id;});
    if(x){x.estado="anulada";x.anulacion=a;await guardarIdx(idx);}
    renderCit();
  }
  async function anularLista(){
    var o=window.__claveOverride;var d=$("fecha").value,t=$("tipoSelect").value;
    var clave=(typeof claveFor==="function")?claveFor(d,t):null;
    var p=clave&&await getParte(clave);
    if(!p){alert("Esta lista aún no está guardada; no hay nada que anular.");return;}
    var a=await pedirAnulacion("Anular lista: "+t+" – "+fechaCorta(d));if(!a)return;
    p.anulado=true;p.anulacion=a;await setParte(clave,p);
    var m=$("statusMsg");m.classList.remove("err");m.textContent="Lista anulada por "+a.por+". Queda en Anteriores y se puede restaurar.";
    anularEstado();
  }
  async function restaurarParte(clave){
    var p=await getParte(clave);if(!p)return;
    var q=prompt("Para restaurar, escribe tu nombre y apellido:");if(!q||q.trim().split(/\s+/).length<2)return;
    p.anulado=false;p.restauracion={por:q.trim(),en:ahoraTxt()};await setParte(clave,p);renderAnteriores();
  }
  async function anularEstado(){
    var b=$("anularListaBtn");if(!b)return;
    var clave=(typeof claveFor==="function")?claveFor($("fecha").value,$("tipoSelect").value):null;
    var p=clave?await getParte(clave):null;
    b.style.display=p&&!p.anulado?"":"none";
  }

  /* ---------- Estilos ---------- */
  var css=".tipo-cat{display:block;color:#d4a82a;font-size:12px;margin-top:4px}"+".cit-tabs{display:flex;gap:6px;margin:0 0 12px}.cit-tabs button{flex:1;min-height:48px;position:relative;background:#171a1e;color:#fff;border:1px solid #343a41;border-radius:10px;font:inherit;font-weight:700}.cit-tabs button.on{background:#b3241c;border-color:#d4a82a}"+
  ".cit-dot{position:absolute;top:-6px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#e0202c;color:#fff;font-size:12px;font-style:normal;line-height:20px;text-align:center;padding:0 5px}.cit-dot[hidden]{display:none}"+
  ".cit-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.cit-card{border:1px solid #343a41;border-radius:10px;padding:12px;margin:12px 0;background:#0f1215}.cit-card.urgente{border-color:#e0202c}.cit-urg{background:#e0202c;color:#fff;border-radius:4px;padding:1px 6px;font-size:11px}"+
  ".cit-tit{font-weight:700;font-size:17px}.cit-det{color:#aeb6bd;margin:4px 0 8px}.cit-resp{margin-top:8px}.cit-resp button{min-height:48px}.cit-mot{font-size:13px;color:#ffd071;margin-top:6px}.cit-motbox{display:flex;gap:8px;margin-top:8px}.cit-motbox[hidden]{display:none}.cit-motbox input{flex:1;min-height:44px}"+
  ".cit-ofi{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:10px;font-size:14px}.cit-exc{position:relative;min-height:44px;background:transparent;color:inherit;border:1px solid #343a41;border-radius:8px;padding:6px 12px;font:inherit}.cit-badge{background:#e0202c;color:#fff;border-radius:10px;padding:0 6px;margin-left:4px}.cit-badge[hidden]{display:none}"+
  ".cit-nomina{margin-top:8px;max-height:260px;overflow:auto}.cit-nomina[hidden]{display:none}.cit-fila{display:flex;justify-content:space-between;gap:8px;padding:8px 4px;border-bottom:1px solid #22272c;font-size:14px}.cit-fila.asistire em{color:#7dffae}.cit-fila.no em{color:#ff8b93}.cit-fila.excusa em{color:#ffd071}.cit-fila.sin em{color:#8a939b}"+
  ".cit-acc{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.cit-acc .btn{min-height:44px}.cit-chk{display:block;margin:8px 0}.cit-conteo{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0;font-size:15px}.cit-conteo span{padding:6px 10px;border-radius:8px;background:#171a1e}.cit-conteo .p b{color:#7dffae}.cit-conteo .j b{color:#ffd071}.cit-conteo .a b{color:#ff8b93}.cit-vinculo{padding:8px 10px;margin:8px 0;border-left:4px solid #d4a82a;background:#171a1e;font-weight:700}"+
  ".ant-fila{display:flex;gap:8px;align-items:center;border-bottom:1px solid #22272c}.ant-abrir{flex:1;min-height:48px;text-align:left;background:transparent;color:#fff;border:0;font:inherit;padding:8px 4px}.ant-fila.anul .ant-abrir{opacity:.55;text-decoration:line-through}"+
  ".cit-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}.cit-modal{background:#14171a;border:1px solid #d4a82a;border-radius:12px;padding:16px;max-width:420px;width:100%}.cit-modal select,.cit-modal input{width:100%;min-height:44px;margin:6px 0}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  function iniciar(){montar();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(iniciar,300);});else setTimeout(iniciar,300);
  window.GermaniaCitaciones={irTab:irTab,render:renderCit};
})();
