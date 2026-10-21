/* Germania: asistente contextual de navegación, solo lectura. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
function actual(){var s=$("miVoluntario");var id=s&&s.value;return typeof ROSTER!=="undefined"&&Array.isArray(ROSTER)?ROSTER.find(function(p){return String(p.id)===String(id);}):null;}
function cargo(p){return String(p&&p.cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function oficial(p){return /^(capitan|teniente\s*(1|2|3|primero|segundo|tercero))/.test(cargo(p));}
function ir(tab){if(typeof window.__mostrarPestana==="function"){window.__mostrarPestana(tab);return;}var b=document.querySelector('[data-go="'+tab+'"]');if(b)b.click();}
function pintar(){
 var panel=$("panel-germania");if(!panel)return;
 var host=$("gAsistente");if(!host){host=document.createElement("details");host.id="gAsistente";host.className="card";host.style.cssText="margin:10px 0;padding:10px 12px;border-radius:10px;grid-column:1 / -1";var anchor=panel.querySelector(".home-grid");if(anchor)anchor.prepend(host);else panel.prepend(host);}
 var p=actual(),esOficial=oficial(p),nombre=p?[p.nombre,p.apellidoPaterno].filter(Boolean).join(" "):"voluntario";
 host.innerHTML='<summary style="cursor:pointer;font-weight:700">Asistente Germania <small style="font-weight:400">· Orientación rápida</small></summary><div style="padding:10px 0 2px"><p style="margin:0 0 8px">Hola, '+esc(nombre)+'. Selecciona una acción:</p><div id="gAsistenteAcciones" style="display:flex;flex-wrap:wrap;gap:7px"></div><p style="font-size:12px;margin:9px 0 0">El asistente solo orienta; no modifica registros ni acredita guardias.</p></div>';
 var acciones=[["Mi historial","historial"],["Mi estado","estado"],["Asistencia","lista"]];
 if(esOficial)acciones.push(["Oficiales y guardias","config"]);
 var cont=$("gAsistenteAcciones");acciones.forEach(function(a){var b=document.createElement("button");b.type="button";b.className="btn small secondary";b.textContent=a[0];b.style.cssText="font-size:12px;padding:6px 9px;min-height:34px";b.onclick=function(){ir(a[1]);};cont.appendChild(b);});
}
function esc(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function iniciar(){pintar();var s=$("miVoluntario");if(s)s.addEventListener("change",pintar);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
})();
