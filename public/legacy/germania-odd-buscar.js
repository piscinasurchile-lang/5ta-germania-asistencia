/* GERMANIA · Búsqueda y filtros del «Archivo de ODD» (solo lógica, sin pantalla).
   - Busca sin importar mayúsculas ni tildes, en número, título, tema, lugar, vestimenta y tipo.
   - Varias palabras: deben estar todas (en cualquier orden).
   - Filtra por año, mes y tipo usando la fecha de la actividad (o, si no tiene, la de publicación).
   La pantalla está en germania-avisos.js. No lee ni escribe datos, ni toca permisos. */
(function(root){
"use strict";

var MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function norm(t){
  return String(t==null?"":t).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim();
}

/* "AAAA-MM-DD" con la que se ordena y filtra una ODD: fecha de la actividad; si no hay, la de publicación. */
function fechaOdd(o){
  var f=o&&o.cuando&&o.cuando.fecha;
  if(/^\d{4}-\d{2}-\d{2}$/.test(f||""))return f;
  var p=String(o&&(o.publicadaEn||o.modificadaEn)||"").slice(0,10);
  return /^\d{4}-\d{2}-\d{2}$/.test(p)?p:"";
}

function textoOdd(o,tipos){
  return norm([o.numero,o.titulo,o.tema,o.lugar,o.vestimenta,(tipos&&tipos[o.tipo])||o.tipo].join(" "));
}

/* f = {q, anio:"2026", mes:"1".."12" o "", tipo:"citacion"…}. Devuelve las ODD (más reciente primero). */
function filtrar(lista,f,tipos){
  f=f||{};
  var pal=norm(f.q).split(" ").filter(Boolean);
  return (lista||[]).filter(function(o){
    if(!o)return false;
    var d=fechaOdd(o);
    if(f.anio&&d.slice(0,4)!==String(f.anio))return false;
    if(f.mes&&(d.slice(5,7)!==String(f.mes).padStart(2,"0")))return false;
    if(f.tipo&&o.tipo!==f.tipo)return false;
    if(pal.length){var t=textoOdd(o,tipos);if(!pal.every(function(w){return t.indexOf(w)>=0;}))return false;}
    return true;
  }).sort(function(a,b){return fechaOdd(b).localeCompare(fechaOdd(a))||String(b.numero||"").localeCompare(String(a.numero||""));});
}

function anios(lista){
  var s={};(lista||[]).forEach(function(o){var y=fechaOdd(o).slice(0,4);if(y)s[y]=1;});
  return Object.keys(s).sort().reverse();
}

/* "2026-10-07" → "7 oct 2026" */
function fechaCorta(iso){
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");
  return m?(+m[3])+" "+MESES[+m[2]-1].slice(0,3)+" "+m[1]:"";
}

var api={norm:norm,fechaOdd:fechaOdd,filtrar:filtrar,anios:anios,fechaCorta:fechaCorta,MESES:MESES};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.GermaniaOddBuscar=api;
})(typeof window!=="undefined"?window:globalThis);
