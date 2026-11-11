import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {GET} from '../app/guardia/asignacion/route.js';
const entrada=await readFile('public/legacy/germania-guardia-asignacion-entrada.js','utf8');
const aviso=await readFile('public/legacy/germania-guardia-aviso.js','utf8');
const roles=await readFile('public/legacy/germania-roles.js','utf8');
const abrir=roles.slice(roles.indexOf('var abriendoDiaGuardia='),roles.indexOf('var botonGestion='));
let avisos=[{f:'2026-11-13',id:'p',rol:'vol',por:'Pablo',estado:'abierto',motivo:'Prueba'},{f:'2026-11-17',id:'q',rol:'vol',por:'Otro',estado:'abierto',motivo:'Prueba'}];
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/guardia/asignacion'){const r=await GET(new Request(url));res.setHeader('content-type','text/html');res.end(await r.text());return;}
 if(url.pathname.startsWith('/legacy/')){res.setHeader('content-type',url.pathname.endsWith('.css')?'text/css':'text/javascript');res.end(await readFile('public'+url.pathname));return;}
 if(url.pathname==='/api/state'||url.pathname==='/api/guardia/avisos'){res.setHeader('content-type','application/json');res.end(JSON.stringify({items:avisos.map(value=>({value}))}));return;}
 res.setHeader('content-type','text/html');res.end('<body data-mando="1"><select id="miVoluntario"><option value="a">Admin</option></select><div id="misNochesInicio"></div><details id="gnAsignacionPanel"><summary>Guardia</summary><p id="gnGestionEstado"></p><iframe id="gnAsignacionFrame"></iframe></details><div id="gnTablaSemanal"></div></body>');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.ODD_CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote','--single-process','--no-proxy-server']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errores=[];page.on('pageerror',e=>errores.push(e.message));
 await page.clock.install({time:new Date('2026-11-11T22:20:00Z')});await page.goto('http://127.0.0.1:'+server.address().port);
 await page.evaluate(()=>{
  window.gnTablaSemanaVisible='';window.gnPlanDraft={inicio:'2026-11-04'};window.gnElegirSemana=async inicio=>{window.gnPlanDraft={inicio};};window.GR={};window.navegaciones=0;window.cargas=0;
  window.ROSTER=[{id:'a',nombre:'Admin',clave:'517'}];window.ADMINISTRADORES=['517'];window.gnPuedePrepararAsignacion=()=>true;window.__mostrarPestana=()=>{window.navegaciones++;window.gnTablaSemanaVisible=window.gnPlanDraft.inicio;};
  window.gnAdd=(f,n)=>new Date(Date.parse(f+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);window.instanteChile=(f,h)=>Date.parse(f+'T'+h+':00-03:00');
  const n=()=>({obac:'o',maq:'m',vol:['v1','v2']});
  window.GermaniaAsignacion={cargar:async inicio=>{window.cargas++;await new Promise(r=>setTimeout(r,100));const noches=Object.fromEntries(Array.from({length:7},(_,i)=>[window.gnAdd(inicio,i),n()]));return {roster:[{id:'o',nombre:'OBAC'},{id:'m',nombre:'Maquinista',conductor:true},{id:'v1',nombre:'Uno'},{id:'v2',nombre:'Dos'}],version:1,puedeAprobar:true,soloLectura:false,revision:{estado:'aprobada',noches,guardadas:Object.keys(noches)}};},guardar:async()=>({version:2})};
 });
 await page.addScriptTag({content:abrir});await page.addScriptTag({content:entrada});await page.addScriptTag({content:aviso});
 await page.evaluate(()=>window.GermaniaAvisoAusencia.refrescar());
 assert.equal(await page.locator('[data-gn-aus-fecha]').count(),2);
 await page.locator('[data-gn-aus-fecha="2026-11-13"]').click();await page.clock.runFor(300);
 const f=page.frameLocator('#gnAsignacionFrame');await f.locator('[data-day="2"].active').waitFor();
 assert.equal(await page.evaluate(()=>window.navegaciones),1);
 // Al actualizar un aviso idéntico conserva el mismo botón, evitando perder foco o parpadear por reemplazar el DOM.
 await page.evaluate(()=>{window.botonAnterior=document.querySelector('[data-gn-aus-fecha="2026-11-13"]');return window.GermaniaAvisoAusencia.refrescar();});
 assert.equal(await page.evaluate(()=>window.botonAnterior===document.querySelector('[data-gn-aus-fecha="2026-11-13"]')),true);
 // Abrir otro aviso conserva el iframe existente y sus cambios locales.
 await f.locator('[data-change="v1"]').click();await f.getByRole('button',{name:'Retirar',exact:true}).click();
 const cargas=await page.evaluate(()=>window.cargas);
 await page.locator('[data-gn-aus-fecha="2026-11-17"]').click();await f.locator('[data-day="6"].active').waitFor();
 assert.equal(await page.evaluate(()=>window.cargas),cargas);await f.locator('[data-day="2"]').click();assert.equal(await f.locator('[data-change="v1"]').count(),0);
 assert.deepEqual(errores,[]);console.log('Navegación móvil, selección tras carga, dos avisos y borrador intacto: OK');
}finally{await browser.close();await new Promise(r=>server.close(r));}
