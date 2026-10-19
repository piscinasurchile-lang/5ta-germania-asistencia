// Registro de participación externa por noche. No acredita asistencia Germania.
export function validarExterno(x){
 if(!x||typeof x!=="object"||Array.isArray(x))return "registro_invalido";
 const campos=["nombre","procedencia","funcion","motivo","autorizadoPor","habilitacionVerificadaPor","referenciaLibro"];
 for(const c of campos)if(typeof x[c]!=="string"||x[c].trim().length<3||x[c].length>250)return "campo_incompleto_"+c;
 if(!["maquinista","obac","voluntario"].includes(x.funcion))return "funcion_invalida";
 if(x.habilitacionConfirmada!==true||x.autorizacionConfirmada!==true)return "autorizacion_no_verificada";
 if(typeof x.horaIngreso!=="string"||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x.horaIngreso))return "hora_invalida";
 if(x.pernocta===true&&!(x.autorizacionPernoctacionEscrita===true&&typeof x.referenciaAutorizacionEscrita==="string"&&x.referenciaAutorizacionEscrita.trim().length>=3))return "pernoctacion_sin_respaldo";
 return null;
}
export function crearExterno(x,actorId){
 const error=validarExterno(x);if(error)return {error};
 return {registro:{...Object.fromEntries(["nombre","procedencia","funcion","motivo","autorizadoPor","habilitacionVerificadaPor","referenciaLibro","horaIngreso","referenciaAutorizacionEscrita"].map(k=>[k,typeof x[k]==="string"?x[k].trim():""])),habilitacionConfirmada:true,autorizacionConfirmada:true,pernocta:x.pernocta===true,autorizacionPernoctacionEscrita:x.autorizacionPernoctacionEscrita===true,registradoPor:String(actorId),registradoEn:new Date().toISOString(),estado:"documentado_no_acreditado"}};
}
