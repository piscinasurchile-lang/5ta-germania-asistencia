import {neon,Pool} from '@neondatabase/serverless';
import {ensureSchema,readState} from '../../../../lib/state-store.js';
import {exigirSesionOficial} from '../../../../lib/guardia-sesion-oficial.js';
import {puedeAprobarGuardia} from '../../../../lib/guardia-acreditacion.js';
import {guardarCambiosAtomicos,validarCambios} from '../../../../lib/guardia-transaccion.mjs';
export const runtime='nodejs';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
export async function POST(req){
 if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=="production"&&process.env.GERMANIA_STAGING!=="1")return Response.json({error:"prueba_requiere_staging_aislado"},{status:503,headers});
 const origin=req.headers.get('origin');
 try{if(!origin||new URL(origin).host!==req.headers.get('host'))return Response.json({error:'origen_no_permitido'},{status:403,headers});}catch{return Response.json({error:'origen_no_permitido'},{status:403,headers});}
 const sesion=exigirSesionOficial(req);if(sesion)return sesion;
 let body;try{body=await req.json();validarCambios(body.cambios);}catch{return Response.json({error:'datos_invalidos'},{status:400,headers});}
 if(JSON.stringify(body).length>300000)return Response.json({error:'datos_demasiado_grandes'},{status:413,headers});
 if(!process.env.DATABASE_URL)return Response.json({error:'database_not_configured'},{status:503,headers});
 let pool,client;
 try{
  const sql=neon(process.env.DATABASE_URL);await ensureSchema(sql);
  const roster=await readState(sql,'roster:v8');
  if(!puedeAprobarGuardia(roster.value,String(body.actorId||'')))return Response.json({error:'oficial_requerido'},{status:403,headers});
  pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});client=await pool.connect();
  const resultados=await guardarCambiosAtomicos(client,body.cambios);
  return Response.json({ok:true,resultados},{headers});
 }catch(error){
  const conflicto=error.conflicto||['40001','40P01','55P03'].includes(error.code);
  return Response.json({error:conflicto?'version_conflict':'guardado_no_confirmado'},{status:conflicto?409:503,headers});
 }finally{if(client)client.release();if(pool)await pool.end().catch(()=>{});}
}
