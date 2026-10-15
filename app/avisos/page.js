"use client";
import {useEffect,useState} from "react";

function decodeKey(b64){
  const binary=atob(b64.replace(/-/g,"+").replace(/_/g,"/"));
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
async function limpiarPunto(){
  try{await navigator.clearAppBadge?.();}catch{}
  try{
    const reg=await navigator.serviceWorker?.getRegistration?.("/");
    const notas=await reg?.getNotifications?.({tag:"germania-informaciones"})||[];
    notas.forEach(n=>n.close());
  }catch{}
}
export default function ConfiguracionAvisos(){
  const [estado,setEstado]=useState("Comprobando notificaciones…");
  const [habilitado,setHabilitado]=useState(false);
  const [pruebaDisponible,setPruebaDisponible]=useState(false);
  const [ocupado,setOcupado]=useState(false);
  const [soportado,setSoportado]=useState(true);

  useEffect(()=>{
    let vivo=true;
    (async()=>{
      if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){
        if(vivo){setSoportado(false);setEstado("Este navegador no admite Web Push. Instala Germania o abre la app desde Chrome.");}
        return;
      }
      try{
        const config=await fetch("/api/push/suscripcion",{cache:"no-store"}).then(r=>r.json());
        const reg=await navigator.serviceWorker.getRegistration("/");
        const sub=await reg?.pushManager?.getSubscription?.();
        if(!vivo)return;
        setPruebaDisponible(!!config.pruebaDisponible);
        setHabilitado(!!sub&&!!config.disponible);
        setEstado(!config.disponible?"El servicio todavía no está habilitado en esta versión.":sub?"Avisos activados en este dispositivo.":"Avisos todavía no activados en este dispositivo.");
      }catch{if(vivo)setEstado("No se pudo comprobar el estado. Comprueba tu conexión.")}
    })();
    void limpiarPunto();
    return()=>{vivo=false;};
  },[]);

  async function activar(){
    if(ocupado)return;
    setOcupado(true);setEstado("Solicitando permiso a Android o iPhone…");
    try{
      // Pedir autorización inmediatamente tras tocar el botón: algunos
      // navegadores la rechazan si se espera primero una llamada de red.
      const permiso=Notification.permission==="granted"?"granted":await Notification.requestPermission();
      if(permiso!=="granted")throw Error("El teléfono no autorizó las notificaciones.");
      const configResp=await fetch("/api/push/suscripcion",{cache:"no-store"});
      const config=await configResp.json();
      if(!config.disponible||!config.publicKey)throw Error("Web Push todavía no está configurado.");
      const reg=await navigator.serviceWorker.register("/sw.js",{scope:"/"});
      await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(!sub){
        sub=await reg.pushManager.subscribe({
          userVisibleOnly:true,applicationServerKey:decodeKey(config.publicKey)
        });
      }
      const res=await fetch("/api/push/suscripcion",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(sub.toJSON())
      });
      if(!res.ok){
        const e=await res.json().catch(()=>({}));
        throw Error(e.error||"No se pudo registrar este teléfono.");
      }
      setPruebaDisponible(!!config.pruebaDisponible);
      setHabilitado(true);
      setEstado("Avisos activados. Germania podrá notificarte cuando esté cerrada. El punto del ícono depende de tu sistema operativo.");
    }catch(e){setEstado(e?.message||"No se pudo activar. Intenta nuevamente.");}
    finally{setOcupado(false);}
  }
  async function probar(){
    setOcupado(true);setEstado("Enviando prueba solo a este teléfono…");
    try{
      const reg=await navigator.serviceWorker.ready;
      const sub=await reg.pushManager.getSubscription();
      if(!sub)throw Error("Primero activa las notificaciones.");
      const registro=await fetch("/api/push/suscripcion",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(sub.toJSON())
      });
      if(!registro.ok)throw Error("No se pudo confirmar el registro del teléfono. Comprueba la conexión.");
      const res=await fetch("/api/push/prueba",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub.toJSON())
      });
      const respuesta=await res.json();
      if(!res.ok){
        if(res.status===429)throw Error("Ya se solicitó una prueba. Espera "+(respuesta.reintentarEnSegundos||60)+" segundos.");
        if(respuesta.error==="suscripcion_no_registrada")throw Error("No se pudo comprobar el registro. Intenta de nuevo.");
        if(respuesta.estado)throw Error("El proveedor rechazó el aviso (código "+respuesta.estado+").");
        throw Error("El aviso no se pudo enviar. Intenta nuevamente.");
      }
      setEstado("El servidor aceptó el envío de prueba. Cierra Germania y revisa si aparece una notificación del teléfono.");
    }catch(e){setEstado(e?.message||"Prueba fallida. Intenta de nuevo en un minuto.");}
    finally{setOcupado(false);}
  }
  async function desactivar(){
    setOcupado(true);
    try{
      const reg=await navigator.serviceWorker.ready;
      const sub=await reg.pushManager.getSubscription();
      if(sub){
        await fetch("/api/push/suscripcion",{
          method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub.toJSON())
        });
        await sub.unsubscribe();
      }
      await limpiarPunto();
      setHabilitado(false);setEstado("Notificaciones desactivadas en este teléfono.");
    }catch{setEstado("No fue posible desactivar el dispositivo. Intenta nuevamente.");}
    finally{setOcupado(false);}
  }
  return <main style={{fontFamily:"system-ui,sans-serif",background:"#080c0f",minHeight:"100dvh",color:"#fff",padding:"24px 16px 48px"}}>
    <section style={{maxWidth:500,margin:"0 auto"}}>
      <a href="/" style={{color:"#ffcc00",textDecoration:"none",fontSize:14}}>← Volver a Germania</a>
      <h1 style={{fontSize:25,margin:"27px 0 12px",color:"#ffcc00"}}>Avisos de Germania</h1>
      <p style={{fontSize:15,lineHeight:1.6,color:"#d3d9de"}}>Recibe un aviso cuando Oficiales publique una ODD o una información para toda la compañía. El punto sobre el ícono no lleva números.</p>
      <div role="status" aria-live="polite" style={{border:"1px solid #496072",borderRadius:12,padding:"14px",margin:"18px 0 14px",fontSize:14,lineHeight:1.5,background:"#14202a"}}>{estado}</div>
      <button type="button" disabled={ocupado||!soportado||habilitado} onClick={activar}
        style={{width:"100%",minHeight:50,border:"1px solid #ffcc00",borderRadius:9,background:habilitado?"#27362d":"#9e131d",color:"#fff",fontSize:15,fontWeight:700,padding:12,opacity:ocupado?.65:1}}>
        {habilitado?"Avisos activados":"Activar avisos en este teléfono"}</button>
      {habilitado&&pruebaDisponible&&<button type="button" disabled={ocupado} onClick={probar}
        style={{width:"100%",minHeight:48,border:"1px solid #ffcc00",borderRadius:9,background:"#253a4b",color:"#fff",fontWeight:700,marginTop:12,padding:10}}>Enviar aviso de prueba a mi teléfono</button>}
      {habilitado&&<button type="button" disabled={ocupado} onClick={desactivar}
        style={{width:"100%",minHeight:44,border:"1px solid #5d6c73",borderRadius:9,background:"transparent",color:"#ced6dc",marginTop:12}}>Desactivar en este teléfono</button>}
      <p style={{fontSize:13,color:"#aab6bf",lineHeight:1.55,marginTop:24}}>La autorización se realiza una vez por dispositivo. En Android el punto y su color dependen del lanzador; en iPhone, instala Germania en la pantalla de inicio y permite notificaciones. No se registran lecturas ni aperturas de mensajes.</p>
    </section>
  </main>;
}
