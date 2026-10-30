import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {chromium} from 'playwright';
import {ensureSchema,resetSchemaCache,readState,writeState} from '../lib/state-store.js';
import {guardarAsistencia} from '../lib/asistencia-guardar.mjs';
const db=new PGlite(),sql=(s,...v)=>{let q=s[0];v.forEach((_,i)=>q+='$'+(i+1)+s[i+1]);return db.query(q,v).then(r=>r.rows);};resetSchemaCache();await ensureSchema(sql);
const roster=[{id:'a',n:1,nombre:'Ana',cargo:'Voluntario'},{id:'b',n:2,nombre:'Bruno',cargo:'Voluntario'}];await writeState(sql,'roster:v8',roster);
const source=await readFile('public/legacy/app.js','utf8'),html=await readFile('public/legacy/index.html','utf8');
const form=html.slice(html.indexOf('  <div class="panel" id="panel-lista">'),html.indexOf('  <!-- HOJA DE SERVICIO B-5 -->'));
const block=source.slice(source.indexOf('let parteBloqueado=false;'),source.indexOf('/* ============ PDF ============ */'));
const pdf=source.slice(source.indexOf('function pdfHeader('),source.indexOf('/* Entrega de archivos compatible'));
const entrega=source.slice(source.indexOf('async function entregarParteGuardado('),source.indexOf('/* ============ HOJA DE SERVICIO B-5 ============ */'));
let guardarCount=0,perderRespuesta=false,delay=false;
const harness=`<!doctype html><html lang="es"><head><script src="/legacy/jspdf.min.js"></script><script src="/legacy/jspdf-autotable.min.js"></script><meta name="viewport" content="width=device-width,initial-scale=1"><style>${html.match(/<style>([\s\S]*?)<\/style>/)[1]} .panel{display:block!important}body{padding:8px} .name-col{overflow-wrap:anywhere}</style></head><body>${form}<script>
let ROSTER=${JSON.stringify(roster)},currentRecord={},currentPartClave=null,partesCompartidas=null;const INDEX_KEY='partes:index:v1';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');const uid=()=>crypto.randomUUID();const slug=s=>s.toLowerCase().replaceAll(' ','-');const on=(id,e,f)=>document.getElementById(id)?.addEventListener(e,f);const sortedRoster=()=>ROSTER;const nombreCompleto=p=>p.nombre;const acronimoCargo=()=>'';const fmtDateLong=d=>d;const parteCuentaAsistencia=p=>true;const switchTab=()=>{};const autenticarOficialidad=async()=>({ok:true});const mensajeOficialidad=()=>'';
async function sGetV(k){const r=await fetch('/state/'+encodeURIComponent(k));if(!r.ok)throw Error('lectura');return r.json();}async function getParte(k){return (await sGetV('parte:'+k)).value;}async function getIndex(){return (await sGetV(INDEX_KEY)).value||[];}
function renderTipoSelect(){document.getElementById('tipoSelect').innerHTML='<option>Academia</option>';}
const LOGO_B64='';${pdf}
window.exportaciones=[];async function downloadPdfDoc(doc,name){window.exportaciones.push({accion:'pdf',bytes:doc.output('arraybuffer').byteLength,pdf:doc.output(),name});}async function sharePdfDoc(doc,name,text){window.exportaciones.push({accion:'whatsapp',bytes:doc.output('arraybuffer').byteLength,pdf:doc.output(),name,text});return true;}
${block}\n${entrega}\nrenderTipoSelect();document.getElementById('fecha').value='2026-10-30';loadListaForSelection();
</script><script src="/legacy/germania-resumen-asistencia.js"></script></body></html>`;
const server=http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname;
 if(path==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(harness);}
 if(path.startsWith('/state/')){const r=await readState(sql,decodeURIComponent(path.slice(7)));res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(r));}
 if(path==='/api/asistencia/guardar'){
  guardarCount++;let text='';for await(const chunk of req)text+=chunk;
  if(delay)await new Promise(r=>setTimeout(r,300));
  const result=await guardarAsistencia(db,JSON.parse(text));if(perderRespuesta){perderRespuesta=false;res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'guardado_no_confirmado'}));return;}
  res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({ok:true,...result}));
 }
 const file=resolve('public','.'+path);if(!file.startsWith(resolve('public')+'/'))throw Error();res.setHeader('Content-Type',extname(file)==='.js'?'text/javascript':'text/plain');res.end(await readFile(file));
 }catch(e){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:e.message}));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.ODD_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
try{
 for(const width of [390,1024]){
  await db.query("DELETE FROM app_state WHERE key <> 'roster:v8'");guardarCount=0;
  await page.setViewportSize({width,height:844});const errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>{errors.push(e.message);console.error('PAGEERROR',e.message);});
  console.log('Navegando',width);await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded',timeout:15000});console.log('Documento cargado');await page.locator('#listaBody tr').first().waitFor();
  assert.equal(await page.locator('#listaBody button.active').count(),0);assert.match(await page.locator('#arValores').textContent(),/2Sin marcar/);
  await page.locator('#guardarBtn').click();assert.match(await page.locator('#statusMsg').textContent(),/Completa/);assert.equal(guardarCount,0);
  await page.locator('#horaAsistencia').fill('20:00');await page.locator('#detalle').fill('Entrenamiento extricación');await page.locator('#registradoPor').fill('Responsable prueba');
  await page.locator('#guardarBtn').click();assert.match(await page.locator('#statusMsg').textContent(),/sin marcar/);
  await page.locator('#completarAusentesBtn').click();await page.locator('#guardarBtn').click();assert.match(await page.locator('#statusMsg').textContent(),/al menos un presente/);assert.equal(guardarCount,0);
  await page.locator('[data-id="a"] [data-status="presente"]').click();await page.locator('#guardarBtn').click();
  perderRespuesta=true;delay=true;
  await page.locator('#confirmarGuardarBtn').evaluate(b=>{b.click();b.click();});
  await page.waitForFunction(()=>document.getElementById('guardarBtn').textContent.includes('Reintentar')&&!document.getElementById('guardarBtn').disabled);
  assert.equal(guardarCount,1);assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,1);
  assert.equal(await page.locator('#detalle').isDisabled(),true);
  await page.locator('#guardarBtn').click();await page.locator('#resumenBox').waitFor({state:'visible'});assert.equal(guardarCount,2);assert.equal((await readState(sql,'correlativo:parte:2026')).value.actual,1);
  await page.locator('#pdfBtn').click();await page.locator('#waBtn').click();const exports=await page.evaluate(()=>window.exportaciones);assert.deepEqual(exports.map(x=>x.accion),['pdf','whatsapp']);assert.ok(exports[0].bytes>1000);assert.match(exports[0].pdf,/Hora: 20:00/);assert.match(exports[0].pdf,/Ana/);assert.doesNotMatch(exports[0].pdf,/Bruno/);
  for(const detalle of ['Segunda actividad','Tercera actividad']){
   await page.locator('#nuevaAsistenciaBtn').click();await page.locator('#horaAsistencia').fill('21:00');await page.locator('#detalle').fill(detalle);await page.locator('#registradoPor').fill('Responsable prueba');await page.locator('#marcarTodosBtn').click();await page.locator('#guardarBtn').click();await page.locator('#confirmarGuardarBtn').click();await page.locator('#resumenBox').waitFor({state:'visible'});await page.waitForFunction(()=>document.getElementById('ultimasAsistencias').textContent.includes(document.getElementById('detalle').value));
  }
  assert.equal(await page.locator('#ultimasAsistencias .hist-item').count(),2);assert.equal((await readState(sql,'partes:index:v1')).value.length,3);assert.doesNotMatch(await page.locator('#ultimasAsistencias').textContent(),/Entrenamiento extricación/);
  await page.locator('[data-asistencia-open]').last().click();await page.locator('#desbloquearParteBtn').waitFor();await page.locator('#claveDesbloqueoParte').fill('prueba');await page.locator('#desbloquearParteBtn').click();await page.locator('#detalle').fill('Segunda corregida');await page.locator('#guardarBtn').click();await page.locator('#confirmarGuardarBtn').click();await page.locator('#resumenBox').waitFor({state:'visible'});
  const idx=(await readState(sql,'partes:index:v1')).value;assert.equal((await readState(sql,'parte:'+idx[1].clave)).value.detalle,'Segunda corregida');assert.equal((await readState(sql,'parte:'+idx[1].clave)).value.numero,2);assert.equal((await readState(sql,'parte:'+idx[2].clave)).value.detalle,'Tercera actividad');
  const sizes=await page.locator('#panel-lista').evaluate(p=>({scroll:document.documentElement.scrollWidth,width:innerWidth,buttons:[...p.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({text:b.textContent,height:b.getBoundingClientRect().height}))}));assert.ok(sizes.scroll<=sizes.width,JSON.stringify(sizes));assert.ok(sizes.buttons.every(b=>b.height>=44),JSON.stringify(sizes));
  assert.deepEqual(errors,[]);console.log('OK '+width+'px: validación, doble toque, respuesta perdida, reintento, PDF/WhatsApp, dos recientes, corrección exacta, controles ≥44px y sin desborde');await page.screenshot({path:'/tmp/germania-asistencia-'+width+'.png'});
 }
}catch(error){console.error(error);throw error;}finally{server.closeAllConnections();server.close();await browser.close();await db.close();}
