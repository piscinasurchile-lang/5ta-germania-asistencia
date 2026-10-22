/* GERMANIA · Texto de los PDF de las ODD, para poder buscar dentro de ellos.
   - Extrae el texto de cada página del PDF con PDF.js (vendor/pdfjs), SIN modificar el PDF.
   - Guarda el texto aparte, en la clave «odd-texto:AAAA-NNN» (el PDF sigue en «odd-pdf:AAAA-NNN»).
   - Un oficial lo genera con el botón «Indexar» del Archivo de ODD; la pantalla está en germania-avisos.js.
   - El índice se considera vigente mientras la ODD siga en la misma versión y con el mismo PDF; si se
     reemplaza el PDF (la versión sube), vuelve a aparecer como pendiente.
   - PDF.js se carga solo al indexar (import dinámico), nunca al abrir la app. */
(function(root){
"use strict";

var PDFJS_VERSION="4.10.38";
var MAX_CARACTERES=400000; /* tope por ODD: un PDF de hasta 1,5 MB no se acerca a esto */
var libPromesa=null;

function claveTexto(odd){
  return "odd-texto:"+String(odd&&odd.id||"").replace(/^odd-/,"");
}

/* Une los trozos de una página en texto legible: salto de línea donde el PDF lo marca. */
function textoDePagina(contenido){
  var out="";
  (contenido&&contenido.items||[]).forEach(function(it){
    if(typeof it.str!=="string")return;
    out+=it.str;
    out+=it.hasEOL?"\n":" ";
  });
  return out.replace(/[ \t]+\n/g,"\n").replace(/[ \t]{2,}/g," ").replace(/\n{3,}/g,"\n\n").trim();
}

/* lib = módulo de PDF.js; data = Uint8Array con el PDF. Devuelve un arreglo con el texto de cada página. */
async function extraerTexto(lib,data){
  var tarea=lib.getDocument({data:data,isEvalSupported:false,useSystemFonts:false,disableFontFace:true,verbosity:0});
  var doc=await tarea.promise,paginas=[],total=0;
  try{
    for(var n=1;n<=doc.numPages;n++){
      var pag=await doc.getPage(n);
      var t=textoDePagina(await pag.getTextContent());
      total+=t.length;
      if(total>MAX_CARACTERES){t=t.slice(0,Math.max(0,t.length-(total-MAX_CARACTERES)));total=MAX_CARACTERES;}
      paginas.push(t);
      if(pag.cleanup)pag.cleanup();
    }
  }finally{
    if(doc.destroy)await doc.destroy();
  }
  return paginas;
}

/* Registro que se guarda. `sinTexto` = el PDF es una imagen (no hay texto que buscar). */
function crearIndice(odd,paginas){
  var chars=paginas.reduce(function(s,p){return s+p.length;},0);
  return {v:1,id:odd.id,pdf:odd.pdf,version:Number(odd.version)||1,paginas:paginas,
    sinTexto:chars<20,generadoEn:new Date().toISOString()};
}

/* ¿El índice guardado corresponde a esta versión de la ODD y a su PDF actual? */
function vigente(indice,odd){
  return !!(indice&&indice.v===1&&odd&&odd.pdf&&indice.pdf===odd.pdf&&
    indice.version===(Number(odd.version)||1)&&Array.isArray(indice.paginas));
}

/* ODD con PDF que aún no tienen índice vigente. `indices` = {id: índice guardado o null}. */
function pendientes(lista,indices){
  return (lista||[]).filter(function(o){return o&&o.pdf&&!vigente(indices&&indices[o.id],o);});
}

function cargarLib(){
  if(!libPromesa){
    var base=new URL("./vendor/pdfjs/",document.baseURI).href;
    libPromesa=import(base+"pdf.min.mjs?v="+PDFJS_VERSION).then(function(lib){
      lib.GlobalWorkerOptions.workerSrc=base+"pdf.worker.min.mjs?v="+PDFJS_VERSION;
      return lib;
    }).catch(function(e){libPromesa=null;throw e;});
  }
  return libPromesa;
}

function bytesDeDataUrl(dataUrl){
  var b64=String(dataUrl||"").split(",")[1]||"";
  var bin=atob(b64),u=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return u;
}

/* Indexa UNA ODD: lee su PDF, extrae el texto y lo guarda en odd-texto:… Solo escribe esa clave. */
async function indexarUno(odd,sGet,sSet){
  var d=await sGet(odd.pdf,null);
  if(!d||!d.dataUrl)throw new Error("El PDF de la ODD "+(odd.numero||"")+" no está disponible.");
  var lib=await cargarLib();
  var paginas=await extraerTexto(lib,bytesDeDataUrl(d.dataUrl));
  var indice=crearIndice(odd,paginas);
  if(!(await sSet(claveTexto(odd),indice)))throw new Error("No se pudo guardar el texto de la ODD "+(odd.numero||"")+".");
  return {paginas:paginas.length,sinTexto:indice.sinTexto};
}

var api={PDFJS_VERSION:PDFJS_VERSION,claveTexto:claveTexto,textoDePagina:textoDePagina,extraerTexto:extraerTexto,
  crearIndice:crearIndice,vigente:vigente,pendientes:pendientes,indexarUno:indexarUno};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.GermaniaOddTexto=api;
})(typeof window!=="undefined"?window:globalThis);
