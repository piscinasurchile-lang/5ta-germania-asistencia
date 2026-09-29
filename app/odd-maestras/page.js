"use client";
import {useEffect,useMemo,useState} from "react";
import "./odd.css";
const TYPES=[["citacion","Citación / Academia / Ejercicio"],["guardia","Guardia Nocturna"],["nomina","Nómina y Claves"],["disposicion","Disposición General"]];
const today=new Date().toISOString().slice(0,10);
export default function Page(){
 const[type,setType]=useState("citacion");
 const[status,setStatus]=useState("");
 const[archive,setArchive]=useState([]);
 const[roster,setRoster]=useState([]);
 const[selected,setSelected]=useState([]);
 const[guardDate,setGuardDate]=useState("");
 const[guard,setGuard]=useState(null);
 const[loading,setLoading]=useState(false);
 const[signers,setSigners]=useState({capitan:true,ayudante:true});
 const[annexes,setAnnexes]=useState([]);
 const[f,setF]=useState({year:new Date().getFullYear(),number:"",issueDate:today,title:"",eventDate:"",time:"20:00",place:"Cuartel General, Valentín Letelier #630",activity:"Academia",topic:"",clothing:"Civil",punctuality:"Se exige PUNTUALIDAD",excuses:"germaniacbv@gmail.com",recipients:"Quinta Compañía",seen:"",considering:"",provisions:"",notes:""});
 useEffect(()=>{try{setArchive(JSON.parse(localStorage.getItem("germania:odd-maestras:v1")||"[]"))}catch{}
   fetch("/api/state/roster:v8",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(x=>{
     const list=Array.isArray(x.value)?x.value.filter(p=>p.activo!==false):[];
     setRoster(list);setSelected(list.map(p=>String(p.clave)));
   }).catch(()=>setStatus("La nómina central no está disponible en este entorno de prueba."));
 },[]);
 const fullName=p=>[p.nombre,p.apellidoPaterno||p.ap,p.apellidoMaterno||p.am].filter(Boolean).join(" ");
 const selectedRoster=useMemo(()=>roster.filter(p=>selected.includes(String(p.clave))),[roster,selected]);
 const toggleMember=code=>setSelected(x=>x.includes(code)?x.filter(v=>v!==code):[...x,code]);
 const loadGuard=async()=>{
   if(!guardDate){setStatus("Selecciona una fecha de Guardia.");return}
   setLoading(true);setStatus("");
   try{const r=await fetch("/api/guardia/orden-dia?fecha="+encodeURIComponent(guardDate),{cache:"no-store"});const x=await r.json();if(!r.ok)throw new Error(x.error);setGuard(x);setStatus("Guardia cargada desde GERMANIA.")}
   catch{setGuard(null);setStatus("No fue posible cargar la Guardia para esa fecha.")}finally{setLoading(false)}
 };
 const set=(k,v)=>setF(x=>({...x,[k]:v}));
 const authority=type==="citacion"?"Artículo 92 ter":"Artículo 91 inciso 1°";
 const addAnnex=e=>{const files=[...(e.target.files||[])];setAnnexes(x=>[...x,...files.map(file=>({name:file.name,type:file.type,size:file.size}))]);e.target.value=""};
 const persist=(estado)=>{
   if(!f.year||!f.number||!f.title){setStatus("Completa año, Nº ODD y asunto.");return false}
   const key=String(f.year)+"-"+String(f.number).padStart(3,"0");
   if(estado==="emitida"&&archive.some(x=>x.key===key&&x.estado==="emitida")){setStatus("Ese correlativo ya fue emitido.");return false}
   const rec={key,type,estado,form:f,updatedAt:new Date().toISOString()};
   const next=[...archive.filter(x=>!(x.key===key&&x.estado==="borrador")),rec];
   localStorage.setItem("germania:odd-maestras:v1",JSON.stringify(next)); setArchive(next);
   setStatus(estado==="emitida"?"ODD emitida y archivada en este módulo de prueba.":"Borrador guardado."); return true;
 };
 const pdf=async()=>{
   if(!f.year||!f.number||!f.title){setStatus("Completa año, Nº ODD y asunto antes de descargar.");return null}
   const {jsPDF}=await import("jspdf"); const d=new jsPDF({unit:"mm",format:"a4"}); let y=18;
   d.setFont("helvetica","bold"); d.setFontSize(12); d.text('Quinta Compañía de Bomberos "Germania" de Villarrica',105,y,{align:"center"}); y+=6;
   d.setFont("helvetica","normal"); d.setFontSize(9); d.text("Fundada el 5 de noviembre de 2025",105,y,{align:"center"}); y+=5;
   d.text("Cuartel General · Valentín Letelier #630 · Villarrica · germaniacbv@gmail.com",105,y,{align:"center"}); y+=9;
   d.setDrawColor(0); d.setLineWidth(1.2); d.line(20,y,77,y); d.setDrawColor(190,0,0); d.line(77,y,134,y); d.setDrawColor(220,175,0); d.line(134,y,190,y); y+=9;
   d.setTextColor(0); d.setFontSize(9); d.text("Villarrica · "+(f.issueDate||""),190,y,{align:"right"}); y+=10;
   d.setFont("helvetica","normal");d.setFontSize(9);const auth=d.splitTextToSize("En uso de las atribuciones conferidas por el Reglamento General del Cuerpo de Bomberos de Villarrica, "+authority+", vengo a dictar lo siguiente:",165);d.text(auth,22,y);y+=auth.length*5+5;d.setFont("helvetica","bold"); d.setFontSize(14); d.text("Orden del Día "+odd,105,y,{align:"center"}); y+=8; d.setFontSize(11); d.text(f.title,105,y,{align:"center",maxWidth:165}); y+=12;
   d.setFont("helvetica","normal"); d.setFontSize(10);
   const lines=[];
   if(type==="citacion") lines.push("Por orden del Capitán de Compañía, cítese a la Quinta Compañía.","","Fecha: "+(f.eventDate||"—")+"   Hora: "+(f.time||"—")+" hrs.","Lugar: "+(f.place||"—"),"Actividad: "+(f.activity||"—"),"Tema: "+(f.topic||"—"),"Vestimenta: "+(f.clothing||"—"),"",f.punctuality||"","Excusas al correo "+(f.excuses||""));
   if(type==="guardia"){lines.push("GUARDIA NOCTURNA","",guardDate?"Fecha: "+guardDate:"",f.notes||"");if(guard){lines.push("","OBAC: "+(guard.obacAsignado?.nombre||"Sin asignar"),"Conductor: "+(guard.conductor?.nombre||"Sin asignar"),"",...(guard.personal||[]).map(p=>p.codigo+" · "+p.nombre))}else lines.push("","ANEXO: Programación diaria de Guardia.");}
   if(type==="nomina") lines.push("NÓMINA Y CLAVES","","CLAVE · NOMBRE · CARGO · TELÉFONO","",...selectedRoster.map(p=>String(p.clave)+" · "+fullName(p)+" · "+(p.cargo||"Voluntario")+" · "+(p.tel||p.telefono||"—")),"",f.notes||"");
   if(type==="disposicion") lines.push("VISTOS:",f.seen||"—","","CONSIDERANDO:",f.considering||"—","","SE DISPONE:",f.provisions||"—");
   for(const block of lines){const wrapped=d.splitTextToSize(block,165); if(y+wrapped.length*5>270){d.addPage();y=20} d.text(wrapped,22,y); y+=Math.max(5,wrapped.length*5)}
   y+=7; const close=d.splitTextToSize("Tómese razón, distribúyase por medio del correo electrónico institucional, léase y archívese.",165); d.text(close,22,y); y+=22;
   d.setFont("helvetica","bold");if(signers.ayudante){d.text("Francisco Vega Lara",62,y,{align:"center"});d.setFontSize(8);d.text("AYUDANTE",62,y+5,{align:"center"})}if(signers.capitan){d.setFontSize(10);d.text("Fernando Jerez Pantoja",148,y,{align:"center"});d.setFontSize(8);d.text("CAPITÁN",148,y+5,{align:"center"})}if(annexes.length){y+=18;d.setFont("helvetica","bold");d.text("ANEXOS",22,y);d.setFont("helvetica","normal");annexes.forEach((a,i)=>{y+=5;d.text((i+1)+". "+a.name,22,y)})}
   d.setFont("helvetica","normal"); d.setFontSize(8); d.text("GERMANIA · Quinta Compañía · Villarrica",105,290,{align:"center"});
   return d;
 };
 const downloadPdf=async()=>{try{const d=await pdf();if(!d)return;d.save("ODD_"+odd.replace("/","_")+".pdf");setStatus("PDF descargado.")}catch(e){setStatus("No fue posible generar el PDF.")}};
 const share=async()=>{try{const d=await pdf();if(!d)return;const blob=d.output("blob"),file=new File([blob],"ODD_"+odd.replace("/","_")+".pdf",{type:"application/pdf"});if(navigator.canShare?.({files:[file]})){await navigator.share({title:"ODD "+odd,files:[file]})}else if(navigator.share){await navigator.share({title:"ODD "+odd,text:f.title})}else{setStatus("Compartir no está disponible en este navegador.")}}catch(e){if(e?.name!=="AbortError")setStatus("No fue posible compartir.")}};
 const odd=useMemo(()=>String(f.number||"___").padStart(3,"0")+"/"+f.year,[f.number,f.year]);
 return <main className="oddShell"><header className="oddTop"><div><b>GERMANIA</b><span> · ODD Maestras</span></div><a href="/">Volver a GERMANIA</a></header>
 <section className="oddIntro"><div><h1>ODD Maestras</h1><p>Genera Órdenes del Día con plantillas oficiales de la Quinta Compañía.</p></div><div className="topActions"><button onClick={()=>document.querySelector(".preview")?.scrollIntoView({behavior:"smooth"})}>◉ Vista previa</button><button className="pdfTop" onClick={downloadPdf}>▣ Generar PDF</button><button onClick={share}>↗ Compartir</button></div></section>
 <nav className="oddTypes">{TYPES.map(([id,label])=><button key={id} onClick={()=>setType(id)} className={type===id?"active":""}><b>{id==="citacion"?"♟":id==="guardia"?"☾":id==="nomina"?"☷":"▤"}</b><span>{label}</span><small>{id==="citacion"?"ODD 015, 017, 034, 041, 048, 050, 058…":id==="guardia"?"ODD 060 · Instrucciones + Anexo 1":id==="nomina"?"ODD 010 · Tabla automática":"ODD 025 · Vistos, Considerando, Se dispone"}</small></button>)}</nav>
 <div className="oddGrid"><section className="oddForm card">
 <h3 className="sectionTitle">1. Datos generales</h3><div className="row"><Field label="Año"><input type="number" value={f.year} onChange={e=>set("year",e.target.value)}/></Field><Field label="Nº ODD"><input inputMode="numeric" value={f.number} onChange={e=>set("number",e.target.value)}/></Field><Field label="Fecha emisión"><input type="date" value={f.issueDate} onChange={e=>set("issueDate",e.target.value)}/></Field></div>
 <Field label="Asunto / título"><input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="Ej.: Academia · Estabilización vehicular"/></Field>
 {type==="citacion"&&<><h3 className="sectionTitle">2. Citación</h3><div className="row"><Field label="Fecha actividad"><input type="date" value={f.eventDate} onChange={e=>set("eventDate",e.target.value)}/></Field><Field label="Hora"><input type="time" value={f.time} onChange={e=>set("time",e.target.value)}/></Field></div><h3 className="sectionTitle">3. Detalles de la actividad</h3><Field label="Lugar"><input value={f.place} onChange={e=>set("place",e.target.value)}/></Field><div className="row"><Field label="Actividad"><select value={f.activity} onChange={e=>set("activity",e.target.value)}><option>Academia</option><option>Ejercicio</option><option>Capacitación</option><option>Ceremonia / formación</option></select></Field><Field label="Tema"><input value={f.topic} onChange={e=>set("topic",e.target.value)}/></Field></div><Field label="Vestimenta"><input value={f.clothing} onChange={e=>set("clothing",e.target.value)}/></Field><h3 className="sectionTitle">4. Instrucciones adicionales</h3><div className="row"><Field label="Puntualidad"><input value={f.punctuality} onChange={e=>set("punctuality",e.target.value)}/></Field><Field label="Excusas al correo"><input type="email" value={f.excuses} onChange={e=>set("excuses",e.target.value)}/></Field></div></>}
 {type==="guardia"&&<><div className="row"><Field label="Fecha de Guardia"><input type="date" value={guardDate} onChange={e=>setGuardDate(e.target.value)}/></Field><label className="field loadField"><span>&nbsp;</span><button type="button" onClick={loadGuard} disabled={loading}>{loading?"Cargando…":"Cargar desde Guardia"}</button></label></div>{guard&&<div className="guardLoaded"><b>{guard.total} voluntarios</b><span>OBAC: {guard.obacAsignado?.nombre||"Sin asignar"}</span><span>Conductor: {guard.conductor?.nombre||"Sin asignar"}</span>{guard.personal?.map(p=><small key={p.codigo}>{p.codigo} · {p.nombre}</small>)}</div>}<Field label="Período / instrucciones"><textarea rows={7} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Período, horarios, dotación mínima e instrucciones generales"/></Field><p className="hint">La nómina de la noche se lee desde Guardia; ODD Maestras no crea una segunda lista.</p></>}
 {type==="nomina"&&<><p className="hint">Nómina activa leída desde GERMANIA. Selecciona quiénes aparecerán en esta ODD.</p><div className="rosterTools"><button type="button" onClick={()=>setSelected(roster.map(p=>String(p.clave)))}>Seleccionar todos</button><button type="button" onClick={()=>setSelected([])}>Limpiar</button><b>{selectedRoster.length} seleccionados</b></div><div className="rosterList">{roster.length?roster.map(p=>{const code=String(p.clave);return <label key={code}><input type="checkbox" checked={selected.includes(code)} onChange={()=>toggleMember(code)}/><span><b>{code}</b> · {fullName(p)} <small>{p.cargo||"Voluntario"}</small></span></label>}):<p className="hint">Sin nómina disponible.</p>}</div><Field label="Observación / vigencia"><textarea rows={4} value={f.notes} onChange={e=>set("notes",e.target.value)}/></Field></>}
 {type==="disposicion"&&<><Field label="VISTOS"><textarea rows={4} value={f.seen} onChange={e=>set("seen",e.target.value)}/></Field><Field label="CONSIDERANDO"><textarea rows={4} value={f.considering} onChange={e=>set("considering",e.target.value)}/></Field><Field label="SE DISPONE"><textarea rows={7} value={f.provisions} onChange={e=>set("provisions",e.target.value)} placeholder={"1. ...\n2. ..."}/></Field></>}
 <h3 className="sectionTitle">5. Firmas, anexos y distribución</h3><div className="signControls"><label><input type="checkbox" checked={signers.ayudante} onChange={e=>setSigners(x=>({...x,ayudante:e.target.checked}))}/> Francisco Vega Lara · AYUDANTE</label><label><input type="checkbox" checked={signers.capitan} onChange={e=>setSigners(x=>({...x,capitan:e.target.checked}))}/> Fernando Jerez Pantoja · CAPITÁN</label></div><Field label="Anexos (referencia del documento)"><input type="file" multiple accept="image/*,.pdf" onChange={addAnnex}/></Field>{annexes.length>0&&<div className="annexList">{annexes.map((a,i)=><span key={a.name+i}>Anexo {i+1}: {a.name}<button type="button" onClick={()=>setAnnexes(x=>x.filter((_,n)=>n!==i))}>×</button></span>)}</div>}<Field label="Distribución / destinatarios"><input value={f.recipients} onChange={e=>set("recipients",e.target.value)}/></Field>
 <div className="actions"><button onClick={()=>persist("borrador")}>Guardar borrador</button><button className="primary" onClick={()=>persist("emitida")}>Emitir y archivar</button><button onClick={downloadPdf}>↓ Descargar PDF</button><button onClick={share}>Compartir</button><button onClick={()=>setStatus("Correo institucional quedará habilitado al conectar el servicio de correo; no se simulará un envío.")}>Correo institucional</button></div>{status&&<div className="status">{status}</div>}<p className="hint">Módulo aislado de prueba: todavía no modifica la base maestra.</p><div className="archive"><b>Archivo del módulo</b>{archive.length===0?<p className="hint">Sin ODD guardadas todavía.</p>:archive.slice().reverse().map(x=><div className="archiveRow" key={x.key+x.updatedAt}><span>ODD {String(x.form.number).padStart(3,"0")}/{x.form.year}</span><span>{x.form.title}</span><em>{x.estado}</em></div>)}</div>
 </section><aside className="preview card"><div className="paper"><div className="brandBand"><span></span><img src="/legacy/germania-icon.png" alt="Emblema oficial Germania"/><span></span></div><div className="paperHead"><div><b>Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica</b><small>Quinta Compañía de Bomberos “Germania” de Villarrica</small><small>Fundada el 5 de noviembre de 2025</small></div></div><p className="date">Villarrica · {f.issueDate||"fecha"}</p><p className="authority">En uso de las atribuciones conferidas por el Reglamento General del Cuerpo de Bomberos de Villarrica, {authority}, vengo a dictar lo siguiente:</p><h2>Orden del Día {odd}</h2>{f.title&&<h3>{f.title}</h3>}
 {type==="citacion"&&<div className="docText"><p>Por orden del Capitán de Compañía, cítese a la Quinta Compañía.</p><p><b>Fecha:</b> {f.eventDate||"—"} · <b>Hora:</b> {f.time||"—"} hrs.</p><p><b>Lugar:</b> {f.place||"—"}</p><p><b>Actividad:</b> {f.activity||"—"}</p><p><b>Tema:</b> {f.topic||"—"}</p><p><b>Vestimenta:</b> {f.clothing||"—"}</p><p className="strong">{f.punctuality}</p><p>Excusas al correo {f.excuses}</p></div>}
 {type==="guardia"&&<div className="docText"><h4>GUARDIA NOCTURNA</h4>{guardDate&&<p><b>Fecha:</b> {guardDate}</p>}<p>{f.notes||"Complete período, horarios, dotación e instrucciones."}</p>{guard?<div className="docRoster"><b>OBAC: {guard.obacAsignado?.nombre||"Sin asignar"} · Conductor: {guard.conductor?.nombre||"Sin asignar"}</b>{guard.personal?.map(p=><span key={p.codigo}>{p.codigo} · {p.nombre}</span>)}</div>:<div className="mockTable">ANEXO · Programación diaria de Guardia</div>}</div>}
 {type==="nomina"&&<div className="docText"><h4>NÓMINA Y CLAVES</h4><div className="docTable"><div className="docTr head"><span>CLAVE</span><span>NOMBRE</span><span>CARGO</span><span>TELÉFONO</span></div>{selectedRoster.map(p=><div className="docTr" key={p.clave}><span>{p.clave}</span><span>{fullName(p)}</span><span>{p.cargo||"Voluntario"}</span><span>{p.tel||p.telefono||"—"}</span></div>)}</div><p>{f.notes}</p></div>}
 {type==="disposicion"&&<div className="docText"><h4>VISTOS:</h4><p>{f.seen||"—"}</p><h4>CONSIDERANDO:</h4><p>{f.considering||"—"}</p><h4>SE DISPONE:</h4><p className="pre">{f.provisions||"—"}</p></div>}
 <p className="closing">Tómese razón, distribúyase por medio del correo electrónico institucional, léase y archívese.</p>{annexes.length>0&&<div className="annexPreview"><b>Anexos</b>{annexes.map((a,i)=><span key={a.name+i}>{i+1}. {a.name}</span>)}</div>}<div className="sign">{signers.ayudante&&<span>Francisco Vega Lara<small>AYUDANTE</small></span>}{signers.capitan&&<span>Fernando Jerez Pantoja<small>CAPITÁN</small></span>}</div><div className="docFooter">2025–2026 · Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica · Quinta Compañía de Bomberos “Germania” de Villarrica<br/>Cuartel General · Valentín Letelier #630 · Villarrica · Chile</div></div></aside></div></main>
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
