import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/legacy/germania-config.js',import.meta.url),'utf8');
test('centralizar la configuración conserva exactamente los códigos autorizados y no permite mutación accidental',()=>{
 const window={};vm.runInNewContext(source,{window});const c=window.GermaniaConfig;
 assert.deepEqual(Array.from(c.administradores),['517']);assert.deepEqual(Array.from(c.vistaPrueba),['517']);
 assert.throws(()=>c.administradores.push('otro'));assert.throws(()=>{window.GermaniaConfig={};});
});
test('los nueve catch vacíos operativos y sus manejadores asíncronos ya no silencian fallos',()=>{
 const source=readFileSync(new URL('../public/legacy/germania-roles.js',import.meta.url),'utf8');assert.doesNotMatch(source,/catch\s*\([^)]*\)\s*\{\s*\}/);assert.doesNotMatch(source,/\.catch\(function\(\)\{\}\)/);
});
