import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../public/legacy/'+name,import.meta.url),'utf8');
const roles=read('germania-roles.js');
const ORDEN=['cap','t3','v1','v2','otro','otro2'];
const fecha='2026-11-11';
const casos=[
 {nombre:'Fernando es el único habilitado',vol:['cap','t3','v1','v2'],maq:[],obac:'t3',driver:'cap'},
 {nombre:'Fernando y otro habilitado se inscribieron como voluntarios',vol:['cap','otro','t3','v1','v2'],maq:[],obac:'cap',driver:'otro'},
 {nombre:'otro maquinista tiene inscripción específica y Fernando general',vol:['cap','t3','v1','v2'],maq:['otro'],obac:'cap',driver:'otro'},
 {nombre:'Fernando y el otro tienen inscripción específica de maquinista',vol:['t3','v1','v2'],maq:['cap','otro'],obac:'cap',driver:'otro'},
 {nombre:'Fernando figura como maquinista y el otro en inscripción general',vol:['otro','t3','v1','v2'],maq:['cap'],obac:'cap',driver:'otro'},
 {nombre:'entre alternativas se conserva la inscripción específica',vol:['cap','otro2','t3','v1','v2'],maq:['otro'],obac:'cap',driver:'otro'},
 {nombre:'sin habilitados no se inventa maquinista',vol:['t3','v1','v2'],maq:[],obac:'t3',driver:null},
];
function fixture(){
 const roster=ORDEN.map(id=>({id,activo:true,conductor:['cap','otro','otro2'].includes(id)}));
 const c={Date,Array,Set,Map,GN_DOTACION_MIN:{voluntarios:2,conductor:1,obac:1},PREC:Object.fromEntries(ORDEN.map((id,i)=>[id,i])),porId:id=>roster.find(p=>p.id===id),esMaquinista:p=>p?.conductor===true};c.window=c;
 vm.createContext(c);vm.runInContext(read('germania-obac.js'),c);vm.runInContext(read('germania-guardia-reglas.js'),c);
 vm.runInContext(roles.slice(roles.indexOf('function regs('),roles.indexOf('function nombreNoche(')),c);
 return c;
}
const plain=value=>JSON.parse(JSON.stringify(value));
for(const caso of casos){
 test(caso.nombre+': cálculo compartido y preparación coinciden',()=>{
  const c=fixture(),S={vol:Object.fromEntries(caso.vol.map(id=>[id,[fecha]])),maq:Object.fromEntries(caso.maq.map(id=>[id,[{f:fecha,t:'2026-11-01T12:00:00Z'}]]))};
  const before=structuredClone(S);
  const entrants=caso.maq.map(id=>({id,maquinista:true})).concat(caso.vol.filter(id=>!caso.maq.includes(id)).map(id=>({id,habilitadoMaquinista:c.esMaquinista(c.porId(id))})));
  const expected=c.GermaniaObac.obacDeNoche({inscritos:entrants,orden:ORDEN});
  const result=c.cobertura(S,[fecha])[0];
  assert.equal(expected.obac,caso.obac);assert.deepEqual(plain(expected.maquinistas),caso.driver?[caso.driver]:[]);
  assert.deepEqual(plain(result.maq.map(x=>x.id)),plain(expected.maquinistas));assert.deepEqual(plain(result.obac.map(x=>x.id)),expected.obac?[expected.obac]:[]);
  assert.deepEqual(plain(result.vol),plain(expected.voluntarios));
  const ids=[...result.maq.map(x=>x.id),...result.obac.map(x=>x.id),...result.vol];assert.equal(new Set(ids).size,ids.length);assert.equal(ids.length,new Set([...caso.maq,...caso.vol]).size);
  assert.equal(result.completa,!!caso.driver);assert.deepEqual(S,before);
 });
}
test('las siete noches conservan su independencia y todos los inscritos',()=>{
 const c=fixture(),dates=casos.map((_,i)=>'2026-11-'+(11+i)),S={vol:{},maq:{}};
 casos.forEach((caso,i)=>{for(const id of caso.vol)(S.vol[id]??=[]).push(dates[i]);for(const id of caso.maq)(S.maq[id]??=[]).push(dates[i]);});
 const before=structuredClone(S),result=c.cobertura(S,dates);
 for(let i=0;i<7;i++){assert.equal(result[i].obac[0]?.id,casos[i].obac);assert.equal(result[i].maq[0]?.id,casos[i].driver||undefined);}
 assert.deepEqual(S,before);
});
test('un maquinista repetido no pierde su habilitación ni duplica una persona',()=>{
 const c=fixture(),inscritos=[{id:'cap'},{id:'otro'},{id:'cap',maquinista:true},{id:'otro',habilitadoMaquinista:true},{id:'v1'},{id:'v2'}],before=structuredClone(inscritos);
 const r=c.GermaniaObac.obacDeNoche({inscritos,orden:ORDEN});assert.equal(r.obac,'cap');assert.deepEqual(plain(r.maquinistas),['otro']);assert.deepEqual(plain(r.voluntarios),['v1','v2']);assert.deepEqual(inscritos,before);
});
test('tabla e historial conservan el mismo orden de maquinistas por fecha de inscripción que la preparación',async()=>{
 const source=read('app.js'),from=source.indexOf('async function gnTablaRolSemana('),to=source.indexOf('let gnTablaSemanaVisible=',from);
 const slots={otro:[{f:fecha,t:'2026-11-03T10:00:00Z'}],otro2:[{f:fecha,t:'2026-11-02T10:00:00Z'}]},vol={cap:[fecha],t3:[fecha],v1:[fecha],v2:[fecha]};
 for(const order of [['otro','otro2'],['otro2','otro']]){
  const c=fixture();c.fetch=async()=>({ok:true,json:async()=>({items:order.map(id=>({key:'guardia-maq:2026-11-11:'+id,value:slots[id]}))})});
  vm.runInContext(source.slice(from,to),c);
  const titulares=(await c.gnTablaRolSemana('guardia-maq:','2026-11-11'))[fecha];assert.deepEqual(plain(titulares),['otro2','otro']);
  const tabla=c.GermaniaObac.obacDeNoche({orden:ORDEN,inscritos:[...titulares.map(id=>({id,maquinista:true})),{id:'cap',habilitadoMaquinista:true},{id:'t3'},{id:'v1'},{id:'v2'}]});
  const preparacion=c.cobertura({vol,maq:slots},[fecha])[0];assert.equal(tabla.obac,'cap');assert.equal(preparacion.obac[0].id,'cap');assert.deepEqual(plain(tabla.maquinistas),['otro2']);assert.equal(preparacion.maq[0].id,tabla.maquinistas[0]);assert.equal(preparacion.maq[0].t,slots.otro2[0].t);
 }
});
test('inscripción general con IDs numéricos no depende del orden de claves o de la API',()=>{
 const c=fixture();c.PREC={'517':0,t3:1,v1:2,v2:3,'2':4,'10':5};c.porId=id=>({id,activo:true,conductor:['517','2','10'].includes(id)});
 const vol=Object.fromEntries(['10','2','517','t3','v1','v2'].map(id=>[id,[fecha]]));
 const preparacion=c.cobertura({vol,maq:{}},[fecha])[0];
 for(const ids of [['10','2','517','t3','v1','v2'],['2','517','10','t3','v1','v2']]){
  const tabla=c.GermaniaObac.obacDeNoche({orden:['517','t3','v1','v2','2','10'],inscritos:ids.map(id=>({id,habilitadoMaquinista:c.esMaquinista(c.porId(id))}))});
  assert.equal(tabla.obac,'517');assert.deepEqual(plain(tabla.maquinistas),['10']);assert.equal(preparacion.obac[0].id,tabla.obac);assert.equal(preparacion.maq[0].id,tabla.maquinistas[0]);
 }
});
