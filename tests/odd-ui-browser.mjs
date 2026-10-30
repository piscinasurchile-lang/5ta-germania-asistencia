import http from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import {PDFDocument,StandardFonts} from 'pdf-lib';
import {analizarPDF} from '../lib/odd-pdf.mjs';
import {catalogoODD,avisoPersonal,validarPublicacion,datosCitacion} from '../lib/odd-dominio.mjs';
const historicos=JSON.parse(await readFile('public/legacy/odd-historicas-2026.json','utf8')).documentos;
const nuevos=[{numero:'065/2026',titulo:'Nueva disposición',resumen:'Deja sin efecto la ODD 060/2026.',dejaSinEfecto:['060/2026'],publicadaEn:new Date().toISOString(),historico:false,url:'/api/odd-archivo/pdf?numero=065%2F2026'}];
let persona='vol-1';const leidos=new Map();
const server=http.createServer(async(req,res)=>{
 const scripts=['germania-odd-archivo.js','germania-avisos.js','germania-odd-pdf-publicar.js'];var nombre=scripts.find(x=>req.url.startsWith('/'+x));if(nombre){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(await readFile('public/legacy/'+nombre));return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#171a1e;color:white"><select id="miVoluntario"><option value="vol-1">Uno</option><option value="vol-2">Dos</option></select><div id="inicioNovedades"><div id="novedadesLista"></div><button id="oddPdfPublicarBtn">Subir ODD</button></div><script>window.sGet=async()=>[];window.sSet=async()=>true;</script><script src="/germania-avisos.js"></script><script src="/germania-odd-pdf-publicar.js"></script><script src="/germania-odd-archivo.js"></script></body></html>');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const launcher={headless:true};
if(process.env.ODD_CHROMIUM_MODULE){const {default:packaged}=await import(process.env.ODD_CHROMIUM_MODULE);launcher.executablePath=await packaged.executablePath();launcher.args=packaged.args;}
if(process.env.ODD_CHROMIUM_PATH){launcher.executablePath=process.env.ODD_CHROMIUM_PATH;launcher.args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-proxy-server'];}
const browser=await chromium.launch(launcher);
try{
 const page=await browser.newPage({viewport:{width:Number(process.env.ODD_VIEWPORT_WIDTH||390),height:844},isMobile:true,hasTouch:true});
 page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(10000);console.log('Navegador preparado');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/odd-archivo',async route=>{
  const request=route.request();
  if(request.method()==='GET'){
   const documentos=catalogoODD([...nuevos,...historicos]).map(d=>({...d,...avisoPersonal(d,leidos.get(persona+':'+d.numero))}));
   await route.fulfill({json:{documentos,personaId:persona,pendientes:documentos.filter(d=>d.pendiente).length}});return;
  }
  if(request.headers()['content-type']?.includes('multipart/form-data')){
   const form=await new Request('http://localhost',{method:'POST',headers:request.headers(),body:request.postDataBuffer()}).formData();
   const file=form.get('archivo');
   if(form.get('accion')==='analizar'){await route.fulfill({json:await analizarPDF(new Uint8Array(await file.arrayBuffer()),form.get('numero'))});return;}
   try{const valid=validarPublicacion({numero:form.get('numero'),titulo:form.get('titulo'),resumen:form.get('resumen'),dejaSinEfecto:JSON.parse(form.get('dejaSinEfecto'))},[...nuevos,...historicos]);
    const documento={...valid,historico:false,publicadaEn:new Date().toISOString(),url:'/api/odd-archivo/pdf?numero='+encodeURIComponent(valid.numero)};nuevos.push(documento);await route.fulfill({status:201,json:{ok:true,documento}});
   }catch(e){await route.fulfill({status:409,json:{error:e.message}});}return;
  }
  const body=JSON.parse(request.postData());
  if(body.accion==='publicar_citacion'){
   const documento={...validarPublicacion(body,[...nuevos,...historicos]),...datosCitacion(body),historico:false,publicadaEn:new Date().toISOString()};nuevos.push(documento);await route.fulfill({status:201,json:{ok:true,documento}});return;
  }
  if(body.accion==='identificar')persona=body.personaId;
  if(body.accion==='leer')leidos.set(persona+':'+body.numero,new Date().toISOString());
  await route.fulfill({json:{ok:true}});
 });
 await page.goto('http://127.0.0.1:'+server.address().port);console.log('Pantalla cargada');
 await page.waitForFunction(()=>document.querySelector('#avisoArchivoOdd')?.textContent.includes('1 sin leer'));
 await page.click('#avisoArchivoOdd');await page.waitForSelector('.oa-ficha');
 assert.equal(await page.locator('.oa-ficha').count(),60);
 await page.locator('#oaQ').fill('aproximacion');assert.equal(await page.locator('.oa-ficha').count(),1);
 assert.match(await page.locator('.oa-ficha').innerText(),/061\/2026/);
 await page.locator('#oaQ').fill('');await page.click('[data-numero="060/2026"]');
 assert.match(await page.locator('#oaLista').innerText(),/SIN EFECTO/);
 await page.click('[data-rel="065/2026"]');await page.waitForFunction(()=>document.querySelector('#oaLectura').textContent==='Leída.').catch(async e=>{console.log({persona,leidos:[...leidos],errors,detalle:await page.locator('#oaLista').innerText()});throw e;});
 assert.equal(leidos.has('vol-1:065/2026'),true);
 assert.equal(await page.locator('#oddAvisosPersonales button').count(),1);
 assert.match(await page.locator('#oddAvisosPersonales').innerText(),/Leída/);
 await page.click('#oaVolver');assert.equal(await page.locator('.oa-ficha').count(),60);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#oddArchivoNuevo').count(),0);
 await page.selectOption('#miVoluntario','vol-2');await page.waitForFunction(()=>document.querySelector('#avisoArchivoOdd')?.textContent.includes('1 sin leer'));
 assert.equal(leidos.has('vol-2:065/2026'),false);
 await page.click('#avisoArchivoOdd');await page.waitForSelector('.oa-ficha');
 await page.locator('#oaA').selectOption('2026');assert.equal(await page.locator('.oa-ficha').count(),60);
 await page.screenshot({path:'/tmp/germania-odd-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('#oddArchivoNuevo button,#oddArchivoNuevo input,#oddArchivoNuevo select').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).every(n=>n.getBoundingClientRect().height>=44)),true);
 await page.keyboard.press('Escape');await page.click('#oddPdfPublicarBtn');await page.waitForSelector('#opPDF');
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);pdf.addPage().drawText('SE DISPONE: Se deja sin efecto la ODD 061/2026.',{x:30,y:700,font,size:12});
 const archivo={name:'ODD 067_2026.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())};
 await page.fill('#opNumero','067/2026');await page.fill('#opTitulo','Nueva ODD de prueba');await page.setInputFiles('#opPDF',archivo);await page.click('#opAnalizar');
 await page.waitForFunction(()=>document.querySelector('#opResumen').value.includes('deja sin efecto'));
 assert.equal(await page.inputValue('#opReferencias'),'061/2026');await page.click('#opPublicar');
 await page.waitForSelector('#oaLista h3');assert.match(await page.locator('#oaLista h3').innerText(),/067/);
 await page.keyboard.press('Escape');await page.click('#oddPdfPublicarBtn');await page.waitForSelector('#opPDF');
 await page.fill('#opNumero','067/2026');await page.fill('#opTitulo','Intento de reemplazo');await page.setInputFiles('#opPDF',archivo);await page.click('#opAnalizar');
 await page.waitForFunction(()=>document.querySelector('#opResumen').value.includes('deja sin efecto'));await page.click('#opPublicar');
 await page.waitForFunction(()=>document.querySelector('#opMensaje').textContent.includes('ya existe'));
 assert.equal(nuevos.filter(d=>d.numero==='067/2026').length,1);
 await page.keyboard.press('Escape');
 const appFuente=await readFile('public/legacy/app.js','utf8');const inicio=appFuente.indexOf('async function abrirFormularioAviso(');const fin=appFuente.indexOf('async function publicarAvisoOdd(',inicio);
 await page.evaluate(code=>{(0,eval)(code+';window.__abrirTextoODD=abrirFormularioAviso;');const b=document.createElement('button');b.id='pruebaAyudante';b.textContent='Ayudante informa ODD';b.onclick=()=>window.__abrirTextoODD();document.body.appendChild(b);},appFuente.slice(inicio,fin));
 await page.click('#pruebaAyudante');await page.waitForSelector('#opPDF');assert.equal(await page.locator('#opPDF').getAttribute('required'),null);
 await page.fill('#opNumero','068/2026');await page.fill('#opTitulo','Academia sin PDF');await page.fill('#opResumen','Cita a academia de rescate vehicular en el cuartel.');
 await page.locator('#oaForm summary').click();await page.selectOption('#opTipo','academia');await page.fill('#opFecha','2026-11-04');await page.fill('#opHora','20:00');await page.fill('#opLugar','Cuartel');
 await page.click('#opPublicar');await page.waitForSelector('#oaCalendario');assert.equal(nuevos.find(d=>d.numero==='068/2026').cuando.hora,'20:00');
 await page.evaluate(()=>{window.descargarIcs=()=>{window.__calendarioProbado=true;};});await page.click('#oaCalendario');assert.equal(await page.evaluate(()=>window.__calendarioProbado),true);
 assert.deepEqual(errors,[]);
 console.log('UI móvil: 60 fichas, búsqueda, filtros, vínculos, lectura por persona, permanencia de 24h, volver, Escape, análisis de PDF real, publicación y rechazo de reemplazo: OK');
}finally{await browser.close();server.close();}
