"use client";

import { useEffect, useRef, useState } from "react";

/* Pantalla de espera: la portada de la Compañía, completa (sin recortar sus textos), con el mensaje
   de estado encima. Se usa mientras se decide el modo del dispositivo y mientras carga la aplicación. */
function Portada({ visible = true, children }) {
  return (
    <div role="status" aria-live="polite" style={{ position: "absolute", inset: 0, zIndex: 10, background: "#020202", opacity: visible ? 1 : 0, transition: "opacity .4s ease", pointerEvents: visible ? "auto" : "none", fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: "min(100vw, calc(100dvh * 0.6))", aspectRatio: "960 / 1600" }}>
          <img src="/legacy/portada-germania.webp?v=1" alt="Quinta Compañía Germania · Honor y sacrificio" decoding="async" fetchPriority="high" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
          {/* El mensaje va en la zona de humo, debajo de los bomberos, sin tapar el lema ni los logos. */}
          <div style={{ position: "absolute", left: "5%", right: "5%", top: "76%", transform: "translateY(-50%)", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: 420, padding: "10px 16px", borderRadius: 14, background: "rgba(0,0,0,.62)", color: "#fff", textAlign: "center" }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [portadaViva, setPortadaViva] = useState(true);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [updating, setUpdating] = useState(false);
  const versionRef = useRef(null);
  const reintentoAuto = useRef(false);
  const [inicioB5Comprobado, setInicioB5Comprobado] = useState(false);
  const [destinoB5, setDestinoB5] = useState("");

  // El badge se limpia al abrir o regresar a la PWA, sin acuses de lectura.
  useEffect(() => {
    const limpiar = async () => {
      // El módulo ODD recalcula su contador al cargar y confirmar lecturas.
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration("/");
        const avisos = await reg?.getNotifications?.({tag:"germania-informaciones"}) || [];
        avisos.forEach(aviso => aviso.close());
      } catch {}
    };
    const alVolver = () => {if(document.visibilityState==="visible")void limpiar();};
    void limpiar();
    window.addEventListener("focus",limpiar);
    document.addEventListener("visibilitychange",alVolver);
    return () => {
      window.removeEventListener("focus",limpiar);
      document.removeEventListener("visibilitychange",alVolver);
    };
  }, []);

  // Modo B-5 solo en el dispositivo que se seleccionó: evitar cargar el iframe
  // completo antes de mostrar la pantalla ligera.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const solicitado = params.get("b5dest") || "";
    const destino = ["lista", "servicio"].includes(solicitado) ? solicitado : "";
    setDestinoB5(destino);
    let modo = null;
    try { modo = localStorage.getItem("germania:modo-dispositivo:v1"); } catch {}
    if (modo === "b5" && !destino) {
      window.location.replace("/b5");
      return;
    }
    // Recuperación si se perdió localStorage, pero la cookie de identificación
    // y el marcador de esta instalación siguen presentes. Ninguna consulta extra
    // en teléfonos de voluntarios que no tienen el marcador B-5.
    const marcador = document.cookie.split(";").some(x => x.trim() === "germania_b5_registrado=1");
    if (!destino && marcador) {
      fetch("/api/b5/dispositivo", {cache:"no-store",credentials:"same-origin"})
        .then(x => x.ok ? x.json() : null)
        .then(d => {
          if (d?.registrado) {
            try { localStorage.setItem("germania:modo-dispositivo:v1", "b5"); } catch {}
            window.location.replace("/b5");
          } else setInicioB5Comprobado(true);
        })
        .catch(() => setInicioB5Comprobado(true));
      return;
    }
    setInicioB5Comprobado(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      const register = () => navigator.serviceWorker.register("./sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
    return () => clearTimeout(timer);
  }, [frameKey]);

  useEffect(() => {
    const checkVersion = async () => {
      if (document.visibilityState !== "visible" || updating) return;
      try {
        const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!versionRef.current) { versionRef.current = data.version; return; }
        if (data.version !== versionRef.current) {
          const doc = frameRef.current?.contentDocument;
          const editing = !!doc?.querySelector("input:focus,textarea:focus,select:focus");
          if (editing) return;
          versionRef.current = data.version;
          setUpdating(true);
          setReady(false);
          setTimeout(() => { setFrameKey(k => k + 1); setUpdating(false); }, 900);
        }
      } catch {}
    };
    const timer = setInterval(checkVersion, 15000);
    document.addEventListener("visibilitychange", checkVersion);
    checkVersion();
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", checkVersion); };
  }, [updating]);

  const onFrameLoad = () => {
    const frame = frameRef.current;
    if (!frame) return;
    let doc, win;
    try {
      doc = frame.contentDocument;
      win = frame.contentWindow;
      if (!doc || !win) throw new Error("iframe no disponible");
    } catch {
      setReady(true);
      return;
    }

    // Únicamente cuando se navega desde Tablet B-5: Inicio siempre regresa
    // al panel propio /b5 y nunca muestra el dashboard normal de voluntarios.
    const esModuloB5 = destinoB5 === "lista" || destinoB5 === "servicio";
    if (esModuloB5 && !doc.__b5InicioInterceptado) {
      doc.__b5InicioInterceptado = true;
      doc.addEventListener("click", (event) => {
        const objetivo = event.target?.closest?.(
          '[data-go="germania"], [data-tab="germania"], [data-nav="germania"], a[href="/"]'
        );
        if (!objetivo) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign("/b5");
      }, true);
    }

    const abrirModuloB5 = () => {
      if (!esModuloB5 || typeof win.__mostrarPestana !== "function") return;
      win.__mostrarPestana(destinoB5);
      // Protege también las llamadas programáticas a "Inicio" en el modo B-5.
      if (!win.__b5InicioEnrutado) {
        const mostrarNormal = win.__mostrarPestana;
        win.__mostrarPestana = function(nombre, ...args) {
          if (nombre === "germania") {
            window.location.assign("/b5");
            return;
          }
          return mostrarNormal.call(this, nombre, ...args);
        };
        win.__b5InicioEnrutado = true;
      }
    };

    const style = doc.createElement("style");
    style.textContent = `
      html,body{width:100%!important;min-height:100%!important;overflow-x:hidden!important}
      .wrap{max-width:none!important;width:100%!important;margin:0!important;padding:16px 18px 76px!important}
      .masthead{width:100%!important}
      #testModeBanner{left:12px!important;right:12px!important;bottom:12px!important;max-width:none!important}
      @media (min-width:700px){
        .home-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
        .card{width:100%!important}
      }
    `;
    if (esModuloB5) {
      // En la tablet operativa no exponer accesos a Oficiales u otras pantallas.
      // No altera ni esconde estos controles en celulares de voluntarios.
      style.textContent += `
        #menuToggle,#mobileMenu,[data-go="config"],[data-tab="config"],.solo-oficiales{display:none!important}
        #gBottomNav button[data-nav]:not([data-nav="germania"]){display:none!important}
      `;
    }
    doc.head.appendChild(style);

    // La Minuta de Disponibilidad se renderiza únicamente en legacy/app.js.
    const loading = () => doc.getElementById("appLoading");
    const isLoaded = () => {
      const el = loading();
      return !el || el.classList.contains("hidden") || win.getComputedStyle(el).display === "none";
    };

    // La aplicación «arrancó» cuando su primer paso ya pintó el escudo. Si el archivo principal
    // no llegó o falló, la pantalla quedaría vacía (sin nombres ni datos) aunque el aviso de carga
    // ya se haya ocultado: en ese caso NO se libera la interfaz; se reintenta una vez y luego se
    // muestra «Reintentar».
    const iniciada = () => {
      try { return !!frame.contentDocument?.getElementById("crestImg")?.getAttribute("src"); }
      catch { return true; }
    };

    // Usar tiempo real: algunas tablets Android reducen la frecuencia de
    // setInterval y un contador por "ticks" puede tardar 4x o más.
    const startedAt = Date.now();
    let recoveryStarted = false;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (isLoaded()) {
        clearInterval(interval);
        reintentoAuto.current = false;
        abrirModuloB5();
        setReady(true);
        setFailed(false);
        return;
      }

      // A los 6 s liberamos primero la interfaz. La recuperación secundaria
      // corre después y nunca puede dejar el cargador esperando una petición.
      if (elapsed >= 9000 && !recoveryStarted && !iniciada() && !reintentoAuto.current) {
        reintentoAuto.current = true;
        clearInterval(interval);
        setSlow(false);
        setFrameKey(k => k + 1);
        return;
      }

      if (elapsed >= 6000 && !recoveryStarted && iniciada()) {
        recoveryStarted = true;
        loading()?.classList.add("hidden");
        abrirModuloB5();
        setReady(true);
        setFailed(false);
        // El inicio de legacy/app.js ya realiza estas cargas. No repetirlas
        // desde el contenedor: en conexiones lentas duplicaban lecturas y
        // renderizados mientras la inicialización original seguía en curso.
        // La recuperación aquí solo libera la máscara visual; no escribe datos.
      }

      if (elapsed >= 12000) {
        clearInterval(interval);
        if (!recoveryStarted && !isLoaded()) setFailed(true);
      }
    }, 250);
  };

  // La portada se desvanece al estar lista la app y luego se retira; si se reintenta, vuelve.
  useEffect(() => {
    if (!ready) { setPortadaViva(true); return; }
    const t = setTimeout(() => setPortadaViva(false), 450);
    return () => clearTimeout(t);
  }, [ready]);

  const retry = () => {
    setReady(false);
    setFailed(false);
    setSlow(false);
    setFrameKey(k => k + 1);
  };

  if (!inicioB5Comprobado) {
    return <main style={{ margin: 0, width: "100vw", height: "100dvh", overflow: "hidden", background: "#020202", position: "relative" }}><Portada><div style={{ fontSize: 17, fontWeight: 700 }}>Abriendo Germania…</div></Portada></main>;
  }

  return (
    <main style={{ margin: 0, width: "100vw", height: "100dvh", overflow: "hidden", background: "#07090b", position: "relative" }}>
      {destinoB5 && <div style={{height:48,background:"#152332",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",fontFamily:"system-ui",fontSize:14}}>
        <strong>GERMANIA · B-5</strong>
        <button type="button" onClick={() => window.location.assign("/b5")} style={{minHeight:34,padding:"6px 13px",color:"#fff",background:"#263a4b",border:"1px solid #516579",borderRadius:8,fontWeight:700}}>Volver a B-5</button>
      </div>}
      {portadaViva && (
        <Portada visible={!ready}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{updating ? "Actualizando GERMANIA…" : "Estamos cargando tu información…"}</div>
          <div style={{ marginTop: 4, color: "#e0e0e0", fontSize: 14 }}>{updating ? "Hay una nueva versión. Se aplicará automáticamente." : failed ? "No pudimos completar la carga." : slow ? "La conexión está tardando. Dame unos segundos." : "Dame unos segundos."}</div>
          {failed && <button type="button" onClick={retry} style={{ marginTop: 12, minHeight: 44, padding: "11px 18px", borderRadius: 8, border: "1px solid #ffcc00", background: "#171d22", color: "#fff", fontWeight: 700 }}>Reintentar</button>}
        </Portada>
      )}
      <iframe
        key={frameKey}
        ref={frameRef}
        title="GERMANIA · Quinta Compañía"
        src={`/legacy/index.html?v=20261001-2&reload=${frameKey}`}
        onLoad={onFrameLoad}
        style={{ border: 0, width: "100vw", height: destinoB5 ? "calc(100dvh - 48px)" : "100dvh", display: "block", background: "#07090b" }}
      />
    </main>
  );
}

