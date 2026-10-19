import {neon} from "@neondatabase/serverless";
import {ensureSchema,readState} from "../../../../lib/state-store.js";
import {buscarDispositivo,REGISTRY_KEY,DEVICE_COOKIE,cookieValue}
  from "../../../../lib/b5-dispositivo.mjs";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function GET(request){
  try{
    if(!process.env.DATABASE_URL)return Response.json({error:"sin_base"},{status:503,headers});
    const token=cookieValue(request.headers,DEVICE_COOKIE);
    if(!token)return Response.json({error:"tablet_no_registrada"},{status:403,headers});
    const sql=neon(process.env.DATABASE_URL);
    await ensureSchema(sql);
    const registro=(await readState(sql,REGISTRY_KEY)).value;
    if(!buscarDispositivo(registro,token))return Response.json({error:"tablet_no_registrada"},{status:403,headers});
    const tipo=new URL(request.url).searchParams.get("tipo");
    if(!["lista","servicio"].includes(tipo))return Response.json({error:"tipo_invalido"},{status:400,headers});
    const key=tipo==="lista"?"partes:index:v1":"servicio:index:v1";
    const idx=(await readState(sql,key)).value;
    if(!Array.isArray(idx))return Response.json({error:"indice_no_disponible"},{status:503,headers});
    const ordenados=idx.filter(x=>x&&typeof x.clave==="string")
      .sort((a,b)=>String(b.date||b.fecha||"").localeCompare(String(a.date||a.fecha||""))).slice(0,80);
    const items=[];
    for(let i=0;i<ordenados.length;i+=8){
      const lote=ordenados.slice(i,i+8);
      const valores=await Promise.all(lote.map(x=>readState(sql,tipo==="lista"?"parte:"+x.clave:x.clave)));
      lote.forEach((x,j)=>{
        const v=valores[j].value;
        if(!v)return;
        const fecha=tipo==="lista"?v.date:v.svFecha;
        const presentes=Object.values(tipo==="lista"?v.records||{}:v.concurrencia||{}).filter(s=>s===(tipo==="lista"?"presente":"si")).length;
        items.push({clave:x.clave,fecha,numero:v.numero||null,anio:v.anio||null,
          tipo:tipo==="lista"?v.tipo:v.svTipoAct,claveDespacho:tipo==="servicio"?v.svClave||"": "",
          presentes,anulado:v.anulado===true,origen:v.origenAsistencia||"",
          vinculacion:v.servicioB5===true});
      });
    }
    return Response.json({ok:true,items},{headers});
  }catch(e){
    console.error("B5 historial Neon",e);
    return Response.json({error:"lectura_no_disponible"},{status:503,headers});
  }
}
