import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../public/legacy/germania-roles.js",import.meta.url),"utf8");
function functionSource(name){
  const start=source.indexOf("function "+name+"(");
  assert.ok(start>=0,"No se encontró "+name);
  const brace=source.indexOf("{",start);
  let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==="{")depth++;
    if(source[i]==="}"&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error("Función incompleta: "+name);
}
const recalc=new Function("porPrec","porId",functionSource("revReordenar")+";return revReordenar;")(
  (a,b)=>a.orden-b.orden,
  id=>({id,orden:Number(id)})
);
function save(old,update){
  const n=structuredClone(old);
  update(n);
  const before=old.obac;
  recalc(n);
  const after=n.obac;
  const changes=[];
  if(before!==after)changes.push({rol:"obac",antesId:before,personaId:after});
  return {n,changes};
}
test("un cambio de voluntario no altera al OBAC de mayor precedencia",()=>{
  const {n,changes}=save({maq:"8",obac:"2",vol:["4","6"]},x=>x.vol.push("7"));
  assert.equal(n.obac,"2");assert.deepEqual(changes,[]);
});
test("al retirarse OBAC asume siguiente precedencia y queda traza",()=>{
  const {n,changes}=save({maq:"8",obac:"2",vol:["4","6"]},x=>{x.obac=null;});
  assert.equal(n.obac,"4");assert.deepEqual(changes,[{rol:"obac",antesId:"2",personaId:"4"}]);
});
test("un nuevo integrante de mayor precedencia desplaza OBAC y queda traza",()=>{
  const {n,changes}=save({maq:"8",obac:"4",vol:["6","7"]},x=>x.vol.push("2"));
  assert.equal(n.obac,"2");assert.equal(changes.length,1);assert.equal(changes[0].antesId,"4");
});
test("el maquinista no puede quedar también como OBAC",()=>{
  const {n}=save({maq:"2",obac:"4",vol:["6","8"]},x=>x.vol.push("2"));
  assert.equal(n.obac,"4");assert.ok(!n.vol.includes("2"));
});
test("la modificación de una noche no afecta otra",()=>{
  const week={a:{maq:"8",obac:"2",vol:["4","6"]},b:{maq:"8",obac:"3",vol:["5","7"]}};
  const untouched=structuredClone(week.b);
  week.a=save(week.a,x=>x.obac=null).n;
  assert.deepEqual(week.b,untouched);
});
test("la implementación conserva la auditoría de reasignación automática",()=>{
  assert.match(source,/if\(anterior!==actual\)\s*\{\s*revLog\(nuevo,D,f,"obac"/);
  assert.match(source,/Reasignación automática por precedencia/);
});
