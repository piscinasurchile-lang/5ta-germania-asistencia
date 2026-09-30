import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import { jsPDF } from "jspdf";
import { LOGO_B64 } from "../../../../../lib/logo";

export const runtime="nodejs";
function equal(a,b){const aa=Buffer.from(String(a||"")),bb=Buffer.from(String(b||""));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function token(){const s=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";return s?crypto.createHmac("sha256",s).update("5ta-germania-oficialidad").digest("hex"):""}
async function asset(sql,key){const r=await sql`SELECT data FROM document_assets WHERE key=${key} AND active=true LIMIT 1`;return r?.[0]?.data?Buffer.from(r[0].data).toString("base64"):null}
export async function POST(req){
 const expected=token(),got=req.cookies.get("quinta_oficialidad")?.value;
 if(!expected||!equal(got,expected)) return Response.json({error:"officiality_required"},{status:401});
 if(!process.env.DATABASE_URL) return Response.json({error:"database_not_configured"},{status:503});
 try{
  const b=await req.json(),f=b.form||{},type=b.type||"citacion",signers=b.signers||{},format=b.paperFormat==="legal"?"legal":"letter";
  const sql=neon(process.env.DATABASE_URL),d=new jsPDF({unit:"mm",format});
  const pageH=d.internal.pageSize.getHeight(),bottom=pageH-22,center=d.internal.pageSize.getWidth()/2;let y=35;
  const head=()=>{d.setFillColor(0);d.rect(20,10,68,3,"F");d.rect(122,10,68,3,"F");d.setFillColor(190,0,0);d.rect(20,13,68,3,"F");d.rect(122,13,68,3,"F");d.setFillColor(255,205,0);d.rect(20,16,68,3,"F");d.rect(122,16,68,3,"F");try{d.addImage(LOGO_B64,"PNG",94,7,22,24)}catch{}};
  const addLines=(arr)=>{d.setFont("helvetica","normal");d.setFontSize(10);for(const x of arr){const w=d.splitTextToSize(String(x||""),165);if(y+w.length*5>bottom){d.addPage();head();y=38}d.text(w,22,y);y+=Math.max(5,w.length*5)}};
  head();d.setFont("helvetica","bold");d.setFontSize(12);d.text('Quinta Compañía de Bomberos "Germania" de Villarrica',center,y,{align:"center"});y+=6;d.setFont("helvetica","normal");d.setFontSize(9);d.text("Fundada el 5 de noviembre de 2025",center,y,{align:"center"});y+=13;d.text("Villarrica · "+(f.issueDate||""),190,y,{align:"right"});y+=10;
  const authority=type==="citacion"?"Artículo 92 ter":"Artículo 91 inciso 1°";addLines(["En uso de las atribuciones conferidas por el Reglamento General del Cuerpo de Bomberos de Villarrica, "+authority+", vengo a dictar lo siguiente:"]);d.setFont("helvetica","bold");d.setFontSize(14);d.text("Orden del Día "+String(f.number||"___").padStart(3,"0")+"/"+f.year,center,y,{align:"center"});y+=8;d.setFontSize(11);d.text(f.title||"",center,y,{align:"center",maxWidth:165});y+=12;
  if(type==="citacion")addLines(["Por orden del Capitán de Compañía, cítese a la Quinta Compañía.","","Fecha: "+(f.eventDate||"—")+"   Hora: "+(f.time||"—")+" hrs.","Lugar: "+(f.place||"—"),"Actividad: "+(f.activity||"—"),"Tema: "+(f.topic||"—"),"Vestimenta: "+(f.clothing||"—"),"",f.punctuality||"","Excusas al correo "+(f.excuses||"")]);
  if(type==="guardia"){addLines(["GUARDIA NOCTURNA","",b.guardDate?"Período: "+b.guardDate+(b.guardEndDate?" al "+b.guardEndDate:""):"",f.notes||""]);for(const g of b.guardWeek||[]){addLines(["",g.date+" · OBAC: "+g.obac+" · Conductor: "+g.driver,...(g.people||[]).map(p=>"Voluntario: "+p.name)])}}
  if(type==="nomina"){addLines(["NÓMINA Y CLAVES","",f.notes||""]);for(const p of b.selectedRoster||[])addLines([String(p.clave||"")+" · "+[p.nombre,p.apellidoPaterno||p.ap,p.apellidoMaterno||p.am].filter(Boolean).join(" ")+" · "+(p.cargo||"Voluntario")])}
  if(type==="disposicion")addLines(["VISTOS:",f.seen||"—","","CONSIDERANDO:",f.considering||"—","","SE DISPONE:",f.provisions||"—"]);
  const close=d.splitTextToSize("Tómese razón, distribúyase por medio del correo electrónico institucional, léase y archívese.",165);if(y+close.length*5+55>bottom){d.addPage();head();y=40}d.setFont("helvetica","normal");d.setFontSize(10);d.text(close,22,y);y+=22;
  const officials=b.officials||{},name=p=>[p?.nombre,p?.apellidoPaterno||p?.ap,p?.apellidoMaterno||p?.am].filter(Boolean).join(" ");
  for(const role of ["ayudante","capitan"]){if(!signers[role])continue;const [sig,stamp]=await Promise.all([asset(sql,role+"_firma"),asset(sql,role+"_timbre")]);if(!sig||!stamp)return Response.json({error:"protected_asset_missing"},{status:503});const x=role==="ayudante"?62:148;d.addImage("data:image/png;base64,"+stamp,"PNG",x-12,y-5,24,24);d.addImage("data:image/png;base64,"+sig,"PNG",x-(role==="capitan"?22:17),y-10,role==="capitan"?44:34,0);d.setFont("helvetica","bold");d.setFontSize(9);d.text(name(officials[role])||role.toUpperCase(),x,y+22,{align:"center"});d.setFontSize(7);d.text(role.toUpperCase(),x,y+27,{align:"center"})}
  const pages=d.getNumberOfPages();for(let p=1;p<=pages;p++){d.setPage(p);d.setDrawColor(190);d.line(30,pageH-13,180,pageH-13);d.setFont("helvetica","normal");d.setFontSize(6);d.setTextColor(130);d.text('Quinta Compañía de Bomberos "Germania" de Villarrica',center,pageH-9,{align:"center"});d.text("Valentín Letelier #630 · Villarrica · Chile · germaniacbv@gmail.com",center,pageH-6,{align:"center"})}
  const out=Buffer.from(d.output("arraybuffer"));return new Response(out,{headers:{"Content-Type":"application/pdf","Cache-Control":"no-store"}});
 }catch(e){console.error("ODD protected PDF failed",e);return Response.json({error:"pdf_generation_failed"},{status:500})}
}