const fechaCL=fecha=>String(fecha||"").split("-").reverse().join("-");
const nombreCompleto=p=>[p?.nombre,p?.apellidoPaterno,p?.apellidoMaterno].filter(Boolean).join(" ").trim();

export function prepararPartePDF(item,datos,nomina){
  if(item?.estado!=="sincronizado")throw new Error("El PDF oficial requiere un parte sincronizado.");
  if(!Number.isInteger(Number(item.numero))||Number(item.numero)<1)throw new Error("Falta el número oficial del parte.");
  if(datos?.anulado)throw new Error("Un parte anulado no puede generar un PDF oficial.");
  if(!datos?.records||typeof datos.records!=="object")throw new Error("Este parte no contiene una nómina válida.");
  const personas=new Map((Array.isArray(nomina)?nomina:[]).map(p=>[String(p.id),p]));
  const presentes=Object.entries(datos.records).filter(([,estado])=>estado==="presente").map(([id])=>{
    const p=personas.get(String(id));
    return {id:String(id),nombre:p?nombreCompleto(p):"Voluntario ID "+id,clave:p?.clave||"",cargo:p?.cargo||""};
  });
  return {
    numero:String(item.numero).padStart(3,"0")+"/"+String(datos.date||item.datos?.date||"").slice(0,4),
    fecha:fechaCL(datos.date||item.datos?.date),tipo:String(datos.tipo||item.datos?.tipo||""),
    detalle:String(datos.detalle||""),registradoPor:String(datos.registradoPor||""),
    presentes,total:presentes.length
  };
}

const selloLogo=async()=>{
  if(typeof Image==="undefined")return null;
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      try{
        const canvas=document.createElement("canvas");
        canvas.width=240;canvas.height=240;
        canvas.getContext("2d").drawImage(img,0,0,240,240);
        resolve(canvas.toDataURL("image/png"));
      }catch{resolve(null);}
    };
    img.onerror=()=>resolve(null);
    img.src="/legacy/germania-192.png";
  });
};

export async function crearArchivoPartePDF(modelo){
  const {jsPDF}=await import("jspdf");
  const doc=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  doc.setProperties({title:"Asistencia "+modelo.numero,subject:"Quinta Compañía Germania · Voluntarios presentes"});
  const ancho=doc.internal.pageSize.getWidth(),alto=doc.internal.pageSize.getHeight();
  const logo=await selloLogo();
  let pagina=0;
  const cabecera=()=>{
    pagina++;
    doc.setFillColor(0,0,0);doc.rect(14,16,182,3,"F");
    doc.setFillColor(210,3,18);doc.rect(14,19,182,2.4,"F");
    doc.setFillColor(255,206,0);doc.rect(14,21.4,182,2.4,"F");
    doc.setFillColor(255,255,255);doc.rect(91,10,28,29,"F");
    if(logo)doc.addImage(logo,"PNG",93,9,24,27);
    doc.setFont("helvetica","bold");doc.setFontSize(10);
    doc.text("Fünfte Deutsche Feuerwehrkompanie Stadt Villarrica",ancho/2,43,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(9);
    doc.text('Quinta Compañía de Bomberos "Germania" de Villarrica',ancho/2,48,{align:"center"});
    doc.setFontSize(8);doc.text("Fundada el 5 de noviembre de 2025",ancho/2,52.5,{align:"center"});
    doc.setDrawColor(180,180,180);doc.line(15,57,195,57);
    doc.setFont("helvetica","bold");doc.setFontSize(14);
    doc.text("PARTE OFICIAL DE ASISTENCIA",ancho/2,68,{align:"center"});
    doc.setFontSize(11);doc.text("N° "+modelo.numero,ancho/2,75,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(9);
    doc.text("Fecha: "+modelo.fecha,15,85);
    doc.text("Actividad: "+modelo.tipo,15,91);
    let y=97;
    if(modelo.detalle){
      for(const linea of doc.splitTextToSize("Detalle: "+modelo.detalle,180)){
        doc.text(linea,15,y);y+=5;
      }
    }
    if(modelo.registradoPor){
      for(const linea of doc.splitTextToSize("Pasó lista: "+modelo.registradoPor,180)){
        doc.text(linea,15,y);y+=5;
      }
    }
    y+=4;
    doc.setFillColor(243,241,232);doc.rect(15,y-5,180,8,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(9);
    doc.text("N°",18,y);doc.text("Clave",30,y);doc.text("Voluntario presente",60,y);
    return y+6;
  };
  let y=cabecera();
  for(let i=0;i<modelo.presentes.length;i++){
    const persona=modelo.presentes[i];
    const lineas=doc.splitTextToSize(persona.nombre,130);
    const altoFila=Math.max(9,lineas.length*4.5+4);
    if(y+altoFila>alto-25){doc.addPage();y=cabecera();}
    doc.setFont("helvetica","normal");doc.setFontSize(9);
    doc.text(String(i+1),18,y+4);
    doc.text(String(persona.clave||"—"),30,y+4);
    doc.text(lineas,60,y+4);
    doc.setDrawColor(218,218,218);doc.line(15,y+altoFila,195,y+altoFila);
    y+=altoFila;
  }
  if(y+16>alto-24){doc.addPage();y=cabecera();}
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("TOTAL PRESENTES: "+modelo.total,15,y+10);
  for(let n=1;n<=doc.internal.getNumberOfPages();n++){
    doc.setPage(n);doc.setDrawColor(175,175,175);doc.line(15,alto-18,195,alto-18);
    doc.setFont("helvetica","normal");doc.setFontSize(8);
    doc.text('Quinta Compañía "Germania" · Cuerpo de Bomberos de Villarrica',15,alto-13);
    doc.text("Página "+n+" de "+doc.internal.getNumberOfPages(),195,alto-13,{align:"right"});
  }
  const nombre="Asistencia_Germania_"+modelo.numero.replace("/","-")+"_"+modelo.fecha.replaceAll("-","")+".pdf";
  return {blob:doc.output("blob"),nombre};
}
