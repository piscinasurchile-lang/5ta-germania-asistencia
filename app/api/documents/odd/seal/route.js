import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import { PDFDocument } from "pdf-lib";

export const runtime="nodejs";
function equal(a,b){const aa=Buffer.from(String(a||"")),bb=Buffer.from(String(b||""));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function token(){const s=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";return s?crypto.createHmac("sha256",s).update("5ta-germania-oficialidad").digest("hex"):""}
async function asset(sql,key){const r=await sql`SELECT data FROM document_assets WHERE key=${key} AND active=true LIMIT 1`;return r?.[0]?.data?Buffer.from(r[0].data):null}
export async function POST(req){
 const expected=token(),got=req.cookies.get("quinta_oficialidad")?.value;
 if(!expected||!equal(got,expected)) return Response.json({error:"officiality_required"},{status:401});
 if(!process.env.DATABASE_URL) return Response.json({error:"database_not_configured"},{status:503});
 try{
  const body=await req.json(),raw=Buffer.from(String(body.pdfBase64||""),"base64");
  if(!raw.length||raw.length>8_000_000) return Response.json({error:"invalid_pdf"},{status:400});
  const sql=neon(process.env.DATABASE_URL);
  const pdf=await PDFDocument.load(raw),pages=pdf.getPages(),page=pages[pages.length-1],{width}=page.getSize();
  const signers=body.signers||{};
  const entries=[];
  if(signers.ayudante) entries.push(["ayudante_firma","ayudante_timbre",width*.29]);
  if(signers.capitan) entries.push(["capitan_firma","capitan_timbre",width*.70]);
  for(const [sigKey,stampKey,cx] of entries){
   const [sig,stamp]=await Promise.all([asset(sql,sigKey),asset(sql,stampKey)]);
   if(!sig||!stamp) return Response.json({error:"protected_asset_missing"},{status:503});
   const s=await pdf.embedPng(sig),t=await pdf.embedPng(stamp);
   page.drawImage(t,{x:cx-25,y:25,width:50,height:50});
   const sw=signers.capitan&&sigKey==="capitan_firma"?86:62,sh=sw*s.height/s.width;
   page.drawImage(s,{x:cx-sw/2,y:42,width:sw,height:sh});
  }
  const bytes=await pdf.save();
  return new Response(bytes,{headers:{"Content-Type":"application/pdf","Cache-Control":"no-store","Content-Disposition":"attachment; filename=ODD_protegida.pdf"}});
 }catch(e){console.error("ODD protected PDF failed",e);return Response.json({error:"pdf_generation_failed"},{status:500})}
}