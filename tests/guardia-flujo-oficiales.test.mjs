import test from "node:test";
import assert from "node:assert/strict";
import {precedenciaOBAC,cargoAutorizadoGuardia,oficialAutorizado,validarRolesEfectivos,validarAcreditacion,firmaContenido,cumplimientoNoche} from "../lib/guardia-acreditacion.js";
import {evaluarDotacionEfectiva,validarComplementos} from "../lib/guardia-asistencia-efectiva.js";
import {informeRatificado,puedeVerLibro} from "../lib/guardia-libro.js";
import {resumenNoche,nochesPendientesSemana} from "../lib/guardia-semana.js";
import {validarIncidencia} from "../lib/guardia-incidencias.js";
import {firmaDotacion} from "../lib/guardia-acreditacion.js";

const roster=[
 {id:"1",nombre:"C",apellidoPaterno:"A",cargo:"Capitán",activo:true,conductor:true,fechaIngreso:"2010-01-01"},
 {id:"2",nombre:"T",apellidoPaterno:"3",cargo:"Teniente Tercero",activo:true},
 {id:"3",nombre:"T",apellidoPaterno:"1",cargo:"Teniente Primero",activo:true},
 {id:"10",nombre:"T",apellidoPaterno:"2",cargo:"Teniente Segundo",activo:true},
 {id:"4",nombre:"M",apellidoPaterno:"Q",cargo:"Voluntario",activo:true,conductor:true,fechaIngreso:"2020-01-01"},
 {id:"5",nombre:"V",apellidoPaterno:"5",cargo:"Voluntario",activo:true,fechaIngreso:"2022-03-01"},
 {id:"6",nombre:"V",apellidoPaterno:"6",cargo:"Voluntario",activo:true,fechaIngreso:"2019-03-01"},
 {id:"8",nombre:"V",apellidoPaterno:"8",cargo:"Voluntario",activo:true},
 {id:"9",nombre:"Ad",apellidoPaterno:"m",cargo:"Voluntario",activo:true,clave:"517"},
 {id:"11",nombre:"Ayu",apellidoPaterno:"d",cargo:"Ayudante",activo:true},
 {id:"12",nombre:"Baja",apellidoPaterno:"x",cargo:"Teniente Primero",activo:false}
];
const noche={maq:"4",obac:"3",vol:["5","6"]};

test("ratifican Capitán y Tenientes 1°, 2° y 3° (activos); nadie más",()=>{
 for(const id of ["1","2","3","10"])assert.equal(oficialAutorizado(roster,id),true,id);
 for(const id of ["4","5","9","11","12","99"])assert.equal(oficialAutorizado(roster,id),false,id);
 assert.equal(cargoAutorizadoGuardia("Teniente 1°"),true);
 assert.equal(cargoAutorizadoGuardia("Teniente"),false);
 assert.equal(cargoAutorizadoGuardia("Capitán"),true);
 assert.equal(cargoAutorizadoGuardia("Director"),false);
});
test("validarAcreditacion exige oficial autorizado",()=>{
 const revision={estado:"aprobada",aprobadaEn:"x",noches:{"2026-10-14":noche}};
 const base={fecha:"2026-10-14",noche,asistencias:{"4":"presente","3":"presente","5":"presente","6":"presente"},revision,ahoraLocal:"2026-10-15T07:00",roster};
 assert.equal(validarAcreditacion({...base,actor:"5"}),"solo_oficiales_autorizados");
 for(const a of ["1","2","3","10"])assert.equal(validarAcreditacion({...base,actor:a}),null,a);
});
test("sin tope artificial de asistentes adicionales",()=>{
 const ad=Array.from({length:60},(_,i)=>({id:"x"+i,motivo:"Acudió a reforzar la guardia"}));
 const ros=[...roster,...ad.map(a=>({id:a.id,activo:true}))];
 const as=Object.fromEntries(ad.map(a=>[a.id,"presente"]));
 assert.equal(validarComplementos(["4","3","5","6"],ad,{},as,ros),null);
});
test("OBAC y conductor efectivos: reglas",()=>{
 const A={"4":"presente","3":"ausente","5":"presente","6":"presente","1":"presente","8":"presente"};
 const v=o=>validarRolesEfectivos({noche,asistencias:A,roster,...o});
 assert.equal(v({}),null,"sin cambios (OBAC ausente es un incumplimiento, no un error)");
 assert.equal(v({obacEfectivo:"5",conductorEfectivo:"5"}),"obac_y_conductor_deben_ser_distintos");
 assert.equal(v({obacEfectivo:"1",conductorEfectivo:"1"}),"obac_y_conductor_deben_ser_distintos");
 assert.equal(v({conductorEfectivo:"8"}),"conductor_no_habilitado");
 assert.equal(v({conductorEfectivo:"1"}),null,"Capitán habilitado conduce");
 assert.equal(v({obacEfectivo:"5"}),null,"la precedencia no bloquea");
 assert.equal(precedenciaOBAC({noche,asistencias:A,obac:"5",cond:"4",roster}).cumple,false);
 assert.equal(precedenciaOBAC({noche,asistencias:A,obac:"5",cond:"4",roster}).masAntiguoId,"6");
 assert.equal(precedenciaOBAC({noche,asistencias:A,obac:"6",cond:"4",roster}).cumple,true);
 assert.equal(v({obacEfectivo:"6"}),null,"el más antiguo presente asume sin constancia");
 assert.equal(validarRolesEfectivos({noche,asistencias:{...A,"5":"ausente"},roster,obacEfectivo:"5",motivoPrecedencia:"xxxxxxxxxx"}),"reemplazo_debe_estar_presente");
 assert.equal(v({obacEfectivo:"99"}),"obac_efectivo_no_en_nomina");
});
test("cumplimiento: tres estados distintos y motivos",()=>{
 const noch={maq:"4",obac:"3",vol:["5","6"]};
 const todos={"4":"presente","3":"presente","5":"presente","6":"presente"};
 const de=evaluarDotacionEfectiva(noch,todos,[]);
 assert.equal(cumplimientoNoche({dotacionEfectiva:de,obacPresente:true,conductorPresente:true,sinFoto:false}).estado,"acreditado");
 const poco=evaluarDotacionEfectiva(noch,{...todos,"6":"ausente"},[]);
 const c=cumplimientoNoche({dotacionEfectiva:poco,obacPresente:true,conductorPresente:true,sinFoto:true});
 assert.equal(c.estado,"con_incumplimientos");assert.deepEqual(c.motivos,["voluntarios_insuficientes","sin_fotografia"]);
 // OBAC reemplazado por un voluntario: ya no cuenta como voluntario
 const rem=evaluarDotacionEfectiva(noch,{...todos,"3":"ausente"},[],{obac:"5"});
 assert.equal(rem.obac,true);assert.equal(rem.voluntarios,1);assert.equal(rem.minimoCumplido,false);
});
test("firmaContenido: mismo contenido = mismo acto, sin importar el orden",()=>{
 const a=firmaContenido({asistencias:{"4":"presente","3":"presente"},adicionales:[{id:"x",motivo:" motivo "}],excusas:{},obac:"3",cond:"4"});
 const b=firmaContenido({asistencias:{"3":"presente","4":"presente"},adicionales:[{id:"x",motivo:"motivo"}],excusas:{},obac:3,cond:4});
 assert.equal(a,b);
 assert.notEqual(a,firmaContenido({asistencias:{"4":"presente","3":"ausente"},adicionales:[{id:"x",motivo:"motivo"}],excusas:{},obac:"3",cond:"4"}));
});
test("cierre de libro por oficial sin foto cuenta como registro cerrado, no como cumplimiento",()=>{
 const revision={estado:"aprobada",aprobadaEn:"2026-10-13T10:00:00Z",noches:{"2026-10-17":noche}};
 const cierre={estado:"enviado",sinFoto:true,fotoClave:null,fotoSHA256:null,enviadoEn:"2026-10-18T10:00:00Z",revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche)};
 const as={"4":"presente","3":"ausente","5":"presente","6":"presente"};
 const ac={fecha:"2026-10-17",estado:"acreditada",revisionAprobadaEn:revision.aprobadaEn,dotacionFirma:firmaDotacion(noche),asistencias:as,asistentes:["4","5","6"],ausentes:["3"],
  cierreLibroFotoSHA256:null,cierreLibroEn:cierre.enviadoEn,adicionales:[],excusas:{}};
 assert.equal(informeRatificado({acreditacion:ac,revision,noche,cierre}),true);
 assert.equal(informeRatificado({acreditacion:ac,revision,noche,cierre:{...cierre,sinFoto:false}}),false,"sin foto y sin marca sinFoto no vale");
 const r=resumenNoche({fecha:"2026-10-17",noche,libro:cierre,acreditacion:{...ac,cumplimiento:{estado:"con_incumplimientos",motivos:["obac_ausente","sin_fotografia"]},dotacionEfectiva:{}},incidencias:[],revision,ahora:"2026-10-21T07:00"});
 assert.equal(r.estado,"acreditada_t3","registro anterior al flujo (sin cargo) lo creó el T3");
 assert.equal(r.reglamento,"con_incumplimientos");
 const porCapitan=resumenNoche({fecha:"2026-10-17",noche,libro:cierre,acreditacion:{...ac,acreditadoPorCargo:"Capitán",cumplimientoFinal:null,cumplimiento:{estado:"acreditado",motivos:[]},dotacionEfectiva:{}},incidencias:[],revision,ahora:"2026-10-21T07:00"});
 assert.equal(porCapitan.estado,"ratificada_pendiente_t3","ratificada por otro oficial: falta el T3");
 assert.equal(nochesPendientesSemana([porCapitan]).length,1,"bloquea el cierre semanal");
 const porT3=resumenNoche({fecha:"2026-10-17",noche,libro:cierre,acreditacion:{...ac,acreditadoPorCargo:"Teniente Tercero",cumplimientoFinal:{estado:"acreditado",porId:"9"},cumplimiento:{estado:"acreditado",motivos:[]},dotacionEfectiva:{}},incidencias:[],revision,ahora:"2026-10-21T07:00"});
 assert.equal(porT3.estado,"acreditada_t3");assert.equal(nochesPendientesSemana([porT3]).length,0);
 const reg=resumenNoche({fecha:"2026-10-17",noche,libro:cierre,acreditacion:null,incidencias:[],revision,ahora:"2026-10-21T07:00"});
 assert.equal(reg.estado,"registro_cerrado");
 assert.equal(resumenNoche({fecha:"2026-10-17",noche,libro:null,acreditacion:null,incidencias:[],revision,ahora:"2026-10-21T07:00"}).estado,"sin_cierre_de_libro");
 assert.equal(resumenNoche({fecha:"2026-10-17",noche,libro:null,acreditacion:null,incidencias:[],revision,ahora:"2026-10-17T23:00"}).estado,"en_curso_o_futura");
 assert.deepEqual(nochesPendientesSemana([r,reg]).map(x=>x.fecha),["2026-10-17"]);
});
test("libro visible para oficiales autorizados aun antes de ratificar",()=>{
 assert.equal(puedeVerLibro(roster[0],noche,false),true);
 assert.equal(puedeVerLibro(roster[2],noche,false),true);
 assert.equal(puedeVerLibro(roster[5],noche,false),false);
});
test("incidencias: validación",()=>{
 const ok={id:"abcdef12",tipo:"llega_tarde",detalle:"Llegó tarde",personaId:"5"};
 assert.equal(validarIncidencia(ok),null);
 assert.equal(validarIncidencia({...ok,tipo:"inventado"}),"tipo_invalido");
 assert.equal(validarIncidencia({...ok,id:"a"}),"id_invalido");
 assert.equal(validarIncidencia({...ok,detalle:"x"}),"detalle_requerido");
 assert.equal(validarIncidencia({...ok,personaId:"5; DROP"}),"persona_invalida");
});

import {idsOficiales} from "../lib/germania-webpush.mjs";
test("push dirigido: solo Capitán y tenientes 1° a 3° activos",()=>{
 assert.deepEqual(idsOficiales(roster).sort(),["1","10","2","3"]);
});
