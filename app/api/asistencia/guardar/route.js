import {neon,Pool} from '@neondatabase/serverless';
import {ensureSchema} from '../../../../lib/state-store.js';
import {validarAsistencia,guardarAsistencia} from '../../../../lib/asistencia-guardar.mjs';
export const runtime='nodejs';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
export async function POST(req){
 if(process.env.VERCEL_ENV&&process.env.VERCEL_ENV!=='production'&&process.env.GERMANIA_STAGING!=='1')return Response.json({error:'prueba_requiere_staging_aislado'},{status:503,headers});
 try{if(new URL(req.headers.get('origin')).host!==req.headers.get('host'))throw Error();}catch{return Response.json({error:'origen_no_permitido'},{status:403,headers});}
 let body;try{const text=await req.text();if(text.length>100000)return Response.json({error:'datos_demasiado_grandes'},{status:413,headers});body=JSON.parse(text);validarAsistencia(body);}catch(error){return Response.json({error:error.validacion?error.message:'datos_invalidos'},{status:400,headers});}
 if(!process.env.DATABASE_URL)return Response.json({error:'database_not_configured'},{status:503,headers});
 let pool,client;
 try{
  await ensureSchema(neon(process.env.DATABASE_URL));
  pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});client=await pool.connect();
  return Response.json({ok:true,...await guardarAsistencia(client,body)},{headers});
 }catch(error){
  const conflict=error.conflicto||['40001','40P01','55P03'].includes(error.code);
  return Response.json({error:conflict?'version_conflict':error.validacion?error.message:'guardado_no_confirmado'},{status:conflict?409:error.validacion?400:503,headers});
 }finally{if(client)client.release();if(pool)await pool.end().catch(()=>{});}
}
