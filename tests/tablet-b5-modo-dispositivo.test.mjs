import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const selector=fs.readFileSync(new URL("../public/legacy/germania-tablet-b5-selector.js",import.meta.url),"utf8");
const inicio=fs.readFileSync(new URL("../app/b5/page.js",import.meta.url),"utf8");
const principal=fs.readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
const cargador=fs.readFileSync(new URL("../public/legacy/germania-actualizar.js",import.meta.url),"utf8");

function montarSelector(){
  const options=[{value:""},{value:"voluntario-a"}];
  const listeners={};
  const estado=new Map([["germania:voluntario-dispositivo:v2","{\"id\":\"voluntario-a\"}"]]);
  const navegado=[];
  const sel={
    options,
    value:"",
    querySelector(q){
      const m=q.match(/option\[value="([^"]*)"\]/);
      return m?options.find(o=>o.value===m[1])||null:null;
    },
    insertBefore(opcion,antes){
      const i=options.indexOf(antes);
      options.splice(i>=0?i:options.length,0,opcion);
    },
    addEventListener(ev,fn,capture){listeners[ev]={fn,capture};}
  };
  const document={
    cookie:"",
    getElementById:id=>id==="miVoluntario"?sel:null,
    createElement:tag=>tag==="option"?{value:"",textContent:""}:null
  };
  const localStorage={
    getItem:k=>estado.get(k)||null,
    setItem:(k,v)=>estado.set(k,v),
    removeItem:k=>estado.delete(k)
  };
  const window={top:{location:{assign:p=>navegado.push(p)}},location:{assign:p=>navegado.push(p)}};
  class MutationObserver {observe(){}}
  vm.runInNewContext(selector,{window,document,localStorage,MutationObserver,console});
  return {sel,options,listeners,estado,navegado,document};
}

test("Tablet B-5 aparece en selector sin ingresar a la nómina",()=>{
  const {options}=montarSelector();
  assert.equal(options[1].value,"__tablet_b5__");
  assert.match(options[1].textContent,/TABLET B-5/);
  assert.equal(options[2].value,"voluntario-a");
});
test("B-5 se guarda solo como modo local, elimina identidad anterior y abre hub",()=>{
  const x=montarSelector();
  x.sel.value="__tablet_b5__";
  let detenido=false;
  x.listeners.change.fn({stopImmediatePropagation(){detenido=true;}});
  assert.equal(x.listeners.change.capture,true);
  assert.equal(detenido,true);
  assert.equal(x.estado.get("germania:modo-dispositivo:v1"),"b5");
  assert.equal(x.estado.has("germania:voluntario-dispositivo:v2"),false);
  assert.match(x.document.cookie,/Max-Age=0/);
  assert.deepEqual(x.navegado,["/b5"]);
});
test("La selección de un voluntario no cambia el modo de la tablet",()=>{
  const x=montarSelector();
  x.sel.value="voluntario-a";
  x.listeners.change.fn({stopImmediatePropagation(){throw Error("No corresponde");}});
  assert.equal(x.estado.has("germania:modo-dispositivo:v1"),false);
  assert.equal(x.navegado.length,0);
});
test("la imagen pública real del B-5 se muestra por defecto y preserva la personalización local",()=>{
  const foto=fs.readFileSync(new URL("../public/legacy/carro-b5.webp",import.meta.url));
  assert.equal(foto.toString("ascii",0,4),"RIFF");
  assert.equal(foto.toString("ascii",8,12),"WEBP");
  assert.ok(foto.length>4000 && foto.length<50000);
  assert.match(inicio,/foto \|\| "\/legacy\/carro-b5\.webp"/);
  assert.match(inicio,/setFoto\(localStorage\.getItem\(FOTO_KEY\)\)/);
});

test("Pantalla B-5 ofrece solo los tres destinos existentes",()=>{
  assert.match(inicio,/id:"servicio"/);
  assert.match(inicio,/id:"lista"/);
  assert.match(inicio,/id:"oficiales"/);
  assert.match(inicio,/Foto del carro/);
  assert.match(inicio,/localStorage\.setItem\(MODO_KEY,"b5"\)/);
  assert.match(inicio,/limpiarIdentidadAnterior\(\)/);
  assert.doesNotMatch(inicio,/\/api\/state\//);
});
test("El acceso B-5 evita descargar el iframe completo al reabrir y conserva la vuelta",()=>{
  assert.match(principal,/if \(modo === "b5" && !destino\)/);
  assert.match(principal,/window\.location\.replace\("\/b5"\)/);
  assert.match(principal,/if \(!inicioB5Comprobado\)/);
  assert.match(principal,/win\.__mostrarPestana\(destinoB5\)/);
  assert.match(principal,/La tablet B-5 no es una identidad de oficial/);
  assert.match(principal,/Volver a B-5/);
  assert.match(cargador,/germania-tablet-b5-selector\.js/);
});
