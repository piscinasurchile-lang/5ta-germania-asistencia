"use client";

import {useEffect,useRef,useState} from "react";
import {guardarNómina,leerNómina,guardarEdicion,leerEdicion,borrarEdicion,
  guardarBorrador,listarBorradores,cambiarBorrador,borrarBorradorLocal,contarPendientes,sincronizarBorradores} from "../../../lib/b5-offline-browser.js";

const SERVICIOS=["Emergencia","Acto de servicio","Carga de combustible","Ejercicio con material","Mantención","Traslado","Otro"];
const CITACIONES=["Citación de Compañía","Instrucción","Ejercicio","Curso práctico","Capacitación","Sesión ordinaria","Otro"];
const CAMPOS=[
  ["Datos del servicio",[
    ["svHoraSalida","Hora de salida","time"],["svHoraLlegada","Hora de llegada","time"],
    ["svHoraControl","Hora de control","time"],["svKmSalida","Km salida"],["svKmLlegada","Km llegada"],
    ["svHorometro","Horómetro"],["svCalle","Calle"],["svNumeracion","Número"],["svSector","Sector"]
  ]],
  ["Personal a cargo",[
    ["svUnidadCargo","Unidad a cargo"],["svConductor","Conductor / maquinista"],
    ["svCuerpoCargo","Cuerpo a cargo"],["svPuestoMando","Puesto de mando"],
    ["svCargoQuinta","A cargo Quinta"],["svOfContabilidad","Oficial contabilidad"],
    ["svOfSeguridad","Oficial seguridad"]
  ]],
  ["Información de la emergencia",[
    ["svLugarInicio","Lugar de inicio"],["svNaturaleza","Naturaleza"],["svDetNaturaleza","Detalle naturaleza"],
    ["svOrigen","Origen"],["svDetOrigen","Detalle origen"],["svCausas","Causas"],
    ["svDetCausa","Detalle causas"],["svTipoInmueble","Tipo inmueble"],
    ["svConstruccion","Construcción"],["svNiveles","Niveles"]
  ]],
  ["Observaciones y recursos",[
    ["svObservaciones","Relato del servicio"],["svPersonas","Personas involucradas"],
    ["svMaterial","Material menor utilizado"],["svApoyo","Unidades de apoyo"]
  ]],
  ["Combustible (si corresponde)",[
    ["svCombConductor","Conductor"],["svCombKm","Kilometraje"],["svCombFecha","Fecha","date"],
    ["svCombServicentro","Servicentro"],["svCombRut","RUT servicentro"],
    ["svCombLitros","Litros cargados"],["svCombValor","Valor combustible"]
  ]]
];
const fechaLocal=()=>{
  const d=new Date(),pad=n=>String(n).padStart(2,"0");
  return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
};
const blanco=t=>t==="servicio"?{svFecha:fechaLocal(),svTipoAct:"Emergencia",registrarAsistencia:true,records:{}}
  :{date:fechaLocal(),tipo:"Citación de Compañía",detalle:"",registradoPor:"",records:{}};
const nombre=p=>[p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" ");
const resumenParte=(registros,clase)=>{
  const lista=Object.values(registros||{});
  return clase==="servicio" ?
    {presentes:lista.filter(v=>v==="si").length,ausentes:lista.filter(v=>v==="no").length,justificados:0,total:lista.length}:
    {presentes:lista.filter(v=>v==="presente").length,ausentes:lista.filter(v=>v==="ausente").length,
      justificados:lista.filter(v=>v==="justificado").length,total:lista.length};
};
const fechaLegible=d=>d?d.split("-").reverse().join("-"):"Sin fecha";

export default function CapturaB5(){
  const [tipo,setTipo]=useState("");
  const [form,setForm]=useState({});
  const [nomina,setNomina]=useState([]);
  const [nominaFecha,setNominaFecha]=useState("");
  const [conexion,setConexion]=useState("comprobando");
  const [cola,setCola]=useState([]);
  const [mensaje,setMensaje]=useState("");
  const [guardando,setGuardando]=useState(false);
  const [listaPreparada,setListaPreparada]=useState(false);
  const [seleccion,setSeleccion]=useState(null);
  const [edicionRegistro,setEdicionRegistro]=useState(null);
  const [claveOficial,setClaveOficial]=useState("");
  const [mensajeDetalle,setMensajeDetalle]=useState("");
  const [operando,setOperando]=useState(false);
  const guardadoRef=useRef(false);
  const sincronizandoRef=useRef(false);
  const abortRef=useRef(false);

  async function recargarCola(){
    try{setCola(await listarBorradores());}catch(e){setMensaje(e.message);}
  }
  async function refrescarNomina(){
    try{
      const controller=new AbortController(),t=setTimeout(()=>controller.abort(),6000);
      let resp;
      try{resp=await fetch("/api/state/roster:v8",{cache:"no-store",signal:controller.signal});}
      finally{clearTimeout(t);}
      if(!resp.ok)throw Error("Sin nómina del servidor");
      const j=await resp.json();
      if(!Array.isArray(j.value)||!j.value.length)throw Error("Nómina no disponible");
      await guardarNómina(j.value);
      const cache=await leerNómina();
      if(!abortRef.current){setNomina(cache.lista);setNominaFecha(cache.actualizada);}
    }catch{/* Se conserva la nómina local; nunca se reemplaza por una lista vacía. */}
  }
  async function verificarConexion(){
    if(!navigator.onLine){
      if(!abortRef.current)setConexion("offline");
      return false;
    }
    try{
      const controller=new AbortController(),t=setTimeout(()=>controller.abort(),5000);
      let response;
      try{response=await fetch("/api/b5/dispositivo?ping="+Date.now(),{cache:"no-store",credentials:"same-origin",signal:controller.signal});}
      finally{clearTimeout(t);}
      if(!response.ok)throw Error("Servidor sin servicio");
      if(!abortRef.current)setConexion("online");
      return true;
    }catch{
      if(!abortRef.current)setConexion("offline");
      return false;
    }
  }
  async function actualizar(){
    if(sincronizandoRef.current)return;
    sincronizandoRef.current=true;
    try{
      const online=await verificarConexion();
      if(!online)return;
      await refrescarNomina();
      await sincronizarBorradores(recargarCola);
      await recargarCola();
    }finally{sincronizandoRef.current=false;}
  }

  useEffect(()=>{
    const clase=new URLSearchParams(window.location.search).get("tipo");
    setTipo(clase==="servicio"?"servicio":"lista");
    abortRef.current=false;
    return()=>{abortRef.current=true;};
  },[]);
  useEffect(()=>{
    if(!tipo)return;
    let activo=true;
    (async()=>{
      try{
        const [edit,roster,queue]=await Promise.all([leerEdicion(tipo),leerNómina(),listarBorradores()]);
        if(!activo)return;
        setForm(edit||blanco(tipo));
        if(roster){setNomina(roster.lista);setNominaFecha(roster.actualizada);}
        setCola(queue);
        setListaPreparada(true);
      }catch(e){if(activo)setMensaje("El almacenamiento de esta tablet no está disponible: "+e.message);}
    })();
    return()=>{activo=false;};
  },[tipo]);
  useEffect(()=>{
    if(!listaPreparada||!tipo)return;
    const id=setTimeout(()=>guardarEdicion(tipo,form).catch(e=>setMensaje("No se pudo conservar la edición: "+e.message)),700);
    return()=>clearTimeout(id);
  },[form,listaPreparada,tipo]);
  useEffect(()=>{
    if(!tipo)return;
    actualizar();
    const handler=()=>actualizar();
    const focus=()=>{if(document.visibilityState==="visible")actualizar();};
    window.addEventListener("online",handler);
    window.addEventListener("offline",handler);
    document.addEventListener("visibilitychange",focus);
    const timer=setInterval(actualizar,18000);
    return()=>{
      clearInterval(timer);window.removeEventListener("online",handler);
      window.removeEventListener("offline",handler);
      document.removeEventListener("visibilitychange",focus);
    };
  },[tipo]);

  function actualizarCampo(k,v){setForm(d=>({...d,[k]:v}));}
  function marcar(id,v){setForm(d=>({...d,records:{...d.records,[id]:v}}));}

  async function verRegistro(item,abrirEditor=false){
    setMensajeDetalle("");
    setClaveOficial("");
    setEdicionRegistro(null);
    const base={...item.datos,anulado:item.estado==="anulado"};
    setSeleccion({item,datos:base,version:null,remoto:false});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      document.getElementById("detalleRegistroB5")?.scrollIntoView({block:"start",behavior:"smooth"});
    }));
    if((item.estado!=="sincronizado"&&item.estado!=="anulado")||conexion!=="online"||item.tipo!=="lista"){
      if(abrirEditor && item.tipo==="lista" && ["pendiente","revision"].includes(item.estado))
        setEdicionRegistro({...base,records:{...base.records}});
      return;
    }
    try{
      const q=new URLSearchParams({id:item.id,date:item.datos.date,tipo:item.datos.tipo});
      const respuesta=await fetch("/api/b5/registros?"+q.toString(),{cache:"no-store",credentials:"same-origin"});
      if(!respuesta.ok)throw new Error("El servidor no pudo confirmar el contenido de este parte.");
      const j=await respuesta.json();
      if(j.ok){
        setSeleccion(prev=>prev?.item.id===item.id?
          {...prev,datos:j.datos,version:j.version,remoto:true}:prev);
        if(abrirEditor && !j.datos.anulado)setEdicionRegistro({...j.datos,records:{...j.datos.records}});
      }
    }catch{
      setMensajeDetalle("Se muestra la copia guardada en esta tablet. No se pudo consultar la versión vigente de Neon.");
    }
  }

  function comenzarEdicion(){
    if(!seleccion)return;
    if(seleccion.item.tipo!=="lista"){
      setMensajeDetalle("La edición de hojas de servicio B-5 requiere su módulo específico.");
      return;
    }
    if((seleccion.item.estado==="sincronizado"||seleccion.item.estado==="anulado") &&
       (!seleccion.remoto||seleccion.datos.anulado)){
      setMensajeDetalle("Para corregir este parte, es necesario abrir su versión vigente desde Neon y que no esté anulado.");
      return;
    }
    setEdicionRegistro({...seleccion.datos,records:{...seleccion.datos.records}});
    setMensajeDetalle("");
  }

  async function guardarCorreccion(){
    if(!seleccion||!edicionRegistro||operando)return;
    const item=seleccion.item;
    const cuentas=resumenParte(edicionRegistro.records,item.tipo);
    if(!cuentas.total)return setMensajeDetalle("El registro no contiene una nómina válida.");
    if(!cuentas.presentes&&!window.confirm("No hay voluntarios presentes. ¿Confirmas que todos quedaron ausentes o justificados?"))return;
    setOperando(true);
    setMensajeDetalle("");
    try{
      if(item.estado==="sincronizado"){
        if(conexion!=="online"||!seleccion.remoto)throw new Error("Para corregir en Neon necesitas Internet y el parte actualizado.");
        const j=await cambiarParteOficial(item,"corregir",edicionRegistro);
        const actualizado={...item,datos:{...item.datos,...edicionRegistro}};
        await cambiarBorrador(actualizado);
        await recargarCola();
        setSeleccion({item:actualizado,datos:{...edicionRegistro,anulado:false},remoto:true,version:j.version});
      }else if(item.estado==="pendiente"||item.estado==="revision"){
        const actualizado={...item,datos:{...edicionRegistro},estado:"pendiente",error:""};
        await cambiarBorrador(actualizado);
        await recargarCola();
        setSeleccion({item:actualizado,datos:actualizado.datos,remoto:false,version:null});
      }else throw new Error("No se puede modificar una asistencia anulada.");
      setEdicionRegistro(null);
      setClaveOficial("");
      setMensajeDetalle("Corrección guardada. No se creó un parte duplicado.");
      if(item.estado!=="sincronizado"&&conexion==="online")actualizar();
    }catch(e){setMensajeDetalle(e.message||"No se pudo corregir la asistencia.");}
    finally{setOperando(false);}
  }

  async function cambiarParteOficial(item,accion,campos){
    if(!seleccion?.remoto||!Number.isInteger(seleccion.version))throw new Error("Actualiza el parte desde Neon antes de continuar.");
    if(!claveOficial.trim())throw new Error("Ingresa la clave de Oficialidad para modificar un parte sincronizado.");
    const sesion=await fetch("/api/auth/officiality",{
      method:"POST",headers:{"Content-Type":"application/json"},
      credentials:"same-origin",body:JSON.stringify({pin:claveOficial})
    });
    if(!sesion.ok)throw new Error("Clave de Oficialidad incorrecta o acceso no configurado.");
    const response=await fetch("/api/b5/registros",{
      method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"same-origin",
      body:JSON.stringify({id:item.id,date:item.datos.date,tipo:item.datos.tipo,version:seleccion.version,
        accion,cambios:campos?{records:campos.records,detalle:campos.detalle||"",
          registradoPor:campos.registradoPor||""}:null})
    });
    const j=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(j.error==="version_conflict"?
      "El parte fue modificado por otra persona. Cierra y vuelve a abrir para ver la versión actual.":
      j.error==="oficialidad_requerida"?"Debes autorizarte como Oficialidad.":
      "No se pudo actualizar el parte oficial ("+(j.error||response.status)+").");
    return j;
  }

  async function eliminarRegistro(){
    if(!seleccion||operando)return;
    const item=seleccion.item;
    if(item.estado==="anulado")return;
    const confirmado=item.estado==="sincronizado";
    const pregunta=confirmado?
      "¿Anular el parte oficial N.º "+item.numero+"? Dejará de contar en las estadísticas, pero se conservará para auditoría y podrá restaurarse.":
      "¿Eliminar esta captura pendiente de la tablet? Todavía no fue confirmada en Neon.";
    if(!window.confirm(pregunta))return;
    setOperando(true);
    setMensajeDetalle("");
    try{
      if(confirmado){
        if(conexion!=="online"||!seleccion.remoto)throw new Error("Para anular en Neon necesitas estar en línea y abrir la versión actual.");
        const j=await cambiarParteOficial(item,"anular",null);
        const actualizado={...item,estado:"anulado"};
        await cambiarBorrador(actualizado);
        await recargarCola();
        setSeleccion({...seleccion,item:actualizado,datos:{...seleccion.datos,anulado:true},version:j.version});
        setMensajeDetalle("Parte anulado en Neon. Su información y número oficial siguen conservados.");
      }else{
        await borrarBorradorLocal(item.id);
        await recargarCola();
        setSeleccion(null);
        setMensaje("Captura pendiente retirada de esta tablet. No se modificaron partes oficiales.");
      }
      setEdicionRegistro(null);
      setClaveOficial("");
    }catch(e){setMensajeDetalle(e.message||"No se pudo realizar la operación.");}
    finally{setOperando(false);}
  }

  async function restaurarRegistro(){
    if(!seleccion||seleccion.item.estado!=="anulado"||operando)return;
    if(!window.confirm("¿Restaurar el parte oficial y volver a incluirlo en las estadísticas?"))return;
    setOperando(true);
    try{
      const item=seleccion.item;
      const j=await cambiarParteOficial(item,"restaurar",null);
      const actualizado={...item,estado:"sincronizado"};
      await cambiarBorrador(actualizado);
      await recargarCola();
      setSeleccion({...seleccion,item:actualizado,datos:{...seleccion.datos,anulado:false},version:j.version});
      setMensajeDetalle("Parte restaurado correctamente.");
      setClaveOficial("");
    }catch(e){setMensajeDetalle(e.message||"No se pudo restaurar.");}
    finally{setOperando(false);}
  }

  async function guardar(){
    if(guardando||!nomina.length||!listaPreparada)return;
    if(tipo==="lista"&&(!form.date||!form.tipo))return setMensaje("Debes indicar fecha y tipo de citación.");
    if(tipo==="servicio"&&(!form.svFecha||!form.svTipoAct))return setMensaje("Debes indicar fecha y tipo de servicio.");
    setGuardando(true);setMensaje("");
    try{
      // Se confirman los datos COMPLETOS en IndexedDB antes de informar al usuario.
      const defecto=tipo==="servicio"?"no":"ausente";
      const records=Object.fromEntries(nomina.map(p=>[String(p.id),form.records?.[p.id]||defecto]));
      const datos={...form,records};
      if(tipo==="lista"&&!resumenParte(records,"lista").presentes && !window.confirm("No hay voluntarios presentes. ¿Guardar igualmente esta lista con cero presentes?"))return;
      if(tipo==="lista"&&form.tipo==="Otro"){
        if(!String(form.tipoPersonalizado||"").trim())throw new Error("Indica qué citación se está registrando.");
        datos.tipo=String(form.tipoPersonalizado).trim();
      }
      const item=await guardarBorrador(tipo,datos);
      guardadoRef.current=true;
      await borrarEdicion(tipo);
      setForm(blanco(tipo));setMensaje("Guardado en esta tablet · "+item.id.slice(0,8)+". Pendiente de confirmar en Neon.");
      await recargarCola();
      if(conexion==="online")actualizar();
    }catch(e){setMensaje("No se pudo guardar en la tablet: "+e.message);}
    finally{setGuardando(false);}
  }

  const pendientes=contarPendientes(cola);
  const bloqueados=cola.filter(i=>i.estado==="revision");
  const confirmados=cola.filter(i=>i.estado==="sincronizado");
  const etiqueta=conexion==="online"?
    (bloqueados.length&&pendientes===bloqueados.length?"EN LÍNEA · Registros para revisión":
      pendientes?"EN LÍNEA · Sincronizando registros pendientes":"EN LÍNEA · Neon disponible"):
    conexion==="offline"?"SIN CONEXIÓN · Tomando datos en esta tablet":"COMPROBANDO LA CONEXIÓN…";
  return (
    <main className="capturaB5">
      <header className="barra">
        <div><h1>GERMANIA · B-5</h1><p>{tipo==="servicio"?"Emergencias · Hoja de servicio":"Asistencia · Pasar lista"}</p></div>
        <button onClick={()=>window.location.assign("/b5")}>Volver a B-5</button>
      </header>
      <section className={"estado "+(conexion==="online"?"enlinea":"sinred")} role="status">
        <strong>{etiqueta}</strong>
        <span>{conexion==="online"?"Los datos se enviarán automáticamente.":"Los datos quedan en la tablet y se sincronizarán cuando vuelva Internet."}</span>
        <span>{pendientes} pendientes · {confirmados.length} sincronizados · {bloqueados.length} para revisión</span>
        {conexion==="online"&&pendientes>0&&<button onClick={actualizar}>Reintentar ahora</button>}
      </section>
      {!!mensaje&&<p className="mensaje" role="status">{mensaje}</p>}
      <section className="contenido">
        <div className="franja">
          <h2>{tipo==="servicio"?"Hoja de servicio B-5":"Parte de asistencia"}</h2>
          <small>{nomina.length?nomina.length+" voluntarios en nómina local":"Nómina local no preparada"}</small>
        </div>
        {!nomina.length&&<p className="alarma">Para trabajar sin Internet, abre la tablet una vez con conexión para descargar la nómina. No se guardará una lista incompleta.</p>}
        {!!nominaFecha&&<p className="fechaNomina">Nómina descargada: {new Date(nominaFecha).toLocaleString("es-CL")}. Se verifica cuando hay conexión.</p>}
        <div className="campos">
          {tipo==="servicio"?<>
            <label>Fecha<input type="date" value={form.svFecha||""} onChange={e=>actualizarCampo("svFecha",e.target.value)}/></label>
            <label>Tipo de actividad
              <select value={form.svTipoAct||"Emergencia"} onChange={e=>setForm(d=>({...d,svTipoAct:e.target.value,
                  registrarAsistencia:e.target.value==="Emergencia"||e.target.value==="Acto de servicio"}))}>
                {SERVICIOS.map(x=><option key={x}>{x}</option>)}
              </select>
            </label>
          </>:<>
            <label>Fecha<input type="date" value={form.date||""} onChange={e=>actualizarCampo("date",e.target.value)}/></label>
            <label>Tipo de citación
              <select value={CITACIONES.includes(form.tipo)?form.tipo:"Otro"} onChange={e=>actualizarCampo("tipo",e.target.value)}>
                {CITACIONES.map(x=><option key={x}>{x}</option>)}
              </select>
            </label>
            {form.tipo==="Otro"&&<label>Descripción del tipo<input value={form.tipoPersonalizado||""} onChange={e=>actualizarCampo("tipoPersonalizado",e.target.value)}/></label>}
            <label>Registrado por<input value={form.registradoPor||""} onChange={e=>actualizarCampo("registradoPor",e.target.value)}/></label>
            <label>Detalle<input value={form.detalle||""} onChange={e=>actualizarCampo("detalle",e.target.value)}/></label>
          </>}
        </div>
        {tipo==="servicio"&&CAMPOS.map(([grupo,campos],idx)=>
          <details key={grupo} open={idx===0}>
            <summary>{grupo}</summary>
            <div className="campos">
              {campos.map(([id,label,t])=><label key={id}>{label}
                <input type={t||"text"} value={form[id]||""} onChange={e=>actualizarCampo(id,e.target.value)}/>
              </label>)}
            </div>
          </details>
        )}
        <section className="asistencia">
          <div className="filaTitulo">
            <h3>{tipo==="servicio"?"Concurrencia de voluntarios":"Pasar lista"}</h3>
            <span>{nomina.filter(p=>(form.records?.[p.id]||"")===(tipo==="servicio"?"si":"presente")).length} {tipo==="servicio"?"concurrentes":"presentes"}</span>
          </div>
          {nomina.map(p=>{
            const valor=form.records?.[p.id]||(tipo==="servicio"?"no":"ausente");
            const ops=tipo==="servicio"?[["si","Concurre"],["no","No concurre"]]:
              [["presente","Presente"],["ausente","Ausente"],["justificado","Justificado"]];
            return <div className="persona" key={p.id}>
              <div className="nombre"><small>{p.clave||p.n||""} · {p.cargo}</small><strong>{nombre(p)}</strong></div>
              <div className="opciones">{ops.map(([v,label])=>
                <button key={v} className={valor===v?"seleccionado":""}
                  onClick={()=>marcar(p.id,v)} aria-pressed={valor===v}>{label}</button>)}</div>
            </div>;
          })}
          {tipo==="servicio"&&<label className="check">
            <input type="checkbox" checked={form.registrarAsistencia!==false}
              onChange={e=>actualizarCampo("registrarAsistencia",e.target.checked)}/>
            Sumar esta salida al control de asistencia
          </label>}
        </section>
        <button className="guardar" disabled={!nomina.length||guardando||!listaPreparada} onClick={guardar}>
          {guardando?"Guardando en la tablet…":"Guardar en esta tablet"}
        </button>
        <p className="explicacion">Primero se guarda en la memoria de la tablet. Solo aparecerá como sincronizado cuando Neon confirme la recepción y asigne el número oficial. No borres los datos del navegador si hay pendientes.</p>
        {conexion==="online"&&<a className="formularioCompleto" href={"/?b5dest="+tipo}>
          Abrir formulario completo y PDF (solo con Internet)
        </a>}
        {cola.length>0&&<section className="historial">
          <h3>Registros de esta tablet</h3>
          {cola.slice().sort((a,b)=>b.creadoEn.localeCompare(a.creadoEn)).slice(0,20).map(x=>{
            const r=resumenParte(x.datos?.records,x.tipo);
            return <div className="registro registroB5" key={x.id}>
              <div className="registroEncabezado">
                <strong>{x.tipo==="servicio"?"Emergencias":"Asistencia"} · {fechaLegible(x.datos?.date||x.datos?.svFecha)}</strong>
                <span>{x.estado==="anulado"?"Anulado · N° "+x.numero:
                  x.estado==="sincronizado"?"Sincronizado · N° "+x.numero:
                  x.estado==="revision"?"Requiere revisión":"Pendiente de Internet"}</span>
              </div>
              <div className="registroTotales">Presentes: {r.presentes} · Ausentes: {r.ausentes}
                {x.tipo==="lista"?" · Justificados: "+r.justificados:""} · Total: {r.total}
              </div>
              {r.total>0&&r.presentes===0&&<div className="alertaVacia">Atención: ningún voluntario figura presente en esta lista.</div>}
              {x.estado==="revision"&&<small>{x.error}</small>}
              <div className="accionesRegistro">
                <button type="button" onClick={()=>verRegistro(x)}>Ver</button>
                <button type="button" disabled={x.tipo!=="lista"||x.estado==="anulado"} onClick={()=>verRegistro(x,true)}>Editar</button>
                <button type="button" className="accionPeligro" onClick={async()=>{await verRegistro(x);setMensajeDetalle("Revisa los datos y elige Anular o Eliminar dentro del detalle.");}}>Borrar</button>
              </div>
            </div>;
          })}
          {seleccion&&<section className="detalleRegistro" id="detalleRegistroB5">
            <div className="registroEncabezado">
              <h3>Parte {seleccion.item.numero?"N.º "+seleccion.item.numero:"sin número"} · {fechaLegible(seleccion.datos.date||seleccion.datos.svFecha)}</h3>
              <button type="button" onClick={()=>{setSeleccion(null);setEdicionRegistro(null);setMensajeDetalle("");}}>Cerrar</button>
            </div>
            <p>{seleccion.datos.tipo||seleccion.datos.svTipoAct} · {seleccion.datos.detalle||"Sin detalle"}</p>
            {seleccion.item.estado==="sincronizado"&&!seleccion.remoto&&
              <p className="avisoLocal">Vista desde la copia de esta tablet. Para corregir o anular se necesita confirmar el parte vigente en Neon.</p>}
            {seleccion.datos.anulado&&<p className="alertaVacia">Este parte está anulado. Se conserva para auditoría y no suma asistencia.</p>}
            <div className="detalleTotales">
              {(()=>{const a=resumenParte((edicionRegistro||seleccion.datos).records,seleccion.item.tipo);
                return "Presentes: "+a.presentes+" · Ausentes: "+a.ausentes+
                  (seleccion.item.tipo==="lista"?" · Justificados: "+a.justificados:"")+" · Total: "+a.total;})()}
            </div>
            {edicionRegistro&&<div className="campos">
              <label>Detalle<input value={edicionRegistro.detalle||""}
                onChange={e=>setEdicionRegistro(v=>({...v,detalle:e.target.value}))}/></label>
              <label>Registrado por<input value={edicionRegistro.registradoPor||""}
                onChange={e=>setEdicionRegistro(v=>({...v,registradoPor:e.target.value}))}/></label>
            </div>}
            <div className="detallePersonas">
              {Object.entries((edicionRegistro||seleccion.datos).records||{}).map(([id,status])=>{
                const persona=nomina.find(p=>String(p.id)===String(id));
                const estados=seleccion.item.tipo==="servicio"?[["si","Concurre"],["no","No concurre"]]:
                  [["presente","Presente"],["ausente","Ausente"],["justificado","Justificado"]];
                return <div className="persona" key={id}>
                  <div className="nombre"><strong>{persona?nombre(persona):"Voluntario ID "+id}</strong>
                    <small>{persona?.cargo||"Registro histórico"}</small></div>
                  {edicionRegistro?<div className="opciones">{estados.map(([valor,etiqueta])=>
                    <button key={valor} type="button" className={status===valor?"seleccionado":""}
                      onClick={()=>setEdicionRegistro(v=>({...v,records:{...v.records,[id]:valor}}))}>{etiqueta}</button>)}</div>:
                    <strong className="estadoIndividual">{estados.find(([v])=>v===status)?.[1]||status}</strong>}
                </div>;
              })}
            </div>
            {(seleccion.item.estado==="sincronizado"||seleccion.item.estado==="anulado")&&
              <label className="claveOficial">Clave de Oficialidad para modificar el parte oficial
                <input type="password" autoComplete="off" value={claveOficial} onChange={e=>setClaveOficial(e.target.value)}/>
              </label>}
            <div className="accionesRegistro detalleAcciones">
              {!edicionRegistro&&seleccion.item.estado!=="anulado"&&seleccion.item.tipo==="lista"&&
                <button type="button" disabled={operando} onClick={comenzarEdicion}>Editar asistencia</button>}
              {edicionRegistro&&<>
                <button type="button" disabled={operando} onClick={guardarCorreccion}>Guardar corrección</button>
                <button type="button" disabled={operando} onClick={()=>setEdicionRegistro(null)}>Cancelar</button>
              </>}
              {!edicionRegistro&&seleccion.item.estado!=="anulado"&&
                <button type="button" disabled={operando||(seleccion.item.estado==="sincronizado"&&!seleccion.remoto)}
                  className="accionPeligro" onClick={eliminarRegistro}>
                  {seleccion.item.estado==="sincronizado"?"Anular parte oficial":"Eliminar captura local"}
                </button>}
              {!edicionRegistro&&seleccion.item.estado==="anulado"&&
                <button type="button" disabled={operando||!seleccion.remoto} onClick={restaurarRegistro}>Restaurar parte</button>}
            </div>
            {!!mensajeDetalle&&<p className="avisoLocal" role="status">{mensajeDetalle}</p>}
          </section>}
        </section>}
      </section>
      <style>{`
        *{box-sizing:border-box}
        body,html{margin:0;background:#080e16}
        .capturaB5{background:#080e16;color:#edf4fa;min-height:100dvh;font-family:system-ui,-apple-system,sans-serif;padding:14px 18px 28px}
        .barra{display:flex;justify-content:space-between;gap:12px;align-items:center;max-width:1050px;margin:auto auto 12px}
        .barra h1{font-size:23px;margin:0}.barra p{margin:4px 0;color:#c5d3df}
        button{cursor:pointer;touch-action:manipulation;font-family:inherit}
        .barra button,.estado button{background:#293b51;border:1px solid #688299;border-radius:8px;color:white;padding:12px;font-weight:700}
        .estado{display:grid;gap:5px;padding:13px 16px;border-radius:12px;max-width:1050px;margin:0 auto 14px}
        .estado strong{font-size:17px}.estado span{font-size:13px}.estado.sinred{background:#50300b;border:2px solid #ffba42}
        .estado.enlinea{background:#153329;border:2px solid #559b7c}
        .estado button{justify-self:start;padding:7px 12px}
        .contenido{background:#111e2b;border:1px solid #354858;border-radius:14px;max-width:1050px;margin:auto;padding:17px}
        .franja{display:flex;justify-content:space-between;gap:12px;align-items:center}
        .franja h2{font-size:22px;margin:0}.franja small{color:#d0c57e}
        .fechaNomina{font-size:12px;color:#a6bacd}
        .alarma{background:#4d290e;color:#fff;padding:13px;border-radius:8px}
        .mensaje{max-width:1050px;margin:8px auto;color:#ffdc89;padding:10px;border:1px solid #9f8149;border-radius:8px}
        .campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:13px 0}
        .campos label{display:grid;gap:6px;font-size:13px}
        input,select{width:100%;border:1px solid #587089;background:#081522;color:#fff;padding:12px;font-size:16px;border-radius:8px;min-width:0}
        details{border-top:1px solid #3e4d60;padding:11px 0}
        summary{cursor:pointer;font-weight:700;font-size:16px;padding:6px 0}
        .filaTitulo{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .filaTitulo h3{margin:7px 0}.filaTitulo span{font-size:14px;font-weight:700;color:#b7d5ec}
        .persona{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #36485a;padding:12px 0}
        .nombre{display:flex;flex-direction:column;gap:3px;min-width:170px;flex:1}
        .nombre small{font-size:11px;color:#a7bacc}.nombre strong{font-size:15px;line-height:1.3}
        .opciones{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
        .opciones button{background:#192939;color:#dce7f1;border:1px solid #6b8197;border-radius:9px;padding:10px 12px}
        .opciones button.seleccionado{border-color:#ffcc62;background:#364324;color:white;font-weight:800}
        .check{display:flex;align-items:center;gap:8px;font-size:14px;margin:18px 0}
        .check input{width:20px;height:20px}
        .guardar{background:#196c43;color:#fff;border:1px solid #94d4af;border-radius:10px;padding:17px 20px;width:100%;font-size:18px;font-weight:800;margin-top:19px}
        .guardar:disabled{opacity:.45}.explicacion{font-size:13px;color:#b2c4d5;line-height:1.55}
        .formularioCompleto{display:inline-block;border:1px solid #688299;border-radius:8px;padding:11px 14px;
          color:#d9e8f8;background:#223246;text-decoration:none;margin:5px 0 12px;font-size:13px}
        .historial{margin-top:20px}.historial h3{font-size:16px}
        .registroB5{display:grid;gap:8px;padding:15px 0}
        .registroEncabezado{display:flex;gap:9px;align-items:center;justify-content:space-between;flex-wrap:wrap}
        .registroEncabezado h3{margin:0}
        .registroEncabezado>span{color:#e8c66d;font-size:13px;font-weight:700}
        .registroTotales,.detalleTotales{font-size:14px;color:#c6e1f3}
        .alertaVacia{background:#5d281c;color:#fff1d2;padding:8px 10px;border:1px solid #d38c64;border-radius:8px;font-size:13px}
        .accionesRegistro{display:flex;flex-wrap:wrap;gap:7px}
        .accionesRegistro button,.registroEncabezado button{padding:8px 13px;background:#233c53;
          border:1px solid #6586a3;color:white;border-radius:7px;font-size:13px;font-weight:700}
        .accionesRegistro button:disabled{opacity:.35;cursor:not-allowed}
        .accionesRegistro .accionPeligro{border-color:#c36e75;color:#ffd1d6;background:#40272f}
        .detalleRegistro{border:1px solid #67829b;background:#182c3c;border-radius:12px;
          margin-top:17px;padding:16px}
        .detallePersonas{max-height:420px;overflow:auto;margin:13px 0}
        .estadoIndividual{font-size:14px;color:#d0e6fb}
        .claveOficial{display:grid;gap:7px;font-size:13px;margin:15px 0;max-width:330px}
        .avisoLocal{color:#ffd18d;font-size:13px;margin-top:12px}
        .detalleAcciones{margin-top:12px}
        .registro{padding:10px 0;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-bottom:1px solid #3e5267}
        .registro strong{color:#f4d37b}.registro small{width:100%;color:#ffcc85}
        @media(max-width:620px){.capturaB5{padding:10px}.campos{grid-template-columns:1fr}
          .persona{flex-direction:column;align-items:stretch}.opciones{justify-content:stretch}.opciones button{flex:1;padding:9px 5px}
          .barra h1{font-size:18px}}
      `}</style>
    </main>
  );
}
