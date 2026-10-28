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
  function firmaDotacion(noche){
    if(!noche || !Array.isArray(noche.vol) || !noche.maq || !noche.obac) return null;
    var vol=noche.vol.map(String);
    var todos=[String(noche.maq),String(noche.obac)].concat(vol);
    if(vol.length<2 || noche.vol.some(id=>id==null || String(id).trim()==="") ||
      new Set(todos).size!==todos.length) return null;
    return JSON.stringify({maq:String(noche.maq),obac:String(noche.obac),vol:vol.sort()});
  }
  function acreditacionVigente(ac,revision,fecha){
    var n=revision&&revision.noches&&revision.noches[fecha];
    /* Aprobación en un único paso (ADR 0012): el acta vigente aprobada por un oficial autorizado cuenta en estadísticas.
       Ya no se exige una segunda acreditación del T3; los campos antiguos de ese paso se ignoran. */
    if(!ac||!n||ac.estado!=="acreditada"||revision.estado!=="aprobada"||
       ac.fecha!==fecha||ac.revisionAprobadaEn!==revision.aprobadaEn||
       !ac.dotacionFirma||ac.dotacionFirma!==firmaDotacion(n)||
       !ac.asistencias||typeof ac.asistencias!=="object"||Array.isArray(ac.asistencias)||
       !Array.isArray(ac.asistentes)||!Array.isArray(ac.ausentes))return false;
    var base=[String(n.maq),String(n.obac)].concat(n.vol.map(String)),
        extras=ac.adicionales||[],excusas=ac.excusas||{};
    if(!Array.isArray(extras)||extras.length>200||!excusas||typeof excusas!=="object"||
       Array.isArray(excusas))return false;
    var ids=base.concat(extras.map(function(p){return String(p&&p.id||"");}));
    if(ids.length!==new Set(ids).size||
       extras.some(function(p){return !p||!p.id||typeof p.motivo!=="string"||
         p.motivo.trim().length<8||ac.asistencias[String(p.id)]!=="presente";}) ||
       Object.keys(excusas).some(function(id){return !base.includes(id)||
         ac.asistencias[id]!=="ausente"||typeof excusas[id]!=="string"||
         excusas[id].trim().length<3;}))return false;
    var keys=Object.keys(ac.asistencias),
      pres=ids.filter(function(id){return ac.asistencias[id]==="presente";}),
      aus=ids.filter(function(id){return ac.asistencias[id]==="ausente";});
    return keys.length===ids.length&&pres.length+aus.length===ids.length&&
      pres.length===ac.asistentes.length&&aus.length===ac.ausentes.length&&
      new Set(ac.asistentes.map(String)).size===pres.length&&
      new Set(ac.ausentes.map(String)).size===aus.length&&
      pres.every(function(id){return ac.asistentes.includes(id);})&&
      aus.every(function(id){return ac.ausentes.includes(id);});
  }
  root.GermaniaGuardiaReglas={evaluarDotacion:evaluarDotacion,firmaDotacion:firmaDotacion,acreditacionVigente:acreditacionVigente};
})(typeof window!=="undefined"?window:globalThis);
