import { neon } from "@neondatabase/serverless";
export const runtime="nodejs";
const db=()=>neon(process.env.DATABASE_URL);
const valid=k=>/^[a-zA-Z0-9:_-]{1,100}$/.test(k);
export async function GET(_req,{params}){const {key}=await params;if(!valid(key))return Response.json({error:"invalid key"},{status:400});const rows=await db().query("select value from app_state where key = $1",[key]);return Response.json({value:rows[0]?.value??null});}
export async function PUT(req,{params}){const {key}=await params;if(!valid(key))return Response.json({error:"invalid key"},{status:400});const {value}=await req.json();await db().query("insert into app_state(key,value,updated_at) values($1,$2::jsonb,now()) on conflict(key) do update set value=excluded.value,updated_at=now()",[key,JSON.stringify(value)]);return Response.json({ok:true});}
