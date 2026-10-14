/* El modo sin conexión solo precarga la pantalla B-5.
 * El resto de Germania mantiene navegación en línea y jamás cachea /api/.
 */
const CACHE="germania-static-v7-b5";
const ASSETS=["/manifest.webmanifest","/legacy/germania-icon.svg","/legacy/germania-192.png",
  "/legacy/germania-512.png","/legacy/apple-touch-icon.png","/legacy/carro-b5.webp"];
const B5_PAGES=["/b5","/b5/captura"];
const isStatic=url=>url.pathname.startsWith("/_next/static/") ||
  ASSETS.includes(url.pathname);

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ASSETS);
    // Precargar la pantalla del carro, formularios y módulos JS/CSS de Next.
    // Al perder Internet, la tablet necesita más que solamente el HTML.
    const modules=new Set();
    for(const page of B5_PAGES){
      try{
        const r=await fetch(page,{cache:"no-store"});
        if(!r.ok)continue;
        await cache.put(page,r.clone());
        const html=await r.text();
        const matches=html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g);
        for(const m of matches)modules.add(m[1].replaceAll("&amp;","&"));
      }catch(e){}
    }
    await Promise.allSettled([...modules].map(x=>cache.add(x)));
    self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(x=>x.startsWith("germania-static-")&&x!==CACHE).map(x=>caches.delete(x)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
  if(isStatic(url)){
    event.respondWith(caches.match(req).then(async cached=>{
      if(cached)return cached;
      const r=await fetch(req);
      if(r.ok){const cache=await caches.open(CACHE);await cache.put(req,r.clone());}
      return r;
    }));
    return;
  }
  if(url.pathname==="/b5"||url.pathname==="/b5/captura"){
    event.respondWith((async()=>{
      try{
        const r=await fetch(req,{cache:"no-store"});
        if(r.ok&&!url.searchParams.has("_rsc")){
          const cache=await caches.open(CACHE);
          await cache.put(url.pathname,r.clone());
        }
        return r;
      }catch(e){
        // Un GET /b5/captura?tipo=servicio usa el mismo documento precargado.
        const cache=await caches.open(CACHE);
        const r=await cache.match(url.pathname);
        if(r)return r;
        return Response.error();
      }
    })());
    return;
  }
  // No cambiar la política en línea de otras pantallas y guardar resultados.
  const dynamic=req.mode==="navigate"||url.pathname.endsWith(".html")||
    url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname==="/";
  if(dynamic){event.respondWith(fetch(req,{cache:"no-store"}));return;}
  event.respondWith(caches.match(req).then(async cached=>{
    if(cached)return cached;
    const response=await fetch(req);
    if(response.ok){
      const cache=await caches.open(CACHE);
      await cache.put(req,response.clone());
    }
    return response;
  }));
});
