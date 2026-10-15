/* Captura sin conexión B-5. ÚNICA fuente de verdad local: IndexedDB de esta tablet.
 * Nunca se confunde un borrador local con un registro confirmado por Neon.
 */
const DB_NAME="germania-b5-trabajo-v1";
const DB_VERSION=1;
const QUEUE="pendientes";
const DATA="datos";
let opening=null;
export function abrirB5DB(){
  if(typeof indexedDB==="undefined")return Promise.reject(new Error("Esta tablet no tiene almacenamiento local disponible."));
  if(opening)return opening;
  opening=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(QUEUE))db.createObjectStore(QUEUE,{keyPath:"id"});
      if(!db.objectStoreNames.contains(DATA))db.createObjectStore(DATA);
    };
    request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    request.onerror=()=>reject(request.error||new Error("No se pudo abrir el almacenamiento."));
    request.onblocked=()=>reject(new Error("Cierra las otras pestañas de Germania."));
  }).catch(e=>{opening=null;throw e;});
  return opening;
}
async function transact(store,mode,fn){
  const db=await abrirB5DB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,mode),obj=tx.objectStore(store);
    let value;
    try{fn(obj,result=>{value=result;});}catch(e){tx.abort();reject(e);return;}
    tx.oncomplete=()=>resolve(value);
    tx.onerror=()=>reject(tx.error||new Error("No se pudieron guardar los datos en esta tablet."));
    tx.onabort=()=>reject(tx.error||new Error("El guardado local fue cancelado."));
  });
}
export function guardarNómina(nomina){
  const limpia=nomina.filter(p=>p&&p.activo!==false&&p.id).map(p=>({
    id:String(p.id),nombre:String(p.nombre||""),apellidoPaterno:String(p.apellidoPaterno||""),
    apellidoMaterno:String(p.apellidoMaterno||""),clave:String(p.clave||""),
    cargo:String(p.cargo||""),n:Number(p.n||0)
  }));
  return transact(DATA,"readwrite",s=>s.put({actualizada:new Date().toISOString(),lista:limpia},"nomina"));
}
export function leerNómina(){
  return transact(DATA,"readonly",(s,set)=>{const r=s.get("nomina");r.onsuccess=()=>set(r.result||null);});
}
export function guardarEdicion(tipo,datos){
  return transact(DATA,"readwrite",s=>s.put(datos,"edicion:"+tipo));
}
export function leerEdicion(tipo){
  return transact(DATA,"readonly",(s,set)=>{const r=s.get("edicion:"+tipo);r.onsuccess=()=>set(r.result||null);});
}
export function borrarEdicion(tipo){
  return transact(DATA,"readwrite",s=>s.delete("edicion:"+tipo));
}
export async function guardarBorrador(tipo,datos){
  if(!["lista","servicio"].includes(tipo))throw new Error("Tipo no admitido.");
  const id=crypto.randomUUID?crypto.randomUUID():"b5-"+Date.now()+"-"+Math.random().toString(36).slice(2);
  const item={id,tipo,datos,estado:"pendiente",creadoEn:new Date().toISOString(),reintentos:0};
  await transact(QUEUE,"readwrite",s=>{s.add(item);});
  return item;
}
export function listarBorradores(){
  return transact(QUEUE,"readonly",(s,set)=>{const r=s.getAll();r.onsuccess=()=>set(r.result||[]);});
}
export function cambiarBorrador(item){
  return transact(QUEUE,"readwrite",s=>s.put(item));
}
export async function borrarBorradorLocal(id){
  const item=(await listarBorradores()).find(x=>x.id===id);
  if(!item||!["pendiente","revision"].includes(item.estado))
    throw new Error("No se puede borrar de la memoria un registro confirmado en Neon.");
  return transact(QUEUE,"readwrite",s=>{
    const solicitud=s.get(id);
    solicitud.onsuccess=()=>{
      if(!solicitud.result||!["pendiente","revision"].includes(solicitud.result.estado)){
        s.transaction.abort();
        return;
      }
      s.delete(id);
    };
  });
}
export function contarPendientes(items){
  return items.filter(x=>x.estado==="pendiente"||x.estado==="revision").length;
}
let syncing=false;
export async function sincronizarBorradores(onUpdate=()=>{}){
  if(syncing)return {ocupado:true};
  syncing=true;
  try{
    const items=await listarBorradores();
    let enviados=0,revision=0,pendientes=0;
    for(const item of items.filter(x=>x.estado==="pendiente").sort((a,b)=>a.creadoEn.localeCompare(b.creadoEn))){
      if(typeof navigator!=="undefined"&&!navigator.onLine){pendientes++;break;}
      try{
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),12000);
        let response;
        try{
          response=await fetch("/api/b5/offline",{method:"POST",credentials:"same-origin",
            headers:{"Content-Type":"application/json"},body:JSON.stringify(item),signal:controller.signal,cache:"no-store"});
        }finally{clearTimeout(timeout);}
        if(response.status===409){
          const json=await response.json().catch(()=>({}));
          item.estado="revision";item.error=json.error||"Coincide con un registro ya existente";
          await cambiarBorrador(item);revision++;onUpdate();continue;
        }
        if(!response.ok){pendientes++;break;}
        const json=await response.json();
        if(!json?.ok||!json?.confirmado){pendientes++;break;}
        item.estado="sincronizado";item.sincronizadoEn=new Date().toISOString();
        item.numero=json.numero||null;item.error="";
        await cambiarBorrador(item);enviados++;onUpdate();
      }catch(e){pendientes++;break;}
    }
    onUpdate();
    return {enviados,revision,pendientes};
  }finally{syncing=false;}
}
