/* GERMANIA · Avisos (Inicio) y Novedades de oficiales.
 * - Avisos: mensajes largos se ven en 3 líneas; al tocar se abren completos. Se agrega el resumen de citaciones por responder.
 * - Novedades de oficiales: lista compartida SOLO para oficiales, con círculo rojo por oficial que desaparece al verlas.
 *   Claves: novedades-ofi:v1 (lista) · novedad-ofi-vista:<voluntario> ({ids:[...]}).
 *   Otros módulos (p. ej. Emergencia B-5) publican con window.GermaniaNovedadesOfi.publicar({texto,tipo,origen}).
 */
(function(){
  "use strict";
  var KEY="novedades-ofi:v1",$=function(i){return document.getElementById(i);};
  function e2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function oficial(){return document.body.getAttribute("data-oficial")==="1";}
  function yo(){var s=$("miVoluntario");return s&&s.value?String(s.value):"";}
  function nombreYo(){var id=yo();var p=(typeof ROSTER!=="undefined"?ROSTER:[]).find(function(x){return String(x.id)===id;});return p?nombreCompleto(p):"";}
  async function lista(){var v=await sGet(KEY,[]);return Array.isArray(v)?v:[];}
  async function publicar(o){
    var texto=String(o&&o.texto||"").trim();if(!texto)return false;
    var n={id:"n"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),texto:texto.slice(0,2000),tipo:o.tipo||"Novedad",origen:o.origen||"Manual",autor:o.autor||nombreYo()||"Oficial",en:new Date().toISOString()};
    /* Agregado atómico: si dos oficiales publican a la vez no se pierde ninguna novedad. */
    var ok=false;try{ok=await sAddToList(KEY,n,{uniqueBy:"id"});}catch(e){ok=false;}
    render();return ok;
  }
  async function vistas(){var v=yo()?await sGet("novedad-ofi-vista:"+yo(),{ids:[]}):{ids:[]};return new Set((v&&v.ids)||[]);}
  async function marcarVistas(ids){
    if(!yo())return;var s=await vistas();ids.forEach(function(i){s.add(i);});
    await sSet("novedad-ofi-vista:"+yo(),{ids:Array.from(s).slice(-300),en:new Date().toISOString()});
  }
  var abierto=false;
  async function render(){
    var card=$("novOfiCard");if(!card)return;
    if(!oficial()){card.hidden=true;actualizarTile(0);return;}
    card.hidden=false;
    var l=(await lista()).slice(-200).reverse(),vis=await vistas();
    var nuevas=l.filter(function(n){return !vis.has(n.id);}).length;
    actualizarTile(nuevas);
    var dot=$("novOfiDot");dot.hidden=!nuevas;dot.textContent=nuevas||"";
    var cuerpo=$("novOfiCuerpo");cuerpo.hidden=!abierto;
    $("novOfiToggle").setAttribute("aria-expanded",String(abierto));
    if(!abierto)return;
    cuerpo.querySelector(".nov-ofi-lista").innerHTML=l.length?l.map(function(n){
      var f=new Date(n.en).toLocaleString("es-CL",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      return '<div class="nov-ofi-item'+(vis.has(n.id)?'':' nueva')+'"><div class="nov-ofi-meta">'+e2(f)+' · '+e2(n.tipo)+' · '+e2(n.autor)+'</div><div class="nov-ofi-txt">'+e2(n.texto)+'</div></div>';
    }).join(""):'<p class="sub">Sin novedades.</p>';
    if(nuevas){await marcarVistas(l.map(function(n){return n.id;}));setTimeout(function(){actualizarTile(0);$("novOfiDot").hidden=true;},2500);}
  }
  function actualizarTile(n){
    var t=document.querySelector(".tile-oficiales");if(!t)return;
    var b=t.querySelector(".tile-badge");
    if(!n){if(b)b.remove();return;}
    if(!b){b=document.createElement("span");b.className="tile-badge";t.appendChild(b);}
    b.textContent=n;
  }
  function montar(){
    if($("novOfiCard"))return;
    var ref=$("inicioNovedades");if(!ref)return;
    var c=document.createElement("section");c.id="novOfiCard";c.className="card solo-oficiales nov-ofi";c.hidden=true;c.style.gridColumn="1 / -1";
    c.innerHTML='<button type="button" id="novOfiToggle" class="nov-ofi-head" aria-expanded="false"><span>Novedades de oficiales</span><i id="novOfiDot" class="nov-ofi-dot" hidden></i></button><div id="novOfiCuerpo" hidden><p class="sub">Solo oficiales. Aquí llegan las novedades de los partes de emergencia y los mensajes entre oficiales.</p><div class="field-row"><div class="field" style="flex:1 1 220px"><input type="text" id="novOfiTxt" placeholder="Escribir novedad para oficiales…"></div><button type="button" class="btn small" id="novOfiEnviar">Enviar</button></div><div class="status-msg" id="novOfiMsg"></div><div class="nov-ofi-lista"></div></div>';
    ref.parentNode.insertBefore(c,ref);
    $("novOfiToggle").addEventListener("click",function(){abierto=!abierto;render();});
    $("novOfiEnviar").addEventListener("click",async function(){
      var t=$("novOfiTxt").value.trim(),m=$("novOfiMsg");if(!t){return;}
      if(!yo()){m.textContent="Elige tu nombre en el Inicio.";m.classList.add("err");return;}
      m.classList.remove("err");m.textContent=(await publicar({texto:t,tipo:"Mensaje"}))?"Enviado a oficiales.":"No se pudo enviar.";$("novOfiTxt").value="";
    });
    /* Avisos: 3 líneas, se abre al tocar */
    var box=$("novedadesLista");
    if(box)box.addEventListener("click",function(ev){var it=ev.target.closest(".ha-item");if(it&&!ev.target.closest("button,a,summary,details"))it.classList.toggle("abierto");});
    /* Resumen de citaciones por responder */
    var fila=document.createElement("button");fila.type="button";fila.id="avisoCitaciones";fila.className="aviso-cit";fila.hidden=true;
    fila.addEventListener("click",function(){if(window.__mostrarPestana)window.__mostrarPestana("lista");if(window.GermaniaCitaciones)window.GermaniaCitaciones.irTab("citaciones");});
    ref.insertBefore(fila,$("novedadesLista"));
    var ar=document.createElement("button");ar.type="button";ar.id="avisoArchivoOdd";ar.className="aviso-cit";ar.textContent="Archivo de ODD ›";
    ar.addEventListener("click",abrirArchivoOdd);ref.appendChild(ar);
    var rg=document.createElement("button");rg.type="button";rg.id="avisoReglamentos";rg.className="aviso-cit";rg.textContent="Reglamentos ›";
    rg.addEventListener("click",abrirReglamentos);ref.appendChild(rg);
    /* también desde el menú ☰ */
    var menu=$("mobileMenu");
    if(menu&&!menu.querySelector("[data-reglamentos]")){var mb=document.createElement("button");mb.type="button";mb.setAttribute("data-reglamentos","1");mb.textContent="Reglamentos";mb.addEventListener("click",function(){var t=$("menuToggle");if(t&&t.getAttribute("aria-expanded")==="true")t.click();abrirReglamentos();});menu.insertBefore(mb,menu.querySelector("[data-ayuda-toggle]"));}
  }
  /* ---------- Reglamentos (consulta para todos los voluntarios, solo lectura) ----------
     Abre solo esta ventana: no navega a ninguna pantalla ni al módulo de Oficiales.
     Cada reglamento se abre en un lector con buscador de palabras y frases. El texto para buscar está en
     reglamentos/*.json (se genera con scripts/extraer-reglamentos.mjs); `v` = primeros 8 caracteres del SHA-256 del PDF.
     El PDF sigue siendo el documento oficial. */
  var REGLAMENTOS=[
    {titulo:"Reglamento de Guardia Nocturna",sub:"Cuerpo de Bomberos de Villarrica · rige la guardia",ej:"dotación mínima",pdf:"./reglamentos/reglamento-guardia-nocturna.pdf",json:"./reglamentos/reglamento-guardia-nocturna.json",v:"747b1d47"},
    {titulo:"Reglamento General del CBV",sub:"Edición 2023",ej:"sanciones",pdf:"./reglamentos/reglamento-general-cbv-2023.pdf",json:"./reglamentos/reglamento-general-cbv-2023.json",v:"19391160"}
  ];
  var regCache={};
  function regCargar(d){
    if(!regCache[d.v])regCache[d.v]=fetch(d.json+"?v="+d.v).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})
      .then(function(j){return window.GermaniaBuscar.preparar(j.paginas);}).catch(function(err){delete regCache[d.v];throw err;});
    return regCache[d.v];
  }
  function abrirReglamentos(){
    if(document.getElementById("regOv"))return;
    var ov=document.createElement("div");ov.className="cit-ov";ov.id="regOv";
    document.body.appendChild(ov);
    function cerrar(){ov.remove();}
    ov.addEventListener("click",function(ev){if(ev.target===ov)cerrar();});
    ov.addEventListener("keydown",function(ev){if(ev.key==="Escape")cerrar();});
    function lista(){
      ov.innerHTML='<div class="cit-modal"><h3>Reglamentos</h3><p class="sub">Consulta. Si hay diferencias, manda el Reglamento de Guardia.</p>'+
        REGLAMENTOS.map(function(d,i){return '<button type="button" class="btn secondary reg-doc" data-reg="'+i+'"><b>'+e2(d.titulo)+'</b><br><small>'+e2(d.sub)+'</small><span class="reg-lupa">Buscar y leer ›</span></button>';}).join("")+
        '<button type="button" class="btn secondary reg-doc" id="regOdd"><b>Orden del Día de guardia</b><br><small>Archivo de ODD (vigente y anteriores)</small></button>'+
        '<button type="button" class="btn reg-cerrar" id="regCerrar">Cerrar</button></div>';
      $("regCerrar").onclick=cerrar;
      $("regOdd").onclick=function(){cerrar();abrirArchivoOdd();};
      [].forEach.call(ov.querySelectorAll("[data-reg]"),function(b){b.onclick=function(){lector(REGLAMENTOS[+b.getAttribute("data-reg")]);};});
    }
    function lector(d){
      var GB=window.GermaniaBuscar;
      ov.innerHTML='<div class="cit-modal"><button type="button" class="btn secondary reg-volver" id="regVolver">‹ Reglamentos</button>'+
        '<h3>'+e2(d.titulo)+'</h3><p class="sub">'+e2(d.sub)+'</p>'+
        '<div class="reg-buscar"><input type="search" id="regQ" class="reg-q" placeholder="Buscar palabra o frase…" aria-label="Buscar en '+e2(d.titulo)+'" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></div>'+
        '<p class="sub" id="regInfo" role="status" aria-live="polite"></p><div id="regRes"></div>'+
        '<a class="btn secondary reg-pdf" target="_blank" rel="noopener" href="'+d.pdf+'">Abrir PDF completo</a>'+
        '<button type="button" class="btn reg-cerrar" id="regCerrar">Cerrar</button></div>';
      $("regVolver").onclick=lista;$("regCerrar").onclick=cerrar;
      var q=$("regQ"),info=$("regInfo"),res=$("regRes"),paginas=null,t=0;
      var ayuda="Escribe una palabra o una frase (por ejemplo: "+d.ej+").";
      if(!GB){info.textContent="El buscador no está disponible ahora. Puedes abrir el PDF completo.";q.disabled=true;return;}
      function plural(n,uno,varios){return n+" "+(n===1?uno:varios);}
      function buscar(){
        if(!paginas)return;
        var r=GB.buscar(paginas,q.value),MAX=40;
        if(r.estado==="corta"){info.textContent=q.value.trim()?"Escribe al menos 2 letras.":ayuda;res.innerHTML="";return;}
        if(r.estado==="nada"){info.textContent="Sin resultados para «"+q.value.trim()+"». Prueba con otra palabra o con menos palabras.";res.innerHTML="";return;}
        info.textContent=(r.estado==="frase"
          ?plural(r.total,"coincidencia","coincidencias")+" en "+plural(r.paginas,"página","páginas")+"."
          :"No aparece la frase exacta. Páginas que contienen todas las palabras: "+r.paginas+".")
          +(r.paginas>MAX?" Mostrando las primeras "+MAX+"; agrega palabras para afinar.":"");
        res.innerHTML=r.resultados.slice(0,MAX).map(function(x){
          var p=paginas[x.pagina-1],f=GB.fragmento(p.texto,x.rangos,70,110);
          return '<details class="reg-res"><summary><b>Pág. '+x.pagina+'</b> · '+f.prefijo+GB.resaltar(f.texto,f.rangos,e2)+f.sufijo+'</summary>'+
            '<div class="reg-pag">'+GB.resaltar(p.texto,x.rangos,e2)+'</div>'+
            '<a class="reg-abrir" target="_blank" rel="noopener" href="'+d.pdf+'#page='+x.pagina+'">Abrir el PDF en la pág. '+x.pagina+' ›</a></details>';
        }).join("");
      }
      info.textContent="Cargando texto para buscar…";
      regCargar(d).then(function(p){if(!info.isConnected)return;paginas=p;info.textContent=ayuda;if(q.value)buscar();})
        .catch(function(){if(info.isConnected)info.textContent="No se pudo cargar el texto para buscar (¿sin conexión?). Puedes abrir el PDF completo.";});
      q.addEventListener("input",function(){clearTimeout(t);t=setTimeout(buscar,180);});
    }
    lista();
  }
  /* ---------- Archivo de ODD (consulta de todas, también las vencidas) ---------- */
  async function abrirArchivoOdd(legacy){
    if(legacy!==true&&window.GermaniaODD)return window.GermaniaODD.abrirArchivo();
    var lista=await sGet("odd-avisos:v1",[]);lista=Array.isArray(lista)?lista:[];
    var ofi=oficial();
    lista=lista.filter(function(o){return o&&(ofi||(!o.anulada&&Array.isArray(o.destinatarios)&&o.destinatarios.indexOf("voluntarios")>=0));})
      .sort(function(x,y){return String(y.publicadaEn||y.modificadaEn||"").localeCompare(String(x.publicadaEn||x.modificadaEn||""));});
    var OB=window.GermaniaOddBuscar,TIPOS=(typeof AVISO_TIPOS!=="undefined"&&AVISO_TIPOS)||{};
    var ov=document.createElement("div");ov.className="cit-ov";ov.id="odbOv";ov.style.alignItems="flex-start";
    if(!OB){ov.innerHTML='<div class="cit-modal"><h3>Archivo de ODD</h3><p class="sub">El buscador no está disponible ahora. Recarga la aplicación.</p><div class="cit-acc"><button type="button" class="btn small secondary" id="odbC">Cerrar</button></div></div>';document.body.appendChild(ov);$("odbC").onclick=function(){ov.remove();};return;}
    var tiposUsados=Array.from(new Set(lista.map(function(o){return o.tipo;}).filter(Boolean)));
    ov.innerHTML='<div class="cit-modal"><h3>Archivo de ODD</h3>'+
      '<input type="search" id="odbQ" placeholder="Buscar palabra o frase…" aria-label="Buscar en las ODD" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">'+
      '<div class="odb-filtros"><select id="odbA" aria-label="Año"><option value="">Todos los años</option>'+OB.anios(lista).map(function(y){return '<option>'+y+'</option>';}).join("")+'</select>'+
      '<select id="odbM" aria-label="Mes"><option value="">Todos los meses</option>'+OB.MESES.map(function(m,i){return '<option value="'+(i+1)+'">'+m.charAt(0).toUpperCase()+m.slice(1)+'</option>';}).join("")+'</select></div>'+
      (tiposUsados.length>1?'<select id="odbT" aria-label="Tipo"><option value="">Todos los tipos</option>'+tiposUsados.map(function(t){return '<option value="'+e2(t)+'">'+e2(TIPOS[t]||t)+'</option>';}).join("")+'</select>':'')+
      '<div id="odbIdx"></div><p class="sub" id="odbN" role="status" aria-live="polite"></p><div id="odbL"></div><div class="cit-acc"><button type="button" class="btn small secondary" id="odbC">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    function sel(id){var x=$(id);return x?x.value:"";}
    var OT=window.GermaniaOddTexto,GB=window.GermaniaBuscar,textos={},detalle=false;
    function pintar(){
      detalle=false;
      var q=$("odbQ").value,f=OB.filtrar(lista,{q:q,anio:sel("odbA"),mes:sel("odbM"),tipo:sel("odbT")},TIPOS,textos);
      var filtrando=!!($("odbQ").value.trim()||sel("odbA")||sel("odbM")||sel("odbT"));
      $("odbN").textContent=lista.length?(filtrando?f.length+" de "+lista.length+" ODD":lista.length+(lista.length===1?" ODD guardada":" ODD guardadas")+", la más reciente primero."):"";
      $("odbL").innerHTML=f.length?f.map(function(o){
        var extra=[OB.fechaCorta(OB.fechaOdd(o)),TIPOS[o.tipo]||"",o.lugar||"",o.tema||""].filter(Boolean).join(" · ");
        return '<div class="ant-fila"><button type="button" class="ant-abrir" data-i="'+lista.indexOf(o)+'">ODD '+e2(o.numero||"s/n")+' · '+e2(o.titulo||"Orden del Día")+'<br><small>'+e2(extra)+(o.anulada?' · RETIRADA':'')+(o.pdf?' · PDF':'')+'</small>'+fragmentoPdf(o,q)+'</button></div>';
      }).join(""):'<p class="sub">'+(lista.length?"Ninguna ODD coincide. Prueba con menos palabras o quita un filtro.":"No hay ODD guardadas.")+'</p>';
    }
    /* Si la búsqueda coincide dentro del PDF, muestra la página y el trozo donde aparece. */
    function fragmentoPdf(o,q){
      if(!GB||!q||!q.trim())return "";
      var r=OB.enPdf(o,q,textos);if(!r)return "";
      var x=r.resultados[0],p=textos[o.id][x.pagina-1],fr=GB.fragmento(p.texto,x.rangos,60,90);
      return '<br><small class="odb-pdf">En el PDF · pág. '+x.pagina+(r.paginas>1?' (y '+(r.paginas-1)+' más)':'')+': '+fr.prefijo+GB.resaltar(fr.texto,fr.rangos,e2)+fr.sufijo+'</small>';
    }
    /* Lee los índices de texto guardados; solo se usan los que corresponden a la versión actual de la ODD. */
    var indices={};
    async function cargarIndices(){
      if(!OT||!GB)return;
      await Promise.all(lista.filter(function(o){return o.pdf;}).map(async function(o){
        var ix=null;try{ix=await sGet(OT.claveTexto(o),null);}catch(e){}
        if(OT.vigente(ix,o)){indices[o.id]=ix;textos[o.id]=ix.sinTexto?[]:GB.preparar(ix.paginas);}else{delete indices[o.id];delete textos[o.id];}
      }));
    }
    /* Solo oficiales: indexar los PDF que aún no se pueden buscar por dentro. */
    function panelIndexar(){
      var c=$("odbIdx");if(!c||!ofi||!OT)return;
      var pend=OT.pendientes(lista,indices);
      if(!pend.length){c.innerHTML="";return;}
      c.innerHTML='<p class="sub">'+pend.length+(pend.length===1?" ODD con PDF aún no se puede buscar por dentro.":" ODD con PDF aún no se pueden buscar por dentro.")+'</p><button type="button" class="btn small" id="odbIx">Indexar PDF para buscar por dentro</button>';
      $("odbIx").onclick=async function(){
        var btn=this,fallos=[],sinTexto=[];btn.disabled=true;
        for(var i=0;i<pend.length;i++){
          $("odbIdx").querySelector("p").textContent="Indexando "+(i+1)+" de "+pend.length+" (ODD "+(pend[i].numero||"s/n")+")…";
          try{var r=await OT.indexarUno(pend[i],sGet,sSet);if(r.sinTexto)sinTexto.push(pend[i].numero||"s/n");}
          catch(e){fallos.push((pend[i].numero||"s/n")+": "+((e&&e.message)||"error"));}
        }
        await cargarIndices();if(!detalle)pintar();
        var resto=OT.pendientes(lista,indices).length;
        var msg=(pend.length-fallos.length)+" ODD indexada"+((pend.length-fallos.length)===1?"":"s")+".";
        if(sinTexto.length)msg+=" Sin texto (el PDF es una imagen): ODD "+sinTexto.join(", ")+".";
        if(fallos.length)msg+=" No se pudo: "+fallos.join("; ")+".";
        panelIndexar();
        if(!resto)$("odbIdx").innerHTML='<p class="sub">'+e2(msg)+'</p>';else $("odbIdx").insertAdjacentHTML("afterbegin",'<p class="sub">'+e2(msg)+'</p>');
      };
    }
    pintar();
    cargarIndices().then(function(){if(!ov.isConnected)return;if(!detalle)pintar();panelIndexar();}).catch(function(){});
    $("odbQ").addEventListener("input",pintar);["odbA","odbM","odbT"].forEach(function(id){var x=$(id);if(x)x.addEventListener("change",pintar);});
    $("odbC").onclick=function(){ov.remove();};
    ov.addEventListener("click",function(ev){if(ev.target===ov)ov.remove();});
    $("odbL").addEventListener("click",function(ev){
      var b=ev.target.closest("[data-i]");if(!b)return;var o=lista[+b.dataset.i];
      var d=o.cuando||{};detalle=true;
      var filas=[["Tipo",TIPOS[o.tipo]||""],["Fecha",[OB.fechaCorta(d.fecha),d.hora].filter(Boolean).join(" · ")],["Lugar",o.lugar],["Tema",o.tema],["Vestimenta",o.vestimenta],["Puntualidad",o.puntualidad?"Se exige puntualidad":""],["Excusas",o.excusas]].filter(function(r){return r[1];});
      $("odbL").innerHTML='<h3>ODD '+e2(o.numero||"")+' · '+e2(o.titulo||"")+(o.anulada?' <small>(RETIRADA)</small>':'')+'</h3>'+
        (filas.length?'<dl class="odb-det">'+filas.map(function(r){return '<dt>'+e2(r[0])+'</dt><dd>'+e2(r[1])+'</dd>';}).join("")+'</dl>':'')+
        (o.pdf?'':'<p class="sub">Esta ODD no tiene PDF adjunto.</p>')+
        '<div class="cit-acc">'+(o.pdf?'<button type="button" class="btn small" id="odbP">Ver ODD completa (PDF)</button>':'')+'<button type="button" class="btn small secondary" id="odbV">Volver a la lista</button></div>';
      var p=$("odbP");if(p)p.onclick=function(){if(typeof abrirPdfAviso==="function")abrirPdfAviso(o.pdf);};
      $("odbV").onclick=pintar;
    });
  }
  async function citPendientes(){
    var f=$("avisoCitaciones");if(!f)return;
    try{
      var idx=await sGet("citaciones:index:v1",[]);var hoy=todayISO();
      var ab=(Array.isArray(idx)?idx:[]).filter(function(c){return c.estado!=="anulada"&&c.fecha>=hoy;});
      var pend=0,urg=false;
      for(var i=0;i<ab.length;i++){var r=yo()?await sGet("citacion-resp:"+ab[i].id+":"+yo(),null):null;if(!r){pend++;if(ab[i].urgente)urg=true;}}
      f.hidden=!pend;f.className="aviso-cit"+(urg?" urgente":"");f.textContent=(urg?"URGENTE · ":"")+pend+(pend===1?" citación por responder ›":" citaciones por responder ›");
    }catch(e){f.hidden=true;}
  }
  var css=".ha-item .ha-texto{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer}.ha-item.abierto .ha-texto{-webkit-line-clamp:unset;display:block}#novedadesLista{max-height:46vh;overflow:auto}"+
  ".aviso-cit{display:block;width:100%;min-height:48px;text-align:left;margin:8px 0;padding:10px 14px;border-radius:10px;border:1px solid #d4a82a;background:#171a1e;color:#fff;font:inherit;font-weight:700}.aviso-cit.urgente{border-color:#e0202c;background:#3a0d10}"+
  "#informacionesCard{display:none!important}.nov-ofi-head{display:flex;justify-content:space-between;align-items:center;width:100%;min-height:48px;background:transparent;border:0;color:inherit;font:inherit;font-weight:800;font-size:17px;text-align:left}.nov-ofi-dot{min-width:24px;height:24px;border-radius:12px;background:#e0202c;color:#fff;font-style:normal;font-size:13px;line-height:24px;text-align:center;padding:0 6px}.nov-ofi-dot[hidden]{display:none}"+
  ".nov-ofi-item{border-bottom:1px solid #2a3037;padding:10px 4px}.nov-ofi-item.nueva{border-left:4px solid #e0202c;padding-left:8px}.nov-ofi-meta{font-size:12px;opacity:.7}.nov-ofi-txt{margin-top:2px;white-space:pre-wrap}.tile{position:relative}.tile-badge{position:absolute;top:6px;right:8px;min-width:22px;height:22px;border-radius:11px;background:#e0202c;color:#fff;font-size:12px;line-height:22px;text-align:center;padding:0 5px}";
  css+=
  "#regOv,#odbOv{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-start;justify-content:center;background:rgba(0,0,0,.72);padding:10px;overflow:auto;-webkit-overflow-scrolling:touch}"+
  "#regOv .cit-modal,#odbOv .cit-modal{width:100%;max-width:560px;box-sizing:border-box;background:#171a1e;color:#fff;border:1px solid #343b40;border-radius:14px;padding:14px;margin:auto 0}"+
  "#regOv h3,#odbOv h3{margin:4px 0 2px;font-size:19px}#regOv .sub,#odbOv .sub{margin:2px 0 10px;font-size:13px;opacity:.75}"+
  "#regOv .btn,#regOv .reg-abrir{display:block;box-sizing:border-box;width:100%;min-height:48px;margin:8px 0;padding:10px 14px;border-radius:10px;font:inherit;font-weight:700;text-align:left;text-decoration:none;color:inherit}"+
  "#regOv .reg-doc small{font-weight:400;opacity:.75}#regOv .reg-lupa{display:block;margin-top:4px;font-size:13px;color:#d4a82a}"+
  "#regOv .reg-volver,#regOv .reg-pdf,#regOv .reg-cerrar{text-align:center}"+
  "#regOv .reg-q{display:block;box-sizing:border-box;width:100%;min-height:48px;padding:10px 14px;border-radius:10px;border:2px solid #d4a82a;background:#0f1215;color:#fff;font:inherit;font-size:16px}"+
  "#regOv .reg-res{border:1px solid #343b40;border-radius:10px;margin:8px 0;background:#0f1215}"+
  "#regOv .reg-res summary{min-height:44px;padding:10px 12px;cursor:pointer;font-size:14px;line-height:1.4}"+
  "#regOv .reg-pag{max-height:50vh;overflow:auto;padding:4px 12px 10px;white-space:pre-wrap;font-size:14px;line-height:1.5;border-top:1px solid #343b40}"+
  "#regOv .reg-abrir{min-height:44px;margin:0;border-top:1px solid #343b40;border-radius:0 0 10px 10px;color:#d4a82a}"+
  "#regOv mark{background:#d4a82a;color:#000;border-radius:3px;padding:0 1px}";
  css+=
  "#odbOv .field-row{display:flex;flex-direction:column;gap:8px;margin:8px 0}#odbOv .field{width:100%}"+
  "#odbOv input,#odbOv select{display:block;box-sizing:border-box;width:100%;min-height:48px;padding:10px 14px;border-radius:10px;border:2px solid #d4a82a;background:#0f1215;color:#fff;font:inherit;font-size:16px}"+
  "#odbOv .ant-abrir{display:block;box-sizing:border-box;width:100%;min-height:48px;margin:6px 0;padding:10px 14px;border-radius:10px;border:1px solid #343b40;background:#0f1215;color:#fff;font:inherit;font-weight:700;text-align:left}#odbOv .ant-abrir small{font-weight:400;opacity:.75}"+
  "#odbOv .cit-acc{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#odbOv .cit-acc .btn{flex:1 1 140px;min-height:48px;border-radius:10px;font:inherit;font-weight:700;text-align:center;color:inherit}"+
  "#odbOv .odb-pdf{display:block;margin-top:4px;font-weight:400;line-height:1.35;opacity:.95}#odbOv mark{background:#d4a82a;color:#000;border-radius:3px;padding:0 1px}#odbOv #odbIdx .btn{width:100%;min-height:48px;margin:0 0 8px;border-radius:10px;font:inherit;font-weight:700}"+
  "#odbOv #odbL{max-height:55vh;overflow:auto}#odbOv input,#odbOv select{margin:0 0 8px}#odbOv .odb-filtros{display:grid;grid-template-columns:1fr 1fr;gap:8px}"+
  "#odbOv .odb-det{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:8px 0;font-size:14px}#odbOv .odb-det dt{opacity:.7}#odbOv .odb-det dd{margin:0;white-space:pre-wrap}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  function ciclo(){montar();render();citPendientes();}
  function iniciar(){ciclo();setInterval(function(){if(!document.hidden)ciclo();},60000);var s=$("miVoluntario");if(s)s.addEventListener("change",function(){setTimeout(ciclo,400);});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(iniciar,500);});else setTimeout(iniciar,500);
  window.GermaniaArchivoOddLegacy=function(){return abrirArchivoOdd(true);};
  window.GermaniaNovedadesOfi={publicar:publicar,render:render};
})();

