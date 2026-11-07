import {neon} from '@neondatabase/serverless';
import {ensureSchema,readState,writeState} from '../../../../lib/state-store.js';
import {exigirSesionOficial} from '../../../../lib/guardia-sesion-oficial.js';
import {fechasSemana} from '../../../../lib/guardia-maquinista.mjs';
import {horaCivilChile} from '../../../../lib/guardia-libro.js';
import {firmaDotacion,puedeAprobarGuardia} from '../../../../lib/guardia-acreditacion.js';
import {puedePreparar,semanaTerminada,prepararActaRevision,cumplimientoVisible} from '../../../../lib/guardia-revision-semanal.mjs';
import {POST as acreditar} from '../acreditacion/route.js';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store'};
const error=(error,status=409)=>Response.json({error},{status,headers});
async function contexto(inicio,actorId){
 if(!fechasSemana(inicio).length)throw Error('semana_invalida');
 if(!process.env.DATABASE_URL)throw Error('database_not_configured');
 const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
 const [r,rev,cierre]=await Promise.all([readState(sql,'roster:v8'),readState(sql,'guardia-revision:'+inicio),readState(sql,'guardia-cierre-semanal:'+inicio)]);
 const roster=Array.isArray(r.value)?r.value:[];
 if(!puedePreparar(roster,actorId))throw Error('solo_oficiales');
 const acreditaciones=Object.fromEntries(await Promise.all(fechasSemana(inicio).map(async f=>[f,await readState(sql,'guardia-acreditacion:'+f)])));
 return {sql,roster,rev,acreditaciones,cierre};
}
export async function GET(req){
 const p=new URL(req.url).searchParams,inicio=p.get('inicio'),actor=p.get('actorId');
 try{const c=await contexto(inicio,actor);return Response.json({revisionDisponible:c.rev.value?.estado==='aprobada'&&semanaTerminada(inicio),puedeAprobar:puedeAprobarGuardia(c.roster,actor),cumplimiento:cumplimientoVisible(c.rev.value,c.acreditaciones),acreditacionVersiones:Object.fromEntries(Object.entries(c.acreditaciones).map(([f,v])=>[f,v.version]))},{headers});}
 catch(e){return error(e.message==='solo_oficiales'?e.message:'lectura_fallida',e.message==='solo_oficiales'?403:503);}
}
export async function POST(req){
 if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=='production'&&process.env.GERMANIA_STAGING!=='1')return error('prueba_requiere_staging_aislado',503);
 try{const o=req.headers.get('origin');if(!o||new URL(o).host!==req.headers.get('host'))return error('origen_no_permitido',403);}catch{return error('origen_no_permitido',403);}
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let b;try{b=await req.json();}catch{return error('datos_invalidos',400);}
 if(JSON.stringify(b).length>100000||!['preparar','guardar-borrador','aprobar-cumplimiento'].includes(b?.accion)||!Number.isInteger(b.version)||!fechasSemana(b.inicio).includes(b.fecha))return error('datos_invalidos',400);
 try{
  const {sql,roster,rev,acreditaciones,cierre}=await contexto(b.inicio,String(b.actorId||'')),r=rev.value||{};
  if(rev.version!==b.version)return error('version_conflict');
  if(r.cerrada||r.estado==='cerrada'||cierre.value?.estado==='cerrada')return error('semana_cerrada');
  let value;
  if(b.accion==='preparar'){
   if(puedeAprobarGuardia(roster,b.actorId))return error('usar_programacion_existente');
   if(b.inicio<horaCivilChile().slice(0,10))return error('semana_iniciada');
   const plan=(await readState(sql,'guardia-plan:'+b.inicio)).value;
   const cierreMs=Date.parse(plan?.cierre),diaPrevio=new Date(Date.parse(b.inicio+'T12:00:00Z')-86400000).toISOString().slice(0,10);
   if(!plan||plan.estado==='abierta'&&(Number.isFinite(cierreMs)?Date.now()<cierreMs:horaCivilChile()<diaPrevio+'T19:00'))return error('inscripcion_abierta');
   const n=b.noche,ids=n&&[n.obac,n.maq,...(Array.isArray(n.vol)?n.vol:[])],activos=new Map(roster.filter(p=>p.activo!==false).map(p=>[String(p.id),p]));
   const base=r.borradorNoches||r.noches||{},anterior=base[b.fecha];
   const apoyoConservado=n?.maq===anterior?.maq&&anterior?.apoyoExterno?.id===n?.maq;
   if(!ids||ids.some(id=>typeof id!=='string'||!activos.has(id)&&!(apoyoConservado&&id===n.maq))||n.vol.length<2||new Set(ids).size!==ids.length||activos.get(n.maq)?.conductor!==true&&!apoyoConservado)return error('dotacion_invalida');
   const noches={...base,[b.fecha]:{...base[b.fecha],obac:n.obac,maq:n.maq,vol:n.vol}};
   if(!apoyoConservado)delete noches[b.fecha].apoyoExterno;
   value={...r,inicio:b.inicio,estado:r.estado==='aprobada'?'aprobada':'borrador',noches:r.estado==='aprobada'?r.noches:noches,borradorNoches:noches,guardadas:[...new Set([...(r.guardadas||[]),b.fecha])],modificadaEn:new Date().toISOString(),preparadaPorId:String(b.actorId)};
  }else{
   if(!semanaTerminada(b.inicio)||r.estado!=='aprobada'||!r.aprobadaEn||!r.noches?.[b.fecha])return error('revision_no_disponible');
   if(!Number.isInteger(b.acreditacionVersion)||acreditaciones[b.fecha].version!==b.acreditacionVersion)return error('version_conflict');
   const acta=prepararActaRevision({noche:r.noches[b.fecha],integrantes:b.integrantes,motivos:b.motivos,roster});
   if(b.accion==='aprobar-cumplimiento'){
    if(!puedeAprobarGuardia(roster,b.actorId))return error('oficial_requerido',403);
    return acreditar({headers:req.headers,cookies:req.cookies,json:async()=>({fecha:b.fecha,actorId:b.actorId,ifVersion:b.acreditacionVersion,...acta,revisionSemanal:acta.detalle})});
   }
   const detalle={...acta.detalle,fuenteAprobadaEn:r.aprobadaEn,fuenteFirma:firmaDotacion(r.noches[b.fecha]),acreditacionVersionBase:b.acreditacionVersion,porId:String(b.actorId),en:new Date().toISOString()};
   value={...r,cumplimiento:{...r.cumplimiento,[b.fecha]:detalle},historialRevisionSemanal:[...(r.historialRevisionSemanal||[]),{fecha:b.fecha,antes:r.cumplimiento?.[b.fecha]||null,despues:detalle}]};
  }
  const saved=await writeState(sql,'guardia-revision:'+b.inicio,value,{ifVersion:b.version});
  if(saved.conflict)return error('version_conflict');
  return Response.json({ok:true,version:saved.version,pendiente:true},{headers});
 }catch(e){return error(e.codigo||(['solo_oficiales','semana_invalida'].includes(e.message)?e.message:'guardado_no_confirmado'),e.message==='solo_oficiales'?403:409);}
}
