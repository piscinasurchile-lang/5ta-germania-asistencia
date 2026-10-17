export const TURNOS = Object.freeze(["10:00–14:00","14:00–19:00","19:00–23:00"]);
export function semanaDomingo(now = new Date()) {
  const local = new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"}).formatToParts(now);
  const v=Object.fromEntries(local.map(p=>[p.type,p.value]));
  const weekday={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[v.weekday];
  const base=new Date(Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day)));
  base.setUTCDate(base.getUTCDate()-((weekday+4)%7)+4);
  const sunday=new Date(base);sunday.setUTCDate(base.getUTCDate()+(7-weekday)%7);
  return sunday.toISOString().slice(0,10);
}
export function domingoSiguiente(fecha=new Date()) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"}).formatToParts(fecha).map(x=>[x.type,x.value]));
  const day={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.weekday];
  const d=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day));
  d.setUTCDate(d.getUTCDate()+(7-day)%7);
  return d.toISOString().slice(0,10);
}
export function validarInscripcion(x) {
  if(!x||typeof x!=="object"||!/^\d{1,12}$/.test(String(x.voluntarioId||"")))return null;
  const turnos=Array.isArray(x.turnos)?[...new Set(x.turnos)]:[];
  if(turnos.some(t=>!Number.isInteger(t)||t<1||t>3))return null;
  if(!["si","no","quizas"].includes(x.comida))return null;
  return {voluntarioId:String(x.voluntarioId),turnos:turnos.sort(),comida:x.comida,ayuda:x.ayuda===true};
}
