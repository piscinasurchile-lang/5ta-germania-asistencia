const FECHA="2026-10-15";
const TIPO_ORIGEN="Citación de Compañía";
const TIPO_DESTINO="Citación de Comandancia";
const ESTADOS=new Set(["presente","ausente","justificado"]);
const ID=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|b5-[0-9]+-[a-z0-9]+)$/i;
export const CLAVE_COMANDANCIA_15="parte:2026-10-15__citacion-de-compania";
export const CLAVE_INDICE_COMANDANCIA_15="2026-10-15__citacion-de-compania";
export const TIPO_RECUPERADO_COMANDANCIA_15=TIPO_DESTINO;

export function resumenRecuperacion(registros){
  const estados=Object.values(registros||{});
  return {presentes:estados.filter(x=>x==="presente").length,
    ausentes:estados.filter(x=>x==="ausente").length,
    justificados:estados.filter(x=>x==="justificado").length,
    total:estados.length};
}

export function construirRecuperacionComandancia(actual,fuente,fechaActualizacion){
  if(!actual||actual.date!==FECHA||actual.numero!==6||actual.anulado!==true||
      actual.tipo!==TIPO_ORIGEN||actual.origenAsistencia!=="citacion_manual")
    throw new Error("parte_oficial_no_coincide");
  if(actual.b5RecuperadoDesdeId)throw new Error("recuperacion_previa");
  if(!actual.records||typeof actual.records!=="object"||Array.isArray(actual.records))
    throw new Error("parte_invalido");
  if(!fuente||!ID.test(String(fuente.id||""))||fuente.date!==FECHA||
      fuente.tipo!==TIPO_ORIGEN||!fuente.records||Array.isArray(fuente.records)||
      typeof fuente.records!=="object"||fuente.id===actual.b5OfflineId)
    throw new Error("fuente_invalida");
  const originales=Object.keys(actual.records).sort();
  const recibidos=Object.keys(fuente.records).sort();
  if(originales.length!==28||recibidos.length!==originales.length||
      originales.some((id,i)=>id!==recibidos[i])||
      recibidos.some(id=>!ESTADOS.has(fuente.records[id])))
    throw new Error("nomina_no_coincide");
  const r=resumenRecuperacion(fuente.records);
  if(r.total!==28||r.presentes!==10||r.ausentes!==7||r.justificados!==11)
    throw new Error("totales_no_coinciden");
  const detalle=String(fuente.detalle||"").trim();
  const registradoPor=String(fuente.registradoPor||"").trim();
  if(detalle.length>4000||registradoPor.length>180)throw new Error("campos_invalidos");
  if(!Number.isFinite(Date.parse(fechaActualizacion)))throw new Error("fecha_invalida");
  return {...actual,tipo:TIPO_DESTINO,detalle:detalle||"Citación de Comandancia",
    registradoPor,records:{...fuente.records},origenAsistencia:"comandancia_citacion",
    anulado:false,generaAsistencia:true,b5RecuperadoDesdeId:fuente.id,
    ultimaRevisionB5:fechaActualizacion,
    historialB5:[...(Array.isArray(actual.historialB5)?actual.historialB5:[]),{
      fecha:fechaActualizacion,accion:"recuperar_citacion_comandancia",
      desdeB5Id:fuente.id,
      b5OfflineIdOriginal:actual.b5OfflineId,
      tipoAnterior:actual.tipo,origenAnterior:actual.origenAsistencia,
      anuladoAnterior:actual.anulado,
      records:{...actual.records},
      totalesRecuperados:r
    }]};
}
