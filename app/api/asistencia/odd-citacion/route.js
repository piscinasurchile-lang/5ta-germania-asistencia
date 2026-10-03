import { neon } from "@neondatabase/serverless";
export const runtime="nodejs";
const validId=v=>typeof v==="string"&&v.length>0&&v.length<100;
function sqlClient(){return process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null}
async function ensure(sql){await sql`CREATE TABLE IF NOT EXISTS app_state (key text PRIMARY KEY,value jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`}
export async function POST(request){
 const origin=request.headers.get("origin"); if(!origin||new URL(origin).host!==request.headers.get("host"))return Response.json({error:"forbidden_origin"},{status:403});
 const sql=sqlClient(); if(!sql)return Response.json({error:"database_not_configured"},{status:503});
 let b;try{b=await request.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
 const {oddKey,date,title,activity,citedIds}=b||{};
 if(!validId(oddKey)||!/^\d{4}-\d{2}-\d{2}$/.test(date||"")||!Array.isArray(citedIds)||!citedIds.length)return Response.json({error:"invalid_payload"},{status:400});
 const ids=[...new Set(citedIds.map(String).filter(validId))]; if(!ids.length)return Response.json({error:"empty_citation"},{status:400});
 const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase().replace(/^-|-$/g,"");
 const tipo="ODD "+oddKey+" · "+(activity||"Citación");
 const clave=date+"__odd-"+slug(oddKey)+"-"+slug(activity||"citacion");
 const stateKey="parte:"+clave;
 try{
  await ensure(sql);
  const existing=await sql`SELECT value FROM app_state WHERE key=${stateKey} LIMIT 1`;
  const prev=existing?.[0]?.value||{};
  const records={...(prev.records||{})}; ids.forEach(id=>{if(!records[id])records[id]="ausente"});
  Object.keys(records).forEach(id=>{if(!ids.includes(String(id)))delete records[id]});
  const parte={...prev,date,tipo,detalle:title||"",records,eligibleIds:ids,origenAsistencia:"odd_5ta_citacion",generaAsistencia:true,oddKey,updatedAt:new Date().toISOString()};
  await sql`INSERT INTO app_state (key,value,updated_at) VALUES (${stateKey},${JSON.stringify(parte)}::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
  const ir=await sql`SELECT value FROM app_state WHERE key='partes:index:v1' LIMIT 1`; const idx=Array.isArray(ir?.[0]?.value)?ir[0].value:[];
  const ix=idx.findIndex(x=>x.clave===clave); const item={clave,date,tipo}; if(ix>=0)idx[ix]=item;else idx.push(item);
  await sql`INSERT INTO app_state (key,value,updated_at) VALUES ('partes:index:v1',${JSON.stringify(idx)}::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
  const tr=await sql`SELECT value FROM app_state WHERE key='tipos:v2' LIMIT 1`; const tipos=Array.isArray(tr?.[0]?.value)?tr[0].value:[]; if(!tipos.includes(tipo))tipos.push(tipo);
  await sql`INSERT INTO app_state (key,value,updated_at) VALUES ('tipos:v2',${JSON.stringify(tipos)}::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
  return Response.json({ok:true,clave,tipo,citados:ids.length},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("ODD attendance failed",e);return Response.json({error:"database_error"},{status:500})}
}