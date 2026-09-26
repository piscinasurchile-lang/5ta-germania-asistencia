import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

export const runtime = "nodejs";

const KEY = "security:officiality_pin";
function equal(a,b){const aa=Buffer.from(String(a||""));const bb=Buffer.from(String(b||""));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function signingSecret(){return process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";}
function token(){return crypto.createHmac("sha256",signingSecret()).update("5ta-germania-oficialidad").digest("hex");}
function hashPin(pin,salt){return crypto.scryptSync(String(pin),salt,64).toString("hex");}
function verifyHash(pin,record){if(!record?.salt||!record?.hash)return false;return equal(hashPin(pin,record.salt),record.hash);}

async function verifyPin(pin){
  const bootstrap=process.env.OFFICIALITY_PIN;
  if(!bootstrap) return false;
  if(process.env.DATABASE_URL){
    try{
      const sql=neon(process.env.DATABASE_URL);
      const rows=await sql`SELECT value FROM app_state WHERE key=${KEY} LIMIT 1`;
      const record=rows?.[0]?.value;
      if(record?.hash&&record?.salt) return verifyHash(pin,record);
      if(record?.pin) return equal(pin,record.pin); // one-time compatibility with earlier format
    }catch(error){console.error("officiality auth DB read failed",error);}
  }
  return equal(pin,bootstrap);
}

export async function POST(req){
  if(!signingSecret()||!process.env.OFFICIALITY_PIN) return NextResponse.json({ok:false,error:"auth_not_configured"},{status:503});
  const {pin}=await req.json().catch(()=>({}));
  if(!await verifyPin(pin)) return NextResponse.json({ok:false},{status:401});
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad",token(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*8});
  return res;
}
export async function GET(req){
  if(!signingSecret()) return NextResponse.json({ok:false},{status:503});
  const got=req.cookies.get("quinta_oficialidad")?.value;
  return NextResponse.json({ok:equal(got,token())});
}
export async function DELETE(){
  const res=NextResponse.json({ok:true});
  res.cookies.set("quinta_oficialidad","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});
  return res;
}
