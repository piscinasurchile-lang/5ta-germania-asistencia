/* GERMANIA · dotación mínima para noches nuevas (2+1+1).
 * Validación pura y sin escritura. No cambia históricos ni ODD.
 * El mínimo de 2 noches de inscripción POR PERSONA es una regla distinta.
 */
(function(root){
  "use strict";
  function ids(v){
    var lista=Array.isArray(v)?v:(v==null||v===""?[]:[v]);
    return lista.map(function(x){
      var valor=x&&typeof x==="object"?x.id:x;
      return valor==null?"":String(valor).trim();
    }).filter(Boolean);
  }
  function evaluarDotacion(n){
    n=n||{};
    var vol=ids(n.vol!==undefined?n.vol:n.voluntarios);
    var maq=ids(n.maq!==undefined?n.maq:n.conductor);
    var obac=ids(n.obac!==undefined?n.obac:n.oficial);
    var todos=vol.concat(maq,obac);
    var distintas=new Set(todos).size===todos.length;
    var faltanVol=Math.max(0,2-vol.length);
    var razones=[];
    if(faltanVol) razones.push("faltan "+faltanVol+" voluntario"+(faltanVol===1?"":"s"));
    if(maq.length!==1) razones.push(maq.length>1?"más de un maquinista":"falta maquinista");
    if(obac.length!==1) razones.push(obac.length>1?"más de un OBAC":"falta OBAC");
    if(!distintas) razones.push("una persona está repetida en la dotación");
    return {
      completa:faltanVol===0&&maq.length===1&&obac.length===1&&distintas,
      voluntarios:vol.length,maquinistas:maq.length,obac:obac.length,
      faltanVoluntarios:faltanVol,personasDistintas:distintas,razones:razones
    };
  }
  root.GermaniaGuardiaReglas={evaluarDotacion:evaluarDotacion};
})(typeof window!=="undefined"?window:globalThis);
