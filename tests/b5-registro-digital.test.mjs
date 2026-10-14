import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  REGISTRY_KEY,DEVICE_COOKIE,MARKER_COOKIE,nuevoDispositivo,huellaToken,
  tokenValido,idPublico,buscarDispositivo,evaluarRegistro,sameOrigin,cookieValue,
  DAILY_LIMIT,DEVICE_LIMIT
} from "../lib/b5-dispositivo.mjs";

const route=fs.readFileSync(new URL("../app/api/b5/dispositivo/route.js",import.meta.url),"utf8");
const b5=fs.readFileSync(new URL("../app/b5/page.js",import.meta.url),"utf8");
const inicio=fs.readFileSync(new URL("../app/page.js",import.meta.url),"utf8");

test("se genera un token único, aleatorio y distinto del ID público",()=>{
  const a=nuevoDispositivo(),b=nuevoDispositivo();
  assert.notEqual(a.id,b.id);
  assert.notEqual(a.token,b.token);
  assert.match(a.id,/^[0-9a-f-]{36}$/);
  assert.ok(tokenValido(a.token));
  assert.equal(huellaToken(a.token),a.hash);
  assert.ok(!JSON.stringify({id:a.id,hash:a.hash}).includes(a.token));
  assert.equal(idPublico(a.id).length,8);
});

test("la identificación encuentra el mismo dispositivo y rechaza secretos inválidos",()=>{
  const d=nuevoDispositivo();
  const registrados=[{id:d.id,hash:d.hash,registradoEn:new Date().toISOString()}];
  assert.equal(buscarDispositivo(registrados,d.token).id,d.id);
  assert.equal(buscarDispositivo(registrados,nuevoDispositivo().token),null);
  assert.equal(buscarDispositivo(registrados,"123"),null);
  assert.equal(buscarDispositivo(registrados,null),null);
  assert.equal(buscarDispositivo(null,d.token),null);
});

test("el registro limita el número de equipos y las altas de un mismo día",()=>{
  const ahora=Date.parse("2026-10-14T12:00:00Z");
  assert.equal(evaluarRegistro([],ahora),null);
  const lista=Array.from({length:DAILY_LIMIT},(_,i)=>({id:String(i),registradoEn:new Date(ahora-1000).toISOString()}));
  assert.equal(evaluarRegistro(lista,ahora),"limite_diario");
  assert.equal(evaluarRegistro(lista.map(x=>({...x,registradoEn:"2026-10-12T10:00:00Z"})),ahora),null);
  assert.equal(evaluarRegistro(Array.from({length:DEVICE_LIMIT},()=>({registradoEn:"2025-01-01T00:00:00Z"})),ahora),"limite_dispositivos");
});

test("las operaciones de alta exigen mismo origen y reservan la clave digital",()=>{
  const base="https://germania.example/api/b5/dispositivo";
  const fake=(origin)=>({url:base,headers:new Headers(origin?{origin,cookie:DEVICE_COOKIE+"=xyz"}:{cookie:"x=y"})});
  assert.equal(sameOrigin(fake("https://germania.example")),true);
  assert.equal(sameOrigin(fake("https://externo.example")),false);
  assert.equal(sameOrigin(fake(null)),false);
  assert.equal(cookieValue(fake("https://germania.example").headers,DEVICE_COOKIE),"xyz");
  assert.equal(REGISTRY_KEY.startsWith("security:"),true);
  assert.match(route,/writeState\(sql,REGISTRY_KEY,\[\.\.\.registrados,dato\],\{ifVersion:version\}\)/);
  assert.match(route,/if\(!sameOrigin\(request\)\)return fail\("forbidden_origin",403\)/);
  assert.match(route,/HttpOnly; Secure; SameSite=Lax/);
  assert.match(route,/Cache-Control.*no-store/);
});

test("la tablet verifica el registro y solo solicita alta si falta; no otorga permisos",()=>{
  assert.match(b5,/fetch\("\/api\/b5\/dispositivo",\{cache:"no-store"/);
  assert.match(b5,/fetch\("\/api\/b5\/dispositivo",\{method:"POST"/);
  assert.match(b5,/if\(!datos\?\.registrado\)/);
  assert.match(b5,/registro\.estado==="registrado"/);
  assert.match(b5,/document\.cookie="germania_b5_registrado=; Max-Age=0/);
  assert.match(route,/permisos:"sin_privilegios_adicionales"/);
});

test("recupera el modo B-5 con marcador y verificación, sin consultar en modo voluntario",()=>{
  assert.match(inicio,/const marcador = document\.cookie\.split\(";"\)/);
  assert.match(inicio,/if \(!destino && marcador\) \{/);
  assert.match(inicio,/fetch\("\/api\/b5\/dispositivo"/);
  assert.match(inicio,/if \(d\?\.registrado\)/);
  assert.match(inicio,/localStorage\.setItem\("germania:modo-dispositivo:v1", "b5"\)/);
  assert.match(inicio,/window\.location\.replace\("\/b5"\)/);
});
