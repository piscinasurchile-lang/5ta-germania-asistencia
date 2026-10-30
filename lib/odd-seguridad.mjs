import crypto from 'node:crypto';
export const COOKIE_ODD = 'germania_odd_persona';
export const headersPrivados = {'Cache-Control':'private, no-store'};
export function esOficial(request) {
 const secret=process.env.SESSION_SECRET||process.env.OFFICIALITY_PIN;
 const got=request.cookies?.get('quinta_oficialidad')?.value||'';
 if (!secret || !got) return false;
 const expected=crypto.createHmac('sha256',secret).update('5ta-germania-oficialidad').digest('hex');
 const a=Buffer.from(got),b=Buffer.from(expected);
 return a.length===b.length && crypto.timingSafeEqual(a,b);
}
export function mismoOrigen(request) {
 try { return new URL(request.headers.get('origin')).origin === new URL(request.url).origin; } catch { return false; }
}
export function firmarPersona(id,ahora=Date.now()) {
 if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw Error('persona_invalida');
 const secret=process.env.SESSION_SECRET;
 if (!secret) throw Error('sesion_no_configurada');
 const data=Buffer.from(JSON.stringify({id,exp:ahora+30*86400000})).toString('base64url');
 return data+'.'+crypto.createHmac('sha256',secret).update('odd-persona:'+data).digest('hex');
}
export function personaActual(request,ahora=Date.now()) {
 try {
  const [data,sig]=String(request.cookies?.get(COOKIE_ODD)?.value||'').split('.');
  if (!data || !sig || !process.env.SESSION_SECRET) return null;
  const expected=crypto.createHmac('sha256',process.env.SESSION_SECRET).update('odd-persona:'+data).digest('hex');
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if (a.length!==b.length || !crypto.timingSafeEqual(a,b)) return null;
  const p=JSON.parse(Buffer.from(data,'base64url').toString());
  return /^[A-Za-z0-9_-]{1,80}$/.test(p.id) && p.exp>ahora ? p.id : null;
 } catch {return null;}
}
export function verificarEntornoODD() {
 const proyecto=process.env.VERCEL_PROJECT_ID;
 const staging=process.env.GERMANIA_STAGING==='1' && (!proyecto||proyecto==='prj_clXOwlxA6eU7V5My5s4mJXuq8p5e');
 const produccion=process.env.VERCEL_ENV==='production' && process.env.GERMANIA_ODD_ARCHIVO==='1'
  && (!proyecto||proyecto==='prj_Xa8pXpul44oW7FrZhKiJDtGM4x0a');
 if(!staging&&!produccion)throw Error('entorno_odd_no_habilitado');
}
