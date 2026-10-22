/* GERMANIA · Motor de búsqueda de los Reglamentos (solo lógica, sin pantalla).
   - Busca sin importar mayúsculas ni tildes («regimen» encuentra «RÉGIMEN»).
   - Una frase se encuentra aunque el PDF la parta en varias líneas.
   - Si la frase exacta no aparece, busca las páginas que contienen TODAS las palabras.
   La pantalla (ventana «Reglamentos») está en germania-avisos.js. No toca datos, guardia, ODD ni permisos. */
(function(root){
"use strict";

/* Texto normalizado (sin tildes, en minúsculas, espacios simples) + mapa hacia el texto original,
   para poder resaltar sobre el original lo que se encontró en el normalizado. */
function indexar(texto){
  texto=String(texto==null?"":texto);
  var t="",m=[],espacio=true; /* true: no deja espacio al principio */
  for(var i=0;i<texto.length;i++){
    var b=texto.charAt(i).normalize("NFD").replace(/[̀-ͯ]/g,"");
    if(!b)continue; /* marca de tilde suelta */
    if(/\s/.test(b)){if(!espacio){t+=" ";m.push(i);espacio=true;}continue;}
    b=b.toLowerCase();espacio=false;
    for(var k=0;k<b.length;k++){t+=b.charAt(k);m.push(i);}
  }
  if(t.charAt(t.length-1)===" "){t=t.slice(0,-1);m.pop();}
  return {t:t,m:m};
}

function preparar(paginas){
  return (paginas||[]).map(function(p){var ix=indexar(p);return {texto:String(p==null?"":p),t:ix.t,m:ix.m};});
}

function ocurrencias(t,aguja){
  var r=[],i=0;if(!aguja)return r;
  while((i=t.indexOf(aguja,i))>=0){r.push(i);i+=aguja.length;}
  return r;
}

function rangosDe(p,ocs,largo){
  return ocs.map(function(i){return [p.m[i],p.m[i+largo-1]+1];});
}

function unir(rangos){
  var o=rangos.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1];}),r=[];
  o.forEach(function(x){
    var u=r[r.length-1];
    if(u&&x[0]<=u[1])u[1]=Math.max(u[1],x[1]);else r.push([x[0],x[1]]);
  });
  return r;
}

/* estado: "corta" (menos de 2 letras) · "frase" · "palabras" · "nada" */
function buscar(paginas,consulta){
  var q=indexar(String(consulta==null?"":consulta).replace(/["“”«»]/g," ")).t;
  if(q.length<2)return {estado:"corta",q:q,resultados:[],total:0,paginas:0};
  var res=[],total=0;
  paginas.forEach(function(p,n){
    var o=ocurrencias(p.t,q);
    if(o.length){total+=o.length;res.push({pagina:n+1,rangos:unir(rangosDe(p,o,q.length))});}
  });
  if(res.length)return {estado:"frase",q:q,resultados:res,total:total,paginas:res.length};
  var pal=q.split(" ").filter(function(w){return w.length>=2;});
  if(pal.length>1){
    paginas.forEach(function(p,n){
      var todas=pal.every(function(w){return p.t.indexOf(w)>=0;});
      if(!todas)return;
      var rg=[];
      pal.forEach(function(w){rg=rg.concat(rangosDe(p,ocurrencias(p.t,w),w.length));});
      total+=rg.length;
      res.push({pagina:n+1,rangos:unir(rg)});
    });
    if(res.length)return {estado:"palabras",q:q,palabras:pal,resultados:res,total:total,paginas:res.length};
  }
  return {estado:"nada",q:q,resultados:[],total:0,paginas:0};
}

/* HTML del texto con lo encontrado entre <mark>…</mark>; `esc` escapa cada trozo (el texto nunca va crudo). */
function resaltar(texto,rangos,esc){
  var out="",pos=0;
  rangos.forEach(function(r){
    if(r[0]<pos)return;
    out+=esc(texto.slice(pos,r[0]))+"<mark>"+esc(texto.slice(r[0],r[1]))+"</mark>";
    pos=r[1];
  });
  return out+esc(texto.slice(pos));
}

/* Trozo corto alrededor de la primera coincidencia, sin cortar palabras; devuelve también los rangos ajustados. */
function fragmento(texto,rangos,antes,despues){
  var r0=rangos[0]||[0,0];
  var ini=Math.max(0,r0[0]-antes),fin=Math.min(texto.length,r0[1]+despues),k;
  if(ini>0){k=ini;while(k<r0[0]&&!/\s/.test(texto.charAt(k-1)))k++;ini=k;}
  if(fin<texto.length){k=fin;while(k>r0[1]&&!/\s/.test(texto.charAt(k)))k--;fin=k;}
  var rs=[];
  rangos.forEach(function(r){if(r[0]>=ini&&r[1]<=fin)rs.push([r[0]-ini,r[1]-ini]);});
  return {texto:texto.slice(ini,fin),rangos:rs,prefijo:ini>0?"… ":"",sufijo:fin<texto.length?" …":""};
}

var api={indexar:indexar,preparar:preparar,buscar:buscar,resaltar:resaltar,fragmento:fragmento};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.GermaniaBuscar=api;
})(typeof window!=="undefined"?window:globalThis);
