import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/legacy/germania-guardia-flujo.js',import.meta.url),'utf8');
function pantalla(persona){
 let consultas=0,retirado=false;
 const host={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null,remove:()=>{retirado=true;}};
 const elements={miVoluntario:{value:'persona'},misNochesInicio:{parentNode:{}},flujoGuardia:host};
 const document={readyState:'loading',getElementById:id=>elements[id]||null,createElement:()=>({}),head:{appendChild(){}},addEventListener(){},querySelector:()=>null};
 const c={document,ROSTER:[{id:'persona',...persona}],console,Date,Intl,URL,Set,Map,TextEncoder,setInterval(){},setTimeout(){},fetch:async url=>{consultas++;return {ok:true,json:async()=>String(url).startsWith('/api/state')?{items:[]}:{semana:'2026-11-04',aprobada:false,noches:[],pendientes:[],cierre:null}};}};
 c.window=c;vm.createContext(c);vm.runInContext(source,c);
 return {c,host,consultas:()=>consultas,retirado:()=>retirado};
}
test('el desplegable exclusivo del Administrador no se muestra ni consulta para otros roles',async()=>{
 for(const cargo of ['Capitán','Teniente Primero','Teniente Segundo','Teniente Tercero','Ayudante Capitán','Bombero']){
  const p=pantalla({cargo,clave:'otra',activo:true});await p.c.GermaniaGuardiaFlujo.refrescar();assert.equal(p.retirado(),true,cargo);assert.equal(p.consultas(),0,cargo);
 }
});
test('el Administrador activo conserva el desplegable de gestión',async()=>{
 const p=pantalla({cargo:'Bombero',clave:'517',activo:true});await p.c.GermaniaGuardiaFlujo.refrescar();assert.equal(p.retirado(),false);assert.ok(p.consultas()>0);assert.ok(p.host.innerHTML.includes('Gestión de guardia nocturna'));
});
test('un Administrador inactivo tampoco muestra el desplegable',async()=>{
 const p=pantalla({cargo:'Bombero',clave:'517',activo:false});await p.c.GermaniaGuardiaFlujo.refrescar();assert.equal(p.retirado(),true);assert.equal(p.consultas(),0);
});
