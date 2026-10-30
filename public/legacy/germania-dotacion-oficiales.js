/* GERMANIA · Dotación de guardia y estado de cada integrante, para Teniente Primero y Teniente Tercero
   (y el administrador, solo lectura). Muestra la noche en curso o la próxima y la anterior:
   quién está en la dotación, quién confirmó, quién avisó que no puede, quién reemplaza, y —terminada la noche—
   presente / ausente / excusado según la aprobación de un oficial autorizado.
   Solo lee. No modifica ni acredita nada. */
(function(){
"use strict";
var $=function(i){return document.getElementById(i);};
function e2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function yo(){var s=$("miVoluntario");return s&&s.value?String(s.value):"";}
function ros(){return typeof ROSTER!=="undefined"&&Array.isArray(ROSTER)?ROSTER:[];}
function persona(){var id=yo();return ros().find(function(x){return String(x.id)===id;})||null;}
function nombreDe(id){var p=ros().find(function(x){return String(x.id)===String(id);});return p?[p.nombre,p.apellidoPaterno].filter(Boolean).join(" "):"Voluntario "+id;}
function cargoTxt(p){return String(p&&p.cargo||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function esT1(p){return !!p&&/teniente\s*(primero|1)/.test(cargoTxt(p));}
function esT3(p){return !!p&&/teniente\s*(tercero|3)/.test(cargoTxt(p));}
function esAdmin(p){return !!p&&String(p.clave||"")==="517";}
function autorizado(){var p=persona();return esT1(p)||esT3(p)||esAdmin(p);}
function ini(f){return instanteChile(f,"22:45");}
function fin(f){return instanteChile(gnAdd(f,1),"06:00");}
function miercoles(f){var d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);return d.toISOString().slice(0,10);}
function etiqueta(f){var d=new Date(f+"T12:00:00");return d.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});}
async function lista(prefijo){
  try{var r=await fetch("/api/state?prefix="+encodeURIComponent(prefijo),{cache:"no-store"});if(!r.ok)return null;var j=await r.json();return Array.isArray(j.items)?j.items:[];}catch(e){return null;}
}
/* Estado de una persona en la noche f. */
function estadoPersona(f,id,ctx){
  var ac=ctx.acred[f],ahora=Date.now(),terminada=ahora>=fin(f);
  var aviso=ctx.aviso[f+":"+id],asiste=ctx.asiste[f+":"+id];
  if(terminada){
    if(ac&&ac.estado==="acreditada"&&ac.asistencias&&ac.asistencias[id]){
      if(ac.asistencias[id]==="presente")return {t:"Presente (aprobado)",c:"verde"};
      var ex=ac.excusas&&ac.excusas[id];return ex?{t:"Excusado: "+ex,c:"gris"}:{t:"Ausente (aprobado)",c:"rojo"};
    }
    return {t:"Pendiente de aprobación de un oficial",c:"gris"};
  }
  if(aviso&&aviso.estado!=="cubierto")return {t:"Avisó que no puede"+(aviso.estado==="sin_reemplazo"?" · sin reemplazo":" · falta reemplazo")+(aviso.motivo?" ("+aviso.motivo+")":""),c:"rojo"};
  if(asiste)return {t:"Confirmó que irá",c:"verde"};
  return {t:"Sin confirmar",c:"gris"};
}
function filaHtml(f,id,rol,ctx){
  var st=estadoPersona(f,id,ctx),reemp=ctx.reemplazos[f+":"+id];
  return '<div class="gdo-fila"><span class="gdo-nom"><b>'+e2(nombreDe(id))+'</b> · '+e2(rol)+(reemp?' <i>(reemplaza a '+e2(nombreDe(reemp))+')</i>':'')+'</span><span class="gdo-chip gdo-'+st.c+'">'+e2(st.t)+'</span></div>';
}
function cuentas(f,dot,ctx){
  var ids=[dot.maq,dot.obac].concat(dot.vol||[]).filter(function(x){return x!=null;}).map(String);
  var n={ok:0,av:0,sin:0};
  ids.forEach(function(id){var av=ctx.aviso[f+":"+id],as=ctx.asiste[f+":"+id];if(av&&av.estado!=="cubierto")n.av++;else if(as)n.ok++;else n.sin++;});
  return n;
}
var tok=0;
async function leerClave(k){
  try{var r=await fetch("/api/state/"+encodeURIComponent(k),{cache:"no-store"});if(!r.ok)return undefined;var j=await r.json();return j.value===undefined?null:j.value;}catch(e){return undefined;}
}
/* Se consultan SOLO las claves de las noches que se muestran (por fecha): así el listado nunca se acerca al límite de 500 claves. */
async function pintar(){
  var mi=++tok,host=$("dotacionOficiales");
  if(!autorizado()){if(host)host.remove();return;}
  var ref=$("misNochesInicio");if(!ref||!ref.parentNode)return;
  var semanas={};
  for(var k=-3;k<=1;k++){var d=window.GermaniaFechas.sumarDias(window.GermaniaFechas.hoyChile(),k);semanas[miercoles(d)]=1;}
  var noches={},fallo=false;
  var revs=await Promise.all(Object.keys(semanas).map(function(w){return leerClave("guardia-revision:"+w);}));
  revs.forEach(function(v){if(v===undefined){fallo=true;return;}if(!v||v.estado!=="aprobada"||!v.noches)return;Object.keys(v.noches).forEach(function(f){noches[f]=v.noches[f];});});
  if(fallo||mi!==tok)return;
  var fechas=Object.keys(noches).sort(),ahora=Date.now();
  var vigente=fechas.filter(function(f){return fin(f)>ahora;})[0]||null;           /* en curso o próxima */
  var previa=fechas.filter(function(f){return fin(f)<=ahora;}).pop()||null;        /* la última terminada */
  var mostrar=[vigente,previa&&ahora-fin(previa)<2*864e5?previa:null].filter(Boolean);
  if(!mostrar.length){if(host)host.remove();return;}
  var ctx={aviso:{},asiste:{},acred:{},reemplazos:{}},leyo=true;
  await Promise.all(mostrar.map(async function(f){
    var r=await Promise.all([lista("guardia-aviso:"+f+":"),lista("guardia-asiste:"+f+":"),leerClave("guardia-acreditacion:"+f)]);
    if(r[0]===null||r[1]===null||r[2]===undefined){leyo=false;return;}
    r[0].forEach(function(it){var v=it.value;if(!v||!v.f)return;ctx.aviso[v.f+":"+v.id]=v;if(v.reemplazoId)ctx.reemplazos[v.f+":"+v.reemplazoId]=v.id;});
    r[1].forEach(function(it){var v=it.value;if(v&&v.f)ctx.asiste[v.f+":"+v.id]=v;});
    if(r[2])ctx.acred[f]=r[2];
  }));
  if(!leyo||mi!==tok)return; /* lectura incompleta: no se pinta nada a medias */
  if(!host){host=document.createElement("section");host.id="dotacionOficiales";host.className="card";host.style.cssText="grid-column:1 / -1;min-width:0";ref.parentNode.insertBefore(host,ref);}
  var abierto=host.querySelector("details")?host.querySelector("details").open:true;
  var h='<details'+(abierto?' open':'')+'><summary style="cursor:pointer;font-weight:700;font-size:1.05em">Dotación de guardia · estado de cada integrante</summary>';
  mostrar.forEach(function(f){
    var dot=noches[f],n=cuentas(f,dot,ctx),term=ahora>=fin(f),curso=!term&&ahora>=ini(f);
    h+='<div class="gdo-noche"><h3>'+e2(etiqueta(f))+' · '+(term?'terminada':curso?'en curso':'próxima')+'</h3>';
    if(!term)h+='<p class="sub">'+n.ok+' confirmaron · '+n.av+' avisaron que no pueden · '+n.sin+' sin confirmar. Mínimo: 4 (conductor, OBAC y 2 voluntarios).</p>';
    h+=filaHtml(f,dot.maq,"Maquinista",ctx)+filaHtml(f,dot.obac,"OBAC",ctx);
    (dot.vol||[]).forEach(function(id){h+=filaHtml(f,id,"Voluntario",ctx);});
    var ac=ctx.acred[f];
    if(term&&ac&&Array.isArray(ac.adicionales)&&ac.adicionales.length)ac.adicionales.forEach(function(a){h+='<div class="gdo-fila"><span class="gdo-nom"><b>'+e2(nombreDe(a.id))+'</b> · Asistente adicional</span><span class="gdo-chip gdo-verde">Presente (aprobado)</span></div>';});
    if(term&&ac&&ac.dotacionEfectiva)h+='<p class="sub"><b>Dotación efectiva: '+(ac.dotacionEfectiva.minimoCumplido?'mínimo cumplido':'INCOMPLETA')+'</b> · '+ac.dotacionEfectiva.total+' presentes.</p>';
    h+='</div>';
  });
  h+='<p class="sub">Solo lectura. Capitán y Tenientes 1°, 2° y 3° pueden aprobar la guardia, en un solo paso, una vez cerrado el libro.</p></details>';
  host.innerHTML=h;
}
var css=".gdo-noche{margin:10px 0;padding-top:6px;border-top:1px solid #2c3a44}.gdo-noche h3{margin:6px 0;text-transform:capitalize;font-size:1em}.gdo-fila{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid #1d272e}.gdo-nom{flex:1 1 55%;min-width:0}.gdo-chip{flex:0 1 auto;font-size:.82em;padding:3px 9px;border-radius:12px;border:1px solid #56626b;max-width:100%}.gdo-verde{border-color:#2e9e5b;color:#8ee0ae}.gdo-rojo{border-color:#ef4444;color:#ff9a95}.gdo-gris{color:#c3ccd2}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
function programar(){
  setInterval(function(){if(document.visibilityState==="visible")pintar();},60000);
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")pintar();});
  var sv=$("miVoluntario");if(sv)sv.addEventListener("change",function(){var h=$("dotacionOficiales");if(h)h.remove();setTimeout(pintar,900);});
  setTimeout(pintar,2800);
}
window.GermaniaDotacionOficiales={refrescar:pintar};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",programar);else programar();
})();

