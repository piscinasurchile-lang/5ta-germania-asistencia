/* Fechas civiles de la compañía; no transforma fechas históricas ni marcas de tiempo UTC. */
(function(root){
 'use strict';
 const formato=new Intl.DateTimeFormat('en-US',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'});
 function fechaChile(instante=new Date()){
  const date=instante instanceof Date?instante:new Date(instante);
  if(!Number.isFinite(date.getTime()))throw new Error('Instante inválido');
  const p=Object.fromEntries(formato.formatToParts(date).map(x=>[x.type,x.value]));
  return p.year+'-'+p.month+'-'+p.day;
 }
 function sumarDias(fecha,dias){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||!Number.isInteger(dias))throw new Error('Fecha civil inválida');
  const d=new Date(fecha+'T12:00:00Z');
  if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==fecha)throw new Error('Fecha civil inválida');
  d.setUTCDate(d.getUTCDate()+dias);return d.toISOString().slice(0,10);
 }
 root.GermaniaFechas=Object.freeze({fechaChile,hoyChile:()=>fechaChile(),sumarDias});
})(typeof window==='undefined'?globalThis:window);
