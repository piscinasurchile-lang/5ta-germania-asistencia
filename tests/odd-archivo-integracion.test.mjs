import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {PDFDocument,StandardFonts} from 'pdf-lib';
import {catalogoODD,avisoPersonal,validarPublicacion,HORAS_24,extraerFechaDocumento} from '../lib/odd-dominio.mjs';
import {prepararArchivoODD,publicarConPDF,documentosODD,leerODD} from '../lib/odd-archivo-store.mjs';
import {analizarPDF} from '../lib/odd-pdf.mjs';
import {esOficial,personaActual,firmarPersona,verificarEntornoODD} from '../lib/odd-seguridad.mjs';
import {notificarODD} from '../lib/odd-notificaciones.mjs';
const base={numero:'065/2026',titulo:'Disposición',resumen:'Deja sin efecto la orden anterior.',dejaSinEfecto:['060/2026'],historico:false,publicadaEn:'2026-10-30T12:00:00Z'};
test('relaciones de vigencia sin modificar ni revivir originales',()=>{
 const originales=[{numero:'060/2026',resumen:'Original'},base,{...base,numero:'066/2026',dejaSinEfecto:['065/2026']}];
 const antes=JSON.stringify(originales);const lista=catalogoODD(originales);
 assert.equal(JSON.stringify(originales),antes);
 assert.deepEqual(lista.find(x=>x.numero==='060/2026').sinEfectoPor,['065/2026']);
 assert.deepEqual(lista.find(x=>x.numero==='065/2026').sinEfectoPor,['066/2026']);
});
test('número inmutable y referencias solo a órdenes anteriores',()=>{
 assert.throws(()=>validarPublicacion(base,[{numero:'65/2026'}]),/inalterable/);
 assert.throws(()=>validarPublicacion({...base,dejaSinEfecto:['065/2026']},[]),/si_misma/);
 assert.throws(()=>validarPublicacion({...base,dejaSinEfecto:['066/2026']},[]),/anteriores/);
});
test('históricos silenciosos y aviso de 24h independiente de lectura',()=>{
 const t=Date.parse(base.publicadaEn);assert.equal(avisoPersonal({...base,historico:true},null,t).pendiente,false);
 assert.equal(avisoPersonal(base,'leida',t+100).destacado,true);
 assert.equal(avisoPersonal(base,'leida',t+HORAS_24).destacado,false);
 assert.equal(avisoPersonal(base,null,t+HORAS_24).pendiente,true);
});
test('extractor de PDF real: disposición, referencias, fecha; escaneado exige revisión',async()=>{
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const pag=pdf.addPage();
 pag.drawText('Villarrica, 28 de septiembre de 2026',{x:30,y:720,font,size:12});
 pag.drawText('SE DISPONE: Se deja sin efecto la ODD 060/2026.',{x:30,y:700,font,size:12});
 const d=await analizarPDF(new Uint8Array(await pdf.save()),base.numero);
 assert.match(d.resumen,/deja sin efecto/);assert.deepEqual(d.dejaSinEfecto,['060/2026']);assert.equal(d.fechaDocumento,'2026-09-28');
 const vacio=await PDFDocument.create();vacio.addPage();assert.equal((await analizarPDF(new Uint8Array(await vacio.save()),base.numero)).requiereRevision,true);
 assert.equal(extraerFechaDocumento('Villarrica, 31 de febrero de 2026'),null);
});
test('sesión de Oficialidad se reutiliza; firma de persona no acepta alteraciones',()=>{
 const old=process.env.SESSION_SECRET;process.env.SESSION_SECRET='solo-prueba-local';
 try{
  const cookie=firmarPersona('vol-517',1000);const req=value=>({cookies:{get:key=>key==='germania_odd_persona'?{value}:undefined}});
  assert.equal(personaActual(req(cookie),1001),'vol-517');assert.equal(personaActual(req(cookie+'x'),1001),null);
  const firma=crypto.createHmac('sha256',process.env.SESSION_SECRET).update('5ta-germania-oficialidad').digest('hex');
  assert.equal(esOficial({cookies:{get:()=>({value:firma})}}),true);assert.equal(esOficial({cookies:{get:()=>({value:'falsa'})}}),false);
 }finally{if(old===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=old;}
});
test('guardia de entorno no permite preview de producción conectado a la base real',()=>{
 const keys=['GERMANIA_STAGING','VERCEL_PROJECT_ID','VERCEL_ENV','GERMANIA_ODD_ARCHIVO'];const antes=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.GERMANIA_STAGING='0';process.env.VERCEL_PROJECT_ID='prj_Xa8pXpul44oW7FrZhKiJDtGM4x0a';process.env.VERCEL_ENV='preview';process.env.GERMANIA_ODD_ARCHIVO='1';assert.throws(verificarEntornoODD,/no_habilitado/);
  process.env.VERCEL_ENV='production';assert.doesNotThrow(verificarEntornoODD);
  process.env.VERCEL_PROJECT_ID='otro';assert.throws(verificarEntornoODD,/no_habilitado/);
 }finally{for(const [k,v] of Object.entries(antes))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
test('Postgres: migración aditiva, PDF atómico, duplicados concurrentes, lecturas aisladas y catálogo mínimo',async()=>{
 const db=new PGlite();const sql=async(strings,...values)=>(await db.query(strings.reduce((q,p,i)=>q+(i?'$'+i:'')+p,''),values)).rows;
 try{
  await db.exec('CREATE TABLE app_state(key text primary key,value jsonb)');
  await sql`INSERT INTO app_state(key,value) VALUES ('registro-real',${JSON.stringify({conservar:true})}::jsonb)`;
  await prepararArchivoODD(sql);await prepararArchivoODD(sql);
  const legado={id:'odd-2026-062',numero:'062/2026',titulo:'Academia de Extricación I',tema:'Gestión de riesgos en la escena',destinatarios:['voluntarios'],informadaPor:'identidad-privada'};
  await sql`INSERT INTO app_state(key,value) VALUES ('odd-avisos:v1',${JSON.stringify([legado])}::jsonb)`;
  const pdf={dataUrl:'data:application/pdf;base64,JVBERi0=',nombre:'original.pdf'};
  const r=await Promise.allSettled([publicarConPDF(sql,{...base,campoPrivado:'NO PUBLICAR'},pdf),publicarConPDF(sql,{...base,resumen:'Reemplazo'},pdf)]);
  assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal((await sql`SELECT data_url FROM germania_odd_pdf`).length,1);
  const lista=await documentosODD(sql,'v1');const d=lista.find(x=>x.numero===base.numero);
  assert.match(lista.find(x=>x.numero==='062/2026').resumen,/gestión de riesgos/);
  assert.equal('informadaPor' in lista.find(x=>x.numero==='062/2026'),false);
  assert.equal((await sql`SELECT value FROM app_state WHERE key='odd-avisos:v1'`)[0].value[0].resumen,undefined);
  assert.equal(d.resumen,base.resumen);assert.equal('campoPrivado' in d,false);assert.equal(d.pendiente,true);
  await leerODD(sql,base.numero,'v1');await leerODD(sql,base.numero,'v1');
  assert.equal((await documentosODD(sql,'v1')).find(x=>x.numero===base.numero).pendiente,false);
  assert.equal((await documentosODD(sql,'v2')).find(x=>x.numero===base.numero).pendiente,true);
  assert.equal((await sql`SELECT value FROM app_state WHERE key='registro-real'`)[0].value.conservar,true);
  const calls=[];const emitir=async payload=>{calls.push(payload);return {simulado:true,enviados:0};};
  await notificarODD(sql,{...base,historico:true},'https://germania.test',{emitir});assert.equal(calls.length,0);
  await notificarODD(sql,base,'https://germania.test',{emitir});assert.equal(calls[0].url,'/?odd=065%2F2026');
 }finally{await db.close();}
});
test('citaciones sin PDF conservan calendario y validan fecha/hora',async()=>{
 const {datosCitacion}=await import('../lib/odd-dominio.mjs');
 const d=datosCitacion({tipo:'academia',fecha:'2026-11-04',hora:'20:00',lugar:'Cuartel',tema:'Extricación',vestimenta:'Uniforme',puntualidad:true});
 assert.deepEqual(d.cuando,{fecha:'2026-11-04',hora:'20:00'});assert.equal(d.lugar,'Cuartel');assert.equal(d.puntualidad,true);
 assert.throws(()=>datosCitacion({fecha:'2026-02-31'}),/fecha_invalida/);
 assert.throws(()=>datosCitacion({hora:'20:00'}),/hora_invalida/);
 assert.throws(()=>datosCitacion({tipo:'otro-rol'}),/tipo_invalido/);
});
