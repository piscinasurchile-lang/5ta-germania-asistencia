import test from "node:test";
import assert from "node:assert/strict";
import {firmaDotacion} from "../lib/guardia-acreditacion.js";
import "../public/legacy/germania-guardia-reglas.js";
import "../public/legacy/germania-guardia-estadisticas.js";
test("rezagado solo cuenta una vez en su estadística y excusado no se confunde con falta",()=>{
 const f="2026-10-15",n={maq:"maq",obac:"obac",vol:["v1","v2"]};
 const r={estado:"aprobada",aprobadaEn:"2026-10-14T00:00:00Z",noches:{[f]:n}};
 const ac={fecha:f,estado:"acreditada",revisionAprobadaEn:r.aprobadaEn,dotacionFirma:firmaDotacion(n),
  asistencias:{maq:"presente",obac:"presente",v1:"presente",v2:"ausente",extra:"presente"},
  asistentes:["maq","obac","v1","extra"],ausentes:["v2"],
  adicionales:[{id:"extra",motivo:"Presente y verificado en fotografía del libro físico"}],
  excusas:{v2:"Permiso informado y justificado"}};
 const g={fechaIng:f,fechaSal:"2026-10-16",horaSal:"06:00",oficial:"obac",conductor:"maq",guardianes:[{id:"v1"},{id:"v2"}]};
 const data=globalThis.GermaniaGuardiaEstadisticas.calcularResumen({
   guardias:[g,g],acreditaciones:{[f]:{revision:r,acta:ac}},
   rosterIds:["maq","obac","v1","v2","extra"],ahoraChile:"2026-10-16T09:30"});
 assert.equal(data.turnos,1);
 assert.equal(data.por.extra.hechas,1);
 assert.equal(data.por.extra.adicionales,1);
 assert.equal(data.por.extra.asig,0);
 assert.equal(data.por.v2.excusadas,1);
 assert.equal(data.por.v2.falto,0);
 assert.equal(data.por.maq.hechas,1);
});
