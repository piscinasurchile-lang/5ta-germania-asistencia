import {difundir} from './germania-webpush.mjs';
export async function notificarODD(sql,documento,origen,{emitir=difundir}={}) {
 if(documento.historico)return {historico:true,enviados:0};
 const res=await emitir({tipo:'odd',titulo:'ODD '+documento.numero+' · '+documento.titulo,
  id:documento.numero,origen,url:'/?odd='+encodeURIComponent(documento.numero)});
 await sql`INSERT INTO germania_odd_sync(clave,valor) VALUES (${'aviso:'+documento.numero},${JSON.stringify({numero:documento.numero,push:res,en:new Date().toISOString()})}::jsonb)
 ON CONFLICT(clave) DO UPDATE SET valor=EXCLUDED.valor,actualizado_en=now()`;
 return res;
}
