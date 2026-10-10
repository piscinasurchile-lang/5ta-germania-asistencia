import test from "node:test";
import assert from "node:assert/strict";
import {permitirInscripcionHeredada, identidadInscripcionVerificada} from "../lib/guardia-acceso.mjs";

test("la inscripción heredada permanece cerrada por defecto",()=>{
 assert.equal(permitirInscripcionHeredada({}),false);
 assert.equal(permitirInscripcionHeredada({GUARDIA_INSCRIPCION_LEGACY_BLOQUEADA:"true"}),false);
 assert.equal(permitirInscripcionHeredada({GUARDIA_INSCRIPCION_LEGACY_BLOQUEADA:"FALSE"}),false);
});
test("la excepción transitoria requiere configuración exacta",()=>{
 assert.equal(permitirInscripcionHeredada({GUARDIA_INSCRIPCION_LEGACY_BLOQUEADA:"false"}),true);
});
test("identidad no se acepta sin código de sesión",()=>{
 assert.equal(identidadInscripcionVerificada({codigoSolicitado:"123"}),false);
 assert.equal(identidadInscripcionVerificada({codigoSesion:"123",codigoSolicitado:"456"}),false);
 assert.equal(identidadInscripcionVerificada({codigoSesion:"123",codigoSolicitado:"123"}),true);
});
