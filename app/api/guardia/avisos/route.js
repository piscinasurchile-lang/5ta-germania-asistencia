import {neon} from '@neondatabase/serverless';
import {readState} from '../../../../lib/state-store.js';
import {miercolesSemana,cargoT3,cargoCapitan,esAdministradorGuardia} from '../../../../lib/guardia-libro.js';
import {esAyudante} from '../../../../lib/guardia-revision-semanal.mjs';
import {avisoSegunDotacion} from '../../../../lib/guardia-aviso-resuelto.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(req){
 const id=new URL(req.url).searchParams.get('actorId')||'';
 if(!id)return Response.json({error:'actor_requerido'},{status:400,headers});
 if(!process.env.DATABASE_URL)return Response.json({error:'database_not_configured'},{status:503,headers});
 try{
  const sql=neon(process.env.DATABASE_URL),roster=(await readState(sql,'roster:v8')).value;
  const actor=Array.isArray(roster)?roster.find(p=>String(p.id)===id&&p.activo!==false):null;
  if(!actor)return Response.json({error:'actor_no_en_nomina'},{status:403,headers});
  const avisos=await sql.query("SELECT key,value,version FROM app_state WHERE key LIKE 'guardia-aviso:%' ORDER BY key");
  const semanas=[...new Set(avisos.map(r=>miercolesSemana(r.value?.f)).filter(Boolean))].map(s=>'guardia-revision:'+s);
  const revisiones=semanas.length?await sql.query('SELECT key,value FROM app_state WHERE key=ANY($1::text[])',[semanas]):[];
  const porSemana=new Map(revisiones.map(r=>[r.key,r.value]));
  const mando=cargoT3(actor.cargo)||cargoCapitan(actor.cargo)||esAyudante(actor)||esAdministradorGuardia(actor);
  const items=avisos.map(r=>({...r,value:avisoSegunDotacion(r.value,porSemana.get('guardia-revision:'+miercolesSemana(r.value?.f)))}))
   .filter(r=>r.value&&(mando||String(r.value.id)===id||String(r.value.reemplazoId)===id))
   .map(r=>{if(mando||String(r.value.id)===id)return r;const {motivo,...value}=r.value;return {...r,value};});
  return Response.json({items},{headers});
 }catch(e){console.error('guardia avisos GET',e?.name||'Error');return Response.json({error:'lectura_no_confirmada'},{status:503,headers});}
}
