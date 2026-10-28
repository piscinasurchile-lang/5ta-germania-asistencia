import {idsEfectivos,validarComplementos} from "./guardia-asistencia-efectiva.js";
// Validación pura: una noche jamás se acredita por el paso de las horas ni por asignación.
export const LIMITE_ADICIONALES=200; // sin límite artificial: solo evita cargas abusivas
export function integrantesNoche(noche) {
  if (!noche || !Array.isArray(noche.vol)) return [];
  return [noche.maq, noche.obac, ...noche.vol].filter(Boolean).map(String);
}
/** Firma de la composición y rol de la dotación aprobada. Cambia al sustituir un integrante
 * o cambiar su función. No se toma del cliente. Se usa para invalidar acreditaciones anteriores. */
export function firmaDotacion(noche) {
  if (!noche || !Array.isArray(noche.vol)) return null;
  const ids = integrantesNoche(noche);
  if (!noche.maq || !noche.obac || noche.vol.length<2 ||
      noche.vol.some(id=>id===null || id===undefined || String(id).trim()==="") ||
      ids.length!==noche.vol.length+2 || ids.length!==new Set(ids).size) return null;
  return JSON.stringify({
    maq: String(noche.maq),
    obac: String(noche.obac),
    vol: noche.vol.map(String).sort()
  });
}
/** Oficiales que pueden cerrar, aprobar y corregir guardias (instrucción del Capitán, oct-2026):
 * Capitán y Tenientes 1°, 2° y 3°. El T3 conserva además la administración de la programación semanal.
 * Aprobación en un único paso (ADR 0012): no existe una segunda acreditación por el T3. */
export function cargoAutorizadoGuardia(cargo){
  const c=String(cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
  return /^capitan(\s|$)/.test(c)||/^teniente\s*(primero|segundo|tercero|1|2|3)/.test(c);
}
export function oficialAutorizado(roster, actor){
  return !!actor && Array.isArray(roster) && roster.some(p=>String(p.id)===String(actor) && p.activo!==false && cargoAutorizadoGuardia(p.cargo));
}
/** Antigüedad (Art. 26): menor fechaIngreso = más antiguo. Sin fecha → se considera el menos antiguo. */
function antig(p){return p&&/^\d{4}-\d{2}-\d{2}/.test(p.fechaIngreso||"")?String(p.fechaIngreso).slice(0,10):"9999-12-31";}
/** Precedencia del OBAC (Art. 26): cargo y luego antigüedad entre los programados presentes. Informativa, no bloquea. */
const RANGO={capitan:0,primero:1,segundo:2,tercero:3};
function rango(p){const c=String(p?.cargo||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(/^capitan/.test(c))return 0;const m=c.match(/^teniente\s*(primero|segundo|tercero|1|2|3)/);if(!m)return 9;return {primero:1,"1":1,segundo:2,"2":2,tercero:3,"3":3}[m[1]];}
export function precedenciaOBAC({noche,asistencias,obac,cond,roster}){
  const prog=integrantesNoche(noche);
  const cand=prog.filter(id=>asistencias?.[id]==="presente"&&id!==String(cond)).map(id=>roster?.find(p=>String(p.id)===id)).filter(Boolean)
    .sort((a,b)=>rango(a)-rango(b)||antig(a).localeCompare(antig(b)));
  const primero=cand[0];
  return {cumple:!primero||String(primero.id)===String(obac)||(rango(primero)===rango(roster?.find(p=>String(p.id)===String(obac)))&&antig(primero)===antig(roster?.find(p=>String(p.id)===String(obac)))),
    masAntiguoId:primero?String(primero.id):null,criterio:"cargo y antigüedad (fecha de ingreso)"};
}
/** Roles efectivos de la noche (cambios durante la guardia). Devuelve código de error o null.
 *  - Deben estar en la nómina, presentes y ser distintos (nadie ocupa dos cargos operativos a la vez).
 *  - Un conductor distinto del programado debe estar habilitado (roster.conductor === true). El Capitán
 *    puede actuar como conductor si está habilitado, pero entonces no puede ser el OBAC. */
export function validarRolesEfectivos({noche, asistencias, obacEfectivo, conductorEfectivo, roster, motivoPrecedencia}){
  const obac=obacEfectivo==null||obacEfectivo===""?String(noche.obac):String(obacEfectivo);
  const cond=conductorEfectivo==null||conductorEfectivo===""?String(noche.maq):String(conductorEfectivo);
  const pers=id=>roster?.find(p=>String(p.id)===id&&p.activo!==false);
  if(!pers(obac))return "obac_efectivo_no_en_nomina";
  if(!pers(cond))return "conductor_efectivo_no_en_nomina";
  if(obac===cond)return "obac_y_conductor_deben_ser_distintos";
  const cambioObac=obac!==String(noche.obac), cambioCond=cond!==String(noche.maq);
  if((cambioObac&&asistencias?.[obac]!=="presente")||(cambioCond&&asistencias?.[cond]!=="presente"))return "reemplazo_debe_estar_presente";
  if(cambioCond&&pers(cond).conductor!==true)return "conductor_no_habilitado";
  if(cambioObac){
    // Oficial de guardia = oficial o bombero más antiguo inscrito: si el reemplazo no lo es, se exige constancia.
    const programados=integrantesNoche(noche);
    // Se compara con los integrantes de la dotación aprobada (quien pasa por el cuartel sin estar inscrito no cuenta).
    const presentes=Object.keys(asistencias||{}).filter(id=>asistencias[id]==="presente"&&id!==cond&&programados.includes(id));
    const masAntiguo=presentes.map(id=>pers(id)).filter(Boolean).sort((a,b)=>antig(a).localeCompare(antig(b)))[0];
    // La precedencia (cargo y antigüedad) no bloquea: se registra como advertencia mientras se prueba la regla.
    void masAntiguo;void motivoPrecedencia;
  }
  return null;
}
export function validarAcreditacion({ fecha, noche, asistencias, revision, ahoraLocal, actor, roster, adicionales=[], excusas={} }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return "fecha_invalida";
  if (!revision || revision.estado !== "aprobada" || !revision.aprobadaEn) return "dotacion_no_aprobada";
  if (!noche) return "noche_no_asignada";
  if (!Array.isArray(noche.vol) || noche.vol.length < 2 || !noche.maq || !noche.obac)
    return "dotacion_incompleta";
  if (!oficialAutorizado(roster, actor)) return "solo_oficiales_autorizados";
  const ids = integrantesNoche(noche);
  if (ids.length<4 || ids.length!==noche.vol.length+2 ||
      noche.vol.some(id=>id===null || id===undefined || String(id).trim()===""))
    return "dotacion_incompleta";
  if (ids.length !== new Set(ids).size) return "dotacion_duplicada";
  if (!asistencias || typeof asistencias !== "object" || Array.isArray(asistencias)) return "asistencia_incompleta";
  const complemento=validarComplementos(ids,adicionales,excusas,asistencias,roster);
  if(complemento)return complemento;
  const todos=idsEfectivos(ids,adicionales);
  const keys = Object.keys(asistencias);
  if (keys.length !== todos.length || keys.some((id) => !todos.includes(id)) || todos.some((id) => !["presente","ausente"].includes(asistencias[id]))) return "asistencia_incompleta";
  // La noche empieza en `fecha` (22:45) y termina a las 06:00 del día siguiente: antes no se puede acreditar.
  const siguiente = new Date(Date.parse(fecha + "T12:00:00Z") + 864e5).toISOString().slice(0, 10);
  if (!ahoraLocal || typeof ahoraLocal !== "string" || ahoraLocal < siguiente + "T06:00") return "noche_no_finalizada";
  return null;
}
export function registroVigente(acreditacion, revision) {
 const ac=acreditacion, noche=revision?.noches?.[ac?.fecha];
 if(!ac||ac.estado!=="acreditada"||revision?.estado!=="aprobada"||!noche||
    ac.revisionAprobadaEn!==revision.aprobadaEn||
    !ac.dotacionFirma||ac.dotacionFirma!==firmaDotacion(noche)||
    !ac.asistencias||typeof ac.asistencias!=="object"||Array.isArray(ac.asistencias)||
    !Array.isArray(ac.asistentes)||!Array.isArray(ac.ausentes))return false;
 const programados=integrantesNoche(noche),adicionales=ac.adicionales??[],excusas=ac.excusas??{};
 if(!Array.isArray(adicionales)||adicionales.length>LIMITE_ADICIONALES||!excusas||typeof excusas!=="object"||Array.isArray(excusas))return false;
 const ids=idsEfectivos(programados,adicionales);
 if(ids.length!==new Set(ids).size)return false;
 if(adicionales.some(x=>typeof x?.motivo!=="string"||x.motivo.trim().length<8||
    ac.asistencias[String(x.id)]!=="presente"))return false;
 if(Object.entries(excusas).some(([id,m])=>!programados.includes(id)||
   ac.asistencias[id]!=="ausente"||typeof m!=="string"||m.trim().length<3))return false;
 const presentes=ids.filter(id=>ac.asistencias[id]==="presente");
 const ausentes=ids.filter(id=>ac.asistencias[id]==="ausente");
 return Object.keys(ac.asistencias).length===ids.length&&
    presentes.length+ausentes.length===ids.length&&
    ac.asistentes.length===presentes.length&&ac.ausentes.length===ausentes.length&&
    new Set(ac.asistentes.map(String)).size===presentes.length&&
    new Set(ac.ausentes.map(String)).size===ausentes.length&&
    presentes.every(id=>ac.asistentes.includes(id))&&
    ausentes.every(id=>ac.ausentes.includes(id));
}

/* Firma estable del contenido ratificado: dos envíos con el mismo contenido son el mismo acto (idempotencia). */
export function firmaContenido({asistencias,adicionales,excusas,obac,cond}){
  const ord=o=>Object.fromEntries(Object.entries(o||{}).map(([k,v])=>[String(k),v]).sort((x,y)=>x[0].localeCompare(y[0])));
  return JSON.stringify({a:ord(asistencias),x:(adicionales||[]).map(p=>[String(p.id),String(p.motivo||"").trim()]).sort((p,q)=>p[0].localeCompare(q[0])),
    e:ord(Object.fromEntries(Object.entries(excusas||{}).map(([k,v])=>[k,String(v).trim()]))),o:String(obac),c:String(cond)});
}
export function cumplimientoNoche({dotacionEfectiva,obacPresente,conductorPresente,sinFoto}){
  const motivos=[];
  if(!obacPresente)motivos.push("obac_ausente");
  if(!conductorPresente)motivos.push("conductor_ausente");
  if(dotacionEfectiva.voluntarios<2)motivos.push("voluntarios_insuficientes");
  if(sinFoto)motivos.push("sin_fotografia");
  return {estado:motivos.length?"con_incumplimientos":"acreditado",motivos};
}
