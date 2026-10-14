"use client";

import {useEffect, useRef, useState} from "react";
import {guardarNómina,listarBorradores,contarPendientes,sincronizarBorradores} from "../../lib/b5-offline-browser.js";

const MODO_KEY="germania:modo-dispositivo:v1";
const FOTO_KEY="germania:b5-foto-dispositivo:v1";
const VOL_KEY="germania:voluntario-dispositivo:v2";

const DESTINOS=[
  {id:"servicio",titulo:"Emergencias B-5",detalle:"Hoja de servicio del carro",color:"#ee5757",simbolo:"🚒"},
  {id:"lista",titulo:"Asistencia",detalle:"Pasar lista",color:"#55a8eb",simbolo:"✓"}
];

function limpiarIdentidadAnterior(){
  try{localStorage.removeItem(VOL_KEY);}catch{}
  document.cookie="germania_voluntario=; Max-Age=0; Path=/; SameSite=Lax";
}

function reducirFoto(file){
  return new Promise((resolve,reject)=>{
    if(!file?.type?.startsWith("image/")){reject(new Error("Selecciona una fotografía."));return;}
    if(file.size>9_000_000){reject(new Error("La foto debe pesar menos de 9 MB."));return;}
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      try{
        const maxWidth=1000,maxHeight=560;
        const escala=Math.min(1,maxWidth/img.width,maxHeight/img.height);
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.width*escala));
        canvas.height=Math.max(1,Math.round(img.height*escala));
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        const webp=canvas.toDataURL("image/webp",0.72);
        const foto=webp.startsWith("data:image/webp")?webp:canvas.toDataURL("image/jpeg",0.7);
        if(foto.length>850_000)throw new Error("No se pudo comprimir la foto. Prueba con otra.");
        resolve(foto);
      }catch(error){reject(error);}
      finally{URL.revokeObjectURL(url);}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("No se pudo leer la fotografía."));};
    img.src=url;
  });
}

export default function TabletB5(){
  const [foto,setFoto]=useState(null);
  const [mensaje,setMensaje]=useState("");
  const [cargandoFoto,setCargandoFoto]=useState(false);
  const [registro,setRegistro]=useState({estado:"comprobando",id:"",error:""});
  const [version,setVersion]=useState(null);
  const [conexion,setConexion]=useState("comprobando");
  const [pendientes,setPendientes]=useState(0);
  const [revision,setRevision]=useState(0);
  const entradaFoto=useRef(null);

  useEffect(()=>{
    // Activar PWA también si la tablet se abre directamente por /b5.
    if("serviceWorker" in navigator && location.protocol==="https:"){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
    try{
      localStorage.setItem(MODO_KEY,"b5");
      setFoto(localStorage.getItem(FOTO_KEY));
    }catch{setMensaje("Este navegador no pudo recordar el modo B-5. Revisa el almacenamiento del equipo.");}
    // La tablet compartida nunca debe atribuir una acción al voluntario anterior.
    limpiarIdentidadAnterior();
  },[]);

  useEffect(()=>{
    let cancelado=false;
    async function reconocerTablet(){
      setRegistro({estado:"comprobando",id:"",error:""});
      try{
        // Primero verificar la instalación ya registrada; no se duplica el alta.
        let respuesta=await fetch("/api/b5/dispositivo",{cache:"no-store",credentials:"same-origin"});
        let datos=await respuesta.json().catch(()=>null);
        if(!respuesta.ok)throw new Error("No se pudo verificar la identificación digital.");
        if(!datos?.registrado){
          respuesta=await fetch("/api/b5/dispositivo",{method:"POST",credentials:"same-origin",cache:"no-store"});
          datos=await respuesta.json().catch(()=>null);
          if(!respuesta.ok)throw new Error(datos?.error==="limite_dispositivos"||datos?.error==="limite_diario"
            ?"El registro de nuevas tablets está temporalmente limitado.":"No se pudo registrar la tablet.");
        }
        if(!cancelado)setRegistro({estado:"registrado",id:datos.id||"",error:""});
      }catch(error){
        if(!cancelado)setRegistro({estado:"error",id:"",error:error?.message||"Sin conexión al registro digital."});
      }
    }
    reconocerTablet();
    return()=>{cancelado=true;};
  },[]);

  useEffect(()=>{
    let activo=true;
    let ocupado=false;
    async function comprobar(){
      if(ocupado||!activo)return;
      ocupado=true;
      try{
        const lista=await listarBorradores();
        if(activo){setPendientes(contarPendientes(lista));setRevision(lista.filter(x=>x.estado==="revision").length);}
        if(!navigator.onLine)throw Error("Sin Internet");
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
        let r;
        try{r=await fetch("/api/b5/dispositivo?ping="+Date.now(),{cache:"no-store",credentials:"same-origin",signal:controller.signal});}
        finally{clearTimeout(timer);}
        if(!r.ok)throw Error("Servidor no disponible");
        if(activo)setConexion("online");
        // Se descarga una copia limitada de la nómina para seguir pasando lista sin Internet.
        try{
          const response=await fetch("/api/state/roster:v8",{cache:"no-store"});
          if(response.ok){
            const json=await response.json();
            if(Array.isArray(json.value)&&json.value.length)await guardarNómina(json.value);
          }
        }catch{}
        await sincronizarBorradores(async()=>{
          const cambios=await listarBorradores();
          if(activo){setPendientes(contarPendientes(cambios));setRevision(cambios.filter(x=>x.estado==="revision").length);}
        });
      }catch{
        if(activo)setConexion("offline");
      }finally{ocupado=false;}
    }
    comprobar();
    const interval=setInterval(comprobar,18000);
    window.addEventListener("online",comprobar);
    window.addEventListener("offline",comprobar);
    const vis=()=>{if(document.visibilityState==="visible")comprobar();};
    document.addEventListener("visibilitychange",vis);
    return()=>{
      activo=false;clearInterval(interval);
      window.removeEventListener("online",comprobar);
      window.removeEventListener("offline",comprobar);
      document.removeEventListener("visibilitychange",vis);
    };
  },[]);

  useEffect(()=>{
    let activa=true;
    async function revisarVersion(){
      if(document.visibilityState!=="visible")return;
      try{
        const respuesta=await fetch("/version.json?t="+Date.now(),{cache:"no-store"});
        if(!respuesta.ok)return;
        const dato=await respuesta.json();
        if(!activa||!dato.version)return;
        setVersion(anterior=>{
          if(anterior&&anterior!==dato.version&&!cargandoFoto)window.location.reload();
          return dato.version;
        });
      }catch{}
    }
    revisarVersion();
    const intervalo=setInterval(revisarVersion,30000);
    return()=>{activa=false;clearInterval(intervalo);};
  },[cargandoFoto]);

  async function actualizarFoto(event){
    const archivo=event.target.files?.[0];
    if(!archivo)return;
    setCargandoFoto(true);
    setMensaje("");
    try{
      const nueva=await reducirFoto(archivo);
      localStorage.setItem(FOTO_KEY,nueva);
      setFoto(nueva);
      setMensaje("Foto del carro guardada en esta tablet.");
    }catch(error){setMensaje(error?.message||"No se pudo guardar la foto.");}
    finally{
      setCargandoFoto(false);
      event.target.value="";
    }
  }

  function irA(destino){
    limpiarIdentidadAnterior();
    // Captura local en los DOS accesos de esta tablet. El resto de Germania
    // conserva su navegación y persistencia central originales.
    window.location.assign("/b5/captura?tipo="+encodeURIComponent(destino));
  }

  function salir(){
    try{localStorage.removeItem(MODO_KEY);}catch{}
    // Al salir voluntariamente no volver a abrir B-5 solo por la cookie de registro.
    document.cookie="germania_b5_registrado=; Max-Age=0; Path=/; SameSite=Lax";
    limpiarIdentidadAnterior();
    window.location.assign("/");
  }

  return (
    <main className="b5">
      <header className="top">
        <img src="/legacy/germania-icon.svg" width="52" height="52" alt="Escudo Germania"/>
        <div><h1>GERMANIA VILLARRICA</h1><p>TABLET OPERATIVA · B-5</p></div>
      </header>

      <section className="panel" aria-labelledby="b5Titulo">
        <div className="head">
          <h2 id="b5Titulo">Unidad B-5</h2>
          <span className="deviceTag">Modo tablet</span>
        </div>

        <div className="photoArea">
          <img
            className="carPhoto"
            src={foto || "/legacy/carro-b5.webp"}
            alt="Fotografía del carro B-5 de la Quinta Compañía Germania junto al lago"
          />
        </div>
        <input ref={entradaFoto} type="file" accept="image/*" onChange={actualizarFoto} hidden aria-label="Elegir fotografía del B-5"/>
        <button className="photoButton" disabled={cargandoFoto} onClick={()=>entradaFoto.current?.click()}>
          {cargandoFoto?"Preparando fotografía…":foto?"Cambiar foto del carro":"Personalizar foto en esta tablet"}
        </button>

        <div className={"conexion "+(conexion==="online"?"conectado":"desconectado")} role="status">
          <strong>{conexion==="online"?(pendientes?"EN LÍNEA · Sincronizando pendientes":"EN LÍNEA · Sincronizado")
            :conexion==="offline"?"SIN CONEXIÓN · Tomando datos en esta tablet"
            :"COMPROBANDO CONEXIÓN…"}</strong>
          <small>{conexion==="online"
            ?"Los registros locales se envían solos al recuperar Internet."
            :"Los datos se guardan aquí. Se enviarán automáticamente cuando vuelva Internet."}</small>
          {!!pendientes&&<small>{pendientes} registros pendientes · {revision} para revisión</small>}
        </div>
        <div className="actions" aria-label="Funciones de la tablet B-5">
          {DESTINOS.map(x=>
            <button key={x.id} className="action" style={{"--accent":x.color}} onClick={()=>irA(x.id)}>
              <span className="symbol" aria-hidden="true">{x.simbolo}</span>
              <strong>{x.titulo}</strong>
              <small>{x.detalle}</small>
            </button>
          )}
        </div>
        <p className="note">Los registros de la unidad B-5 y de asistencia continúan guardándose en Germania.</p>
        <p className="deviceStatus" role="status">
          {registro.estado==="registrado"?"Identificación digital registrada · B-5 #"+registro.id
            :registro.estado==="comprobando"?"Reconociendo esta tablet…"
            :"Registro digital pendiente · "+registro.error}
        </p>
        {mensaje&&<p className="message" role="status">{mensaje}</p>}
      </section>

      <footer className="foot">
        <button className="exit" onClick={salir}>Cambiar a modo voluntario</button>
        <span>Quinta Compañía Germania · Villarrica</span>
      </footer>
      <style>{`
        *{box-sizing:border-box}
        html,body{margin:0;background:#070e15}
        .b5{min-height:100dvh;background:#070e15;color:#fff;
          font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:18px 22px 30px}
        .top{display:flex;align-items:center;gap:15px;max-width:990px;margin:0 auto 20px}
        .top img{object-fit:contain;flex-shrink:0}
        .top h1{font-size:clamp(18px,2.6vw,26px);letter-spacing:.04em;margin:0}
        .top p{font-weight:700;color:#f3cb5a;font-size:14px;margin:4px 0}
        .panel{background:#101b27;border:1px solid #293747;border-radius:20px;
          padding:clamp(16px,2.5vw,26px);max-width:990px;margin:0 auto}
        .head{display:flex;gap:10px;justify-content:space-between;align-items:center}
        .head h2{font-size:clamp(21px,3vw,30px);margin:0 0 15px}
        .deviceTag{background:#213342;color:#c9dae7;border-radius:99px;padding:6px 10px;font-size:12px}
        .photoArea{height:clamp(180px,37vh,330px);overflow:hidden;border-radius:13px;background:#192938}
        .carPhoto{width:100%;height:100%;object-fit:contain}
        .placeholder{height:100%;display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:10px;color:#e4edf2}
        .placeholder img{object-fit:contain}
        .placeholder strong{font-size:24px}
        .placeholder small{color:#a8bac7;text-align:center}
        button{font-family:inherit;cursor:pointer;touch-action:manipulation}
        button:focus-visible{outline:3px solid #ffda6c;outline-offset:2px}
        .photoButton{display:block;margin:11px auto 20px;background:#192a38;
          border:1px solid #506476;padding:8px 16px;border-radius:8px;color:#d4e4ed;font-size:13px}
        .photoButton:disabled{opacity:.65;cursor:wait}
        .conexion{padding:13px 16px;border-radius:11px;margin:0 0 16px;display:grid;gap:4px}
        .conexion strong{font-size:15px}.conexion small{font-size:12px;line-height:1.45}
        .conexion.conectado{background:#153329;border:2px solid #58a686}
        .conexion.desconectado{background:#51320b;border:2px solid #ffbd4d}
        .actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .action{min-height:124px;display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:7px;border:2px solid var(--accent);background:#1b2c3d;
          color:#fff;border-radius:14px;padding:12px 8px;transition:background .15s}
        .action:active{background:#34485c}
        .action .symbol{font-size:27px;color:var(--accent);font-weight:800}
        .action strong{font-size:clamp(14px,2.1vw,21px);text-align:center;line-height:1.1}
        .action small{color:#c1d0dc;font-size:12px;text-align:center}
        .note{color:#bacbd8;font-size:13px;line-height:1.5;margin:16px 1px 0}
        .deviceStatus{color:#a9c3d6;font-size:12px;line-height:1.4;margin:8px 1px 0}
        .message{font-size:13px;color:#ffdd73}
        .foot{max-width:990px;margin:19px auto 0;display:flex;gap:16px;
          justify-content:space-between;align-items:center;flex-wrap:wrap;color:#9db3c5;font-size:12px}
        .exit{background:#15212d;border:1px solid #566474;color:#e6edf4;
          border-radius:9px;padding:12px 16px;font-weight:700}
        @media(max-width:620px){
          .b5{padding:12px 12px 24px}
          .top{gap:10px}
          .top img{width:43px;height:43px}
          .actions{gap:8px}
          .action{min-height:116px;padding:8px 4px}
          .action strong{font-size:13px}
          .action small{font-size:10px}
          .action .symbol{font-size:24px}
          .deviceTag{font-size:10px}
        }
      `}</style>
    </main>
  );
}
