import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const workerSource=readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
function workerMock() {
  const handlers=new Map(),acciones=[];
  const self={
    location:new URL("https://germania.example/"),
    navigator:{setAppBadge:async()=>{acciones.push("punto");}},
    registration:{showNotification:async (title,options)=>{acciones.push({title,options});}},
    clients:{
      matchAll:async()=>[],
      openWindow:async url=>{acciones.push({open:url});}
    },
    addEventListener:(type,callback)=>handlers.set(type,callback)
  };
  runInNewContext(workerSource,{self,URL,Promise,setTimeout,clearTimeout});
  return {handlers,acciones,self};
}
function emitir(handler,data) {
  let pendente=null;
  handler({data:{json:()=>data},waitUntil:p=>{pendente=p;}});
  return pendente;
}

test("un push de Germania establece punto sin número y una notificación",async()=>{
  const {handlers,acciones}=workerMock();
  assert.ok(handlers.has("push"));
  await emitir(handlers.get("push"),{tipo:"germania-informacion"});
  assert.equal(acciones[0],"punto");
  assert.equal(acciones[1].title,"GERMANIA · Nueva información");
  assert.equal(acciones[1].options.tag,"germania-informaciones");
  assert.doesNotMatch(JSON.stringify(acciones),/voluntarioId|lecturas|unreadCount|badgeCount/);
});
test("no se genera un aviso a partir de un push ajeno",()=>{
  const {handlers,acciones}=workerMock();
  assert.equal(emitir(handlers.get("push"),{tipo:"otro"}),null);
  assert.deepEqual(acciones,[]);
});
test("al tocar la notificación, abre Germania y no marca lecturas",async()=>{
  const {handlers,acciones}=workerMock();
  let pendente=null,cerrada=false;
  handlers.get("notificationclick")({
    notification:{tag:"germania-informaciones",close:()=>{cerrada=true;}},
    waitUntil:p=>{pendente=p;}
  });
  await pendente;
  assert.equal(cerrada,true);
  assert.equal(acciones.at(-1).open,"/");
});
test("no existen botones de leído ni escritura de lecturas en el canal compartido",()=>{
  const ui=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
  const api=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");
  const shell=readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
  assert.doesNotMatch(ui,/data-nov-read|confirmarLectura|novReadPending/);
  assert.doesNotMatch(api,/informaciones-prueba-lecturas|voluntarioId/);
  assert.match(api,/confirmaciones_de_lectura_desactivadas/);
  assert.match(shell,/navigator\.clearAppBadge/);
  assert.match(shell,/getNotifications\(\{tag:"germania-informaciones"\}\)/);
});
