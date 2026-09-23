import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

export const runtime = "nodejs";

const KEY="security:officiality_pin";
function equal(a,b){const aa=Buffer.from(String(a||""));const bb=Buffer.from(String(b||""));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function signingSecret(){return process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN||"";}
function token(){return crypto.createHmac("sha256",signingSecret()).update("5ta-germania-oficialidad").digest("hex");}

export async function POST(request){
  if(!signingSecret()||!process.env.DATABASE_URL) return NextResponse.json({ok:false,error:"auth_not_configured"},{status:503});
  const session=request.cookies.get("quinta_oficialidad")?.value;
  if(!session||!equal(session,token())) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});

  const {pin}=await request.json().catch(()=>({}));
  if(!/^\d{4,12}$/.test(String(pin||""))) return NextResponse.json({ok:false,error:"invalid_pin"},{status:400});

  const salt=crypto.randomBytes(16).toString("hex");
  const hash=crypto.scryptSync(String(pin),salt,64).toString("hex");
  const sql=neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO app_state (key,value,updated_at)
    VALUES (${KEY},${JSON.stringify({salt,hash})}::jsonb,now())
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()
  `;
  return NextResponse.json({ok:true});
}
