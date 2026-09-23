import { NextResponse } from "next/server";
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
export async function POST(req){
  const secret=process.env.OFFICIALITY_PIN;
  if(!secret) return NextResponse.json({ok:false,error:"auth_not_configured"},{status:503});
  const {pin}=await req.json().catch(()=>({}));
  if(!equalSecret(pin,secret)) return NextResponse.json({ok:false},{status:401});
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad",token(secret),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*8});
  return res;
}
export async function GET(req){
  const secret=process.env.OFFICIALITY_PIN;
  if(!secret) return NextResponse.json({ok:false},{status:503});
  const got=req.cookies.get("quinta_oficialidad")?.value;
  return NextResponse.json({ok:equalSecret(got,token(secret))});
}
export async function DELETE(){
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad","",{httpOnly:true,path:"/",maxAge:0});
  return res;
}
