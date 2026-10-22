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
    /* Cumplimiento final: lo acredita solo el T3. Registros anteriores al flujo (sin acreditadoPorCargo) los creaba solo el T3. */
    if(ac&&(ac.cumplimientoFinal?ac.cumplimientoFinal.estado!=="acreditado":ac.acreditadoPorCargo!==undefined))return false;
    return actaValida(ac,revision,fecha);
  }
  /* Acta real íntegra (dotación vigente, asistencias coherentes), sin exigir el paso T3 que ya no existe. */
  function actaValida(ac,revision,fecha){
    var n=revision&&revision.noches&&revision.noches[fecha];
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
  /* Noche terminada = cumplida (instrucción del Capitán, oct-2026): ya no hay cierre OBAC, ratificación ni acreditación T3.
     Si no hay un acta real vigente, una noche terminada de una revisión aprobada cuenta con toda su dotación programada
     como presente (conductor y OBAC incluidos). Solo lectura: no escribe nada ni modifica actas guardadas. */
  function ahoraChile(){
    try{
      var d={};new Intl.DateTimeFormat("en-GB",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",
        hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).forEach(function(x){d[x.type]=x.value;});
      return d.year+"-"+d.month+"-"+d.day+"T"+d.hour+":"+d.minute;
    }catch(e){return "";}
  }
  function nocheTerminada(fecha,ahora){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha||"")||!ahora)return false;
    var sig=new Date(Date.parse(fecha+"T12:00:00Z")+864e5).toISOString().slice(0,10);
    return ahora>=sig+"T06:00";
  }
  function actaAutomatica(fecha,n){
    var ids=[];
    [n&&n.maq,n&&n.obac].concat((n&&n.vol)||[]).forEach(function(x){
      var v=x==null?"":String(x).trim();if(v&&ids.indexOf(v)<0)ids.push(v);
    });
    var asistencias={};ids.forEach(function(id){asistencias[id]="presente";});
    return {estado:"acreditada",fecha:fecha,automatica:true,asistentes:ids.slice(),ausentes:[],asistencias:asistencias,
      adicionales:[],excusas:{},obacEfectivoId:n&&n.obac?String(n.obac):"",conductorEfectivoId:n&&n.maq?String(n.maq):""};
  }
  function actaEfectiva(ac,revision,fecha,ahora){
    if(actaValida(ac,revision,fecha))return ac;
    var n=revision&&revision.noches&&revision.noches[fecha];
    if(!n||revision.estado!=="aprobada"||!Array.isArray(n.vol))return null;
    return nocheTerminada(fecha,ahora||ahoraChile())?actaAutomatica(fecha,n):null;
  }
  root.GermaniaGuardiaReglas={evaluarDotacion:evaluarDotacion,firmaDotacion:firmaDotacion,acreditacionVigente:acreditacionVigente,actaValida:actaValida,
    actaEfectiva:actaEfectiva,nocheTerminada:nocheTerminada,ahoraChile:ahoraChile};
})(typeof window!=="undefined"?window:globalThis);
