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
  function calcularResumen({guardias,acreditaciones,rosterIds,ahoraChile}){
    var por={};
    (rosterIds||[]).forEach(function(id){
      por[String(id)]={asig:0,hechas:0,cubrio:0,ced:0,falto:0,obac:0,maq:0};
    });
    var resultado={por:por,turnos:0,asign:0,reemp:0,sinObac:0,sinCond:0,pendientes:0,sin:0,fallan:0};
    var nochesVistas=new Set();
    (guardias||[]).forEach(function(g){
      if(!g || !g.fechaIng || nochesVistas.has(g.fechaIng)) return;
      nochesVistas.add(g.fechaIng); resultado.turnos++;
      var f=g.fechaIng, par=acreditaciones?.[f]||null, rev=par?.revision||null,
          candidato=par?.acta||null, n=rev?.noches?.[f]||null;
      var guardiaReglas=root.GermaniaGuardiaReglas;
      var ac=guardiaReglas?.acreditacionVigente(candidato,rev,f)?candidato:null;
      var sal=g.fechaSal||siguienteDia(f), hora=g.horaSal||"08:00";
      if(!ac && sal && ahoraChile && ahoraChile>=sal+"T"+hora) resultado.pendientes++;
      var originales=Array.isArray(g.guardianes)?g.guardianes:[];
      var ids=n?[n.maq,n.obac,...(n.vol||[])]:
        [g.oficial,g.conductor,...originales.map(x=>x?.id)];
      var asignados=[...new Set(ids.filter(Boolean).map(String))];
      asignados.forEach(function(id){if(por[id])por[id].asig++;});
      resultado.asign+=asignados.length;
      if(!(n?n.obac:g.oficial))resultado.sinObac++;
      if(!(n?n.maq:g.conductor))resultado.sinCond++;
      var reemplazos=new Map();
      originales.forEach(function(x){
        if(x?.id && x.reemplazo) reemplazos.set(String(x.id),String(x.reemplazo));
      });
      resultado.reemp+=reemplazos.size;
      var cedidos=new Set(reemplazos.keys());
      cedidos.forEach(function(id){if(por[id])por[id].ced++;});
      if(!ac)return;
      var presentes=new Set(ac.asistentes.map(String));
      var ausentes=new Set(ac.ausentes.map(String));
      presentes.forEach(function(id){if(por[id])por[id].hechas++;});
      ausentes.forEach(function(id){if(por[id]&&!cedidos.has(id))por[id].falto++;});
      var remplazan=new Set(reemplazos.values());
      remplazan.forEach(function(id){if(por[id]&&presentes.has(id))por[id].cubrio++;});
      if(n?.obac&&por[String(n.obac)]&&presentes.has(String(n.obac)))por[String(n.obac)].obac++;
      if(n?.maq&&por[String(n.maq)]&&presentes.has(String(n.maq)))por[String(n.maq)].maq++;
    });
    var filas=Object.values(por);
    resultado.sin=filas.filter(q=>!q.hechas&&!q.asig).length;
    resultado.fallan=filas.filter(q=>q.falto>0).length;
    return resultado;
  }
  root.GermaniaGuardiaEstadisticas={calcularResumen:calcularResumen};
})(typeof window!=="undefined"?window:globalThis);
