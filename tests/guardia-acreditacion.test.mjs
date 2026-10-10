import test from "node:test";
import assert from "node:assert/strict";
import { integrantesNoche, validarAcreditacion, registroVigente, firmaDotacion } from "../lib/guardia-acreditacion.js";
import "../public/legacy/germania-guardia-reglas.js";
const n={maq:"maq",obac:"obac",vol:["v1","v2"]};
const rev={estado:"aprobada",aprobadaEn:"2026-10-10T10:00:00Z",noches:{"2026-10-14":n}};
const roster=[{id:"t3",cargo:"Teniente 3",activo:true},{id:"cap",cargo:"Capitán",activo:true}];
const a={maq:"presente",obac:"presente",v1:"presente",v2:"ausente"};
const args={fecha:"2026-10-14",noche:n,asistencias:a,revision:rev,ahoraLocal:"2026-10-15T09:00",actor:"t3",roster};
test("cuatro personas distintas, estado de asistencia explícito y T3",()=>{
 assert.deepEqual(integrantesNoche(n),["maq","obac","v1","v2"]);
 assert.equal(validarAcreditacion(args),null);
});
test("capitán no puede acreditar como T3",()=>{
 assert.equal(validarAcreditacion({...args,actor:"cap"}),"solo_teniente_tercero");
});
test("dos roles iguales impiden acreditar",()=>{
 assert.equal(validarAcreditacion({...args,noche:{...n,obac:"maq"}}),"dotacion_duplicada");
});
test("nadie puede ser acreditado por defecto ni por terminar la noche",()=>{
 assert.equal(validarAcreditacion({...args,asistencias:{...a,v2:""}}),"asistencia_incompleta");
 assert.equal(validarAcreditacion({...args,revision:{...rev,estado:"borrador"}}),"dotacion_no_aprobada");
});
test("solo registro acreditado de dotación vigente suma presencia",()=>{
 const ok={fecha:"2026-10-14",estado:"acreditada",revisionAprobadaEn:rev.aprobadaEn,dotacionFirma:firmaDotacion(n),
    asistentes:["maq","obac","v1"],ausentes:["v2"],asistencias:a};
 assert.equal(registroVigente(ok,rev),true);
 assert.equal(registroVigente(null,rev),false);
 assert.equal(registroVigente(ok,{...rev,aprobadaEn:"2026-10-11T10:00:00Z"}),false);
 assert.equal(registroVigente({...ok,asistencias:{...a,otro:"presente"}},rev),false);
 assert.equal(registroVigente({...ok,asistencias:{...a,v1:"ausente"}},rev),false);
});

test("servidor y móvil obtienen la misma firma independiente del orden de voluntarios",()=>{
 const web=globalThis.GermaniaGuardiaReglas;
 assert.equal(web.firmaDotacion(n),firmaDotacion(n));
 assert.equal(firmaDotacion({...n,vol:["v2","v1"]}),firmaDotacion(n));
 assert.equal(firmaDotacion({...n,maq:"obac",obac:"maq"} )===firmaDotacion(n),false);
 assert.equal(firmaDotacion({...n,vol:["v1",null]}),null);
 assert.equal(validarAcreditacion({...args,noche:{...n,vol:["v1",null]},asistencias:{maq:"presente",obac:"presente",v1:"presente"}}),"dotacion_incompleta");
});
test("reemplazo o cambio de cargo deja acreditación anterior PENDIENTE en servidor y móvil",()=>{
 const web=globalThis.GermaniaGuardiaReglas;
 const ok={fecha:"2026-10-14",estado:"acreditada",revisionAprobadaEn:rev.aprobadaEn,
   dotacionFirma:firmaDotacion(n),asistentes:["maq","obac","v1"],ausentes:["v2"],asistencias:a};
 assert.equal(registroVigente(ok,rev),true);
 assert.equal(web.acreditacionVigente(ok,rev,"2026-10-14"),true);
 const cambiado={...rev,noches:{"2026-10-14":{...n,vol:["v1","reemplazo"]}}};
 assert.equal(registroVigente(ok,cambiado),false);
 assert.equal(web.acreditacionVigente(ok,cambiado,"2026-10-14"),false);
 const conductorCambia={...rev,noches:{"2026-10-14":{...n,maq:"otroConductor"}}};
 assert.equal(registroVigente(ok,conductorCambia),false);
 assert.equal(web.acreditacionVigente(ok,conductorCambia,"2026-10-14"),false);
});
test("ausencias y presentes duplicados no se contabilizan",()=>{
 const ok={fecha:"2026-10-14",estado:"acreditada",revisionAprobadaEn:rev.aprobadaEn,
  dotacionFirma:firmaDotacion(n),asistentes:["maq","obac","v1"],ausentes:["v2"],asistencias:a};
 assert.equal(registroVigente({...ok,asistentes:["maq","maq","obac","v1"]},rev),false);
 assert.equal(registroVigente({...ok,ausentes:["v2","v2"]},rev),false);
 assert.equal(registroVigente({...ok,dotacionFirma:undefined},rev),false);
 assert.equal(globalThis.GermaniaGuardiaReglas.acreditacionVigente(ok,rev,"2026-10-14"),true);
});
