import test from "node:test";
import assert from "node:assert/strict";
import {evaluarInscripcion,resumenNoche,obacProvisional,guardiaCompleta} from "../lib/guardia-reglas.mjs";

const fecha="2026-10-14";
const row=(personaId,funcion)=>({fecha,personaId,funcion,estado:"inscrita"});
const intento=(personaId,funcion,inscripciones=[],extra={})=>evaluarInscripcion({fecha,personaId,funcion,inscripciones,habilitados:["maq1","maq2","capitan"],...extra});

test("admite más de tres voluntarios",()=>{
 const rows=["v1","v2","v3","v4"].map(id=>row(id,"voluntario"));
 assert.equal(resumenNoche(rows,fecha).voluntarios,4);
 assert.equal(intento("v5","voluntario",rows).ok,true);
});
test("impide duplicación de una persona por noche",()=>{
 assert.equal(intento("v1","voluntario",[row("v1","voluntario")]).codigo,"YA_INSCRITO");
 assert.equal(intento("maq1","conductor",[row("maq1","voluntario")]).codigo,"YA_INSCRITO");
});
test("solo conductor habilitado puede reservar",()=>{
 assert.equal(intento("v1","conductor").codigo,"NO_HABILITADO");
 assert.equal(intento("maq1","conductor").ok,true);
});
test("una plaza de conductor por noche",()=>{
 const r=intento("maq2","conductor",[row("maq1","conductor")]);
 assert.equal(r.codigo,"OCUPADO");
 assert.equal(r.mensaje,"OCUPADO. ELIGE OTRO DÍA");
 assert.equal(intento("capitan","conductor",[row("maq1","conductor")]).codigo,"OCUPADO");
});
test("maquinista puede tomar otras noches",()=>{
 assert.equal(intento("maq1","conductor",[{...row("maq1","conductor"),fecha:"2026-10-15"}]).ok,true);
});
test("cierre de inscripción bloquea nuevos registros",()=>{
 assert.equal(intento("v1","voluntario",[],{cerrada:true}).codigo,"INSCRIPCION_CERRADA");
});
test("OBAC excluye conductor y aplica precedencia",()=>{
 const inscripciones=[row("capitan","conductor"),row("v1","voluntario"),row("v2","obac")];
 assert.equal(obacProvisional({inscripciones,fecha,precedencia:["capitan","v2","v1"],habilitadosObac:["capitan","v2","v1"]}),"v2");
});
test("anuladas no ocupan plaza",()=>{
 assert.equal(intento("maq2","conductor",[{...row("maq1","conductor"),estado:"anulada"}]).ok,true);
});

test("cinco personas distintas son necesarias para completar guardia",()=>{
 const rows=[row("v1","voluntario"),row("v2","voluntario"),row("v3","voluntario"),row("maq1","conductor"),row("ob1","obac")];
 assert.equal(guardiaCompleta(rows,fecha),true);
 assert.equal(guardiaCompleta(rows.slice(0,4),fecha),false);
 assert.equal(guardiaCompleta([...rows.slice(0,4),row("v1","obac")],fecha),false);
});
test("OBAC provisional no se obtiene de los voluntarios regulares",()=>{
 const rows=[row("v1","voluntario"),row("v2","voluntario"),row("maq1","conductor")];
 assert.equal(obacProvisional({inscripciones:rows,fecha,precedencia:["v1","v2"],habilitadosObac:["v1","v2"]}),null);
});

test("habilitaciones OBAC y conductor son independientes",()=>{
 assert.equal(intento("ob1","obac",[],{habilitadosObac:["ob1"]}).ok,true);
 assert.equal(intento("maq1","obac",[],{habilitadosObac:["ob1"]}).codigo,"NO_HABILITADO");
 assert.equal(intento("ob1","conductor",[],{habilitadosObac:["ob1"]}).codigo,"NO_HABILITADO");
});
test("solo un OBAC por noche",()=>{
 assert.equal(intento("ob2","obac",[row("ob1","obac")],{habilitadosObac:["ob1","ob2"]}).codigo,"OBAC_OCUPADO");
});
