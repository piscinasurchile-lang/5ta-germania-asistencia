import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../public/legacy/app.js",import.meta.url),"utf8");
const from=source.indexOf("async function renderGnTablaSemanal(){");
const until=source.indexOf("\non(\"gnTablaActualizar\"",from);
assert.ok(from>=0&&until>from);
const code=source.slice(from,until);

function setup({estado="aprobada",falla=false}={}){
 const noches=["2026-10-14","2026-10-15","2026-10-16","2026-10-17","2026-10-18","2026-10-19","2026-10-20"];
 const guardia={estado,noches:Object.fromEntries(noches.map(f=>[f,{vol:["v1","v2","v3"],obac:"obac",maq:"maq"}]))};
 const people=[
   {id:"v1",nombre:"Ana",apellidoPaterno:"Uno"},
   {id:"v2",nombre:"Berta",apellidoPaterno:"Dos"},
   {id:"v3",nombre:"Carlos",apellidoPaterno:"Tres"},
   {id:"obac",nombre:"Francisco",apellidoPaterno:"Vega"},
   {id:"maq",nombre:"Diego",apellidoPaterno:"Lozano"},
   {id:"mal",nombre:"Tomás",apellidoPaterno:"Lara"}
 ];
 const box={innerHTML:""};
 let recalculos=0,consultasMaquinista=0;
 const ctx={
  document:{getElementById:id=>id==="gnTablaSemanal"?box:null},
  gnPlanDraft:{inicio:"2026-10-14",fin:"2026-10-20",cierre:"2026-10-10T00:00:00Z"},
  gnTablaSemanaVisible:"",
  gnWeek:()=>noches,
  gnInsCierreMs:()=>0,
  gnFmt:fecha=>fecha,
  ROSTER:people,
  ROSTER_KEY:"roster:v8",
  sGet:async key=>{
    if(key==="roster:v8")return people;
    if(key==="guardia-revision:2026-10-14"){
      if(falla)throw Error("Sin Internet");
      return guardia;
    }
    if(key==="precedencia:v1")return {lista:[]};
    throw Error("unexpected "+key);
  },
  fetch:async()=>({ok:true,json:async()=>({
    items:people.map(p=>({key:"guardia-inscripcion:2026-10-14:"+p.id,value:noches}))
  })}),
  gnTablaRolSemana:async()=>{consultasMaquinista++;return Object.fromEntries(noches.map(f=>[f,["maq"]]))},
  precBuscar:()=>null,
  porPrec:()=>0,
  GN_DOTACION_MIN:{voluntarios:3},
  nombreCompleto:p=>[p.nombre,p.apellidoPaterno].join(" "),
  gnNombreId:id=>id,
  esc:x=>String(x).replaceAll("<","&lt;"),
  window:{
   GermaniaObac:{obacDeNoche:()=>{
     recalculos++;
     return {maquinistas:["maq"],obac:"mal",voluntarios:["v1","v2"]};
   }},
   GermaniaGuardiaReglas:{evaluarDotacion:()=>({completa:true,razones:[]})}
  },
  on:()=>{},
  console
 };
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {ctx,box,getRecalculos:()=>recalculos,getMaquinistaConsultas:()=>consultasMaquinista};
}
test("tabla semanal usa la revisión aprobada como fuente, sin recalcular OBAC",async()=>{
 const a=setup();
 await a.ctx.renderGnTablaSemanal();
 assert.match(a.box.innerHTML,/Francisco Vega/);
 assert.match(a.box.innerHTML,/Diego Lozano/);
 assert.match(a.box.innerHTML,/Carlos Tres/);
 assert.doesNotMatch(a.box.innerHTML,/Tomás Lara/);
 assert.match(a.box.innerHTML,/Dotación semanal aprobada/);
 assert.equal(a.getRecalculos(),0);
 assert.equal(a.getMaquinistaConsultas(),0);
});
test("una semana no aprobada sigue usando el cálculo de inscripciones",async()=>{
 const a=setup({estado:"en_revision"});
 await a.ctx.renderGnTablaSemanal();
 assert.ok(a.getRecalculos()>0);
 assert.ok(a.getMaquinistaConsultas()>0);
 assert.match(a.box.innerHTML,/Tomás Lara/);
});
test("no muestra dotación no confirmada si falla leer la revisión",async()=>{
 const a=setup({falla:true});
 await a.ctx.renderGnTablaSemanal();
 assert.match(a.box.innerHTML,/No se pudo verificar la revisión semanal/);
 assert.equal(a.getRecalculos(),0);
});
