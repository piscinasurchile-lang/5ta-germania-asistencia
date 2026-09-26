"use client";
import Link from "next/link";
import {LOGO_B64} from "../../lib/logo.js";

export default function GuardiaHeader({subtitle="Guardia Nocturna"}){
 const fecha=new Intl.DateTimeFormat("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
 return <>
  <header className="g-head">
   <div className="g-brand"><img className="g-crest-img" src={LOGO_B64} alt="Escudo Quinta Compañía Germania"/><div><h1>Quinta Compañía “Germania”</h1><p>Cuerpo de Bomberos de Villarrica · Control de asistencia y registro</p><p className="g-founded">Fundada como Brigada el 21 de junio de 2023 · Compañía desde el 5 de noviembre de 2025</p></div></div>
   <div className="g-today">{fecha}</div>
  </header>
  <nav className="g-tabs" aria-label="Navegación principal"><Link href="/" className="g-tab">Pasar lista</Link><Link href="/" className="g-tab">Salida B-5</Link><Link href="/guardia/menu" className="g-tab active">Guardia</Link><Link href="/" className="g-tab">Historial</Link><Link href="/" className="g-tab">Informe</Link><Link href="/" className="g-tab">Configuración</Link></nav>
  {subtitle&&<div className="g-section-title">{subtitle}</div>}
 </>;
}
