/* GERMANIA · Comparar una lista nueva con la nómina.
   REGLA (Oficialidad, 2026-10-08): ningún voluntario se pierde ni se borra por no venir en una
   lista. Esta herramienta SOLO LEE y compara: informa, no agrega, no da de baja, no borra.
   Quien falta se muestra con lo que tiene en su hoja de vida para que la Oficialidad decida. */
(function(){
"use strict";
if(typeof ROSTER==="undefined") return;
var $=function(id){ return document.getElementById(id); };
function E(x){ return String(x==null?"":x).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function sinTilde(t){ return String(t||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function rutNorm(t){ var m=String(t||"").replace(/\./g,"").match(/(\d{6,8})\s*-?\s*([0-9kK])\b/); return m?m[1]+"-"+m[2].toUpperCase():""; }
function palabras(t){ return sinTilde(t).replace(/[^a-zñ\s]/g," ").split(/\s+/).filter(function(w){ return w.length>2&&!/^(del|las|los|con|von|van)$/.test(w); }); }
function nombreDe(m){ return [m.nombre,m.apellidoPaterno,m.apellidoMaterno].filter(Boolean).join(" "); }

/* Una línea puede traer RUT, clave y/o nombre. Se prueba en ese orden de certeza. */
function emparejar(linea){
  var rut=rutNorm(linea), r;
  if(rut){ r=ROSTER.filter(function(m){ return rutNorm(m.rut)===rut; }); if(r.length===1) return {m:r[0],por:"RUT"}; }
  var sinRut=linea.replace(/\d{1,2}\.?\d{3}\.?\d{3}\s*-\s*[0-9kK]/g," ");
  var pal=palabras(sinRut);
  if(pal.length>=2){
    var cand=ROSTER.map(function(m){ var w=palabras(nombreDe(m)); var hit=pal.filter(function(x){ return w.indexOf(x)>=0; }).length; return {m:m,hit:hit,tot:w.length}; })
      .filter(function(c){ return c.hit>=2; }).sort(function(a,b){ return b.hit-a.hit; });
    if(cand.length&&(cand.length===1||cand[0].hit>cand[1].hit)) return {m:cand[0].m,por:"nombre",dudoso:cand[0].hit<Math.min(3,cand[0].tot)};
    if(cand.length>1) return {m:null,ambiguo:cand.slice(0,3).map(function(c){ return c.m; })};
  }
  var cl=(linea.match(/(^|[^\d])(\d{1,4})([^\d]|$)/)||[])[2];
  if(cl&&!rut){ r=ROSTER.filter(function(m){ return String(m.clave)===cl; }); if(r.length===1) return {m:r[0],por:"clave",dudoso:pal.length===0?false:true}; }
  return {m:null};
}

function hojaDeVida(m){
  var cur=m.cursos&&typeof m.cursos==="object"?Object.keys(m.cursos).length:0;
  var an=(m.anotaciones||[]).length;
  var partes=[]; if(m.fechaIngreso) partes.push("ingreso "+m.fechaIngreso); if(m.cargo&&m.cargo!=="Voluntario") partes.push(m.cargo);
  partes.push(an+" anotación"+(an===1?"":"es")+" en hoja de vida"); if(cur) partes.push(cur+" curso"+(cur===1?"":"s"));
  if(m.conductor) partes.push("conductor");
  return partes.join(" · ");
}
function sec(titulo,color,filas,ayuda){
  return '<div class="card" style="border-left:6px solid '+color+';margin:10px 0;"><h3 style="margin:0 0 4px;">'+titulo+' ('+filas.length+')</h3>'+(ayuda?'<p class="sub" style="margin:0 0 8px;">'+ayuda+'</p>':"")+
    (filas.length?'<ul style="margin:0;padding-left:18px;">'+filas.map(function(f){ return "<li>"+f+"</li>"; }).join("")+"</ul>":'<div class="foot-note">Nadie.</div>')+"</div>";
}

function comparar(texto){
  var lineas=String(texto||"").split(/\r?\n/).map(function(l){ return l.replace(/[;\t]+/g," ").trim(); }).filter(function(l){ return l&&!/^(n[°ºo]?|clave|rut|nombre)\b[\s,;]*(clave|rut|nombre|apellido)/i.test(l); });
  var vistos={}, coinciden=[], dudosos=[], nuevos=[], reactivar=[], ambiguos=[];
  lineas.forEach(function(l){
    var r=emparejar(l);
    if(r.ambiguo){ ambiguos.push('«'+E(l)+'» podría ser: '+r.ambiguo.map(function(m){ return E(m.clave+" · "+nombreDe(m)); }).join(" / ")); return; }
    if(!r.m){ nuevos.push('«'+E(l)+'»'); return; }
    vistos[r.m.id]=true;
    var et=E((r.m.clave?r.m.clave+" · ":"")+nombreDe(r.m));
    if(r.m.activo===false) reactivar.push(et+' — hoy figura <b>inactivo/de baja</b> en la app ('+E(r.m.motivoBaja||"sin motivo")+')');
    else if(r.dudoso) dudosos.push('«'+E(l)+'» → '+et+' <span class="foot-note">(coincidencia por '+r.por+', confírmala)</span>');
    else coinciden.push(et);
  });
  var activos=ROSTER.filter(function(m){ return m.activo!==false; });
  var faltan=activos.filter(function(m){ return !vistos[m.id]; }).map(function(m){
    return '<b>'+E((m.clave?m.clave+" · ":"")+nombreDe(m))+'</b><br><span class="foot-note">'+E(hojaDeVida(m))+"</span>";
  });
  var h='<div class="status-msg">'+lineas.length+' línea(s) leída(s) · '+activos.length+' voluntarios activos en la app.</div>';
  if(faltan.length) h+='<div class="card" style="border-left:6px solid #e0b324;background:rgba(224,179,36,.08);margin:10px 0;"><b>⚠ Atención:</b> '+faltan.length+' voluntario(s) de la app <b>no vienen en la lista nueva</b>. <b>No se tocó a nadie.</b> Confirma con la Oficialidad si es una baja real o si la lista está incompleta antes de hacer cualquier cambio.</div>';
  h+=sec("Faltan en la lista nueva","#d93a3a",faltan,"Siguen activos en la app con su hoja de vida intacta. Si de verdad se retiraron, se registra desde «Bajas y eliminación» (nunca borrando).");
  h+=sec("En la lista y no están en la app","#e0b324",nuevos,"No se agregan solos. Si son ingresos, se cargan desde «Ingreso» para crear su hoja de vida.");
  h+=sec("Hoy inactivos en la app que vienen en la lista","#e0b324",reactivar,"Pregunta si corresponde reactivarlos. No se cambió nada.");
  h+=sec("Coincidencia dudosa","#e0b324",dudosos);
  h+=sec("Ambiguos (más de un posible)","#e0b324",ambiguos);
  h+=sec("Coinciden sin problema","#2f9e5b",coinciden);
  return h;
}

function iniciar(){
  var btn=$("cmpBtn"); if(!btn||btn.dataset.ok) return; btn.dataset.ok="1";
  btn.addEventListener("click",function(){
    var t=$("cmpTexto").value; if(!t.trim()){ $("cmpResultado").innerHTML='<div class="status-msg err">Pega la lista o sube un archivo primero.</div>'; return; }
    $("cmpResultado").innerHTML=comparar(t);
  });
  $("cmpArchivo").addEventListener("change",function(e){
    var f=e.target.files[0]; if(!f) return;
    var rd=new FileReader(); rd.onload=function(){ $("cmpTexto").value=String(rd.result||""); $("cmpResultado").innerHTML=comparar($("cmpTexto").value); }; rd.readAsText(f,"utf-8"); e.target.value="";
  });
}
iniciar();
window.gnCompararLista=comparar;
})();
