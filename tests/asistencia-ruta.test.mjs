import test from 'node:test';
import assert from 'node:assert/strict';
import {POST} from '../app/api/asistencia/guardar/route.js';
const req=(body,origin='https://germania.test')=>new Request('https://germania.test/api/asistencia/guardar',{method:'POST',headers:{origin,host:'germania.test','Content-Type':'application/json'},body:JSON.stringify(body)});
test('la ruta rechaza origen externo y datos vacíos sin consultar ni escribir la base',async()=>{
 const r=await POST(req({},'https://externo.test'));assert.equal(r.status,403);assert.equal((await r.json()).error,'origen_no_permitido');
 const vacio=await POST(req({}));assert.equal(vacio.status,400);assert.equal((await vacio.json()).error,'operacion_invalida');
});
test('el preview de producción no puede escribir contra la base real',async()=>{
 const anterior=process.env.VERCEL_ENV,staging=process.env.GERMANIA_STAGING;
 try{process.env.VERCEL_ENV='preview';delete process.env.GERMANIA_STAGING;const r=await POST(req({}));assert.equal(r.status,503);assert.equal((await r.json()).error,'prueba_requiere_staging_aislado');}
 finally{if(anterior===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=anterior;if(staging===undefined)delete process.env.GERMANIA_STAGING;else process.env.GERMANIA_STAGING=staging;}
});
