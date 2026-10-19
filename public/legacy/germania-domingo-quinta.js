(function(){
"use strict";
const root=document.getElementById("domingoQuinta"),selector=document.getElementById("miVoluntario");
if(!root||!selector)return;
let resumen={turnos:[0,0,0],comida:0},fecha="",selected=[],comida="si",ayuda=false,guardando=false;
const h=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
function fechaVisible(s){const [y,m,d]=s.split("-").map(Number);const f=new Date(Date.UTC(y,m-1,d));return dias[f.getUTCDay()]+" "+d+"/"+m;}
let propia=null,inscritos=[];
function actual(){return propia}
function nombreDe(id){const o=Array.from(selector.options).find(o=>o.value===String(id));return (o?.textContent?.trim()||"Voluntario "+String(id).slice(0,12)).replace(/^\s*\d+\s*[·.\-:]\s*/,"")}
function resumenTexto(){const titulo="Guardia diurna · "+fechaVisible(fecha);const grupos=[1,2,3].map((n,i)=>"Turno "+n+" ("+["10:00–14:00","14:00–19:00","19:00–23:00"][i]+")\\n"+(inscritos.filter(v=>v.turnos.includes(n)).map(v=>"• "+nombreDe(v.voluntarioId)).join("\\n")||"Sin inscritos"));const comidaLista=inscritos.filter(v=>v.comida==="si").map(v=>nombreDe(v.voluntarioId));const ayudaLista=inscritos.filter(v=>v.ayuda).map(v=>nombreDe(v.voluntarioId));return [titulo,...grupos,"Comida confirmada ("+comidaLista.length+")\\n"+(comidaLista.join("\\n")||"Sin confirmaciones"),"Ayudan en cocina\\n"+(ayudaLista.join("\\n")||"Sin inscritos")].join("\\n\\n").replaceAll("\\n","\n")}
function participantesHTML(){return '<details class="dq-participantes"><summary>Ver inscritos por turno</summary>'+[1,2,3].map(n=>'<p><strong>Turno '+n+'</strong></p><ul>'+((inscritos.filter(v=>v.turnos.includes(n)).map(v=>'<li>'+h(nombreDe(v.voluntarioId))+'</li>').join(''))||'<li>Sin inscritos</li>')+'</ul>').join('')+'<p><strong>Comida confirmada:</strong> '+inscritos.filter(v=>v.comida==="si").length+'</p><p><strong>Ayudan en cocina:</strong> '+inscritos.filter(v=>v.ayuda).length+'</p><button type="button" id="dq-compartir">Compartir resumen</button> <button type="button" id="dq-imprimir">Imprimir / PDF</button></details>'}
function esTenienteSegundo(){const o=selector.selectedOptions?.[0];return !!o&&/mat[ií]as\s+corval[aá]n/i.test(o.textContent||"")}
function pintar(){
 const id=selector.value;
 if(!id){root.innerHTML="";return}
 const pending=!sessionStorage.getItem("dq-leido:"+fecha+":"+id);
 if(pending)sessionStorage.setItem("dq-leido:"+fecha+":"+id,"1");
 const mi=actual();
 root.innerHTML='<div class="dq-wrap"><div class="dq-hero"><small>GERMANIA · 5ª COMPAÑÍA</small><h2>☀ Domingo en la Quinta '+(pending?'<span class="dq-dot" aria-label="Nueva inscripción"></span>':'')+'</h2><p>'+h(fechaVisible(fecha))+' · Nos organizamos para cuidar y compartir.</p></div><strong>¿En qué turno te sumas?</strong><p>Puedes elegir más de uno.</p>'+
 ["10:00 a 14:00","14:00 a 19:00","19:00 a 23:00"].map((t,i)=>'<button type="button" class="dq-turno" data-turno="'+(i+1)+'" aria-pressed="'+selected.includes(i+1)+'">'+(selected.includes(i+1)?"✓ ":"○ ")+'Turno '+(i+1)+' · '+t+'</button>').join("")+
 '<div class="dq-comida"><strong>🍽 La mesa de la Quinta</strong><p>¿Te quedas a comer?</p>'+
 [["si","¡Sí, me sumo!"],["quizas","Todavía no sé"],["no","Esta vez no puedo"]].map(([v,t])=>'<label><input type="radio" name="dq-comida" value="'+v+'" '+(comida===v?"checked":"")+'> '+t+'</label>').join("")+
 '<label><input type="checkbox" id="dq-ayuda" '+(ayuda?"checked":"")+'> Puedo ayudar a preparar la comida</label><p>Minuta: el menú se informará aquí.</p></div>'+
 '<button type="button" class="dq-submit" id="dq-guardar">Guardar mi inscripción</button><p class="dq-status" id="dq-status" role="status">'+(mi?"Inscripción guardada. Puedes modificarla.":"Selecciona tus preferencias y confirma.")+'</p>'+
 '<details><summary>Participación por turno</summary><p>'+[1,2,3].map(n=>"Turno "+n+": "+(resumen.turnos[n-1]||0)).join(" · ")+'</p><p>Comida confirmada: '+resumen.comida+'</p></details>'+(esTenienteSegundo()?participantesHTML():'')+'</div>';
 root.querySelectorAll("[data-turno]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.turno);selected=selected.includes(n)?selected.filter(x=>x!==n):[...selected,n].sort();pintar()});
 root.querySelectorAll('[name="dq-comida"]').forEach(x=>x.onchange=()=>{comida=x.value});
 root.querySelector("#dq-ayuda").onchange=e=>{ayuda=e.target.checked};
 root.querySelector("#dq-guardar").onclick=guardar;
 if(esTenienteSegundo())root.querySelector("#dq-compartir").onclick=async()=>{const texto=resumenTexto();if(navigator.share){try{await navigator.share({text:texto,title:"Guardia diurna"});return}catch(e){if(e.name==="AbortError")return}}if(navigator.clipboard)await navigator.clipboard.writeText(texto);else window.prompt("Copia el resumen",texto)};
 if(esTenienteSegundo())root.querySelector("#dq-imprimir").onclick=()=>{
 const w=window.open("","_blank");if(!w){alert("Permite ventanas emergentes para generar PDF");return}
 const grupos=[1,2,3].map((n,i)=>{const nombres=inscritos.filter(v=>v.turnos.includes(n)).map(v=>nombreDe(v.voluntarioId));return '<tr><td><b>Turno '+n+'</b><br><small>'+["10:00–14:00","14:00–19:00","19:00–23:00"][i]+'</small></td><td>'+(nombres.length?nombres.map(h).join("<br>"):"Sin inscritos")+'</td><td>'+nombres.length+'</td></tr>'}).join("");
 const lista=(arr)=>arr.length?arr.map(x=>'<li>'+h(nombreDe(x.voluntarioId))+'</li>').join(""):'<li>Sin inscritos</li>';
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Guardia diurna</title><style>@page{size:letter;margin:15mm}body{font:12pt Arial,sans-serif;color:#202020;margin:0}header{border-bottom:3px solid #9d2424;padding-bottom:14px;margin-bottom:24px}header small{letter-spacing:2px;color:#555}h1{font-size:22pt;margin:12px 0 4px}h2{font-size:14pt;margin:22px 0 10px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:12px;text-align:left;vertical-align:top}th{background:#f0f0f0}td:last-child{text-align:center;width:55px}small{color:#555}ul{line-height:1.7}footer{border-top:1px solid #ddd;margin-top:35px;padding-top:12px;color:#666;font-size:9pt}@media print{button{display:none}}</style></head><body><header><small>CUERPO DE BOMBEROS DE VILLARRICA · QUINTA COMPAÑÍA GERMANIA</small><h1>Guardia Diurna</h1><div>'+h(fechaVisible(fecha))+' de '+h(fecha.slice(0,4))+'</div></header><h2>Distribución de voluntarios</h2><table><thead><tr><th>Horario</th><th>Voluntarios inscritos</th><th>Total</th></tr></thead><tbody>'+grupos+'</tbody></table><h2>Comida y compañerismo</h2><b>Comida confirmada ('+inscritos.filter(v=>v.comida==="si").length+')</b><ul>'+lista(inscritos.filter(v=>v.comida==="si"))+'</ul><b>Colaboran en cocina ('+inscritos.filter(v=>v.ayuda).length+')</b><ul>'+lista(inscritos.filter(v=>v.ayuda))+'</ul><footer>GERMANIA · Resumen de inscripciones · Documento informativo</footer></body></html>';
 w.document.open();w.document.write(html);w.document.close();w.onload=()=>{w.focus();w.print()};
 };

}
async function cargar(){
 if(!selector.value){root.innerHTML="";return}
 try{const r=await fetch("/api/domingo-quinta?voluntarioId="+encodeURIComponent(selector.value),{cache:"no-store"});if(!r.ok)throw Error("Servicio no disponible");const d=await r.json();if(!d.abierta){fecha="";resumen={turnos:[0,0,0],comida:0};root.innerHTML="";return}fecha=d.domingo;resumen=d.resumen||{turnos:[0,0,0],comida:0};inscritos=d.inscritos||[];propia=d.propia||null;selected=propia?.turnos||[];comida=propia?.comida||"si";ayuda=!!propia?.ayuda;pintar()}
 catch(e){root.innerHTML='<p style="padding:14px;color:#fff">Domingo en la Quinta no disponible temporalmente. Intenta nuevamente.</p>'}
}
async function guardar(){
 if(guardando||!selector.value)return;
 guardando=true;const btn=root.querySelector("#dq-guardar"),status=root.querySelector("#dq-status");
 btn.disabled=true;status.textContent="Guardando…";
 try{
 const r=await fetch("/api/domingo-quinta",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({voluntarioId:selector.value,turnos:selected,comida,ayuda})});
 if(!r.ok)throw Error("No se pudo guardar ("+r.status+")");
 await cargar();const s=root.querySelector("#dq-status");if(s)s.textContent="Inscripción guardada correctamente.";
 }catch(e){status.textContent=e.message+" · Intenta nuevamente.";btn.disabled=false}
 finally{guardando=false}
}
selector.addEventListener("change",()=>{selected=[];comida="si";ayuda=false;cargar()});
setTimeout(cargar,1600);
window.addEventListener("focus",cargar);
})();
