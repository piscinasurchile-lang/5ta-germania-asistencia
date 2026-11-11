// El aviso original se conserva. Su estado visible se contrasta con la programación publicada.
const ids=n=>[n?.obac,n?.maq,...(Array.isArray(n?.vol)?n.vol:[])].filter(Boolean).map(String);
const rol=(n,id)=>String(n?.maq||'')===id?'maq':String(n?.obac||'')===id?'obac':(n?.vol||[]).map(String).includes(id)?'vol':null;
export function avisoSegunDotacion(aviso,revision){
 if(!aviso||aviso.estado==='cubierto'||revision?.estado!=='aprobada'||!revision.aprobadaEn)return aviso;
 const f=aviso.f,id=String(aviso.id||''),actual=revision.noches?.[f];
 if(!f||!id||!actual||ids(actual).includes(id))return aviso;
 const aprobacion=Date.parse(revision.aprobadaEn);if(!Number.isFinite(aprobacion))return aviso;
 const retiros=(revision.cambios||[]).filter(c=>{
  const en=Date.parse(c.en);return Number.isFinite(en)&&en<=aprobacion&&
   ids(c.antes?.[f]).includes(id)&&c.despues?.[f]&&!ids(c.despues[f]).includes(id);
 }).sort((a,b)=>Date.parse(b.en)-Date.parse(a.en));
 const cambio=retiros[0];if(!cambio)return aviso;
 const antes=ids(cambio.antes[f]),despues=ids(cambio.despues[f]);
 const salen=antes.filter(x=>!despues.includes(x)),entran=despues.filter(x=>!antes.includes(x));
 // Una retirada sin entrada, o cambios múltiples, no prueban quién cubre el aviso.
 if(salen.length!==1||salen[0]!==id||entran.length!==1)return aviso;
 const reemplazo=entran[0];
 if(rol(cambio.antes[f],id)!==aviso.rol||rol(cambio.despues[f],reemplazo)!==aviso.rol||rol(actual,reemplazo)!==aviso.rol)return aviso;
 return {...aviso,estado:'cubierto',reemplazoId:reemplazo,estadoOriginal:aviso.estado,
  resolucionDerivada:true,fuenteResolucion:'dotacion_aprobada',
  resueltoPorId:revision.aprobadaPorId||cambio.porId||'',resueltoPor:revision.aprobadaPor||cambio.por||'',
  resueltoEn:revision.aprobadaEn,cambioEn:cambio.en,cambioId:cambio.id||null};
}
