/* El modo sin conexión solo precarga la pantalla B-5.
 * El resto de Germania mantiene navegación en línea y jamás cachea /api/.
 */
const CACHE="germania-static-v11-b5";
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
  // Nunca servir una versión de despliegue desde caché, aunque el cliente pida no-store.
  if(url.pathname==="/version.json")return;
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


/* Avisos por Web Push; el sistema operativo decide si dibuja el punto rojo.
 * Nunca mostramos contadores ni guardamos lectura o identidad. */
const GERMANIA_PUSH_TAG="germania-informaciones";
self.addEventListener("push",event=>{
  let mensaje;
  try{mensaje=event.data?.json();}catch{}
  if(!mensaje||mensaje.tipo!=="germania-informacion")return;
  event.waitUntil((async()=>{
    try{await self.navigator?.setAppBadge?.();}catch{}
    const prueba=mensaje.clase==="prueba";
    const title=prueba?"GERMANIA · PRUEBA":mensaje.clase==="odd"?"GERMANIA · Nueva ODD":"GERMANIA · Información";
    await self.registration.showNotification(title,{
      body:String(mensaje.titulo||"Abre Germania para revisar las informaciones.").slice(0,160),
      icon:"/legacy/germania-192.png",badge:"/legacy/favicon-64.png",
      tag:GERMANIA_PUSH_TAG,data:{url:"/"}
    });
  })());
});
self.addEventListener("notificationclick",event=>{
  if(event.notification?.tag!==GERMANIA_PUSH_TAG)return;
  event.notification.close();
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    const actual=windows.find(w=>{try{return new URL(w.url).origin===self.location.origin;}catch{return false;}});
    if(actual){
      try{if(typeof actual.navigate==="function")await actual.navigate("/");}catch{}
      return actual.focus();
    }
    return self.clients.openWindow("/");
  })());
});
