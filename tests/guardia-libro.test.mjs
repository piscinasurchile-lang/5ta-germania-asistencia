import test from "node:test";
import assert from "node:assert/strict";
import {siguienteDia,miercolesSemana,ventanaCierreOBAC,nocheFinalizada,cargoT3,cargoCapitan,puedeVerLibro} from "../lib/guardia-libro.js";

test("la semana oficial comienza el miércoles",()=>{
 assert.equal(miercolesSemana("2026-10-14"),"2026-10-14");
 assert.equal(miercolesSemana("2026-10-15"),"2026-10-14");
 assert.equal(miercolesSemana("2026-10-20"),"2026-10-14");
 assert.equal(miercolesSemana("2026-10-21"),"2026-10-21");
 assert.equal(miercolesSemana("2026-02-30"),null);
 assert.equal(siguienteDia("2026-12-31"),"2027-01-01");
});
test("el OBAC solo puede cerrar desde las 06:00 y hasta las 06:00 siguientes",()=>{
 assert.equal(ventanaCierreOBAC("2026-10-14","2026-10-15T05:59"),false);
 assert.equal(ventanaCierreOBAC("2026-10-14","2026-10-15T06:00"),true);
 assert.equal(ventanaCierreOBAC("2026-10-14","2026-10-15T23:59"),true);
 assert.equal(ventanaCierreOBAC("2026-10-14","2026-10-16T05:59"),true);
 assert.equal(ventanaCierreOBAC("2026-10-14","2026-10-16T06:00"),false);
 assert.equal(nocheFinalizada("2026-10-14","2026-10-15T05:59"),false);
 assert.equal(nocheFinalizada("2026-10-14","2026-10-15T06:00"),true);
});
test("solo el OBAC designado puede cerrar, mando puede consultar",()=>{
 const noche={obac:"fran",maq:"maq",vol:["v1","v2","v3"]};
 const francisco={id:"fran",cargo:"Ayudante",activo:true};
 const otro={id:"v1",cargo:"Voluntario",activo:true};
 const teniente={id:"t3",cargo:"Teniente 3",activo:true};
 const capitan={id:"cap",cargo:"Capitán",activo:true};
 assert.equal(puedeVerLibro(francisco,noche),true);
 assert.equal(puedeVerLibro(otro,noche),false);
 assert.equal(puedeVerLibro(teniente,noche),true);
 assert.equal(puedeVerLibro(capitan,noche),true);
 assert.equal(puedeVerLibro({...francisco,activo:false},noche),false);
 assert.equal(cargoT3(teniente.cargo),true);
 assert.equal(cargoCapitan(capitan.cargo),true);
 assert.equal(cargoT3("Teniente 2"),false);
});
