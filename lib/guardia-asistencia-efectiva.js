/* Guardia efectiva: complementa, nunca modifica, la dotación aprobada. */
export function idsEfectivos(programados, adicionales=[]) {
  return [...programados.map(String), ...adicionales.map(a=>String(a.id))];
}
export function validarComplementos(programados, adicionales, excusas, asistencias, roster) {
  if (!Array.isArray(adicionales) || adicionales.length>15) return "rezagados_invalidos";
  if (!excusas || typeof excusas!=="object" || Array.isArray(excusas)) return "excusas_invalidas";
  const base=new Set(programados.map(String)), extras=new Set();
  for(const persona of adicionales){
    const id=String(persona?.id||""), motivo=persona?.motivo;
    if(!id || base.has(id) || extras.has(id))return "rezagado_duplicado";
    if(!roster?.some(p=>String(p.id)===id && p.activo!==false))return "rezagado_no_en_nomina";
    if(typeof motivo!=="string" || motivo.trim().length<8 || motivo.length>300)return "motivo_rezagado_requerido";
    if(asistencias?.[id]!=="presente")return "rezagado_debe_estar_presente";
    extras.add(id);
  }
  for(const [id,motivo] of Object.entries(excusas)){
    if(!base.has(id) || asistencias?.[id]!=="ausente" ||
       typeof motivo!=="string" || motivo.trim().length<3 || motivo.length>400)return "excusa_invalida";
  }
  return null;
}
export function resumenEfectivo(ac){
  const presentes=[...new Set((ac?.asistentes||[]).map(String))];
  const excusas=ac?.excusas||{};
  const ausentes=[...new Set((ac?.ausentes||[]).map(String))];
  return {presentes,excusados:ausentes.filter(id=>!!excusas[id]),
    faltantes:ausentes.filter(id=>!excusas[id])};
}
