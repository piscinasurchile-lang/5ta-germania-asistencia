"use client";

import { useState } from "react";
import PruebaNotificacion, { limpiarAvisosLocales } from "./PruebaNotificacion";

const DEMO = "PRUEBA GERMANIA — Aviso de prueba. No corresponde a una emergencia ni a una ODD oficial.";

export default function DemoAvisosPage() {
  const [pantalla, setPantalla] = useState("telefono");
  const [pendiente, setPendiente] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [paso, setPaso] = useState(0);

  function publicar() {
    const ahora = new Date();
    setMensajes((anteriores) => [
      { id: ahora.getTime(), texto: DEMO, fecha: ahora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) },
      ...anteriores,
    ].slice(0, 5));
    setPendiente(true);
    setPantalla("telefono");
    setPaso((anterior) => anterior + 1);
  }

  function abrir() {
    setPantalla("germania");
    setPendiente(false);
    void limpiarAvisosLocales();
  }

  function volver() {
    setPantalla("telefono");
  }

  return (
    <main className="demo">
      <header className="cabecera">
        <div className="marca">
          <img src="/legacy/germania-192.png" width="45" height="45" alt="Escudo de Germania" />
          <div>
            <strong>GERMANIA · VISTA DE PRUEBA</strong>
            <span>Quinta Compañía · Villarrica</span>
          </div>
        </div>
        <a href="/" className="enlace">Abrir app de prueba <span aria-hidden="true">↗</span></a>
      </header>

      <section className="introduccion">
        <div className="etiqueta">DEMOSTRACIÓN INTERACTIVA · SIN ENVÍOS REALES</div>
        <h1>Así funcionará el aviso en el ícono de Germania</h1>
        <p>Simula una publicación, observa el punto sobre el ícono y abre Germania. El punto desaparece automáticamente sin registrar lecturas.</p>
      </section>

      <div className="zona">
        <section className="telefono" aria-label="Simulación visual de teléfono móvil">
          <div className="camara" aria-hidden="true" />
          <div className="pantalla">
            {pantalla === "telefono" ? (
              <div className="inicio-telefono">
                <div className="barra-sistema"><span>18:19</span><span>●●● ▰</span></div>
                <div className="fecha"><span>Jueves 15 de octubre</span><strong>18:19</strong></div>
                <div className="aplicaciones">
                  <button type="button" onClick={abrir} className="icono-app" aria-label={pendiente ? "Abrir Germania con una información nueva" : "Abrir Germania"}>
                    <div className="cuadro-icono">
                      <img src="/legacy/germania-192.png" alt="" width="78" height="78" />
                      {pendiente && <span className="punto" aria-label="Hay un aviso nuevo" />}
                    </div>
                    <span>Germania</span>
                  </button>
                  <div className="icono-falso" aria-hidden="true"><div>✉</div><span>Correo</span></div>
                  <div className="icono-falso" aria-hidden="true"><div>▦</div><span>Calendario</span></div>
                </div>
                {pendiente && (
                  <div className="notificacion">
                    <div className="titulo-notificacion"><img src="/legacy/germania-192.png" width="25" height="25" alt="" /><b>GERMANIA</b><small>ahora</small></div>
                    <strong>Nueva información</strong>
                    <p>Abre Germania para revisar las informaciones.</p>
                  </div>
                )}
                <div className="base-telefono" aria-hidden="true"><span /><span /><span /></div>
              </div>
            ) : (
              <div className="interior-app">
                <div className="barra-sistema oscura"><span>18:19</span><span>●●● ▰</span></div>
                <div className="header-germania">
                  <img src="/legacy/germania-192.png" alt="" width="58" height="58" />
                  <strong>Quinta Compañía<br />Germania</strong>
                  <small>Cuerpo de Bomberos de Villarrica</small>
                </div>
                <div className="contenido-germania">
                  <div className="usuario"><div className="avatar">GV</div><div><b>Voluntario</b><small>Pantalla de demostración</small></div></div>
                  <div className="modulo">
                    <div className="titulo-modulo"><span className="indicador">i</span><b>INFORMACIONES</b></div>
                    <p>Avisos de la oficialidad para los voluntarios</p>
                    {mensajes.length ? mensajes.map((m) => (
                      <article key={m.id} className="mensaje">
                        <small>HOY · {m.fecha}</small>
                        <strong>{m.texto}</strong>
                      </article>
                    )) : <div className="sin-avisos">Sin informaciones por ahora.</div>}
                  </div>
                  <div className="pie-app">Sin botones de «Leído» ni confirmaciones.</div>
                </div>
                <button type="button" className="cerrar" onClick={volver}>Volver a pantalla de inicio</button>
              </div>
            )}
          </div>
          <div className="barra-inferior" aria-hidden="true" />
        </section>

        <aside className="controles">
          <h2>Prueba el funcionamiento</h2>
          <div className="paso"><span>1</span><div><strong>Publicar una información</strong><p>Se simula que un oficial envía un comunicado a toda la compañía.</p></div></div>
          <button type="button" onClick={publicar} className="principal">Simular publicación de aviso</button>
          <div className="paso"><span>2</span><div><strong>Ver el punto sobre el ícono</strong><p>En la pantalla del teléfono aparecerá una señal sin número.</p></div></div>
          <button type="button" onClick={volver} className="secundario">Ver pantalla del teléfono</button>
          <div className="paso"><span>3</span><div><strong>Abrir Germania</strong><p>Al entrar, desaparece el punto; la información permanece dentro de la aplicación.</p></div></div>
          <button type="button" onClick={abrir} className="secundario">Abrir Germania</button>
          <div role="status" className="estado">
            <b>{pendiente ? "Aviso pendiente en el ícono" : mensajes.length ? "Aviso limpiado automáticamente" : "Esperando publicación de prueba"}</b>
            <span>{paso ? `Publicaciones simuladas: ${paso}. ` : ""}No se guardan ni transmiten datos.</span>
          </div>
          <PruebaNotificacion />
          <p className="aclaracion">Esta página muestra el diseño de manera interactiva. No modifica la app oficial, no envía Web Push y no contacta a voluntarios. El aspecto exacto de los distintivos lo controla cada teléfono.</p>
        </aside>
      </div>
      <style jsx>{`
        *{box-sizing:border-box}
        .demo{min-height:100dvh;background:linear-gradient(160deg,#0b1118,#19252d 55%,#0e1115);color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;padding-bottom:44px}
        .cabecera{height:auto;min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid #34404b;padding:14px max(18px,calc((100vw - 1160px)/2))}
        .marca{display:flex;align-items:center;gap:12px}.marca img{object-fit:contain}.marca strong{display:block;font-size:14px;letter-spacing:.03em}.marca span{display:block;font-size:12px;color:#c0c8cf;margin-top:3px}
        .enlace{font-size:13px;color:#ffe082;text-decoration:none;padding:10px 12px;border:1px solid #716029;border-radius:8px}
        .introduccion{max-width:1020px;margin:28px auto 30px;padding:0 22px;text-align:center}.etiqueta{font-size:11px;letter-spacing:.09em;color:#fde68a;font-weight:700}
        h1{font-size:clamp(24px,4vw,36px);max-width:730px;margin:12px auto;line-height:1.2}.introduccion p{color:#bcc6cf;max-width:690px;margin:0 auto;font-size:15px;line-height:1.55}
        .zona{max-width:970px;padding:0 20px;margin:0 auto;display:grid;grid-template-columns:minmax(290px,370px) minmax(300px,1fr);align-items:center;gap:50px}
        .telefono{width:min(100%,340px);height:665px;margin:auto;border:8px solid #4b555d;border-radius:42px;background:#090c10;padding:9px;box-shadow:0 25px 70px #0009,inset 0 0 0 2px #101b24;position:relative}
        .camara{width:85px;height:17px;border-radius:0 0 14px 14px;background:#090c10;position:absolute;left:50%;top:7px;z-index:3;transform:translateX(-50%)}
        .pantalla{overflow:hidden;height:100%;border-radius:29px;background:#e8e9e5}
        .inicio-telefono{position:relative;height:100%;background:linear-gradient(155deg,#163a4f,#224c6e 35%,#612f3a 90%);color:#fff}
        .barra-sistema{display:flex;justify-content:space-between;padding:15px 22px 0;font-size:12px;font-weight:700}
        .fecha{text-align:center;margin-top:38px}.fecha span{display:block;font-size:14px}.fecha strong{display:block;font-size:53px;letter-spacing:-.05em;line-height:1.2}
        .aplicaciones{display:flex;gap:25px;padding:0 22px;position:absolute;top:270px;left:0;right:0}
        .icono-app{appearance:none;background:transparent;border:0;color:#fff;cursor:pointer;display:flex;flex-direction:column;gap:8px;align-items:center;font:12px system-ui}
        .cuadro-icono{position:relative;width:78px;height:78px;border-radius:18px;background:#131719;border:1px solid #92805c;display:grid;place-items:center;box-shadow:0 4px 10px #0005}.cuadro-icono img{width:75px;height:75px;object-fit:contain}
        .punto{position:absolute;right:-5px;top:-4px;width:19px;height:19px;border:3px solid #fff;border-radius:50%;background:#e31b30;box-shadow:0 2px 8px #0008}
        .icono-falso{text-align:center;font-size:12px}.icono-falso div{display:grid;place-items:center;width:70px;height:70px;margin:3px auto 12px;background:linear-gradient(120deg,#eaeef4,#a5c4e9);color:#244263;border-radius:17px;font-size:34px}
        .notificacion{position:absolute;top:415px;left:15px;right:15px;border:1px solid #ffffff77;background:#f0f3f2ed;color:#111927;border-radius:17px;padding:13px 14px;box-shadow:0 10px 30px #0003}.titulo-notificacion{display:flex;align-items:center;gap:7px;font-size:11px;margin-bottom:9px}.titulo-notificacion small{margin-left:auto;color:#697683}.notificacion>strong{font-size:13px}.notificacion p{font-size:12px;margin:5px 0 0;line-height:1.4}
        .base-telefono{position:absolute;bottom:35px;left:0;right:0;display:flex;justify-content:space-around}.base-telefono span{height:25px;width:25px;background:#d1d5db30;border-radius:50%}
        .interior-app{height:100%;background:#f5f6f7;color:#202327;position:relative}.barra-sistema.oscura{background:#0d1015;color:#fff;padding-bottom:8px}.header-germania{background:linear-gradient(180deg,#090e12,#5c1118);color:#fff;padding:20px 12px 18px;text-align:center;border-bottom:3px solid #d5a720}.header-germania img{display:block;object-fit:contain;margin:0 auto 6px}.header-germania strong{display:block;font-size:19px;line-height:1.15}.header-germania small{display:block;font-size:10px;color:#d2d6d9;margin-top:4px}
        .contenido-germania{padding:13px}.usuario{display:flex;align-items:center;gap:10px;background:#111b24;color:#fff;padding:12px;border-radius:9px;margin-bottom:13px}.usuario b,.usuario small{display:block}.usuario small{color:#b7c3cb;font-size:11px;margin-top:4px}.avatar{border:2px solid #d5a720;border-radius:50%;width:42px;height:42px;display:grid;place-items:center;font-size:12px;background:#283746}
        .modulo{padding:14px;background:#fff;border-radius:11px;border:1px solid #dce0e4;box-shadow:0 2px 8px #0001;max-height:310px;overflow:auto}.titulo-modulo{display:flex;gap:9px;align-items:center;font-size:14px}.indicador{background:#b91c1c;color:#fff;border-radius:50%;display:grid;place-items:center;width:24px;height:24px;font-style:italic;font-weight:bold}
        .modulo>p{font-size:12px;color:#687580;margin:10px 0 12px}.mensaje{border-left:3px solid #b91c1c;background:#f3f4f6;padding:10px;margin-bottom:9px;border-radius:4px}.mensaje small{display:block;font-size:10px;color:#69717b;margin-bottom:6px}.mensaje strong{font-size:12px;line-height:1.45;display:block;overflow-wrap:anywhere}.sin-avisos{font-size:12px;color:#5f6870}.pie-app{text-align:center;color:#67727a;font-size:11px;margin-top:13px}
        .cerrar{position:absolute;bottom:15px;left:12px;right:12px;background:#15232e;border:0;color:#fff;font-size:12px;font-weight:700;border-radius:9px;padding:13px;cursor:pointer}
        .barra-inferior{position:absolute;width:110px;height:4px;background:#fff9;bottom:15px;left:50%;transform:translateX(-50%);border-radius:4px}
        .controles{align-self:start;padding-top:15px}.controles h2{font-size:21px;margin:0 0 22px}.paso{display:flex;gap:12px;align-items:start;margin:16px 0 12px}.paso>span{border:1px solid #e0b93a;color:#f8d76f;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;flex:0 0 auto;font-size:13px;font-weight:700}.paso strong{font-size:14px}.paso p{font-size:12px;color:#bbc4ce;line-height:1.5;margin:5px 0}
        .principal,.secundario{display:block;width:100%;padding:13px 16px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer}.principal{background:#c21b27;color:#fff;border:1px solid #e35d65}.secundario{background:#21303b;color:#fff;border:1px solid #597083}.principal:hover,.secundario:hover{filter:brightness(1.15)}.principal:focus-visible,.secundario:focus-visible,.icono-app:focus-visible,.cerrar:focus-visible,.enlace:focus-visible{outline:3px solid #f5cb60;outline-offset:3px}
        .estado{margin-top:25px;background:#14242c;border:1px solid #385364;border-radius:11px;padding:14px}.estado b{display:block;font-size:14px}.estado span{font-size:12px;display:block;color:#b4c2ca;margin-top:6px}.aclaracion{margin-top:17px;font-size:12px;color:#aebec9;line-height:1.55}
        @media(max-width:760px){.cabecera{padding:12px 14px}.marca strong{font-size:12px}.marca span{font-size:11px}.enlace{font-size:11px;padding:8px}.zona{grid-template-columns:1fr;gap:24px}.controles{padding-top:0;max-width:450px;margin:auto;width:100%}.introduccion{margin:25px auto 19px}.telefono{height:625px;width:320px}.aplicaciones{gap:18px}.notificacion{top:398px}}
        @media(max-width:360px){.telefono{transform:scale(.9);transform-origin:center top;margin-bottom:-60px}}
      `}</style>
    </main>
  );
}
