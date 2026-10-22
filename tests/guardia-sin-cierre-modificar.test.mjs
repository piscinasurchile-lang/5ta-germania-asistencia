import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AVISOS_OFICIALES_ACTIVOS,avisarOficiales} from "../lib/guardia-avisos-oficiales.js";

const f=r=>readFileSync(new URL(r,import.meta.url),"utf8");
const vista=f("../public/legacy/germania-cierre-libro.js");
const acred=f("../app/api/guardia/acreditacion/route.js");
const libro=f("../app/api/guardia/libro/route.js");

test("sin avisos a oficiales: la bandera está apagada y avisarOficiales no escribe ni envía nada",async()=>{
  assert.equal(AVISOS_OFICIALES_ACTIVOS,false);
  const sql=()=>{throw new Error("no debe consultar la base");};
  assert.equal(await avisarOficiales(sql,{clave:"rat:2026-10-14:1",tipo:"ratificada",fecha:"2026-10-14",titulo:"x"}),false);
});
test("pantallas: bandera CIERRE_OFICIAL_ACTIVO=false oculta cierre OBAC, ratificación, T3 y visto bueno",()=>{
  assert.match(vista,/const CIERRE_OFICIAL_ACTIVO=false;/);
  // El formulario de cierre OBAC y las confirmaciones solo existen con la bandera activa.
  assert.match(vista,/const parte=CIERRE_OFICIAL_ACTIVO\?result\.principal:\(result\.proximas\[0\]\|\|null\);/);
  assert.match(vista,/of \(CIERRE_OFICIAL_ACTIVO\?result\.confirmaciones:\[\]\)/);
  // La ficha de cada noche ofrece «Modificar esta noche» y no el T3 ni el visto bueno.
  const nuevo=vista.slice(vista.indexOf("if(!CIERRE_OFICIAL_ACTIVO){\n   if(x.acreditacionVigente&&x.acreditacion)"));
  assert.match(nuevo.slice(0,1800),/Modificar esta noche/);
  assert.ok(!/data-lgn-final|data-lgn-visto/.test(nuevo.slice(0,1800)),"sin botones T3 ni visto bueno en el modo nuevo");
});
test("editor: todos parten como «Asistió» y no se exige la foto del libro ni el cierre OBAC",()=>{
  assert.match(vista,/\(CIERRE_OFICIAL_ACTIVO\?"":"presente"\)/);
  assert.match(vista,/if\(CIERRE_OFICIAL_ACTIVO&&!zona\.querySelector\("\[data-lgn-comprobado\]"\)\?\.checked\)/);
  assert.match(vista,/\(CIERRE_OFICIAL_ACTIVO&&!x\.cierre\)/);
  assert.match(vista,/Motivo de la modificación \(obligatorio; queda registrado\)/);
});
test("API: modificar una noche no exige libro cerrado, deja la modificación vigente y no manda avisos",()=>{
  assert.ok(!/libro_no_cerrado_o_desactualizado"\},\{status/.test(acred),"ya no devuelve libro_no_cerrado");
  assert.match(acred,/cumplimientoFinal:\{estado:"acreditado",porId:actor/);
  assert.match(acred,/sinFoto:false/);
  assert.match(libro,/registroVigente\(r\.acreditacion,revision\)/);
  assert.ok(!/cumplimientoFinalT3/.test(libro));
});
test("el botón «Acreditación de guardia / Novedades» queda oculto sin ratificación",()=>{
  assert.match(vista,/btn\.hidden=!CIERRE_OFICIAL_ACTIVO\|\|!mando/);
});
