import {conectarODD,esquemaODD} from '../../../../lib/odd-archivo-store.mjs';
import {esOficial,personaActual} from '../../../../lib/odd-seguridad.mjs';
import {numeroODD} from '../../../../lib/odd-dominio.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request) {
 if(!esOficial(request)&&!personaActual(request))return Response.json({error:"selecciona_tu_nombre"},{status:401});
 try {
  const numero=numeroODD(new URL(request.url).searchParams.get('numero'));
  const sql=conectarODD(); await esquemaODD(sql);
  const rows=await sql`SELECT data_url FROM germania_odd_pdf WHERE numero=${numero}`;
  if (!rows.length) return Response.json({error:'pdf_no_encontrado'},{status:404});
  const data=Buffer.from(rows[0].data_url.split(',')[1],'base64');
  return new Response(data,{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="ODD-'+numero.replace('/','-')+'.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 } catch {return Response.json({error:'pdf_no_disponible'},{status:503});}
}
