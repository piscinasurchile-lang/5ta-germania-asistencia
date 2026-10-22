/* GERMANIA · resumen estadístico PURO de guardias.
 * Una noche no cuenta como cumplida sin acta válida del Teniente Tercero.
 * No lee ni escribe bases, no modifica ODD ni registros operativos.
 */
(function(root){
  "use strict";
  function siguienteDia(fecha){
    var d=new Date(fecha+"T12:00:00Z");
    if(!Number.isFinite(+d))return "";
    d.setUTCDate(d.getUTCDate()+1);
    return d.toISOString().slice(0,10);
  }
  /* bajas (opcional): {id: fechaBaja|""}. Quien está de baja sigue en el histórico, pero NO se le inventan ausencias:
     con fecha de baja no cuenta nada posterior a esa fecha; sin fecha de baja no se le cuentan faltas ni excusas. */
  function calcularResumen({guardias,acreditaciones,rosterIds,ahoraChile,bajas}){
    var por={};
    (rosterIds||[]).forEach(function(id){
      por[String(id)]={asig:0,hechas:0,cubrio:0,ced:0,falto:0,excusadas:0,adicionales:0,obac:0,maq:0};
    });
    function suma(id,campo,f){var q=por[id];if(!q)return;var b=bajas&&bajas[id];if(b!==undefined&&b!==null){if((campo==="falto"||campo==="excusadas")&&(b===""||f>b))return;if(b!==""&&f>b)return;}q[campo]++;}
    var resultado={por:por,turnos:0,asign:0,reemp:0,sinObac:0,sinCond:0,pendientes:0,sin:0,fallan:0};
    var nochesVistas=new Set();
    (guardias||[]).forEach(function(g){
      if(!g || !g.fechaIng || nochesVistas.has(g.fechaIng)) return;
      nochesVistas.add(g.fechaIng); resultado.turnos++;
      var f=g.fechaIng, par=acreditaciones?.[f]||null, rev=par?.revision||null,
          candidato=par?.acta||null, n=rev?.noches?.[f]||null;
      var guardiaReglas=root.GermaniaGuardiaReglas;
      var ac=guardiaReglas?.actaEfectiva?guardiaReglas.actaEfectiva(candidato,rev,f,ahoraChile):(guardiaReglas?.acreditacionVigente(candidato,rev,f)?candidato:null);
      var sal=g.fechaSal||siguienteDia(f), hora=g.horaSal||"08:00";
      if(!ac && sal && ahoraChile && ahoraChile>=sal+"T"+hora) resultado.pendientes++;
      var originales=Array.isArray(g.guardianes)?g.guardianes:[];
      var ids=n?[n.maq,n.obac,...(n.vol||[])]:
        [g.oficial,g.conductor,...originales.map(x=>x?.id)];
      var asignados=[...new Set(ids.filter(Boolean).map(String))];
      asignados.forEach(function(id){suma(id,"asig",f);});
      resultado.asign+=asignados.length;
      if(!(n?n.obac:g.oficial))resultado.sinObac++;
      if(!(n?n.maq:g.conductor))resultado.sinCond++;
      var reemplazos=new Map();
      originales.forEach(function(x){
        if(x?.id && x.reemplazo) reemplazos.set(String(x.id),String(x.reemplazo));
      });
      /* Cambios hechos por el Teniente Tercero en la revisión aprobada ("cambia"): cuentan igual que un
         reemplazo anotado en el turno (decisión del administrador, 17-oct-2026). Solo lectura. */
      var cambiosT3=new Map();
      if(rev&&rev.estado==="aprobada"&&Array.isArray(rev.cambios)){
        rev.cambios.forEach(function(c){
          if(!c||c.fecha!==f||c.accion!=="cambia"||c.rol!=="vol"||!c.antesId||!c.personaId)return;
          var antes=String(c.antesId),quien=String(c.personaId),encadenado=false;
          cambiosT3.forEach(function(v,k){if(!encadenado&&v===antes){cambiosT3.set(k,quien);encadenado=true;}});
          if(!encadenado)cambiosT3.set(antes,quien);
        });
      }
      cambiosT3.forEach(function(quien,antes){
        if(antes===quien||reemplazos.has(antes))return;
        reemplazos.set(antes,quien);
        if(asignados.indexOf(antes)<0){asignados.push(antes);suma(antes,"asig",f);resultado.asign++;}
      });
      resultado.reemp+=reemplazos.size;
      var cedidos=new Set(reemplazos.keys());
      cedidos.forEach(function(id){suma(id,"ced",f);});
      if(!ac)return;
      var presentes=new Set(ac.asistentes.map(String));
      var ausentes=new Set(ac.ausentes.map(String));
      presentes.forEach(function(id){suma(id,"hechas",f);});
      ausentes.forEach(function(id){if(por[id]&&!cedidos.has(id)){if(ac.excusas?.[id])suma(id,"excusadas",f);else suma(id,"falto",f);}});
       (ac.adicionales||[]).forEach(function(p){if(presentes.has(String(p.id)))suma(String(p.id),"adicionales",f);});
      var remplazan=new Set(reemplazos.values());
      remplazan.forEach(function(id){if(presentes.has(id))suma(id,"cubrio",f);});
      /* OBAC y conductor que de verdad cumplieron la función (si hubo cambio durante la noche, se acreditan los efectivos). */
      var obacId=ac.obacEfectivoId||(n&&n.obac),maqId=ac.conductorEfectivoId||(n&&n.maq);
      if(obacId&&presentes.has(String(obacId)))suma(String(obacId),"obac",f);
      if(maqId&&presentes.has(String(maqId)))suma(String(maqId),"maq",f);
    });
    var filas=Object.keys(por).filter(function(id){return !(bajas&&bajas[id]!==undefined&&bajas[id]!==null);}).map(function(id){return por[id];});
    resultado.sin=filas.filter(q=>!q.hechas&&!q.asig).length;
    resultado.fallan=filas.filter(q=>q.falto>0).length;
    return resultado;
  }
  root.GermaniaGuardiaEstadisticas={calcularResumen:calcularResumen};
})(typeof window!=="undefined"?window:globalThis);
