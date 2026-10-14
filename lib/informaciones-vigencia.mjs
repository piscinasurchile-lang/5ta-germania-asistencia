/* Reglas únicas de vencimiento para informaciones oficiales. No elimina registros ni acreditaciones. */
export const AVISO_VIGENCIA_MS=48*60*60*1000;
export function vencimientoAlPublicar(ahora,fechaHora){
  if(!Number.isFinite(ahora))throw new Error("fecha_actual_invalida");
  if(fechaHora===undefined||fechaHora===null||fechaHora==="")return new Date(ahora+AVISO_VIGENCIA_MS).toISOString();
  if(typeof fechaHora!=="string"||!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(fechaHora)){
    throw new Error("fecha_hora_invalida");
  }
  const ms=Date.parse(fechaHora);
  if(!Number.isFinite(ms)||ms<=ahora)throw new Error("vencimiento_debe_ser_futuro");
  return new Date(ms).toISOString();
}
export function avisoEstaVigente(aviso,ahora=Date.now()){
  const creado=Date.parse(aviso?.en||"");
  if(!Number.isFinite(creado)||!Number.isFinite(ahora))return false;
  const fin=aviso?.vence?Date.parse(aviso.vence):creado+AVISO_VIGENCIA_MS;
  return Number.isFinite(fin)&&fin>ahora;
}
