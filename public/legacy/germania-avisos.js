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
    if(menu&&!menu.querySelector("[data-reglamentos]")){var mb=document.createElement("button");mb.type="button";mb.setAttribute("data-reglamentos","1");mb.textContent="📖 Reglamentos";mb.addEventListener("click",function(){var t=$("menuToggle");if(t&&t.getAttribute("aria-expanded")==="true")t.click();abrirReglamentos();});menu.insertBefore(mb,menu.querySelector("[data-ayuda-toggle]"));}
  }
  /* ---------- Reglamentos (consulta para todos los voluntarios, solo lectura) ---------- */
  function abrirReglamentos(){
    if(document.getElementById("regOv"))return;
    var docs=[
      ["Reglamento de Guardia Nocturna","Cuerpo de Bomberos de Villarrica · rige la guardia","./reglamentos/reglamento-guardia-nocturna.pdf"],
      ["Reglamento General del CBV","Edición 2023","./reglamentos/reglamento-general-cbv-2023.pdf"]
    ];
    var ov=document.createElement("div");ov.className="cit-ov";ov.id="regOv";ov.style.alignItems="flex-start";
    ov.innerHTML='<div class="cit-modal" style="max-height:92vh;overflow:auto"><h3>Reglamentos</h3><p class="sub">Consulta. Si hay diferencias, manda el Reglamento de Guardia.</p>'+
      docs.map(function(d){return '<a class="btn secondary" style="display:block;min-height:52px;margin:8px 0;text-align:left" target="_blank" rel="noopener" href="'+d[2]+'"><b>'+e2(d[0])+'</b><br><small>'+e2(d[1])+'</small></a>';}).join("")+
      '<button type="button" class="btn secondary" id="regOdd" style="display:block;width:100%;min-height:52px;margin:8px 0;text-align:left"><b>Orden del Día de guardia</b><br><small>Archivo de ODD (vigente y anteriores)</small></button>'+
      '<button type="button" class="btn" id="regCerrar" style="width:100%;min-height:48px;margin-top:8px">Cerrar</button></div>';
    document.body.appendChild(ov);
    $("regCerrar").onclick=function(){ov.remove();};
    ov.addEventListener("click",function(ev){if(ev.target===ov)ov.remove();});
    $("regOdd").onclick=function(){ov.remove();abrirArchivoOdd();};
  }
  /* ---------- Archivo de ODD (consulta de todas, también las vencidas) ---------- */
  async function abrirArchivoOdd(){
    var lista=await sGet("odd-avisos:v1",[]);lista=Array.isArray(lista)?lista:[];
    var ofi=oficial();
    lista=lista.filter(function(o){return o&&(ofi||(!o.anulada&&Array.isArray(o.destinatarios)&&o.destinatarios.indexOf("voluntarios")>=0));})
      .sort(function(x,y){return String(y.publicadaEn||y.modificadaEn||"").localeCompare(String(x.publicadaEn||x.modificadaEn||""));});
    var anios=Array.from(new Set(lista.map(function(o){return String(o.publicadaEn||"").slice(0,4);}).filter(Boolean)));
    var ov=document.createElement("div");ov.className="cit-ov";ov.style.alignItems="flex-start";
    ov.innerHTML='<div class="cit-modal" style="max-height:92vh;overflow:auto"><h3>Archivo de ODD</h3><div class="field-row"><div class="field"><input type="text" id="odbQ" placeholder="Buscar por número o título"></div><div class="field"><select id="odbA"><option value="">Todos los años</option>'+anios.map(function(y){return '<option>'+y+'</option>';}).join("")+'</select></div></div><div id="odbL"></div><div class="cit-acc"><button type="button" class="btn small secondary" id="odbC">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    function pintar(){
      var q=($("odbQ").value||"").toLowerCase(),y=$("odbA").value;
      var f=lista.filter(function(o){return (!y||String(o.publicadaEn||"").slice(0,4)===y)&&(!q||(String(o.numero||"")+" "+String(o.titulo||"")).toLowerCase().indexOf(q)>=0);});
      $("odbL").innerHTML=f.length?f.map(function(o,i){
        var c=o.cuando&&o.cuando.fecha?o.cuando.fecha:String(o.publicadaEn||"").slice(0,10);
        return '<div class="ant-fila"><button type="button" class="ant-abrir" data-i="'+lista.indexOf(o)+'">ODD '+e2(o.numero||"s/n")+' · '+e2(o.titulo||"Orden del Día")+'<br><small>'+e2(c)+(o.anulada?' · RETIRADA':'')+(o.pdf?' · PDF':'')+'</small></button></div>';
      }).join(""):'<p class="sub">No hay ODD guardadas con ese criterio.</p>';
    }
    pintar();$("odbQ").addEventListener("input",pintar);$("odbA").addEventListener("change",pintar);
    $("odbC").onclick=function(){ov.remove();};
    $("odbL").addEventListener("click",function(ev){
      var b=ev.target.closest("[data-i]");if(!b)return;var o=lista[+b.dataset.i];
      var d=o.cuando||{};
      $("odbL").innerHTML='<h3>ODD '+e2(o.numero||"")+' · '+e2(o.titulo||"")+'</h3><p class="sub">'+e2([d.fecha,d.hora,o.lugar].filter(Boolean).join(" · "))+'</p><p style="white-space:pre-wrap">'+e2(o.detalle||o.descripcion||o.texto||"")+'</p><div class="cit-acc">'+(o.pdf?'<button type="button" class="btn small" id="odbP">Ver ODD completa (PDF)</button>':'')+'<button type="button" class="btn small secondary" id="odbV">Volver a la lista</button></div>';
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
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  function ciclo(){montar();render();citPendientes();}
  function iniciar(){ciclo();setInterval(function(){if(!document.hidden)ciclo();},60000);var s=$("miVoluntario");if(s)s.addEventListener("change",function(){setTimeout(ciclo,400);});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(iniciar,500);});else setTimeout(iniciar,500);
  window.GermaniaNovedadesOfi={publicar:publicar,render:render};
})();
