"use client";

import {useEffect,useRef,useState} from "react";
import {prepararPartePDF,crearArchivoPartePDF,prepararEmergenciaPDF,crearEmergenciaPDF} from "../../../lib/b5-parte-pdf.mjs";
import {guardarNómina,leerNómina,guardarEdicion,leerEdicion,borrarEdicion,
  guardarBorrador,listarBorradores,cambiarBorrador,borrarBorradorLocal,contarPendientes,sincronizarBorradores} from "../../../lib/b5-offline-browser.js";

const TIPOS_EMERGENCIA_BASE=["Inflamación de ducto","Incendio estructural","Olor indeterminado"];
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
  const [modoServicio,setModoServicio]=useState("emergencia");
  const [tiposEmergencia,setTiposEmergencia]=useState([]);
  const [form,setForm]=useState({});
  const [nomina,setNomina]=useState([]);
  const [nominaFecha,setNominaFecha]=useState("");
  const [conexion,setConexion]=useState("comprobando");
  const [cola,setCola]=useState([]);
  const [historialNeon,setHistorialNeon]=useState([]);
  const [errorHistorial,setErrorHistorial]=useState("");
  const [mensaje,setMensaje]=useState("");
  const [guardando,setGuardando]=useState(false);
  const [listaPreparada,setListaPreparada]=useState(false);
  const [seleccion,setSeleccion]=useState(null);
  const [edicionRegistro,setEdicionRegistro]=useState(null);
  const [claveOficial,setClaveOficial]=useState("");
  const [mensajeDetalle,setMensajeDetalle]=useState("");
  const [operando,setOperando]=useState(false);
  const [confirmacion,setConfirmacion]=useState(null);
  const [procesandoArchivo,setProcesandoArchivo]=useState("");
  const [mensajeArchivo,setMensajeArchivo]=useState("");
  const [recuperacion,setRecuperacion]=useState(null);
  const [claveRecuperacion,setClaveRecuperacion]=useState("");
  const [mensajeRecuperacion,setMensajeRecuperacion]=useState("");
  const [recuperando,setRecuperando]=useState(false);
  const guardadoRef=useRef(false);
  const sincronizandoRef=useRef(false);
  const abortRef=useRef(false);

  async function cargarHistorialNeon(clase){
    if(!["lista","servicio"].includes(clase))return;
    try{
      const r=await fetch("/api/b5/historial?tipo="+clase,{cache:"no-store",credentials:"same-origin"});
      if(!r.ok)throw Error(r.status===403?"Tablet no registrada":"No se pudo consultar Neon");
      const j=await r.json();
      if(!abortRef.current){setHistorialNeon(j.items||[]);setErrorHistorial("");}
    }catch(e){if(!abortRef.current){setHistorialNeon([]);setErrorHistorial(e.message);}}
  }
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
      await cargarHistorialNeon(tipo);
    }finally{sincronizandoRef.current=false;}
  }

  useEffect(()=>{
    const clase=new URLSearchParams(window.location.search).get("tipo");
    setTipo(clase==="servicio"?"servicio":"lista");
    setModoServicio(new URLSearchParams(window.location.search).get("modo")==="carro"?"carro":"emergencia");
    try{
      const guardados=JSON.parse(localStorage.getItem("b5:tipos-emergencia:v1")||"[]");
      setTiposEmergencia([...new Set([...TIPOS_EMERGENCIA_BASE,...(Array.isArray(guardados)?guardados:[])])].sort((a,b)=>a.localeCompare(b,"es")));
    }catch{setTiposEmergencia(TIPOS_EMERGENCIA_BASE);}
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
        // Mantener intacta cualquier captura con datos; renovar solo fechas de formularios vacíos.
        const conMarcas=edit&&Object.values(edit.records||{}).some(v=>["si","presente","justificado"].includes(v));
        const conDatos=edit&&Object.entries(edit).some(([k,v])=>
          !["date","svFecha","tipo","svTipoAct","registrarAsistencia","records"].includes(k)
          && String(v??"").trim()!=="");
        const formulario=edit&&(conMarcas||conDatos)?edit:blanco(tipo);
        setForm(formulario);
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
  function agregarTipoEmergencia(){
    const nuevo=window.prompt("Nuevo tipo de emergencia:");
    if(!nuevo)return;
    const limpio=nuevo.trim().replace(/\\s+/g," ").slice(0,100);
    if(!limpio)return;
    const existente=tiposEmergencia.find(t=>t.toLocaleLowerCase("es")===limpio.toLocaleLowerCase("es"));
    const elegido=existente||limpio;
    if(!existente){
      const siguientes=[...tiposEmergencia,limpio].sort((a,b)=>a.localeCompare(b,"es"));
      try{localStorage.setItem("b5:tipos-emergencia:v1",JSON.stringify(siguientes));}catch{
        setMensaje("No se pudo guardar el tipo en esta tablet.");return;
      }
      setTiposEmergencia(siguientes);
    }
    actualizarCampo("svTipoEmergencia",elegido);
  }
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

  async function guardarCorreccion(datos){
    if(!seleccion||!datos||operando)return false;
    const item=seleccion.item;
    const cuentas=resumenParte(datos.records,item.tipo);
    if(!cuentas.total){setMensajeDetalle("El registro no contiene una nómina válida.");return false;}
    setOperando(true);
    setMensajeDetalle("");
    try{
      if(item.estado==="sincronizado"){
        if(conexion!=="online"||!seleccion.remoto)throw new Error("Para corregir en Neon necesitas Internet y el parte actualizado.");
        const j=await cambiarParteOficial(item,"corregir",datos);
        const actualizado={...item,datos:{...item.datos,...datos}};
        await cambiarBorrador(actualizado);
        await recargarCola();
        setSeleccion({item:actualizado,datos:{...datos,anulado:false},remoto:true,version:j.version});
      }else if(item.estado==="pendiente"||item.estado==="revision"){
        const actualizado={...item,datos:{...datos},estado:"pendiente",error:""};
        await cambiarBorrador(actualizado);
        await recargarCola();
        setSeleccion({item:actualizado,datos:actualizado.datos,remoto:false,version:null});
      }else throw new Error("No se puede modificar una asistencia anulada.");
      setEdicionRegistro(null);
      setClaveOficial("");
      setMensajeDetalle("Corrección guardada. No se creó un parte duplicado.");
      if(item.estado!=="sincronizado"&&conexion==="online")actualizar();
      return true;
    }catch(e){setMensajeDetalle(e.message||"No se pudo corregir la asistencia.");return false;}
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

  async function prepararRecuperacion(item){
    const r=resumenParte(item?.datos?.records,item?.tipo);
    if(item?.estado!=="revision"||item?.tipo!=="lista"||
      item?.datos?.date!=="2026-10-15"||item?.datos?.tipo!=="Citación de Compañía"||
      r.presentes!==10||r.ausentes!==7||r.justificados!==11||r.total!==28){
      setMensajeRecuperacion("Esta captura no coincide con la citación de Comandancia pendiente de recuperación.");
      return;
    }
    if(conexion!=="online"){
      setMensajeRecuperacion("Conecta la tablet a Wi-Fi antes de recuperar el parte oficial.");
      return;
    }
    setMensajeRecuperacion("");
    try{
      const respuesta=await fetch("/api/b5/recuperar-comandancia",{cache:"no-store",credentials:"same-origin"});
      const j=await respuesta.json().catch(()=>({}));
      if(!respuesta.ok)throw new Error("No se pudo revisar el parte oficial. No se modificó ningún dato.");
      if(j.numero!==6 || !j.anulado || j.tipo!=="Citación de Compañía" ||
        !Number.isInteger(j.version))
        throw new Error("El parte oficial ya cambió. No es seguro sobrescribirlo; revisa su estado.");
      setClaveRecuperacion("");
      setRecuperacion({item,version:j.version,numero:j.numero});
    }catch(e){setMensajeRecuperacion(e.message||"No se pudo preparar la recuperación.");}
  }

  async function confirmarRecuperacion(){
    if(!recuperacion||recuperando)return;
    if(!claveRecuperacion.trim()){
      setMensajeRecuperacion("Debes ingresar la clave de Oficialidad antes de recuperar el parte.");
      return;
    }
    const item=recuperacion.item;
    setRecuperando(true);setMensajeRecuperacion("");
    try{
      const auth=await fetch("/api/auth/officiality",{method:"POST",
        credentials:"same-origin",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({pin:claveRecuperacion})});
      if(!auth.ok)throw new Error("La clave de Oficialidad no fue aceptada.");
      const response=await fetch("/api/b5/recuperar-comandancia",{method:"POST",
        credentials:"same-origin",cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({version:recuperacion.version,
          fuente:{id:item.id,date:item.datos.date,tipo:item.datos.tipo,
            records:item.datos.records,detalle:item.datos.detalle||"",
            registradoPor:item.datos.registradoPor||""}})});
      const j=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(j.error==="version_conflict"?
        "El parte oficial cambió mientras lo revisabas. Ningún registro fue sobrescrito.":
        "No se pudo recuperar el parte ("+(j.error||response.status)+").");
      // El servidor ya confirmó su restauración. Las copias locales se actualizan
      // después; ante un error aquí el POST es idempotente y conserva el N.º 6.
      const vigente=await listarBorradores();
      for(const local of vigente){
        if(local.id===item.id)await cambiarBorrador({...local,estado:"sincronizado",
          numero:6,error:"",sincronizadoEn:new Date().toISOString(),recuperadoComandancia:true});
        else if(local.tipo==="lista"&&local.numero===6 &&
          local.datos?.date==="2026-10-15"&&local.estado==="anulado")
          await cambiarBorrador({...local,estado:"sustituido",
            error:"Copia anterior: asistencia cero. El parte oficial N.º 6 fue recuperado."});
      }
      await recargarCola();
      setRecuperacion(null);setClaveRecuperacion("");
      setMensajeRecuperacion("Citación de Comandancia recuperada como parte oficial N.º 6: 10 presentes, 7 ausentes y 11 justificados. Ya puedes generar el PDF y compartirlo por WhatsApp.");
    }catch(e){
      setMensajeRecuperacion(e.message||"No se pudo finalizar la recuperación. Conserva ambas copias.");
    }finally{setRecuperando(false);}
  }

  function solicitarGuardar(){
    if(guardando||!nomina.length||!listaPreparada)return;
    if(tipo==="lista"&&(!form.date||!form.tipo))return setMensaje("Indica la fecha y el tipo de citación.");
    if(tipo==="servicio"&&(!form.svFecha||!form.svTipoAct))return setMensaje("Indica la fecha y el tipo de servicio.");
    if(tipo==="servicio" && form.svTipoAct==="Emergencia"){
      if(!String(form.svTipoEmergencia||"").trim())return setMensaje("Selecciona o agrega el tipo de emergencia.");
      if(!form.svHoraEmergencia||!form.svHoraLista||!String(form.svClave||"").trim()||!String(form.svUnidadCargo||"").trim()||!String(form.svConductor||"").trim())return setMensaje("Completa las dos horas, clave, OBAC y maquinista antes de guardar.");
      const presentes=nomina.filter(p=>form.records?.[p.id]==="si").length;
      const direccion=[form.svCalle,form.svNumeracion,form.svSector].filter(v=>String(v||"").trim()).join(" ").trim();
      if(!direccion||!String(form.svTipoAct||"").trim()||!String(form.svFecha||"").trim()||!presentes){
        return setMensaje("PARTE INCOMPLETO: faltan datos de la emergencia o voluntarios presentes. No se guardará ni enviará a Neon. Los borradores vacíos podrán eliminarse del historial tras revisión.");
      }
    }
    if(tipo==="lista" && !nomina.some(p=>form.records?.[p.id]==="presente"))return setMensaje("ASISTENCIA INCOMPLETA: marca al menos un voluntario presente. No se guardará una lista vacía.");
    const fechaCaptura=tipo==="servicio"?form.svFecha:form.date;
    if(fechaCaptura!==fechaLocal()&&!window.confirm(
      "La fecha del parte es "+fechaLegible(fechaCaptura)+", distinta de hoy ("+
      fechaLegible(fechaLocal())+"). ¿Confirmas que corresponde al día real del servicio?"+
      " La sincronización no cambiará esta fecha."
    ))return;
    const defecto=tipo==="servicio"?"no":"ausente";
    const records=Object.fromEntries(nomina.map(p=>[String(p.id),form.records?.[p.id]||defecto]));
    const datos={...form,records};
    if(tipo==="lista"&&form.tipo==="Otro"){
      if(!String(form.tipoPersonalizado||"").trim())return setMensaje("Indica qué citación se está registrando.");
      datos.tipo=String(form.tipoPersonalizado).trim();
    }
    setMensaje("");
    setConfirmacion({modo:"nuevo",datos,clase:tipo,fecha:datos.date||datos.svFecha,
      actividad:datos.tipo||datos.svTipoAct});
  }

  function solicitarCorreccion(){
    if(!seleccion||!edicionRegistro||operando)return;
    if(seleccion.item.estado==="sincronizado"&&(!seleccion.remoto||conexion!=="online")){
      setMensajeDetalle("Conéctate a Internet para corregir la versión oficial.");
      return;
    }
    const datos={...edicionRegistro,records:{...edicionRegistro.records}};
    setConfirmacion({modo:"correccion",datos,clase:seleccion.item.tipo,
      fecha:datos.date||datos.svFecha,actividad:datos.tipo||datos.svTipoAct,
      numero:seleccion.item.numero});
  }

  async function guardar(datos){
    if(guardando||!nomina.length||!listaPreparada)return false;
    setGuardando(true);setMensaje("");
    try{
      const item=await guardarBorrador(tipo,datos);
      guardadoRef.current=true;
      await borrarEdicion(tipo);
      setForm(blanco(tipo));
      setMensaje("Parte guardado en esta tablet. Cuando Neon confirme, aparecerá su número oficial. Código local: "+item.id.slice(0,8));
      await recargarCola();
      if(conexion==="online")actualizar();
      return true;
    }catch(e){setMensaje("No se pudo guardar en la tablet: "+e.message);return false;}
    finally{setGuardando(false);}
  }

  async function confirmarGuardar(){
    if(!confirmacion||guardando||operando)return;
    const ok=confirmacion.modo==="correccion"?
      await guardarCorreccion(confirmacion.datos):await guardar(confirmacion.datos);
    if(ok)setConfirmacion(null);
  }

  async function descargarPDF(blob,nombre){
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download=nombre;link.style.display="none";
    document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),60000);
  }

  async function compartirParte(item,modo){
    if(item.estado!=="sincronizado"||procesandoArchivo)return;
    setProcesandoArchivo(item.id+modo);
    setMensajeArchivo("");
    try{
      if(item.tipo==="servicio"){
        const modelo=prepararEmergenciaPDF(item,item.datos,nomina);
        const {blob,nombre:archivo}=await crearEmergenciaPDF(modelo);
        if(modo==="whatsapp"){
          const file=new File([blob],archivo,{type:"application/pdf"});
          if(navigator.canShare?.({files:[file]})&&navigator.share){
            try{await navigator.share({files:[file],title:"Emergencia B-5 "+modelo.numero});return;}
            catch(e){if(e.name==="AbortError")return;}
          }
        }
        await descargarPDF(blob,archivo);
        setMensajeArchivo(modo==="whatsapp"?"PDF descargado; adjúntalo en WhatsApp.":"PDF de emergencia descargado.");
        return;
      }
      if(conexion!=="online")throw new Error("Conecta la tablet a Internet para obtener el parte oficial actualizado.");
      const params=new URLSearchParams({id:item.id,date:item.datos.date,tipo:item.datos.tipo});
      const r=await fetch("/api/b5/registros?"+params.toString(),{cache:"no-store",credentials:"same-origin"});
      if(!r.ok)throw new Error("No se pudo comprobar el parte oficial en Neon. Intenta nuevamente.");
      const respuesta=await r.json();
      if(!respuesta.ok||respuesta.datos?.anulado||Number(respuesta.datos?.numero)!==Number(item.numero))
        throw new Error("El parte está anulado o cambió. Revísalo antes de generar el PDF.");
      const modelo=prepararPartePDF(item,respuesta.datos,nomina);
      const {blob,nombre:archivo}=await crearArchivoPartePDF(modelo);
      if(modo==="whatsapp"){
        const file=new File([blob],archivo,{type:"application/pdf"});
        if(navigator.canShare?.({files:[file]})&&navigator.share){
          try{
            await navigator.share({files:[file],title:"Asistencia Germania N° "+modelo.numero,
              text:"Parte oficial de asistencia · "+modelo.fecha});
            setMensajeArchivo("PDF compartido desde el teléfono. Confirma el envío a WhatsApp.");
            return;
          }catch(e){if(e.name==="AbortError")return;}
        }
        await descargarPDF(blob,archivo);
        setMensajeArchivo("PDF descargado. Elige WhatsApp y adjunta el archivo "+archivo+
          " desde Descargas; este navegador no permite compartirlo directamente.");
      }else{
        await descargarPDF(blob,archivo);
        setMensajeArchivo("PDF oficial descargado: "+archivo);
      }
    }catch(e){
      setMensajeArchivo(e.message||"No fue posible generar el PDF.");
    }finally{setProcesandoArchivo("");}
  }

  const pendientes=contarPendientes(cola);
  const bloqueados=cola.filter(i=>i.estado==="revision");
  const confirmados=cola.filter(i=>i.estado==="sincronizado");
  const visibles=cola.filter(i=>i.tipo===tipo && !["anulado","sustituido"].includes(i.estado));
  const historicos=cola.filter(i=>i.tipo===tipo && ["anulado","sustituido"].includes(i.estado));
  const etiqueta=conexion==="online"?
    (bloqueados.length&&pendientes===bloqueados.length?"EN LÍNEA · Registros para revisión":
      pendientes?"EN LÍNEA · Sincronizando registros pendientes":"EN LÍNEA · Neon disponible"):
    conexion==="offline"?"SIN CONEXIÓN · Tomando datos en esta tablet":"COMPROBANDO LA CONEXIÓN…";
  return (
    <main className="capturaB5">
      <header className="barra">
        <div><h1>GERMANIA · B-5</h1><p>{tipo==="servicio"?modoServicio==="carro"?"Servicio Carro":"Emergencia B-5":"Asistencia · Pasar lista"}</p></div>
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
          <h2>{tipo==="servicio"?modoServicio==="carro"?"Servicio Carro":"Parte de Emergencia B-5":"Parte de asistencia"}</h2>
          <small>{nomina.length?nomina.length+" voluntarios en nómina local":"Nómina local no preparada"}</small>
        </div>
        {!nomina.length&&<p className="alarma">Para trabajar sin Internet, abre la tablet una vez con conexión para descargar la nómina. No se guardará una lista incompleta.</p>}
        {!!nominaFecha&&<p className="fechaNomina">Nómina descargada: {new Date(nominaFecha).toLocaleString("es-CL")}. Se verifica cuando hay conexión.</p>}
        <div className="campos">
          {tipo==="servicio"?<>
            <label>Fecha<input type="date" value={form.svFecha||""} onChange={e=>actualizarCampo("svFecha",e.target.value)}/></label>
            {modoServicio==="carro"&&<label>Tipo de actividad
              <select value={form.svTipoAct||"Emergencia"} onChange={e=>setForm(d=>({...d,svTipoAct:e.target.value,
                  registrarAsistencia:e.target.value==="Emergencia"||e.target.value==="Acto de servicio"}))}>
                {SERVICIOS.filter(x=>x!=="Emergencia").map(x=><option key={x}>{x}</option>)}
              </select>
            </label>}
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
        {tipo==="servicio"&&modoServicio==="emergencia"&&<>
          <h3 className="seccionFicha">1. Personal a cargo</h3>
          <div className="campos">
            <label>OBAC *<input value={form.svUnidadCargo||""} onChange={e=>actualizarCampo("svUnidadCargo",e.target.value)}/></label>
            <label>Maquinista *<input value={form.svConductor||""} onChange={e=>actualizarCampo("svConductor",e.target.value)}/></label>
          </div>
          <h3 className="seccionFicha">2. Información de la emergencia</h3>
          <div className="campos">
            <label>Clave de despacho *<input inputMode="text" placeholder="Ej.: 10-01" value={form.svClave||""} onChange={e=>actualizarCampo("svClave",e.target.value)}/></label>
            <label>Tipo de emergencia *
              <select value={form.svTipoEmergencia||""} onChange={e=>actualizarCampo("svTipoEmergencia",e.target.value)}>
                <option value="">Seleccionar tipo</option>
                {tiposEmergencia.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <button type="button" className="agregarTipo" onClick={agregarTipoEmergencia}>+ Agregar tipo de emergencia</button>
          </div>
          <div className="campos">
          <label>Hora del llamado * <small>(formato 24 horas, HH:MM)</small><input type="time" lang="es-CL" step="60" value={form.svHoraEmergencia||""} onChange={e=>actualizarCampo("svHoraEmergencia",e.target.value)}/></label>
          <label>Hora de lista final * <small>(después de ordenar el carro, HH:MM)</small><input type="time" lang="es-CL" step="60" value={form.svHoraLista||""} onChange={e=>actualizarCampo("svHoraLista",e.target.value)}/></label>
          <label>Dirección / calle<input value={form.svCalle||""} onChange={e=>actualizarCampo("svCalle",e.target.value)}/></label>
          <label>Número<input value={form.svNumeracion||""} onChange={e=>actualizarCampo("svNumeracion",e.target.value)}/></label>
          <label>Sector (opcional)<input value={form.svSector||""} onChange={e=>actualizarCampo("svSector",e.target.value)}/></label>
          </div>
          <h3 className="seccionFicha">3. Observaciones y recursos</h3>
          <div className="campos">
            <label>Observaciones<textarea value={form.svObservaciones||""} onChange={e=>actualizarCampo("svObservaciones",e.target.value)}/></label>
            <label>Unidades de apoyo<input value={form.svApoyo||""} onChange={e=>actualizarCampo("svApoyo",e.target.value)}/></label>
            <label>Material utilizado<input value={form.svMaterial||""} onChange={e=>actualizarCampo("svMaterial",e.target.value)}/></label>
          </div>
        </>}
        {tipo==="servicio"&&modoServicio==="carro"&&CAMPOS.map(([grupo,campos],idx)=>
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
            <h3>{tipo==="servicio"&&modoServicio==="emergencia"?"4. Nómina de concurrentes":tipo==="servicio"?"Concurrencia de voluntarios":"Pasar lista"}</h3>
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
          {tipo==="servicio"&&modoServicio!=="emergencia"&&<label className="check">
            <input type="checkbox" checked={form.registrarAsistencia!==false}
              onChange={e=>actualizarCampo("registrarAsistencia",e.target.checked)}/>
            Sumar esta salida al control de asistencia
          </label>}
        </section>
        <p className="guiaGuardado">1. Marca a cada voluntario. 2. Revisa los totales. 3. Confirma que la asistencia está correcta. Si alguien no se marca, quedará como ausente.</p>
        <button className="guardar" disabled={!nomina.length||guardando||!listaPreparada} onClick={solicitarGuardar}>
          {guardando?"Guardando en la tablet…":"5. Revisar antes de guardar"}
        </button>
        <p className="explicacion">Primero se guarda en la memoria de la tablet. Solo aparecerá como sincronizado cuando Neon confirme la recepción y asigne el número oficial. No borres los datos del navegador si hay pendientes.</p>
        {conexion==="online"&&<a className="formularioCompleto" href={"/?b5dest="+tipo}>
          Abrir formulario completo y PDF (solo con Internet)
        </a>}
        <section className="historial" aria-label="Partes oficiales en Neon">
          <h3>Partes oficiales registrados · {tipo==="lista"?"Asistencia":"Servicio y emergencias"}</h3>\n          <details className="historialAuditoria" key={"historial-"+tipo}>\n            <summary>{tipo==="servicio"?"Emergencias realizadas":"Asistencias registradas"} · {historialNeon.filter(x=>!x.anulado).length}</summary>\n            <div style={{maxHeight:"340px",overflowY:"auto",overscrollBehavior:"contain",padding:"8px 2px"}}>
          <p className="explicacion">Estos partes están guardados en Neon y siguen visibles aunque se cambie de tablet. Los anulados no cuentan como asistencia.</p>
          <button type="button" onClick={()=>cargarHistorialNeon(tipo)} disabled={conexion!=="online"}>Actualizar historial oficial</button>
          {conexion!=="online"&&<p className="avisoLocal">Sin Internet: consulta los registros locales que aparecen debajo.</p>}
          {!!errorHistorial&&<p className="avisoLocal">Historial oficial no disponible: {errorHistorial}</p>}
          {historialNeon.filter(x=>!x.anulado).slice(0,30).map(x=><div className="registro registroB5" key={x.clave}>
            <div className="registroEncabezado"><strong>N.º {x.numero||"—"}/{x.anio||"—"} · {fechaLegible(x.fecha)}</strong><span>Guardado en Neon</span></div>
            <div>{x.tipo||"Sin tipo"}{x.claveDespacho?" · Clave "+x.claveDespacho:""} · {x.presentes} presentes</div>
            {x.vinculacion&&<small>Asistencia vinculada a un servicio B-5; no corresponde a una nueva citación.</small>}
          </div>)}
          {!!historialNeon.filter(x=>x.anulado).length&&<details className="historialAuditoria"><summary>Partes oficiales anulados · {historialNeon.filter(x=>x.anulado).length}</summary>
            {historialNeon.filter(x=>x.anulado).map(x=><p key={x.clave}>N.º {x.numero||"—"} · {fechaLegible(x.fecha)} · {x.tipo} · Anulado</p>)}
          </details>}
            </div>\n          </details>\n        </section>
        {(visibles.length>0||historicos.length>0)&&<section className="historial">
          <h3>Registros de esta tablet</h3>
          {visibles.slice().sort((a,b)=>b.creadoEn.localeCompare(a.creadoEn)).slice(0,20).map(x=>{
            const r=resumenParte(x.datos?.records,x.tipo);
            return <div className="registro registroB5" key={x.id}>
              <div className="registroEncabezado">
                <strong>{x.tipo==="servicio"?"Emergencias":"Asistencia"} · {fechaLegible(x.datos?.date||x.datos?.svFecha)}</strong>
                <span>{x.estado==="sustituido"?"Copia anterior (conservada) · N° "+x.numero:
                  x.estado==="anulado"?"Anulado · N° "+x.numero:
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
                <button type="button" disabled={x.tipo!=="lista"||x.estado==="anulado"||x.estado==="sustituido"} onClick={()=>verRegistro(x,true)}>Editar</button>
                {(x.tipo==="lista"||x.datos?.svTipoAct==="Emergencia")&&<>
                  <button type="button" disabled={x.estado!=="sincronizado"||conexion!=="online"||!!procesandoArchivo}
                    onClick={()=>compartirParte(x,"pdf")}>PDF</button>
                  <button type="button" disabled={x.estado!=="sincronizado"||conexion!=="online"||!!procesandoArchivo}
                    onClick={()=>compartirParte(x,"whatsapp")}>WhatsApp</button>
                </>}
                <button type="button" className="accionPeligro" disabled={x.estado==="sustituido"}
                  onClick={async()=>{await verRegistro(x);setMensajeDetalle("Revisa los datos y elige Anular o Eliminar dentro del detalle.");}}>Borrar</button>
                {x.estado==="revision"&&x.tipo==="lista"&&x.datos?.date==="2026-10-15"&&
                  x.datos?.tipo==="Citación de Compañía"&&r.presentes===10&&r.ausentes===7&&
                  r.justificados===11&&r.total===28&&
                  <button type="button" className="botonRecuperar" onClick={()=>prepararRecuperacion(x)}>
                    Recuperar citación de Comandancia · N.º 6
                  </button>}
              </div>
            </div>;
          })}
          {!!historicos.length&&<details className="historialAuditoria"><summary>Historial de auditoría · {historicos.length} copias anuladas o anteriores</summary><p>Estos registros se conservan para auditoría y no deben contabilizarse como asistencias vigentes.</p>{historicos.slice().sort((a,b)=>b.creadoEn.localeCompare(a.creadoEn)).map(x=><div className="registro registroB5" key={x.id}><strong>{fechaLegible(x.datos?.date||x.datos?.svFecha)} · N.º {x.numero||"sin número"}</strong><p>{x.estado==="sustituido"?"Copia anterior conservada":"Parte anulado"} · {x.datos?.tipo||x.datos?.svTipoAct}</p><button type="button" onClick={()=>verRegistro(x)}>Ver respaldo</button></div>)}</details>}
          {!!mensajeArchivo&&<p className="avisoLocal" role="status">{mensajeArchivo}</p>}
          {seleccion&&<section className="detalleRegistro" id="detalleRegistroB5">
            <div className="registroEncabezado">
              <h3>Parte {seleccion.item.numero?"N.º "+seleccion.item.numero:"sin número"} · {fechaLegible(seleccion.datos.date||seleccion.datos.svFecha)}</h3>
              <button type="button" onClick={()=>{setSeleccion(null);setEdicionRegistro(null);setMensajeDetalle("");}}>Cerrar</button>
            </div>
            <p>{seleccion.datos.tipo||seleccion.datos.svTipoAct} · {seleccion.datos.detalle||"Sin detalle"}</p>
            {seleccion.item.tipo==="servicio"&&seleccion.datos.svTipoAct==="Emergencia"&&<p>Hora de emergencia: {seleccion.datos.svHoraEmergencia||"Sin registrar"} · Hora de lista: {seleccion.datos.svHoraLista||"Sin registrar"} · Clave: {seleccion.datos.svClave||"Sin registrar"}</p>}
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
              {Object.entries((edicionRegistro||seleccion.datos).records||{}).filter(([,status])=>seleccion.item.tipo!=="servicio"||status==="si").map(([id,status])=>{
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
                <button type="button" disabled={operando} onClick={solicitarCorreccion}>Revisar corrección</button>
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
      {!!mensajeRecuperacion&&!recuperacion&&<p className="avisoLocal" role="status">{mensajeRecuperacion}</p>}
      {recuperacion&&<div className="confirmacionFondo">
        <section className="confirmacionPanel" role="dialog" aria-modal="true" aria-labelledby="tituloRecuperacionB5">
          <div className="confirmacionPaso">RECUPERACIÓN DE ASISTENCIA · 15/10/2026</div>
          <h2 id="tituloRecuperacionB5">Restaurar citación de Comandancia</h2>
          <p>El parte oficial N.º 6 está anulado con 28 ausentes. La lista correcta de esta tablet contiene:</p>
          <div className="confirmacionTotales">
            <div><strong>10</strong><span>Presentes</span></div>
            <div><strong>7</strong><span>Ausentes</span></div>
            <div><strong>11</strong><span>Justificados</span></div>
          </div>
          <p>Esta recuperación conservará el número N.º 6, corregirá el tipo de citación a Comandancia y guardará el historial original. No afectará al parte del 14 de octubre.</p>
          <label className="claveOficial">Clave de Oficialidad
            <input type="password" autoComplete="off" value={claveRecuperacion}
              onChange={e=>setClaveRecuperacion(e.target.value)}/>
          </label>
          {!!mensajeRecuperacion&&<p className="alertaVacia" role="status">{mensajeRecuperacion}</p>}
          <div className="confirmacionAcciones">
            <button type="button" disabled={recuperando} onClick={()=>{setRecuperacion(null);setClaveRecuperacion("");}}>Cancelar</button>
            <button type="button" className="confirmarDefinitivo" disabled={recuperando} onClick={confirmarRecuperacion}>
              {recuperando?"Recuperando…":"Sí, recuperar parte N.º 6"}
            </button>
          </div>
        </section>
      </div>}
      {confirmacion&&<div className="confirmacionFondo">
        <section className="confirmacionPanel" role="dialog" aria-modal="true" aria-labelledby="tituloConfirmacionB5">
          <div className="confirmacionPaso">PASO FINAL · VERIFICACIÓN</div>
          <h2 id="tituloConfirmacionB5">¿Está seguro de guardar este parte?</h2>
          <p>{confirmacion.modo==="correccion"?
            "Se corregirá el parte existente, conservando su número oficial y el historial de cambios.":
            "Primero quedará guardada en esta tablet. Con Internet se enviará automáticamente a Neon."}</p>
          <div className="confirmacionDatos">
            <div><strong>Fecha</strong><span>{fechaLegible(confirmacion.fecha)}</span></div>
            <div><strong>Actividad</strong><span>{confirmacion.actividad}</span></div>
            {confirmacion.clase==="servicio"&&confirmacion.datos.svTipoAct==="Emergencia"&&<>
              <div><strong>Hora emergencia</strong><span>{confirmacion.datos.svHoraEmergencia}</span></div>
              <div><strong>Hora lista</strong><span>{confirmacion.datos.svHoraLista}</span></div>
              <div><strong>Clave</strong><span>{confirmacion.datos.svClave}</span></div>
              <div><strong>Tipo emergencia</strong><span>{confirmacion.datos.svTipoEmergencia}</span></div>
              <div><strong>Dirección</strong><span>{[confirmacion.datos.svCalle,confirmacion.datos.svNumeracion,confirmacion.datos.svSector].filter(Boolean).join(" ")}</span></div>
              <div><strong>OBAC</strong><span>{confirmacion.datos.svUnidadCargo}</span></div>
              <div><strong>Maquinista</strong><span>{confirmacion.datos.svConductor}</span></div>
            </>}
            {confirmacion.numero&&<div><strong>Parte</strong><span>N.º {String(confirmacion.numero).padStart(3,"0")}</span></div>}
          </div>
          {(()=>{const r=resumenParte(confirmacion.datos.records,confirmacion.clase);
            const ids=Object.entries(confirmacion.datos.records)
              .filter(([,v])=>v===(confirmacion.clase==="servicio"?"si":"presente")).map(([id])=>id);
            return <>
              <div className="confirmacionTotales">
                <div><strong>{r.presentes}</strong><span>{confirmacion.clase==="servicio"?"Concurrentes":"Presentes"}</span></div>
                <div><strong>{r.ausentes}</strong><span>{confirmacion.clase==="servicio"?"No concurren":"Ausentes"}</span></div>
                {confirmacion.clase==="lista"&&<div><strong>{r.justificados}</strong><span>Justificados</span></div>}
              </div>
              {!r.presentes&&<p className="confirmacionAlerta">Atención: no hay voluntarios presentes. Confirma solo si realmente corresponde.</p>}
              {!!ids.length&&<details className="confirmacionLista">
                <summary>Ver los {ids.length} voluntarios presentes</summary>
                <ol>{ids.map(id=><li key={id}>
                  {nomina.find(p=>String(p.id)===id)?nombre(nomina.find(p=>String(p.id)===id)):"Voluntario ID "+id}
                </li>)}</ol>
              </details>}
            </>;
          })()}
          <p className="confirmacionAyuda">Revisa la fecha, la actividad y las cantidades. Si hay un error, vuelve a la lista antes de confirmar.</p>
          <div className="confirmacionAcciones">
            <button type="button" disabled={guardando||operando} onClick={()=>setConfirmacion(null)}>No, revisar de nuevo</button>
            <button type="button" className="confirmarDefinitivo" disabled={guardando||operando} onClick={confirmarGuardar}>
              {guardando||operando?"Guardando…":"Sí, estoy seguro · Guardar"}
            </button>
          </div>
        </section>
      </div>}
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
        .seccionFicha{margin:18px 0 7px;padding:9px 12px;background:#1b3448;border-left:4px solid #e4ba58;border-radius:5px;font-size:17px}
        .agregarTipo{align-self:end;min-height:44px;background:#243f57;color:#fff;border:1px solid #819bb1;border-radius:8px;font-weight:700}
        .campos textarea{width:100%;min-height:80px;background:#081522;color:white;border:1px solid #587089;border-radius:8px;padding:10px;font:inherit}
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
        .accionesRegistro .botonRecuperar{background:#17663f;color:#fff;border-color:#8bd4a7;
          flex-basis:100%;min-height:44px}
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
        .confirmacionFondo{position:fixed;inset:0;background:#000c;z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
        .confirmacionPanel{background:#122436;color:#f4f9fe;border:2px solid #e0b654;border-radius:16px;
          padding:20px;max-width:560px;width:100%;max-height:90dvh;overflow:auto;box-shadow:0 18px 55px #0009}
        .confirmacionPanel h2{font-size:21px;line-height:1.25;margin:10px 0}
        .confirmacionPanel p{font-size:14px;line-height:1.5}
        .confirmacionPaso{font-size:11px;font-weight:800;letter-spacing:1px;color:#e8cf8b}
        .confirmacionDatos{display:grid;gap:6px;background:#1c3447;padding:12px;border-radius:8px}
        .confirmacionDatos>div{display:flex;justify-content:space-between;gap:8px;font-size:14px}
        .confirmacionDatos strong{color:#cbddea}
        .confirmacionTotales{display:flex;gap:8px;margin:12px 0}
        .confirmacionTotales>div{flex:1;text-align:center;border:1px solid #587c8b;border-radius:8px;padding:10px 4px}
        .confirmacionTotales strong{display:block;font-size:28px;color:#fff}
        .confirmacionTotales span{font-size:11px;color:#c6d8e7}
        .confirmacionAlerta{background:#692d1d;border:1px solid #e39b61;border-radius:8px;padding:10px;color:#fff1dc}
        .confirmacionLista{max-height:170px;overflow:auto;font-size:13px;border:1px solid #526e88;border-radius:8px;padding:9px}
        .confirmacionLista summary{font-size:13px}
        .confirmacionLista li{padding:2px 0}
        .confirmacionAyuda{color:#d9e9f2}
        .confirmacionAcciones{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .confirmacionAcciones button{border-radius:9px;border:1px solid #8099aa;color:#fff;background:#344d62;
          padding:14px 8px;font-size:14px;font-weight:800}
        .confirmacionAcciones .confirmarDefinitivo{background:#166e43;border-color:#79cba0}
        .confirmacionAcciones button:disabled{opacity:.55}
        .registro{padding:10px 0;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-bottom:1px solid #3e5267}
        .registro.registroB5{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
        .guiaGuardado{background:#172d3d;border:1px solid #426882;border-radius:10px;padding:11px 13px;color:#dfebf3;font-size:14px;line-height:1.55}
        .registro strong{color:#f4d37b}.registro small{width:100%;color:#ffcc85}
        /* Tablet B-5: formulario compacto sin reducir las zonas táctiles. */
        @media(min-width:621px) and (max-width:900px){
          .capturaB5{padding:9px 12px 20px}
          .contenido{padding:12px}
          .campos{gap:8px 12px;margin:9px 0}
          .campos label{gap:4px}
          .campos input,.campos select,.campos textarea{padding:8px 10px;min-height:44px}
          .franja h2{font-size:19px}
          .persona{padding:8px 0}
        }
        @media(max-width:620px){.capturaB5{padding:10px}.campos{grid-template-columns:1fr}
          .persona{flex-direction:column;align-items:stretch}.opciones{justify-content:stretch}.opciones button{flex:1;padding:9px 5px}
          .barra h1{font-size:18px}}
      `}</style>
    </main>
  );
}
