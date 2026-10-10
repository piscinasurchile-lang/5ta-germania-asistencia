/** El flujo antiguo no acredita la identidad individual del voluntario.
 * Se mantiene cerrado salvo autorización explícita durante una transición controlada.
 * No constituye un sistema de autenticación.
 */
export function permitirInscripcionHeredada(configuracion) {
  return configuracion?.GUARDIA_INSCRIPCION_LEGACY_BLOQUEADA === "false";
}
export function identidadInscripcionVerificada({codigoSesion, codigoSolicitado} = {}) {
  return /^\d{1,6}$/.test(String(codigoSesion || "")) &&
    String(codigoSesion) === String(codigoSolicitado || "");
}
