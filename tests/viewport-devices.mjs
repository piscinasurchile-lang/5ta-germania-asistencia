import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const PORT=18763;
const BASE="http://127.0.0.1:"+PORT;
const server=spawn("python3",["-m","http.server",String(PORT),"--bind","127.0.0.1","--directory","public"],{stdio:"ignore"});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
  for(let i=0;i<40;i++){try{if((await fetch(BASE+"/legacy/dashboard-preview.html")).ok)return;}catch{}await sleep(300);}
  throw Error("Servidor estático no responde");
}
async function check(browser,device){
  const ctx=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.dpr||1,isMobile:device.mobile??false,hasTouch:device.touch??false});
  const page=await ctx.newPage();
  const snapshots=[];
  try{
    await page.route("**/api/**",route=>{
      const url=new URL(route.request().url());
      if(url.pathname==="/api/informaciones/prueba"){
        return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({items:[
          {id:"11111111-1111-4111-8111-111111111111",texto:"Citación de Comandancia para el jueves a las 19:30 horas, en el cuartel de la Compañía. Texto largo para validar ancho de pantalla y saltos de línea sin cortes.",en:new Date().toISOString(),autor:"Comandancia",destino:"compania",lecturas:[]}
        ],nextOffset:null,previousOffset:null})});
      }
      if(url.pathname.startsWith("/api/state/")){
        const key=decodeURIComponent(url.pathname.replace("/api/state/",""));
        const value=key==="roster:v8"?[{id:"517",nombre:"Camila",apellidoPaterno:"Soto",apellidoMaterno:"Muñoz",activo:true,cargo:"Voluntario"}]:[];
        return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({value,version:1})});
      }
      return route.fulfill({status:200,contentType:"application/json",body:'{"items":[],"value":[],"version":1}'});
    });

    await page.goto(BASE+"/legacy/dashboard-preview.html",{waitUntil:"domcontentloaded"});
    await page.locator("#volver").waitFor({state:"visible",timeout:12000});
    const dash=await page.evaluate(()=>{
      const viewport=document.documentElement.clientWidth;
      const overflow=document.documentElement.scrollWidth-viewport;
      const controls=[...document.querySelectorAll(".filters select,.filters button")].map(el=>({label:(el.textContent||"").trim().slice(0,25),height:el.getBoundingClientRect().height}));
      return {overflow,viewport,controls};
    });
    assert.ok(dash.overflow<=2,device.name+" Dashboard desbordado "+JSON.stringify(dash));
    for(const b of dash.controls)assert.ok(b.height>=43.5,device.name+" control táctil insuficiente "+JSON.stringify(b));

    await page.goto(BASE+"/legacy/index.html",{waitUntil:"domcontentloaded"});
    await page.locator("#inicioNovedades").waitFor({state:"visible",timeout:12000});
    await page.locator("[data-nov-vista='historial']").click();
    await page.waitForTimeout(200);
    const notice=await page.evaluate(()=>{
      const box=document.querySelector("#inicioNovedades");
      const a=[...box.querySelectorAll("[data-nov-vista]")].map(b=>({height:b.getBoundingClientRect().height,width:b.getBoundingClientRect().width}));
      return {vw:document.documentElement.clientWidth,boxWidth:box.getBoundingClientRect().width,scrollWidth:box.scrollWidth,controls:a,selected:box.querySelector('[data-nov-vista="historial"]')?.getAttribute("aria-pressed")};
    });
    assert.equal(notice.selected,"true",device.name+" Historial no seleccionable");
    for(const b of notice.controls)assert.ok(b.height>=43.5,device.name+" botón de avisos demasiado pequeño "+JSON.stringify(b));
    assert.ok(notice.scrollWidth<=notice.boxWidth+2,device.name+" avisos desbordados "+JSON.stringify(notice));
    if(device.width>=701){
      const nav=await page.evaluate(()=>{
        const panel=document.getElementById("panel-panel");
        const hasNav=typeof window.__mostrarPestana==="function";
        if(hasNav)window.__mostrarPestana("panel");
        return {hasNav,active:!!panel?.classList.contains("active"),found:!!panel?.querySelector('[aria-label="Volver al inicio de Germania"]')};
      });
      console.log(device.name+" diagnóstico navegación: "+JSON.stringify(nav));
      assert.ok(nav.hasNav,device.name+" navegación de panel sin inicializar");
      assert.ok(nav.active,device.name+" navegación no activó Informes");
      assert.ok(nav.found,device.name+" botón Inicio inexistente");
      const button=page.locator('#panel-panel [aria-label="Volver al inicio de Germania"]');
      assert.ok((await button.boundingBox())?.height>=43.5,device.name+" botón de Inicio insuficiente");
    }
    snapshots.push(device.name+" OK: "+JSON.stringify({dash,notice}));
  }finally{await ctx.close();}
  return snapshots;
}
let browser;
try{
  await ready();
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const cases=[
    {name:"Android 360x800",width:360,height:800,mobile:true,touch:true,dpr:3},
    {name:"iPhone SE 375x667",width:375,height:667,mobile:true,touch:true,dpr:2},
    {name:"iPhone 390x844",width:390,height:844,mobile:true,touch:true,dpr:3},
    {name:"Android 412x915",width:412,height:915,mobile:true,touch:true,dpr:2.5},
    {name:"Tablet B-5 1280x800",width:1280,height:800,touch:true,dpr:1},
    {name:"Tablet B-5 vertical 800x1280",width:800,height:1280,touch:true,dpr:1},
    {name:"PC 1366x768",width:1366,height:768}
  ];
  for(const device of cases){const result=await check(browser,device);for(const item of result)console.log(item);}
  console.log("PASAN 7 tamaños de pantalla con Chromium.");
}catch(err){console.error(err);process.exitCode=1;}finally{
  if(browser)await browser.close();
  server.kill("SIGTERM");
}
