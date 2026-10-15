/* Germania: fases del aviso OBAC, calculadas con hora oficial de Chile. Sin escrituras. */
(function(){
 "use strict";
 const DIA_MS=24*60*60*1000;
 function fechaSiguiente(fecha){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha||""))return "";
  const d=new Date(fecha+"T12:00:00Z");
  if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==fecha)return "";
  d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
 }
 function horaChile(fecha=new Date()){
  const d=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{
   timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",
   hour:"2-digit",minute:"2-digit",hourCycle:"h23",hour12:false
  }).formatToParts(fecha).map(p=>[p.type,p.value]));
  return d.year+"-"+d.month+"-"+d.day+"T"+d.hour+":"+d.minute;
 }
 function fase(x,ahoraChile,ahoraMs){
  if(!x||!fechaSiguiente(x.fecha))return "oculto";
  if(x.cierre){
   const enviado=Date.parse(x.cierre.enviadoEn||"");
   return x.cierre.estado==="enviado"&&Number.isFinite(enviado)&&ahoraMs>=enviado&&ahoraMs<enviado+DIA_MS
    ?"confirmacion":"oculto";
  }
  if(x.cierreHabilitado===true)return "cierre";
  if(ahoraChile>=x.fecha+"T22:30"&&ahoraChile<fechaSiguiente(x.fecha)+"T06:00")return "previo";
  return "oculto";
 }
 function seleccionar(items,actorId,ahoraChile=horaChile(),ahoraMs=Date.now()){
  const m=String(actorId||""),avisos=[],formularios=[],previos=[];
  for(const x of Array.isArray(items)?items:[]){
   if(!m||String(x?.dotacion?.obac||"")!==m)continue;
   const tipo=fase(x,ahoraChile,ahoraMs);
   if(tipo==="confirmacion")avisos.push(x);
   else if(tipo==="cierre")formularios.push(x);
   else if(tipo==="previo")previos.push(x);
  }
  // Si la persona tiene dos turnos seguidos, atender primero el cierre pendiente
  // y no ocultar el recordatorio del turno siguiente ni el acuse anterior.
  formularios.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  previos.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  avisos.sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return {pendientes:formularios,proximas:previos,confirmaciones:avisos,
   principal:formularios[0]||previos[0]||null};
 }
 window.GermaniaObacAvisos={fechaSiguiente,horaChile,fase,seleccionar};
})();