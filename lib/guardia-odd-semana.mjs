// Proyección de lectura: nunca guarda ni acredita asistencia.
const ISO=/^\d{4}-\d{2}-\d{2}$/;
export function fechasSemanaGuardia(inicio){
  if(!ISO.test(inicio||""))throw new Error("Selecciona un miércoles válido para la semana de guardia.");
  const fecha=new Date(inicio+"T12:00:00Z");
  if(Number.isNaN(fecha.getTime())||fecha.toISOString().slice(0,10)!==inicio||fecha.getUTCDay()!==3){
    throw new Error("La semana normal de guardia comienza un miércoles.");
  }
  return Array.from({length:7},(_,i)=>{
    const dia=new Date(fecha);
    dia.setUTCDate(fecha.getUTCDate()+i);
    return dia.toISOString().slice(0,10);
  });
}
function nombreMiembro(persona){
  if(!persona)return "";
  return [persona.nombre,persona.apellidoPaterno||persona.ap,persona.apellidoMaterno||persona.am]
    .map(x=>String(x||"").trim()).filter(Boolean).join(" ");
}
export function proyectarSemanaODD(inicio,revision,nomina){
  const fechas=fechasSemanaGuardia(inicio);
  if(!revision||revision.estado!=="aprobada"||revision.inicio!==inicio||!revision.noches){
    throw new Error("Esta semana todavía no tiene una revisión aprobada. No se puede generar su ODD.");
  }
  if(!Array.isArray(nomina)||!nomina.length){
    throw new Error("No fue posible consultar la nómina institucional. No se emitirá una ODD incompleta.");
  }
  const miembros=new Map();
  for(const p of nomina){
    if(p.id!==undefined&&p.id!==null)miembros.set(String(p.id),p);
  }
  const buscar=(id,noche)=>{
    if(id===null||id===undefined||id==="")return null;
    const m=miembros.get(String(id));
    if(m)return {code:String(m.clave??""),name:nombreMiembro(m)};
    if(String(id)===String(noche.apoyoExterno?.id||"")&&noche.apoyoExterno?.nombre){
      return {code:"",name:String(noche.apoyoExterno.nombre)};
    }
    return {code:"",name:"Sin identificar"};
  };
  return fechas.map(date=>{
    const noche=revision.noches[date];
    if(!noche||!Array.isArray(noche.vol)){
      throw new Error("Falta la dotación revisada del "+date+". No se puede completar el anexo semanal.");
    }
    const obac=buscar(noche.obac,noche),maq=buscar(noche.maq,noche);
    const people=noche.vol.map(id=>buscar(id,noche)||{code:"",name:"Sin identificar"});
    const ids=[...noche.vol,...(noche.maq?[noche.maq]:[]),...(noche.obac?[noche.obac]:[])].map(String);
    const completos=ids.length===new Set(ids).size && people.length>=2 && !!maq && !!obac &&
      [maq,obac,...people].every(p=>p.name&&p.name!=="Sin identificar");
    return {date,total:people.length,complete:completos,obac:obac?.name||"Sin asignar",
      driver:maq?.name||"Sin asignar",people};
  });
}
