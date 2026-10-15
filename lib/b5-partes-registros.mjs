const STATUS=new Set(["presente","ausente","justificado"]);

function slug(tipo){
  return tipo.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase();
}
export function claveDeParteB5({id,date,tipo}={}){
  if(typeof id!=="string"||!/^([0-9a-f-]{36}|b5-[0-9]+-[a-z0-9]+)$/.test(id))return null;
  if(typeof date!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date)
    ||Number.isNaN(Date.parse(date+"T12:00:00Z")))return null;
  if(typeof tipo!=="string"||!tipo.trim()||tipo.length>100)return null;
  return "parte:"+date+"__"+slug(tipo.trim());
}
export function aplicarCambioParteB5(actual,accion,cambios,fecha){
  if(!actual||!actual.records||typeof actual.records!=="object")throw new Error("parte_invalido");
  const datos={...actual};
  const antes={fecha,accion,records:actual.records,detalle:actual.detalle||"",
    registradoPor:actual.registradoPor||"",anulado:actual.anulado===true};
  if(accion==="corregir"){
    if(actual.anulado)throw new Error("parte_anulado");
    const records=cambios?.records;
    if(!records||typeof records!=="object"||Array.isArray(records))throw new Error("estados_invalidos");
    const originales=Object.keys(actual.records).sort(),propuestos=Object.keys(records).sort();
    if(originales.length!==propuestos.length || originales.some((id,i)=>id!==propuestos[i]))throw new Error("nomina_no_coincide");
    if(propuestos.some(id=>!STATUS.has(records[id])))throw new Error("estados_invalidos");
    if(typeof cambios.detalle!=="string"||cambios.detalle.length>4000 ||
       typeof cambios.registradoPor!=="string"||cambios.registradoPor.length>180)throw new Error("campos_invalidos");
    datos.records={...records};
    datos.detalle=cambios.detalle.trim();
    datos.registradoPor=cambios.registradoPor.trim();
  }else if(accion==="anular"){
    if(actual.anulado)throw new Error("ya_anulado");
    datos.anulado=true;
    datos.generaAsistencia=false;
  }else if(accion==="restaurar"){
    if(!actual.anulado)throw new Error("no_anulado");
    datos.anulado=false;
    datos.generaAsistencia=true;
  }else throw new Error("accion_no_permitida");
  datos.historialB5=[...(Array.isArray(actual.historialB5)?actual.historialB5:[]).slice(-19),antes];
  datos.ultimaRevisionB5=fecha;
  return datos;
}
