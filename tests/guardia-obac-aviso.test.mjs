import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../public/legacy/germania-obac-avisos.js",import.meta.url),"utf8");
const pantalla=readFileSync(new URL("../public/legacy/germania-cierre-libro.js",import.meta.url),"utf8");
const index=readFileSync(new URL("../public/legacy/index.html",import.meta.url),"utf8");
function modulo(){
 const window={};
 vm.runInNewContext(source,{window,Intl,Date});
 return window.GermaniaObacAvisos;
}
const ficha=(fecha,id="obac",extras={})=>({fecha,dotacion:{obac:id},cierreHabilitado:false,...extras});
test("ficha aparece exactamente a las 22:30 locales el día de su propia guardia",()=>{
 const {fase}=modulo();
 const f=ficha("2026-10-15");
 const ms=Date.parse("2026-10-16T01:30:00.000Z");
 assert.equal(fase(f,"2026-10-15T22:29",ms),"oculto");
 assert.equal(fase(f,"2026-10-15T22:30",ms),"previo");
 assert.equal(fase(f,"2026-10-15T22:45",ms),"previo");
 assert.equal(fase(f,"2026-10-16T05:59",ms),"previo");
 assert.equal(fase({...f,cierreHabilitado:true},"2026-10-16T06:00",ms),"cierre");
});
test("24 horas de confirmación desde el envío, sin depender de ratificación T3",()=>{
 const {fase}=modulo(),enviado="2026-10-16T09:07:30.000Z",t=Date.parse(enviado);
 const a=ficha("2026-10-15","obac",{cierre:{estado:"enviado",enviadoEn:enviado},finalizada:true,acreditacionVigente:true});
 assert.equal(fase(a,"2026-10-16T06:07",t),"confirmacion");
 assert.equal(fase(a,"2026-10-17T06:07",t+86399999),"confirmacion");
 assert.equal(fase(a,"2026-10-17T06:07",t+86400000),"oculto");
 assert.equal(fase({...a,acreditacionVigente:false},"2026-10-16T06:10",t+120000),"confirmacion");
});
test("la notificación vieja no tapa el turno del nuevo OBAC",()=>{
 const m=modulo(),t=Date.parse("2026-10-15T23:00:00Z");
 const ayer=ficha("2026-10-14","francisco",{cierre:{estado:"enviado",enviadoEn:"2026-10-15T18:20:00Z"}});
 const hoy=ficha("2026-10-15","otro");
 const a=m.seleccionar([ayer,hoy],"otro","2026-10-15T22:30",t);
 assert.equal(a.principal.fecha,"2026-10-15");
 assert.equal(a.proximas.length,1);
 assert.equal(a.confirmaciones.length,0);
 const b=m.seleccionar([ayer,hoy],"francisco","2026-10-15T22:30",t);
 assert.equal(b.principal,null);
 assert.equal(b.confirmaciones.length,1);
});
test("si el mismo OBAC tiene dos noches seguidas, se ve el nuevo turno y el acuse anterior",()=>{
 const m=modulo(),t=Date.parse("2026-10-15T23:00:00Z");
 const ayer=ficha("2026-10-14","mismo",{cierre:{estado:"enviado",enviadoEn:"2026-10-15T18:00:00Z"}});
 const hoy=ficha("2026-10-15","mismo");
 const r=m.seleccionar([ayer,hoy],"mismo","2026-10-15T22:30",t);
 assert.equal(r.principal.fecha,"2026-10-15");
 assert.equal(r.confirmaciones[0].fecha,"2026-10-14");
});
test("un cierre anterior no enviado tiene prioridad sobre otro turno por cerrar",()=>{
 const m=modulo();
 const a=ficha("2026-10-14","mismo",{cierreHabilitado:true});
 const b=ficha("2026-10-15","mismo",{cierreHabilitado:false});
 const r=m.seleccionar([b,a],"mismo","2026-10-15T22:30",Date.now());
 assert.equal(r.principal.fecha,"2026-10-14");
 assert.equal(r.proximas[0].fecha,"2026-10-15");
});
test("notificación es breve; formulario OBAC requiere foto y no muestra novedades",()=>{
 assert.match(pantalla,/lgn-obac-confirmacion/);
 assert.match(pantalla,/24 horas/);
 assert.match(pantalla,/id="lgnFoto"/);
 assert.doesNotMatch(pantalla,/id="lgnNovedades"/);
 assert.match(pantalla,/nov="Sin novedades"/);
 assert.match(pantalla,/if\(!file\)/);
 assert.match(pantalla,/cierreHabilitado===true/);
 assert.match(index,/germania-obac-avisos\.js\?v=20261015obac1/);
 assert.match(index,/germania-cierre-libro\.js\?v=\d{8}[a-z0-9]+/);
 assert.doesNotMatch(source,/\bfetch\s*\(|localStorage|method:"POST"/);
});
