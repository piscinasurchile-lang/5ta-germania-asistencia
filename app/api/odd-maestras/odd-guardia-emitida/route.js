import {neon} from "@neondatabase/serverless";
import {createHash} from "node:crypto";
import {PDFDocument} from "pdf-lib";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const db=()=>process.env.DATABASE_URL?neon(process.env.DATABASE_URL):null;
const headers={"Cache-Control":"private, no-store"};
const resp=(obj,status=200)=>Response.json(obj,{status,headers});
const keyFor=(y,n)=>"odd_guardia_emitida_"+y+"_"+String(n).padStart(3,"0");
const valid=(y,n)=>/^\d{4}$/.test(String(y))&&/^\d{1,3}$/.test(String(n))&&Number(n)>0;
const origin=r=>{try{return new URL(r.headers.get("origin")).origin===new URL(r.url).origin}catch{return false}};
export async function GET(request){
 const sql=db();if(!sql)return resp({error:"base_no_configurada"},503);
 const q=new URL(request.url).searchParams,y=q.get("year"),n=q.get("number");
 if(!valid(y,n))return resp({error:"datos_invalidos"},400);
 try{
  const found=await sql.query("SELECT encode(data,'base64') as encoded FROM document_assets WHERE key=$1 AND active=true LIMIT 1",[keyFor(y,n)]);
  if(!found.length)return resp({error:"no_encontrado"},404);
  return new Response(Buffer.from(found[0].encoded,"base64"),{headers:{
   ...headers,"Content-Type":"application/pdf",
   "Content-Disposition":'attachment; filename="ODD_'+String(n).padStart(3,"0")+'_'+y+'.pdf"',
   "X-Content-Type-Options":"nosniff"
  }});
 }catch(e){console.error("odd archivada GET",e);return resp({error:"archivo_no_disponible"},503)}
}
export async function POST(request){
 if(!origin(request))return resp({error:"origen_no_permitido"},403);
 const sql=db();if(!sql)return resp({error:"base_no_configurada"},503);
 try{
  if(Number(request.headers.get("content-length")||0)>6_000_000)return resp({error:"archivo_demasiado_grande"},413);
  const b=await request.json(),y=String(b.year||""),n=String(b.number||"");
  if(!valid(y,n)||b.confirmacion!=="EMITIR_ODD_GUARDIA"||typeof b.base64!=="string"||b.base64.length>5_000_000)
   return resp({error:"datos_invalidos"},400);
  const raw=Buffer.from(b.base64,"base64");
  if(raw.length<5000||raw.length>3_750_000||raw.toString("latin1",0,5)!=="%PDF-")return resp({error:"pdf_invalido"},422);
  const pdf=await PDFDocument.load(raw,{updateMetadata:false});
  if(pdf.getPageCount()!==3||pdf.getPages().some(p=>Math.abs(p.getWidth()-612)>0.3||Math.abs(p.getHeight()-935.52)>0.3))
   return resp({error:"geometria_pdf_incorrecta"},422);
  const key=keyFor(y,n),sha=createHash("sha256").update(raw).digest("hex");
  const previous=await sql.query("SELECT encode(data,'base64') as encoded FROM document_assets WHERE key=$1 LIMIT 1",[key]);
  if(previous.length){
   const old=createHash("sha256").update(Buffer.from(previous[0].encoded,"base64")).digest("hex");
   return old===sha?resp({ok:true,existente:true,sha256:sha}):resp({error:"odd_emitida_inmutable"},409);
  }
  await sql.query("INSERT INTO document_assets(key,data,active,source,effective_year) VALUES($1,decode($2,'base64'),true,$3,$4) ON CONFLICT(key) DO NOTHING",
    [key,b.base64,"ODD Guardia Nocturna "+n+"/"+y+" desde original 063/2026",Number(y)]);
  const saved=await sql.query("SELECT encode(data,'base64') as encoded FROM document_assets WHERE key=$1 LIMIT 1",[key]);
  const h=saved[0]&&createHash("sha256").update(Buffer.from(saved[0].encoded,"base64")).digest("hex");
  return h===sha?resp({ok:true,sha256:sha}):resp({error:"verificacion_archivo_fallida"},409);
 }catch(e){console.error("odd archivada POST",e);return resp({error:"no_se_pudo_archivar_pdf"},503)}
}
