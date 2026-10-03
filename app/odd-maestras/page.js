"use client";
import {useEffect,useMemo,useState} from "react";
import "./odd.css";
import {LOGO_B64} from "../../lib/logo";
const TYPES=[["citacion","Citación / Academia / Ejercicio"],["guardia","Guardia Nocturna"],["nomina","Nómina y Claves"],["disposicion","Informativa / Disposición General"]];
const today=new Date().toISOString().slice(0,10);
export default function Page(){
 const[type,setType]=useState("citacion");
 const[status,setStatus]=useState("");
 const[archive,setArchive]=useState([]);
 const[roster,setRoster]=useState([]);
 const[selected,setSelected]=useState([]);
 const[guardDate,setGuardDate]=useState("");
 const[guardEndDate,setGuardEndDate]=useState("");
 const[guard,setGuard]=useState(null);
 const[guardWeek,setGuardWeek]=useState([]);
 const[loading,setLoading]=useState(false);
 const[pdfUrl,setPdfUrl]=useState("");
 const[signers,setSigners]=useState({capitan:true,ayudante:true});
 const[officials,setOfficials]=useState({capitan:null,ayudante:null});
 const[annexes,setAnnexes]=useState([]);
 const[f,setF]=useState({year:new Date().getFullYear(),number:"",issueDate:today,title:"",eventDate:"",time:"20:00",place:"Cuartel General, Valentín Letelier #630",activity:"Academia",topic:"",clothing:"Civil",punctuality:"Se exige PUNTUALIDAD",excuses:"germaniacbv@gmail.com",recipients:"Quinta Compañía",seen:"",considering:"",provisions:"",notes:""});
 useEffect(()=>{try{const q=new URLSearchParams(window.location.search).get("tipo");if(["citacion","guardia","nomina","disposicion"].includes(q))setType(q);setArchive(JSON.parse(localStorage.getItem("germania:odd-maestras:v1")||"[]"));fetch("/api/state/odd:maestras:v1",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(x=>{if(Array.isArray(x.value)){setArchive(x.value);localStorage.setItem("germania:odd-maestras:v1",JSON.stringify(x.value))}}).catch(()=>{})}catch{}
   fetch("/api/state/roster:v8",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(x=>{
     const list=Array.isArray(x.value)?x.value.filter(p=>p.activo!==false):[];
     setRoster(list);setSelected(list.map(p=>String(p.clave)));setOfficials({capitan:list.find(p=>String(p.cargo||"").toLowerCase().includes("capit"))||null,ayudante:list.find(p=>String(p.cargo||"").toLowerCase().includes("ayud"))||null});
   }).catch(()=>setStatus("La nómina central no está disponible en este entorno de prueba."));
 },[]);
 const fullName=p=>[p.nombre,p.apellidoPaterno||p.ap,p.apellidoMaterno||p.am].filter(Boolean).join(" ");
 const selectedRoster=useMemo(()=>roster.filter(p=>selected.includes(String(p.clave))),[roster,selected]);
 const toggleMember=code=>setSelected(x=>x.includes(code)?x.filter(v=>v!==code):[...x,code]);
 const guardRow=(x,date)=>({date,total:Number(x?.total||0),complete:Boolean(x?.completa),obac:x?.obacAsignado?.nombre||"Sin asignar",driver:x?.conductor?.nombre||"Sin asignar",people:(x?.personal||[]).map(p=>({code:p.codigo||p.clave||"",name:p.nombre||""}))});
 const loadGuard=async()=>{
   if(!guardDate){setStatus("Selecciona la fecha inicial de Guardia.");return}
   setLoading(true);setStatus("");
   try{
     const start=new Date(guardDate+"T12:00:00"),dates=[];
     const requestedEnd=guardEndDate?new Date(guardEndDate+"T12:00:00"):null;
     for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(requestedEnd&&d>requestedEnd)break;dates.push(d.toISOString().slice(0,10))}
     const rows=await Promise.all(dates.map(async date=>{const r=await fetch("/api/guardia/orden-dia?fecha="+encodeURIComponent(date),{cache:"no-store"});const x=await r.json();if(!r.ok)throw new Error(x.error||"Guardia");return guardRow(x,date)}));
     setGuardWeek(rows);setGuard(rows[0]||null);
     if(!guardEndDate&&rows.length)setGuardEndDate(rows.at(-1).date);
     const pending=rows.filter(x=>x.obac==="Sin asignar"||x.driver==="Sin asignar"||!x.complete);
     setStatus(pending.length?"Semana cargada. "+pending.length+" noche(s) requieren revisión antes de emitir.":"Semana completa cargada desde Guardia.");
   }catch{setGuard(null);setGuardWeek([]);setStatus("No fue posible cargar el período de Guardia.")}finally{setLoading(false)}
 };
 const set=(k,v)=>setF(x=>({...x,[k]:v}));
 const authority=type==="citacion"?"Artículo 92 ter":"Artículo 91 inciso 1°";
 const addAnnex=e=>{const files=[...(e.target.files||[])];Promise.all(files.map(file=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve({name:file.name,type:file.type,size:file.size,data:String(r.result||"")});r.onerror=()=>resolve({name:file.name,type:file.type,size:file.size,data:""});r.readAsDataURL(file)}))).then(items=>setAnnexes(x=>[...x,...items]));e.target.value=""};
 const persist=async(estado)=>{
   if(!f.year||!f.number||!f.title){setStatus("Completa año, Nº ODD y asunto.");return false}
   if(estado==="emitida"&&type==="nomina"&&!selectedRoster.length){setStatus("No se puede emitir una nómina sin voluntarios seleccionados.");return false}
   if(estado==="emitida"&&type==="disposicion"&&(!f.seen.trim()||!f.considering.trim()||!f.provisions.trim())){setStatus("Completa VISTOS, CONSIDERANDO y SE DISPONE antes de emitir.");return false}
   if(estado==="emitida"&&type==="citacion"&&(!f.eventDate||!f.time||!f.place.trim()||!f.topic.trim())){setStatus("Completa fecha, hora, lugar y tema de la citación antes de emitir.");return false}
   if(estado==="emitida"&&type==="guardia"){if(!guardWeek.length){setStatus("Carga primero la programación semanal desde Guardia.");return false}const fd=guardWeek.filter(x=>!x.complete).map(x=>x.date),fo=guardWeek.filter(x=>x.obac==="Sin asignar").map(x=>x.date),fc=guardWeek.filter(x=>x.driver==="Sin asignar").map(x=>x.date);if(fd.length||fo.length||fc.length){const m=[];if(fd.length)m.push("dotación mínima: "+fd.join(", "));if(fo.length)m.push("OBAC: "+fo.join(", "));if(fc.length)m.push("conductor: "+fc.join(", "));setStatus("No se puede emitir la ODD de Guardia Nocturna. Falta completar "+m.join(" · ")+".");return false}}
   const key=String(f.year)+"-"+String(f.number).padStart(3,"0");
   if(estado==="emitida"&&archive.some(x=>x.key===key&&x.estado==="emitida")){setStatus("Ese correlativo ya fue emitido.");return false}
   if(estado==="emitida"&&type==="citacion"){
     if(!selectedRoster.length){setStatus("Selecciona al menos un voluntario citado.");return false}
     try{
       const r=await fetch("/api/asistencia/odd-citacion",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({oddKey:key,date:f.eventDate,title:f.title,activity:f.activity,citedIds:selectedRoster.map(p=>String(p.id))})});
       const x=await r.json(); if(!r.ok)throw new Error(x.error||"asistencia");
     }catch{setStatus("No se emitió la ODD: no fue posible crear su registro oficial de asistencia.");return false}
   }
   const rec={key,type,estado,form:{...f},naturaleza:type==="citacion"?"citacion":"informativa",generaAsistencia:type==="citacion",guardSnapshot:type==="guardia"?guardWeek.map(x=>({...x,people:x.people.map(p=>({...p}))})):null,rosterSnapshot:(type==="nomina"||type==="citacion")?selectedRoster.map(p=>({...p})):null,annexSnapshot:annexes.map(({data,...a})=>a),signerSnapshot:{...signers},updatedAt:new Date().toISOString()};
   const next=[...archive.filter(x=>!(x.key===key&&x.estado==="borrador")),rec];
   localStorage.setItem("germania:odd-maestras:v1",JSON.stringify(next)); setArchive(next); fetch("/api/state/odd:maestras:v1",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:next})}).catch(()=>{});
   setStatus(estado==="emitida"?"ODD emitida y archivada.":"Borrador guardado."); return true;
 };
 const pdf=async()=>{
   if(!f.year||!f.number||!f.title){setStatus("Completa año, Nº ODD y asunto antes de descargar.");return null}
   const {jsPDF}=await import("jspdf"); const d=new jsPDF({unit:"mm",format:"a4"}); let y=18;
   const institutionalHead=()=>{d.setFillColor(0,0,0);d.rect(20,10,68,3,"F");d.rect(122,10,68,3,"F");d.setFillColor(190,0,0);d.rect(20,13,68,3,"F");d.rect(122,13,68,3,"F");d.setFillColor(255,205,0);d.rect(20,16,68,3,"F");d.rect(122,16,68,3,"F");try{d.addImage(LOGO_B64,"PNG",94,7,22,24)}catch{}};
   institutionalHead(); y=35;
   d.setFont("helvetica","bold"); d.setFontSize(12); d.text('Quinta Compañía de Bomberos "Germania" de Villarrica',105,y,{align:"center"}); y+=6;
   d.setFont("helvetica","normal"); d.setFontSize(9); d.text("Fundada el 5 de noviembre de 2025",105,y,{align:"center"}); y+=5;
   d.text("Cuartel General · Valentín Letelier #630 · Villarrica · germaniacbv@gmail.com",105,y,{align:"center"}); y+=9;
   y+=4;
   d.setTextColor(0); d.setFontSize(9); d.text("Villarrica · "+(f.issueDate||""),190,y,{align:"right"}); y+=10;
   d.setFont("helvetica","normal");d.setFontSize(9);const auth=d.splitTextToSize("En uso de las atribuciones conferidas por el Reglamento General del Cuerpo de Bomberos de Villarrica, "+authority+", vengo a dictar lo siguiente:",165);d.text(auth,22,y);y+=auth.length*5+5;d.setFont("helvetica","bold"); d.setFontSize(14); d.text("Orden del Día "+odd,105,y,{align:"center"}); y+=8; d.setFontSize(11); d.text(f.title,105,y,{align:"center",maxWidth:165}); y+=12;
   d.setFont("helvetica","normal"); d.setFontSize(10);
   const lines=[];
   if(type==="citacion") lines.push("Por orden del Capitán de Compañía, cítese a la Quinta Compañía.","","Fecha: "+(f.eventDate||"—")+"   Hora: "+(f.time||"—")+" hrs.","Lugar: "+(f.place||"—"),"Actividad: "+(f.activity||"—"),"Tema: "+(f.topic||"—"),"Vestimenta: "+(f.clothing||"—"),"",f.punctuality||"","Excusas al correo "+(f.excuses||""));
   if(type==="guardia"){lines.push("GUARDIA NOCTURNA","",guardDate?"Período: "+guardDate+(guardEndDate?" al "+guardEndDate:""):"",f.notes||"");}
   if(type==="nomina") lines.push("NÓMINA Y CLAVES","",f.notes||"");
   if(type==="disposicion") lines.push("VISTOS:",f.seen||"—","","CONSIDERANDO:",f.considering||"—","","SE DISPONE:",f.provisions||"—");
   for(const block of lines){const wrapped=d.splitTextToSize(block,165); if(y+wrapped.length*5>270){d.addPage();y=20} d.text(wrapped,22,y); y+=Math.max(5,wrapped.length*5)}
   y+=7; const close=d.splitTextToSize("Tómese razón, distribúyase por medio del correo electrónico institucional, léase y archívese.",165); d.text(close,22,y); y+=22;
   d.setFont("helvetica","bold");if(signers.ayudante){d.text(fullName(officials.ayudante)||"AYUDANTE",62,y,{align:"center"});d.setFontSize(8);d.text("AYUDANTE",62,y+5,{align:"center"})}if(signers.capitan){d.setFontSize(10);d.text(fullName(officials.capitan)||"CAPITÁN",148,y,{align:"center"});d.setFontSize(8);d.text("CAPITÁN",148,y+5,{align:"center"})}if(annexes.length){y+=18;d.setFont("helvetica","bold");d.text("ANEXOS",22,y);d.setFont("helvetica","normal");annexes.forEach((a,i)=>{y+=5;d.text((i+1)+". "+a.name,22,y)})}
   if(type==="nomina"&&selectedRoster.length){
     const cols=[["Clave",18],["Nombre",25],["A. Paterno",30],["A. Materno",28],["Rut",28],["Cargo",29],["Teléfono",32]],x0=10;
     let ty=type==="nomina"?Math.max(y+5,72):72;
     const header=()=>{let x=x0;d.setFillColor(45);d.setTextColor(255);d.setFont("helvetica","bold");d.setFontSize(7);for(const [label,w] of cols){d.rect(x,ty,w,8,"F");d.text(label,x+2,ty+5);x+=w}d.setTextColor(0);ty+=8};
     header();
     for(const p of selectedRoster){if(ty>268){d.addPage();institutionalHead();ty=40;header()}const vals=[p.clave,p.nombre,p.apellidoPaterno||p.ap||"",p.apellidoMaterno||p.am||"",p.rut||"",p.cargo||"Voluntario",p.tel||p.telefono||""];let x=x0;const official=String(p.cargo||"").toLowerCase()!=="voluntario";if(official)d.setFillColor(230,126,34);else d.setFillColor(248);d.setFont("helvetica","normal");d.setFontSize(6.5);for(let i=0;i<cols.length;i++){const w=cols[i][1];d.rect(x,ty,w,7,"FD");d.text(String(vals[i]??""),x+1.5,ty+4.5,{maxWidth:w-3});x+=w}ty+=7}
   }
   if(type==="disposicion"&&annexes.some(a=>a.type?.startsWith("image/")&&a.data)){let n=0;for(const a of annexes.filter(a=>a.type?.startsWith("image/")&&a.data)){n++;d.addPage();institutionalHead();d.setFont("helvetica","bold");d.setTextColor(0);d.setFontSize(10);d.text("ANEXO Nº "+n+".",28,50);d.setFont("helvetica","normal");d.setFontSize(8);d.text(a.name,28,57);try{const fmt=a.type.includes("png")?"PNG":"JPEG";d.addImage(a.data,fmt,38,65,134,0)}catch{d.text("Imagen adjunta: "+a.name,28,68)}}}
   if(type==="guardia"&&guardWeek.length){
     d.addPage(); institutionalHead(); let ay=35;
     d.setFont("helvetica","bold");d.setFontSize(11);d.text("Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica",105,ay,{align:"center"});ay+=5;
     d.setFont("helvetica","normal");d.setFontSize(9);d.text('Quinta Compañía de Bomberos "Germania" de Villarrica',105,ay,{align:"center"});ay+=5;d.text("Fundada el 5 de noviembre de 2025",105,ay,{align:"center"});ay+=10;
     d.setFont("helvetica","bold");d.setFontSize(10);d.text("Anexo 1",105,ay,{align:"center"});ay+=6;
     const left=48,mid=95,right=162;
     for(const g of guardWeek){
       const entries=[["OBAC",g.obac],["Conductor",g.driver],...g.people.map(p=>["Voluntario",p.name])];
       const h=Math.max(19,entries.length*4.4+5);
       if(ay+h>272){d.addPage();institutionalHead();ay=35;d.setFont("helvetica","bold");d.text("Anexo 1 (continuación)",105,ay,{align:"center"});ay+=7}
       d.setDrawColor(20);d.setLineWidth(.35);d.rect(left,ay,right-left,h);d.line(mid,ay,mid,ay+h);
       d.setFont("helvetica","bold");d.setFontSize(8);d.text(g.date,left+(mid-left)/2,ay+h/2,{align:"center"});
       let ey=ay+5;for(const [role,name] of entries){d.setFont("helvetica","normal");d.setFontSize(7);d.text(role,mid+2,ey);d.text(name,mid+20,ey,{maxWidth:right-mid-22});ey+=4.4}
       ay+=h;
     }
   }
   const pages=d.getNumberOfPages();for(let p=1;p<=pages;p++){d.setPage(p);d.setDrawColor(190);d.line(30,284,180,284);d.setFont("helvetica","normal");d.setFontSize(6);d.setTextColor(130);d.text('2025-2026 Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica | Quinta Compañía de Bomberos "Germania" de Villarrica',105,287,{align:"center"});d.text("Cuartel General del Cuerpo de Bomberos de Villarrica · Valentín Letelier #630 · Villarrica · Chile · germaniacbv@gmail.com",105,290,{align:"center"});}
   return d;
 };
 const previewPdf=async()=>{try{const d=await pdf();if(!d)return;const blob=d.output("blob");if(pdfUrl)URL.revokeObjectURL(pdfUrl);const url=URL.createObjectURL(blob);setPdfUrl(url);setStatus("Vista previa PDF actualizada.");}catch(e){setStatus("No fue posible generar la vista previa PDF.")}};
 const guardReady=()=>type!=="guardia"||guardWeek.length>0&&guardWeek.every(x=>x.complete&&x.obac!=="Sin asignar"&&x.driver!=="Sin asignar");
 const downloadPdf=async()=>{try{if(!guardReady()){setStatus("Guardia incompleta: no se puede descargar la ODD oficial hasta completar dotación mínima, OBAC y conductor.");return}const d=await pdf();if(!d)return;d.save("ODD_"+odd.replace("/","_")+".pdf");setStatus("PDF descargado.")}catch(e){setStatus("No fue posible generar el PDF.")}};
 const share=async()=>{try{if(!guardReady()){setStatus("Guardia incompleta: no se puede compartir la ODD oficial hasta completar dotación mínima, OBAC y conductor.");return}const d=await pdf();if(!d)return;const blob=d.output("blob"),file=new File([blob],"ODD_"+odd.replace("/","_")+".pdf",{type:"application/pdf"});if(navigator.canShare?.({files:[file]})){await navigator.share({title:"ODD "+odd,files:[file]})}else if(navigator.share){await navigator.share({title:"ODD "+odd,text:f.title})}else{setStatus("Compartir no está disponible en este navegador.")}}catch(e){if(e?.name!=="AbortError")setStatus("No fue posible compartir.")}};
 const odd=useMemo(()=>String(f.number||"___").padStart(3,"0")+"/"+f.year,[f.number,f.year]);
 return <main className="oddShell"><header className="oddTop"><div><b>GERMANIA</b><span> · ODD Maestras</span></div><a href="/">Volver a GERMANIA</a></header>
 <section className="oddIntro"><div><h1>ODD Maestras</h1><p>Genera Órdenes del Día con plantillas oficiales de la Quinta Compañía.</p></div><div className="topActions"><button onClick={previewPdf}>◉ Vista previa</button><button className="pdfTop" onClick={downloadPdf}>↓ Descargar PDF</button><button onClick={share}>↗ Compartir</button></div></section>
 <nav className="oddTypes">{TYPES.map(([id,label])=><button key={id} onClick={()=>setType(id)} className={type===id?"active":""}><b>{id==="citacion"?"♟":id==="guardia"?"☾":id==="nomina"?"☷":"▤"}</b><span>{label}</span><small>{id==="citacion"?"ODD 015, 017, 034, 041, 048, 050, 058…":id==="guardia"?"ODD 060 · Instrucciones + Anexo 1":id==="nomina"?"ODD 010 · Tabla automática":"ODD 025 · Vistos, Considerando, Se dispone"}</small></button>)}</nav>
 <div className="oddGrid"><section className="oddForm card">
 <h3 className="sectionTitle">1. Datos generales</h3><div className="row"><Field label="Año"><input type="number" value={f.year} onChange={e=>set("year",e.target.value)}/></Field><Field label="Nº ODD"><input inputMode="numeric" value={f.number} onChange={e=>set("number",e.target.value)}/></Field><Field label="Fecha emisión"><input type="date" value={f.issueDate} onChange={e=>set("issueDate",e.target.value)}/></Field></div>
 <Field label="Asunto / título"><input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="Ej.: Academia · Estabilización vehicular"/></Field>
 {type==="citacion"&&<><h3 className="sectionTitle">2. Citación</h3><div className="row"><Field label="Fecha actividad"><input type="date" value={f.eventDate} onChange={e=>set("eventDate",e.target.value)}/></Field><Field label="Hora"><input type="time" value={f.time} onChange={e=>set("time",e.target.value)}/></Field></div><h3 className="sectionTitle">3. Detalles de la actividad</h3><Field label="Lugar"><input value={f.place} onChange={e=>set("place",e.target.value)}/></Field><div className="row"><Field label="Actividad"><select value={f.activity} onChange={e=>set("activity",e.target.value)}><option>Academia</option><option>Ejercicio</option><option>Capacitación</option><option>Ceremonia / formación</option></select></Field><Field label="Tema"><input value={f.topic} onChange={e=>set("topic",e.target.value)}/></Field></div><Field label="Vestimenta"><input value={f.clothing} onChange={e=>set("clothing",e.target.value)}/></Field><h3 className="sectionTitle">4. Instrucciones adicionales</h3><div className="row"><Field label="Puntualidad"><input value={f.punctuality} onChange={e=>set("punctuality",e.target.value)}/></Field><Field label="Excusas al correo"><input type="email" value={f.excuses} onChange={e=>set("excuses",e.target.value)}/></Field></div><h3 className="sectionTitle">5. Voluntarios citados</h3><p className="hint">Solo estos voluntarios generan obligación de asistencia. La identificación se guarda por ID interno, no por nombre.</p><div className="rosterTools"><button type="button" onClick={()=>setSelected(roster.map(p=>String(p.clave)))}>Citar a toda la Compañía</button><button type="button" onClick={()=>setSelected([])}>Limpiar</button><b>{selectedRoster.length} citados</b></div><div className="rosterList">{roster.map(p=>{const code=String(p.clave);return <label key={code}><input type="checkbox" checked={selected.includes(code)} onChange={()=>toggleMember(code)}/><span><b>{code}</b> · {fullName(p)} <small>{p.cargo||"Voluntario"}</small></span></label>})}</div></>}
 {type==="guardia"&&<><div className="row"><Field label="Inicio del período"><input type="date" value={guardDate} onChange={e=>{setGuardDate(e.target.value);setGuardWeek([])}}/></Field><Field label="Fin del período"><input type="date" value={guardEndDate} onChange={e=>{setGuardEndDate(e.target.value);setGuardWeek([])}}/></Field><label className="field loadField"><span>&nbsp;</span><button type="button" onClick={loadGuard} disabled={loading}>{loading?"Cargando…":"Cargar semana desde Guardia"}</button></label></div>{guardWeek.length>0&&<><div className="guardGate"><b>Control previo a ODD</b><span className={guardWeek.every(g=>g.complete)?"ok":"bad"}>Dotación mínima {guardWeek.every(g=>g.complete)?"✓":"pendiente"}</span><span className={guardWeek.every(g=>g.obac!=="Sin asignar")?"ok":"bad"}>OBAC {guardWeek.every(g=>g.obac!=="Sin asignar")?"✓":"pendiente"}</span><span className={guardWeek.every(g=>g.driver!=="Sin asignar")?"ok":"bad"}>Conductor {guardWeek.every(g=>g.driver!=="Sin asignar")?"✓":"pendiente"}</span><div><a href="/guardia/completar">Completar Guardia</a><a href="/guardia/obac">Asignar OBAC</a><a href="/guardia/conductor">Resolver conductor</a></div></div><div className="guardWeek">{guardWeek.map(g=><div className={"guardNight "+((g.obac==="Sin asignar"||g.driver==="Sin asignar"||!g.complete)?"pending":"ok")} key={g.date}><b>{g.date}</b><span>OBAC: {g.obac}</span><span>Conductor: {g.driver}</span><small>{g.total} voluntarios · {g.complete?"Dotación completa":"Revisar dotación"}</small>{g.people.map(p=><small key={g.date+p.code}>{p.code} · {p.name}</small>)}</div>)}</div></>}<Field label="Período / instrucciones"><textarea rows={7} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Período, horarios, dotación mínima e instrucciones generales"/></Field><p className="hint">La nómina de la noche se lee desde Guardia; ODD Maestras no crea una segunda lista.</p></>}
 {type==="nomina"&&<><p className="hint">Nómina activa leída desde GERMANIA. Selecciona quiénes aparecerán en esta ODD.</p><div className="rosterTools"><button type="button" onClick={()=>setSelected(roster.map(p=>String(p.clave)))}>Seleccionar todos</button><button type="button" onClick={()=>setSelected([])}>Limpiar</button><b>{selectedRoster.length} seleccionados</b></div><div className="rosterList">{roster.length?roster.map(p=>{const code=String(p.clave);return <label key={code}><input type="checkbox" checked={selected.includes(code)} onChange={()=>toggleMember(code)}/><span><b>{code}</b> · {fullName(p)} <small>{p.cargo||"Voluntario"}</small></span></label>}):<p className="hint">Sin nómina disponible.</p>}</div><Field label="Observación / vigencia"><textarea rows={4} value={f.notes} onChange={e=>set("notes",e.target.value)}/></Field></>}
 {type==="disposicion"&&<><Field label="VISTOS"><textarea rows={4} value={f.seen} onChange={e=>set("seen",e.target.value)}/></Field><Field label="CONSIDERANDO"><textarea rows={4} value={f.considering} onChange={e=>set("considering",e.target.value)}/></Field><Field label="SE DISPONE"><textarea rows={7} value={f.provisions} onChange={e=>set("provisions",e.target.value)} placeholder={"1. ...\\n2. ..."}/></Field></>}
 <h3 className="sectionTitle">5. Firmas, anexos y distribución</h3><div className="signControls"><label><input type="checkbox" checked={signers.ayudante} onChange={e=>setSigners(x=>({...x,ayudante:e.target.checked}))}/> Francisco Vega Lara · AYUDANTE</label><label><input type="checkbox" checked={signers.capitan} onChange={e=>setSigners(x=>({...x,capitan:e.target.checked}))}/> Fernando Jerez Pantoja · CAPITÁN</label></div><Field label="Anexos (referencia del documento)"><input type="file" multiple accept="image/*,.pdf" onChange={addAnnex}/></Field>{annexes.length>0&&<div className="annexList">{annexes.map((a,i)=><span key={a.name+i}>Anexo {i+1}: {a.name}<button type="button" onClick={()=>setAnnexes(x=>x.filter((_,n)=>n!==i))}>×</button></span>)}</div>}<Field label="Distribución / destinatarios"><input value={f.recipients} onChange={e=>set("recipients",e.target.value)}/></Field>
 <div className="actions"><button onClick={()=>persist("borrador")}>Guardar borrador</button><button className="primary" onClick={()=>persist("emitida")}>Emitir y archivar</button><button onClick={downloadPdf}>↓ Descargar PDF</button><button onClick={share}>Compartir</button><button onClick={()=>setStatus("Correo institucional quedará habilitado al conectar el servicio de correo; no se simulará un envío.")}>Correo institucional</button></div>{status&&<div className="status">{status}</div>}<p className="hint">Archivo ODD sincronizado con el estado central de GERMANIA.</p><div className="archive"><b>Archivo del módulo</b>{archive.length===0?<p className="hint">Sin ODD guardadas todavía.</p>:archive.slice().reverse().map(x=><div className="archiveRow" key={x.key+x.updatedAt}><span>ODD {String(x.form.number).padStart(3,"0")}/{x.form.year}</span><span>{x.form.title}</span><em>{x.estado}</em></div>)}</div>
 </section><aside className="preview card">{pdfUrl?<div className="pdfPreview"><iframe title="Vista previa PDF ODD" src={pdfUrl}/><button type="button" onClick={()=>setPdfUrl("")}>Volver a vista editable</button></div>:<div className="paper"><div className="brandBand"><span></span><img src={LOGO_B64} alt="Emblema oficial Germania"/><span></span></div><div className="paperHead"><div><b>Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica</b><small>Quinta Compañía de Bomberos “Germania” de Villarrica</small><small>Fundada el 5 de noviembre de 2025</small></div></div><p className="date">Villarrica · {f.issueDate||"fecha"}</p><p className="authority">En uso de las atribuciones conferidas por el Reglamento General del Cuerpo de Bomberos de Villarrica, {authority}, vengo a dictar lo siguiente:</p><h2>Orden del Día {odd}</h2>{f.title&&<h3>{f.title}</h3>}
 {type==="citacion"&&<div className="docText"><p>Por orden del Capitán de Compañía, cítese a la Quinta Compañía.</p><p><b>Fecha:</b> {f.eventDate||"—"} · <b>Hora:</b> {f.time||"—"} hrs.</p><p><b>Lugar:</b> {f.place||"—"}</p><p><b>Actividad:</b> {f.activity||"—"}</p><p><b>Tema:</b> {f.topic||"—"}</p><p><b>Vestimenta:</b> {f.clothing||"—"}</p><p className="strong">{f.punctuality}</p><p>Excusas al correo {f.excuses}</p></div>}
 {type==="guardia"&&<div className="docText"><h4>GUARDIA NOCTURNA</h4>{guardDate&&<p><b>Período:</b> {guardDate}{guardEndDate?" al "+guardEndDate:""}</p>}<p>{f.notes||"Complete período, horarios, dotación e instrucciones."}</p><h4>Anexo 1</h4>{guardWeek.length?<div className="guardAnnex official">{guardWeek.map(g=><div key={g.date}><b>{g.date}</b><section><span><strong>OBAC</strong>{g.obac}</span><span><strong>Conductor</strong>{g.driver}</span>{g.people.map(p=><span key={g.date+p.code}><strong>Voluntario</strong>{p.name}</span>)}</section></div>)}</div>:<div className="mockTable">Programación pendiente de cargar desde Guardia</div>}</div>}
 {type==="nomina"&&<div className="docText"><h4>NÓMINA Y CLAVES</h4><div className="docTable seven"><div className="docTr head"><span>Clave</span><span>Nombre</span><span>A. Paterno</span><span>A. Materno</span><span>Rut</span><span>Cargo</span><span>Teléfono</span></div>{selectedRoster.map(p=><div className={"docTr "+(String(p.cargo||"").toLowerCase()!=="voluntario"?"official":"")} key={p.clave}><span>{p.clave}</span><span>{p.nombre}</span><span>{p.apellidoPaterno||p.ap||""}</span><span>{p.apellidoMaterno||p.am||""}</span><span>{p.rut||"—"}</span><span>{p.cargo||"Voluntario"}</span><span>{p.tel||p.telefono||"—"}</span></div>)}</div><p>{f.notes}</p></div>}
 {type==="disposicion"&&<div className="docText"><h4>VISTOS:</h4><p>{f.seen||"—"}</p><h4>CONSIDERANDO:</h4><p>{f.considering||"—"}</p><h4>SE DISPONE:</h4><p className="pre">{f.provisions||"—"}</p></div>}
 <p className="closing">Tómese razón, distribúyase por medio del correo electrónico institucional, léase y archívese.</p>{annexes.length>0&&<div className="annexPreview"><b>Anexos</b>{annexes.map((a,i)=><span key={a.name+i}>{i+1}. {a.name}</span>)}</div>}<div className="sign">{signers.ayudante&&<span>Francisco Vega Lara<small>AYUDANTE</small></span>}{signers.capitan&&<span>Fernando Jerez Pantoja<small>CAPITÁN</small></span>}</div><div className="docFooter">2025–2026 · Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica · Quinta Compañía de Bomberos “Germania” de Villarrica<br/>Cuartel General · Valentín Letelier #630 · Villarrica · Chile</div></div>}</aside></div></main>
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
