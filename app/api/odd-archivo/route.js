import {NextResponse} from 'next/server';
import crypto from 'node:crypto';
import {notificarODD} from '../../../lib/odd-notificaciones.mjs';
import {conectarODD,esquemaODD,documentosODD,publicarConPDF,publicarDocumento,leerODD} from '../../../lib/odd-archivo-store.mjs';
import {esOficial,mismoOrigen,personaActual,firmarPersona,COOKIE_ODD,headersPrivados} from '../../../lib/odd-seguridad.mjs';
import {analizarPDF} from '../../../lib/odd-pdf.mjs';
import {validarPublicacion,numeroODD,MAX_PDF,datosCitacion} from '../../../lib/odd-dominio.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const error=(code,status=400)=>NextResponse.json({error:code},{status,headers:headersPrivados});
export async function GET(request) {
 try {
  const sql=conectarODD(); await esquemaODD(sql);
  const persona=personaActual(request);
  const documentos=await documentosODD(sql,persona);
  return NextResponse.json({documentos,personaId:persona,pendientes:persona?documentos.filter(d=>d.pendiente).length:0},{headers:headersPrivados});
 } catch {return error('archivo_no_disponible',503);}
}
export async function POST(request) {
 if (!mismoOrigen(request)) return error('origen_invalido',403);
 if (Number(request.headers.get('content-length')||0)>MAX_PDF+65536) return error('solicitud_muy_grande',413);
 try {
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
   if (!esOficial(request)) return error('acceso_oficial_requerido',403);
   const form=await request.formData();
   const archivo=form.get('archivo');
   if (!archivo || typeof archivo.arrayBuffer!=='function' || archivo.size>MAX_PDF) return error('pdf_invalido');
   const numero=numeroODD(form.get('numero'));
   const bytes=new Uint8Array(await archivo.arrayBuffer());
   const analisis=await analizarPDF(bytes.slice(),numero);
   if (form.get('accion')==='analizar') return NextResponse.json(analisis,{headers:headersPrivados});
   if (form.get('accion')!=='publicar') return error('accion_invalida');
   const sql=conectarODD(); await esquemaODD(sql);
   const existentes=await documentosODD(sql);
   const validado=validarPublicacion({numero,titulo:form.get('titulo'),resumen:form.get('resumen'),
    dejaSinEfecto:JSON.parse(String(form.get('dejaSinEfecto')||'[]'))},existentes);
   const cita=datosCitacion(JSON.parse(String(form.get('datosCitacion')||'{}')));
   const documento={...validado,...cita,fechaDocumento:analisis.fechaDocumento,id:'odd-'+numero.replace('/','-'),
    publicadaEn:new Date().toISOString(),destinatarios:['voluntarios'],historico:false,
    archivoInmutable:true,fuente:'oficiales',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    url:'/api/odd-archivo/pdf?numero='+encodeURIComponent(numero)};
   await publicarConPDF(sql,documento,{dataUrl:'data:application/pdf;base64,'+Buffer.from(bytes).toString('base64'),nombre:String(archivo.name||'ODD.pdf').slice(0,150)});
   let push;try{push=await notificarODD(sql,documento,new URL(request.url).origin);}catch{push={error:true};}
   return NextResponse.json({ok:true,documento,push},{status:201,headers:headersPrivados});
  }
  const body=await request.json();
  if(body.accion==='publicar_citacion'&&!esOficial(request))return error('acceso_oficial_requerido',403);
  const sql=conectarODD(); await esquemaODD(sql);
  if(body.accion==='publicar_citacion'){
   const validado=validarPublicacion(body,await documentosODD(sql));
   const documento={...validado,...datosCitacion(body),id:'odd-'+validado.numero.replace('/','-'),publicadaEn:new Date().toISOString(),destinatarios:['voluntarios'],historico:false,archivoInmutable:true,fuente:'oficiales-citacion'};
   await publicarDocumento(sql,documento);
   let push;try{push=await notificarODD(sql,documento,new URL(request.url).origin);}catch{push={error:true};}
   return NextResponse.json({ok:true,documento,push},{status:201,headers:headersPrivados});
  }
  if (body.accion==='identificar') {
   const id=String(body.personaId||'');
   if (!id) {const res=NextResponse.json({ok:true},{headers:headersPrivados});res.cookies.set(COOKIE_ODD,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return res;}
   const rows=await sql`SELECT value FROM app_state WHERE key='roster:v8' LIMIT 1`;
   if (!Array.isArray(rows[0]?.value)||!rows[0].value.some(p=>String(p.id)===id && p.activo!==false)) return error('persona_invalida');
   const res=NextResponse.json({ok:true},{headers:headersPrivados});
   res.cookies.set(COOKIE_ODD,firmarPersona(id),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:30*86400});
   return res;
  }
  if (body.accion==='leer') {
   const persona=personaActual(request);
   if (!persona || persona!==String(body.personaId||'')) return error('selecciona_tu_nombre',401);
   const numero=numeroODD(body.numero);
   if (!(await documentosODD(sql)).some(x=>x.numero===numero)) return error('odd_no_encontrada',404);
   await leerODD(sql,numero,persona);
   return NextResponse.json({ok:true},{headers:headersPrivados});
  }
  return error('accion_invalida');
 } catch(e) {
  const code=String(e?.message||'');
  const known=['tipo_invalido','fecha_invalida','hora_invalida','datos_citacion_invalidos','numero_invalido','pdf_invalido','pdf_supera_30_paginas','titulo_invalido','resumen_requiere_revision','referencias_invalidas','no_puede_anularse_a_si_misma','solo_puede_dejar_sin_efecto_odd_anteriores','odd_ya_existe_original_inalterable'];
  if (known.includes(code)) return error(code,code==='odd_ya_existe_original_inalterable'?409:400);
  return error('no_se_pudo_procesar_odd',503);
 }
}
