export const TURNOS = Object.freeze(["10:00–14:00","14:00–19:00","19:00–23:00"]);
export function domingoSiguiente(fecha=new Date()) {
 const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"}).formatToParts(fecha).map(p=>[p.type,p.value]));
 const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.weekday];
 const d=new Date(Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day)));
 d.setUTCDate(d.getUTCDate()+(7-day)%7);
 return d.toISOString().slice(0,10);
}
export function convocatoriaAbierta(fecha=new Date()) {
 const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(fecha).map(p=>[p.type,p.value]));
 const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.weekday];
 return (day===6&&(Number(parts.hour)*60+Number(parts.minute)>=765))||day===0;
}
export function validarInscripcion(x) {
  if(!x||typeof x!=="object"||!/^\d{1,12}$/.test(String(x.voluntarioId||"")))return null;
  const turnos=Array.isArray(x.turnos)?[...new Set(x.turnos)]:[];
  if(turnos.some(t=>!Number.isInteger(t)||t<1||t>3))return null;
  if(!["si","no","quizas"].includes(x.comida))return null;
  return {voluntarioId:String(x.voluntarioId),turnos:turnos.sort(),comida:x.comida,ayuda:x.ayuda===true};
}
