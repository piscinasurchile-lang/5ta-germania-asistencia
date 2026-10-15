import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("punto de aviso no exige botón ni registro de quién leyó",()=>{
 const ui=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
 const api=readFileSync(new URL("../app/api/informaciones/prueba/route.js",import.meta.url),"utf8");
 const home=readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
 assert.doesNotMatch(ui,/data-nov-read|confirmarLectura|novReadPending/);
 assert.doesNotMatch(api,/voluntarioId|informaciones-prueba-lecturas:/);
 assert.match(api,/confirmaciones_de_lectura_desactivadas/);
 assert.match(home,/navigator\.clearAppBadge/);
 assert.match(home,/getNotifications/);
});
