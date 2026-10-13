(function(root){
'use strict';
const roster=[
{id:'andres',nombre:'Andrés Herrera Santander',rango:4,maquinista:false},
{id:'capitan',nombre:'Capitán · ejemplo',rango:1,maquinista:true},
{id:'tte1',nombre:'Teniente Primero · ejemplo',rango:2,maquinista:false},
{id:'tte2',nombre:'Teniente Segundo · ejemplo',rango:3,maquinista:false},
{id:'maq2',nombre:'Maquinista 2 · ejemplo',rango:8,maquinista:true},
{id:'maq3',nombre:'Maquinista 3 · ejemplo',rango:9,maquinista:true},
{id:'v1',nombre:'Voluntario A · ejemplo',rango:10,maquinista:false},
{id:'v2',nombre:'Voluntario B · ejemplo',rango:11,maquinista:false},
{id:'v3',nombre:'Voluntario C · ejemplo',rango:12,maquinista:false},
{id:'david',nombre:'David Briones · cuartelero',rango:99,maquinista:true,externo:true}];
const days=Array.from({length:7},(_,i)=>'2026-10-'+(14+i));
const person=id=>roster.find(p=>p.id===id);
function create(){return {phase:'cerrada',submissions:{capitan:days.filter((_,i)=>i%3===0),maq2:days.filter((_,i)=>i%3===1),maq3:days.filter((_,i)=>i%3===2),tte1:days.slice(),v1:days.slice(),v2:days.slice()},nights:days.map((date,i)=>({date,ids:[['capitan','maq2','maq3'][i%3],'tte1','v1','v2'],driver:['capitan','maq2','maq3'][i%3],version:1,seen:{},accredited:[],ended:false})),history:[]};}
function requireOfficer(id){if(id!=='andres')throw Error('Solo el Teniente Tercero puede realizar esta acción.');}
function roles(n){const driver=n.ids.includes(n.driver)?n.driver:null;const others=n.ids.filter(id=>id!==driver).sort((a,b)=>person(a).rango-person(b).rango);return {driver,obac:others[0]||null,volunteers:others.slice(1),complete:!!driver&&others.length>=3};}
function signature(n,id){const r=roles(n);return !n.ids.includes(id)?null:n.date+':'+(r.driver===id?'Maquinista':r.obac===id?'OBAC':'Voluntario');}
function log(s,actor,action,date){s.history.unshift({actor,action,date,at:new Date().toISOString()});}
function submit(s,id,dates){if(s.phase!=='abierta')throw Error('La inscripción está cerrada.');if(!person(id)||person(id).externo)throw Error('Persona no habilitada para inscripción voluntaria.');if(new Set(dates).size<2)throw Error('Elige al menos dos noches.');if(dates.some(d=>!days.includes(d)))throw Error('Fecha inválida.');s.submissions[id]=[...new Set(dates)];log(s,id,'Confirmó selección',dates.join(', '));}
function open(s,actor){requireOfficer(actor);s.phase='abierta';log(s,actor,'Abrió inscripción','Semana');}
function close(s,actor){requireOfficer(actor);if(s.phase!=='abierta')throw Error('La semana no está abierta.');s.phase='cerrada';for(const n of s.nights){n.ids=Object.keys(s.submissions).filter(id=>s.submissions[id].includes(n.date));const candidates=n.ids.filter(id=>person(id).maquinista);n.driver=candidates.length===1?candidates[0]:null;n.version++;n.seen={};n.ended=false;n.accredited=[];}log(s,actor,'Cerró inscripción y preparó revisión','Semana');}
function edit(s,actor,date,op,id,target){requireOfficer(actor);if(s.phase==='abierta')throw Error('Cierra la inscripción antes de ajustar.');const n=s.nights.find(n=>n.date===date);if(!n||!person(id))throw Error('Asignación inválida.');if(n.ended)throw Error('La noche terminó; conserva su historial.');let other=null;if(op==='mover'){other=s.nights.find(n=>n.date===target);if(!other||other===n||other.ended||other.ids.includes(id))throw Error('Destino inválido o persona ya asignada.');}const snapshots=new Map(s.nights.map(x=>[x.date,new Map(x.ids.map(p=>[p,signature(x,p)]))]));
if(op==='agregar'){if(!n.ids.includes(id))n.ids.push(id);}else if(op==='quitar'||op==='mover'){n.ids=n.ids.filter(p=>p!==id);if(n.driver===id)n.driver=null;if(other)other.ids.push(id);}else if(op==='maquinista'){if(!person(id).maquinista)throw Error('Selecciona un maquinista habilitado.');if(!n.ids.includes(id))n.ids.push(id);n.driver=id;}else throw Error('Acción inválida.');
for(const x of [n,other].filter(Boolean)){x.version++;for(const pid of Object.keys(x.seen)){if(snapshots.get(x.date).get(pid)!==signature(x,pid))delete x.seen[pid];}}
log(s,actor,op+' · '+person(id).nombre,date+(target?' → '+target:''));}
function approve(s,actor){requireOfficer(actor);if(s.phase!=='cerrada')throw Error('Cierra y revisa la semana primero.');if(s.nights.some(n=>!roles(n).complete))throw Error('Hay noches incompletas: falta OBAC, maquinista o dos voluntarios.');s.phase='aprobada';log(s,actor,'Aprobó semana','Semana');}
function seen(s,id,date){const n=s.nights.find(n=>n.date===date);if(s.phase!=='aprobada'||!n||!n.ids.includes(id)||n.ended)throw Error('No hay asignación aprobada para confirmar.');n.seen[id]={signature:signature(n,id),at:new Date().toISOString()};log(s,id,'Confirmó visto',date);}
function end(s,actor,date){requireOfficer(actor);const n=s.nights.find(n=>n.date===date);if(s.phase!=='aprobada'||!n)throw Error('Primero aprueba la semana.');n.ended=true;log(s,actor,'Simuló fin de noche a las 06:00',date);}
function accredit(s,actor,date,id){requireOfficer(actor);const n=s.nights.find(n=>n.date===date);if(!n||!n.ended||!n.ids.includes(id))throw Error('La noche debe terminar antes de acreditar.');if(!n.accredited.includes(id))n.accredited.push(id);log(s,actor,'Acreditó · '+person(id).nombre,date);}
const api={roster,days,person,create,roles,signature,submit,open,close,edit,approve,seen,end,accredit};if(typeof module!=='undefined')module.exports=api;root.GuardiaDemo=api;
})(typeof window!=='undefined'?window:globalThis);
