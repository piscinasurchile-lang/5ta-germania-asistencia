import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("la tablet B-5 detecta la nueva versión sin caché anterior ni borrar datos",()=>{
 const version=JSON.parse(fs.readFileSync(new URL("../public/version.json",import.meta.url),"utf8"));
 const worker=fs.readFileSync(new URL("../public/sw.js",import.meta.url),"utf8");
 assert.match(version.version,/^\d{4}-\d{2}-\d{2}\.[a-z0-9-]+$/);
 assert.match(worker,/const CACHE="germania-static-v10-b5"/);
 assert.ok(worker.includes('if(url.pathname==="/version.json")return;'));
 assert.match(worker,/url\.pathname\.startsWith\("\/api\/"\)\)return;/);
 assert.match(worker,/const B5_PAGES=\["\/b5","\/b5\/captura"\]/);
});
