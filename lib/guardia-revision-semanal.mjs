import {fechasSemana} from './guardia-maquinista.mjs';
import {horaCivilChile,nocheFinalizada} from './guardia-libro.js';
import {puedeAprobarGuardia,integrantesNoche,firmaDotacion,registroVigente} from './guardia-acreditacion.js';
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
export const esAyudante=p=>!!p&&p.activo!==false&&/^ayudante(?:\s|$)/.test(norm(p.cargo));
export function puedePreparar(roster,id){return puedeAprobarGuardia(roster,id)||esAyudante(roster?.find(p=>String(p.id)===String(id)));}
export function semanaTerminada(inicio,ahora=new Date()){
 const fechas=fechasSemana(inicio);return fechas.length===7&&nocheFinalizada(fechas[6],horaCivilChile(ahora));
}
function fallo(codigo){throw Object.assign(Error(codigo),{codigo});}
export function prepararActaRevision({noche,integrantes,motivos={},roster}){
 if(!noche||!Array.isArray(noche.vol)||!Array.isArray(integrantes)||integrantes.length>60||!motivos||typeof motivos!=='object'||Array.isArray(motivos))fallo('revision_invalida');
 const originales=integrantesNoche(noche),ids=new Set(),activos=new Map((roster||[]).filter(p=>p.activo!==false).map(p=>[String(p.id),p]));
 const miembros=integrantes.map(p=>{
  if(!p||typeof p.id!=='string'||ids.has(p.id)||!['OBAC','Maquinista','Voluntario'].includes(p.funcion)||!['presente','ausente','justificado'].includes(p.estado)||(!originales.includes(p.id)&&!activos.has(p.id)))fallo('integrante_invalido');
  if(p.estado==='presente'&&p.funcion==='Maquinista'&&activos.get(p.id)?.conductor!==true&&!(p.id===String(noche.maq)&&noche.apoyoExterno?.id===p.id))fallo('maquinista_no_habilitado');
  ids.add(p.id);return {id:p.id,funcion:p.funcion,estado:p.estado,...(p.reemplaza?{reemplaza:String(p.reemplaza)}:{})};
 });
 if(originales.some(id=>!ids.has(id)))fallo('conservar_integrantes_aprobados');
 const presentes=miembros.filter(p=>p.estado==='presente');
 if(['OBAC','Maquinista'].some(rol=>presentes.filter(p=>p.funcion===rol).length>1))fallo('funcion_duplicada');
 const razones={};for(const p of miembros){const motivo=motivos[p.id];if(motivo!==undefined&&(typeof motivo!=='string'||motivo.length>300))fallo('motivo_invalido');if(motivo?.trim())razones[p.id]=motivo.trim();}
 const reemplazos=[];
 for(const p of miembros){
  if(p.estado==='justificado'&&(!originales.includes(p.id)||!razones[p.id]||razones[p.id].length<3))fallo('motivo_justificacion_requerido');
  if(!originales.includes(p.id)&&(p.estado!=='presente'||!razones[p.id]||razones[p.id].length<8))fallo('motivo_adicional_requerido');
  if(p.reemplaza){
   if(p.estado!=='presente'||p.id===p.reemplaza||!miembros.some(o=>o.id===p.reemplaza&&o.estado!=='presente')||reemplazos.some(o=>o.antesId===p.reemplaza))fallo('reemplazo_invalido');
   if(!razones[p.id]||razones[p.id].length<8)fallo('motivo_reemplazo_requerido');
   reemplazos.push({antesId:p.reemplaza,personaId:p.id,motivo:razones[p.id]});
  }
 }
 const obac=presentes.find(p=>p.funcion==='OBAC')?.id||String(noche.obac),maq=presentes.find(p=>p.funcion==='Maquinista')?.id||String(noche.maq);
 if(presentes.some(p=>p.id===obac&&p.funcion!=='OBAC'))fallo('asignar_obac_efectivo');
 if(presentes.some(p=>p.id===maq&&p.funcion!=='Maquinista'))fallo('asignar_maquinista_efectivo');
 return {asistencias:Object.fromEntries(miembros.map(p=>[p.id,p.estado==='presente'?'presente':'ausente'])),
  adicionales:miembros.filter(p=>!originales.includes(p.id)).map(p=>({id:p.id,motivo:razones[p.id]})),
  excusas:Object.fromEntries(miembros.filter(p=>p.estado==='justificado').map(p=>[p.id,razones[p.id]])),
  obacEfectivoId:obac,conductorEfectivoId:maq,
  detalle:{integrantes:miembros,motivos:razones,reemplazos},
  motivoCorreccion:Object.values(razones).join(' · ').slice(0,400)};
}
export function revisionDesdeActa(noche,acta){
 if(acta.revisionSemanal?.integrantes)return {integrantes:acta.revisionSemanal.integrantes,motivos:acta.revisionSemanal.motivos||{},aprobada:true};
 const ids=[...new Set([...integrantesNoche(noche),...(acta.adicionales||[]).map(p=>String(p.id))])];
 return {aprobada:true,motivos:{...Object.fromEntries((acta.adicionales||[]).map(p=>[p.id,p.motivo])),...acta.excusas},integrantes:ids.map(id=>{
  const estado=acta.asistencias[id]==='presente'?'presente':acta.excusas?.[id]?'justificado':'ausente';
  const obac=estado==='presente'?(acta.obacEfectivoId||noche.obac):noche.obac,maq=estado==='presente'?(acta.conductorEfectivoId||noche.maq):noche.maq;
  return {id,funcion:id===String(obac)?'OBAC':id===String(maq)?'Maquinista':'Voluntario',estado};
 })};
}
export function cumplimientoVisible(revision,acreditaciones){
 const visible={};for(const [fecha,noche] of Object.entries(revision?.noches||{})){
  const ac=acreditaciones[fecha],draft=revision.cumplimiento?.[fecha];
  const vigente=ac?.value&&registroVigente(ac.value,revision);
  const draftVigente=draft&&draft.fuenteAprobadaEn===revision.aprobadaEn&&draft.fuenteFirma===firmaDotacion(noche)&&draft.acreditacionVersionBase===(ac?.version||0);
  if(draftVigente)visible[fecha]={...draft,aprobada:false};
  else if(vigente)visible[fecha]=revisionDesdeActa(noche,ac.value);
 }
 return visible;
}
