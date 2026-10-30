import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=resolve('public');
let fallar=false,lecturas=0;const metodos=[];
const datos={'roster:v8':[{id:'uno',nombre:'Ana',apellidoPaterno:'Prueba',activo:true,fechaIngreso:'2025-01-01'}],
 'partes:index:v1':[{clave:'prueba',date:'2026-10-20'}],
 'parte:prueba':{date:'2026-10-20',tipo:'Reunión de compañía',records:{uno:'presente'}},'guardias:index':[]};
const harness=`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/legacy/germania-ui.css"><style>.panel{display:none}.panel.active{display:block}#mobileMenu:not(.open){display:none}body{margin:0}.g-menu-fondo{display:none}</style></head><body><button id="menuToggle" aria-expanded="false">Más</button><nav id="mobileMenu"><button data-go="panel">Estadísticas menú</button></nav><section class="panel active" id="panel-germania"><h1>Germania</h1><button data-go="panel">Estadísticas inicio</button><button data-go="estado">Mi estado</button><div style="height:1500px"></div></section><section class="panel" id="panel-estado"><h1>Mi estado</h1><input id="borrador" value="Conservar"><button data-go="panel">Estadísticas estado</button></section><section class="panel" id="panel-panel"></section><script>window.cambiosPantalla=0;window.__mostrarPestana=function(n){window.cambiosPantalla++;document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+n));};document.getElementById('menuToggle').onclick=()=>document.getElementById('mobileMenu').classList.toggle('open');document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>window.__mostrarPestana(b.dataset.go));</script><script src="/legacy/germania-fixes-20261002.js"></script><script src="/legacy/germania-menu-compacto.js"></script><script src="/legacy/germania-atras.js"></script><script src="/legacy/germania-navegacion.js"></script></body></html>`;
const server=http.createServer(async(req,res)=>{
 try{
 if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(harness);return;}
 if(req.url.startsWith('/api/state/')){lecturas++;metodos.push(req.method);await new Promise(r=>setTimeout(r,100));const key=decodeURIComponent(req.url.split('/api/state/')[1]);res.setHeader('Content-Type','application/json');if(fallar&&key==='roster:v8'){res.statusCode=503;res.end('{}');return;}res.end(JSON.stringify({value:datos[key]??null}));return;}
 const path=resolve(root,'.'+req.url.split('?')[0]);if(!path.startsWith(root+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.ODD_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-proxy-server']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
for(const width of [390,1024]){
 await page.setViewportSize({width,height:844});const errores=[];page.on('pageerror',e=>errores.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.getByRole('button',{name:'Mi estado',exact:true}).click();
 await page.getByRole('button',{name:'Estadísticas estado',exact:true}).click();
 const stats=page.frameLocator('#germaniaEstadisticasDialog iframe');
 await stats.locator('#estado').filter({hasText:'Resumen listo'}).waitFor();
 assert.equal(await stats.locator('#kAct').textContent(),'1');
 assert.equal(await stats.locator('#kTasa').textContent(),'100.0%');
 await stats.locator('#miNombre').selectOption('uno');
 const downloadPromise=page.waitForEvent('download');await stats.locator('#miPdf').click();const download=await downloadPromise;assert.match(download.suggestedFilename(),/Asistencia_/);
 await stats.locator('#mes').selectOption('10');await stats.locator('#cargar:not([disabled])').waitFor();
 await stats.locator('#estadisticasAtras').click();
 assert.equal(await page.locator('#germaniaEstadisticasDialog').evaluate(d=>d.open),false);
 assert.equal(await page.locator('#panel-estado').getAttribute('class'),'panel active');
 assert.equal(await page.locator('#borrador').inputValue(),'Conservar');
 const cuenta=lecturas;
 await page.getByRole('button',{name:'Estadísticas estado',exact:true}).click();
 assert.equal(await stats.locator('#mes').inputValue(),'10');assert.equal(lecturas,cuenta);
 // Android uses Germania's existing history sentinel; it closes only the overlay.
 await page.goBack();await page.waitForFunction(()=>!document.getElementById('germaniaEstadisticasDialog').open);
 assert.equal(await page.locator('#panel-estado').getAttribute('class'),'panel active');
 await page.locator('#menuToggle').click();await page.getByRole('button',{name:'Estadísticas menú',exact:true}).click();
 await stats.locator('#estadisticasAtras').click();assert.equal(await page.locator('#mobileMenu').evaluate(m=>m.classList.contains('open')),false);
 await page.getByRole('button',{name:'Estadísticas estado',exact:true}).click();
 await stats.locator('#infPer').selectOption('anio');await stats.locator('#infGen').click();await stats.locator('#infDoc').waitFor();
 await stats.locator('#mes').selectOption('9');await stats.locator('#cargar:not([disabled])').waitFor();assert.equal(await stats.locator('#infAcc').isVisible(),false);assert.equal(await stats.locator('#infOut').textContent(),'');
 await stats.locator('#mes').selectOption('10');await stats.locator('#cargar:not([disabled])').waitFor();
 // A result started before a period change must never repopulate the old report.
 await stats.locator('body').evaluate(()=>{document.getElementById('infGen').click();const mes=document.getElementById('mes');mes.value='9';mes.dispatchEvent(new Event('change'));});
 await stats.locator('#cargar:not([disabled])').waitFor();
 assert.equal(await stats.locator('#infAcc').isVisible(),false);assert.equal(await stats.locator('#infOut').textContent(),'');
 await stats.locator('#mes').selectOption('10');await stats.locator('#cargar:not([disabled])').waitFor();
 const medidas=await stats.locator('body').evaluate(()=>({ancho:document.documentElement.scrollWidth,ventana:innerWidth,controles:[...document.querySelectorAll('button,select')].filter(e=>e.getClientRects().length).map(e=>({id:e.id,h:e.getBoundingClientRect().height})),fondo:getComputedStyle(document.body).backgroundColor,accion:getComputedStyle(document.getElementById('cargar')).backgroundColor}));
 assert.ok(medidas.ancho<=medidas.ventana,JSON.stringify(medidas));assert.ok(medidas.controles.every(c=>c.h>=44),JSON.stringify(medidas.controles));assert.equal(medidas.fondo,'rgb(7, 9, 11)');assert.equal(medidas.accion,'rgb(227, 6, 19)');
 await stats.locator('body').evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:`/tmp/germania-estadisticas-${width}.png`});
 fallar=true;await stats.locator('#cargar').click();await stats.locator('#estado').filter({hasText:'No fue posible'}).waitFor();assert.equal(await stats.locator('#cargar').isEnabled(),true);fallar=false;await stats.locator('#cargar').click();await stats.locator('#estado').filter({hasText:'Resumen listo'}).waitFor();
 await stats.locator('#estadisticasInicio').click();assert.equal(await page.locator('#panel-germania').getAttribute('class'),'panel active');
 assert.deepEqual(errores,[]);console.log(`OK ${width}px: atrás, Android, menú, filtros persistentes, PDF, infografía, reintento, controles y colores`);

}
assert.ok(metodos.every(x=>x==='GET'));console.log('Solo lecturas; ninguna escritura operativa.');
}finally{await browser.close();server.close();}
