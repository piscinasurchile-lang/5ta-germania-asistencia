import {neon,Pool} from '@neondatabase/serverless';
import {ensureSchema,readState} from '../../../../lib/state-store.js';
import {exigirSesionOficial} from '../../../../lib/guardia-sesion-oficial.js';
import {consultarAprobacionSemana,aprobarSemanaConConexion} from '../../../../lib/guardia-aprobacion-semana.mjs';
import {acreditarConConexion} from '../acreditacion/route.js';
import {avisarOficiales} from '../../../../lib/guardia-avisos-oficiales.js';
import {agregarIncidencia} from '../../../../lib/guardia-incidencias.js';
export const runtime='nodejs';
export const maxDuration=60;
const headers={'Cache-Control':'private, no-store'};
const error=(e,status=409)=>Response.json({error:e.message,fecha:e.fecha||null},{status,headers});
export async function GET(req){
 const p=new URL(req.url).searchParams;
 if(!process.env.DATABASE_URL)return error(Error('database_not_configured'),503);
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const {revision,roster,...resumen}=await consultarAprobacionSemana(sql,p.get('inicio'),p.get('actorId'));
  return Response.json(resumen,{headers});
 }catch(e){return error(e,e.message==='solo_oficiales_autorizados'?403:409);}
}
export async function POST(req){
 try{const origin=req.headers.get('origin');if(!origin||new URL(origin).host!==req.headers.get('host'))return error(Error('origen_no_permitido'),403);}catch{return error(Error('origen_no_permitido'),403);}
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=='production'&&process.env.GERMANIA_STAGING!=='1')return error(Error('prueba_requiere_staging_aislado'),503);
 let b;try{b=await req.json();if(JSON.stringify(b).length>12000)throw Error();}catch{return error(Error('datos_invalidos'),400);}
 if(!process.env.DATABASE_URL)return error(Error('database_not_configured'),503);
 let pool,client;
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});client=await pool.connect();
  const resultado=await aprobarSemanaConConexion(client,req,b,acreditarConConexion);
  // Los avisos se envían únicamente después de confirmar la transacción completa.
  if(!resultado.repetida)for(const n of resultado.resultados||[]){
   if(n.repetida)continue;
   try{
    const ac=(await readState(sql,'guardia-acreditacion:'+n.fecha)).value;
    const correccion=n.version>1;
    if(correccion)await agregarIncidencia(sql,n.fecha,{id:'auto-corr-'+n.version,tipo:'correccion_posterior',personaId:null,detalle:'Corrección por '+ac.acreditadoPorNombre+': '+ac.motivoCorreccion,estado:'resuelta',automatica:true,registradaPorId:b.actorId,registradaPorNombre:ac.acreditadoPorNombre,en:ac.acreditadoEn});
    if(!ac.dotacionEfectiva.minimoCumplido)await agregarIncidencia(sql,n.fecha,{id:'auto-dotacion-'+n.fecha,tipo:'dotacion_insuficiente',personaId:null,detalle:'Dotación efectiva bajo el mínimo (1 conductor, 1 OBAC y 2 voluntarios): '+ac.cumplimiento.motivos.join(', '),estado:'abierta',automatica:true,registradaPorId:b.actorId,registradaPorNombre:ac.acreditadoPorNombre,en:ac.acreditadoEn});
    await avisarOficiales(sql,{clave:(correccion?'corr:':'rat:')+n.fecha+':'+n.version,tipo:correccion?'correccion':'ratificada',fecha:n.fecha,titulo:'Guardia aprobada · '+n.fecha+' · '+n.acreditadoPorNombre,porNombre:n.acreditadoPorNombre});
   }catch(e){console.error('Aviso posterior a aprobación semanal',e);}
  }
  return Response.json(resultado,{headers});
 }catch(e){return error(e,e.message==='solo_oficiales_autorizados'?403:409);}
 finally{client?.release();if(pool)await pool.end();}
}
