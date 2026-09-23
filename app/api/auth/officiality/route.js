import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

export const runtime = "nodejs";

function equalSecret(a,b){
  const aa=Buffer.from(String(a||""));
  const bb=Buffer.from(String(b||""));
  return aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
}
function token(secret){
  return crypto.createHmac("sha256",secret).update("5ta-germania-oficialidad").digest("hex");
}
async function activePin(){
  const bootstrap=process.env.OFFICIALITY_PIN;
  if(!bootstrap) return null;
  if(!process.env.DATABASE_URL) return bootstrap;
  try{
    const sql=neon(process.env.DATABASE_URL);
    const rows=await sql`SELECT value FROM app_state WHERE key='security:officiality_pin' LIMIT 1`;
    return rows?.[0]?.value?.pin || bootstrap;
  }catch{
    return bootstrap;
  }
}
export async function POST(req){
  const secret=await activePin();
  const signing=process.env.OFFICIALITY_PIN;
  if(!secret || !signing) return NextResponse.json({ok:false,error:"auth_not_configured"},{status:503});
  const {pin}=await req.json().catch(()=>({}));
  if(!equalSecret(pin,secret)) return NextResponse.json({ok:false},{status:401});
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad",token(signing),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*8});
  return res;
}
export async function GET(req){
  const signing=process.env.OFFICIALITY_PIN;
  if(!signing) return NextResponse.json({ok:false},{status:503});
  const got=req.cookies.get("quinta_oficialidad")?.value;
  return NextResponse.json({ok:equalSecret(got,token(signing))});
}
export async function DELETE(){
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad","",{httpOnly:true,path:"/",maxAge:0});
  return res;
}
