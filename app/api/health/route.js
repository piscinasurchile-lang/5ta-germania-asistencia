export const runtime="nodejs";
export async function GET(){return Response.json({ok:true,app:"5ta-germania-asistencia",database:!!process.env.DATABASE_URL});}
