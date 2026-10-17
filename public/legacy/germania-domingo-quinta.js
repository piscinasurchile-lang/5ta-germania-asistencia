(function(){
"use strict";
const root=document.getElementById("domingoQuinta"),selector=document.getElementById("miVoluntario");
if(!root||!selector)return;
let inscritos=[],fecha="",selected=[],comida="si",ayuda=false,guardando=false;
const h=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
function fechaVisible(s){const [y,m,d]=s.split("-").map(Number);const f=new Date(Date.UTC(y,m-1,d));return dias[f.getUTCDay()]+" "+d+"/"+m;}
function actual(){return inscritos.find(x=>String(x.id)===String(selector.value))}
function pintar(){
 const id=selector.value;
 if(!id){root.innerHTML="";return}
 const mi=actual();
 const pending=!!fecha&&!mi;
 root.innerHTML='<div class="dq-wrap"><div class="dq-hero"><small>GERMANIA · 5ª COMPAÑÍA</small><h2>☀ Domingo en la Quinta '+(pending?'<span class="dq-dot" aria-label="Nueva inscripción"></span>':'')+'</h2><p>'+h(fechaVisible(fecha))+' · Nos organizamos para cuidar y compartir.</p></div><strong>¿En qué turno te sumas?</strong><p>Puedes elegir más de uno.</p>'+
 ["10:00 a 14:00","14:00 a 19:00","19:00 a 23:00"].map((t,i)=>'<button type="button" class="dq-turno" data-turno="'+(i+1)+'" aria-pressed="'+selected.includes(i+1)+'">'+(selected.includes(i+1)?"✓ ":"○ ")+'Turno '+(i+1)+' · '+t+'</button>').join("")+
 '<div class="dq-comida"><strong>🍽 La mesa de la Quinta</strong><p>¿Te quedas a comer?</p>'+
 [["si","¡Sí, me sumo!"],["quizas","Todavía no sé"],["no","Esta vez no puedo"]].map(([v,t])=>'<label><input type="radio" name="dq-comida" value="'+v+'" '+(comida===v?"checked":"")+'> '+t+'</label>').join("")+
 '<label><input type="checkbox" id="dq-ayuda" '+(ayuda?"checked":"")+'> Puedo ayudar a preparar la comida</label><p>Minuta: el menú se informará aquí.</p></div>'+
 '<button type="button" class="dq-submit" id="dq-guardar">¡Listo, cuenten conmigo!</button><p class="dq-status" id="dq-status" role="status">'+(mi?"Inscripción guardada. Puedes modificarla.":"Selecciona tus preferencias y confirma.")+'</p>'+
 '<details><summary>Participación por turno</summary><p>'+[1,2,3].map(n=>"Turno "+n+": "+inscritos.filter(x=>Array.isArray(x.turnos)&&x.turnos.includes(n)).length).join(" · ")+'</p><p>Comida confirmada: '+inscritos.filter(x=>x.comida==="si").length+'</p></details></div>';
 root.querySelectorAll("[data-turno]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.turno);selected=selected.includes(n)?selected.filter(x=>x!==n):[...selected,n].sort();pintar()});
 root.querySelectorAll('[name="dq-comida"]').forEach(x=>x.onchange=()=>{comida=x.value});
 root.querySelector("#dq-ayuda").onchange=e=>{ayuda=e.target.checked};
 root.querySelector("#dq-guardar").onclick=guardar;
}
async function cargar(){
 if(!selector.value){root.innerHTML="";return}
 try{const r=await fetch("/api/domingo-quinta",{cache:"no-store"});if(!r.ok)throw Error("Servicio no disponible");const d=await r.json();if(!d.abierta){fecha="";inscritos=[];root.innerHTML="";return}fecha=d.domingo;inscritos=d.inscritos||[];const mi=actual();selected=mi&&Array.isArray(mi.turnos)?mi.turnos.map(Number):[];comida=mi?.comida||"si";ayuda=!!mi?.ayuda;pintar()}
 catch(e){root.innerHTML='<p style="padding:14px;color:#fff">Domingo en la Quinta no disponible temporalmente. Intenta nuevamente.</p>'}
}
async function guardar(){
 if(guardando||!selector.value)return;
 guardando=true;const btn=root.querySelector("#dq-guardar"),status=root.querySelector("#dq-status");btn.disabled=true;status.textContent="Guardando…";
 try{
 const r=await fetch("/api/domingo-quinta",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({voluntarioId:selector.value,turnos:selected,comida,ayuda})});
 if(!r.ok)throw Error("No se pudo guardar");await cargar();const msg=root.querySelector("#dq-status");if(msg)msg.textContent="¡Listo! Tu inscripción quedó registrada.";
 }catch(e){status.textContent="Error de conexión: no se guardó. Intenta nuevamente.";btn.disabled=false}
 finally{guardando=false}
}
selector.addEventListener("change",()=>{selected=[];comida="si";ayuda=false;cargar()});
setTimeout(cargar,1600);
window.addEventListener("focus",cargar);
})();
