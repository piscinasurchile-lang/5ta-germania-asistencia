import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const leer=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("los JS de Germania usados en móvil y escritorio no tienen errores de sintaxis",()=>{
 for(const ruta of [
   "public/legacy/app.js",
   "public/legacy/germania-roles.js",
   "public/legacy/germania-guardia-reglas.js",
   "public/legacy/germania-guardia-estadisticas.js",
   "public/legacy/germania-obac.js"
 ]){
   assert.doesNotThrow(()=>new vm.Script(leer(ruta),{filename:ruta}),ruta);
 }
});
test("el dashboard contiene JavaScript válido y carga el mismo validador y estadística",()=>{
 const html=leer("public/legacy/dashboard-preview.html");
 assert.match(html,/src="\/legacy\/germania-guardia-reglas\.js/);
 assert.match(html,/src="\/legacy\/germania-guardia-estadisticas\.js/);
 const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(s=>s.trim());
 assert.ok(scripts.length>0,"Debe existir un script de estadísticas");
 scripts.forEach((script,i)=>{
   assert.doesNotThrow(()=>new vm.Script(script,{filename:"dashboard-inline-"+i}),"error en JS inline del dashboard");
 });
});
test("la pantalla carga reglas y estadísticas antes del núcleo y de los roles",()=>{
 const html=leer("public/legacy/index.html");
 const pos=n=>html.indexOf("./"+n+".js?v=");
 const reglas=pos("germania-guardia-reglas"),resumen=pos("germania-guardia-estadisticas"),
       app=pos("app"),roles=pos("germania-roles");
 assert.ok(reglas>0&&resumen>reglas&&app>resumen&&roles>app);
});
test("los informes NO sustituyen acreditaciones por estado antiguo de guardianes",()=>{
 const js=leer("public/legacy/app.js"),p=js.indexOf('on("gnPdfEstad"'),q=js.indexOf("/* ---- INFOGRAFÍA",p);
 assert.ok(p>0&&q>p);
 const informe=js.slice(p,q);
 assert.match(informe,/gnResumenAcreditado\(lista\)/);
 assert.doesNotMatch(informe,/cubrenGuardia\(g\.guardianes\)/);
 const i=js.indexOf('on("gnInfo"'),j=js.indexOf("/* ============ HISTORIAL",i);
 assert.ok(i>0&&j>i);
 const info=js.slice(i,j);
 assert.match(info,/gnResumenAcreditado\(lista\)/);
 assert.doesNotMatch(info,/x\.estado==="no"/);
});
