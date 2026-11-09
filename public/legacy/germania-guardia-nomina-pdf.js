(function(root){
'use strict';
// Presentación de la consulta semanal existente. No consulta ni modifica registros.
function crear({jsPDF,inicio,filas,logo,emitidoEn=new Date()}){
 if(typeof jsPDF!=='function'||!Array.isArray(filas)||filas.length!==7)throw Error('No se pudieron cargar las siete noches');
 const doc=new jsPDF({unit:'pt',format:'letter',orientation:'portrait'});
 const dias=['Miércoles','Jueves','Viernes','Sábado','Domingo','Lunes','Martes'];
 const fecha=f=>new Date(f+'T12:00:00Z');
 const etiqueta=f=>fecha(f).toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 const aprobada=filas.every(f=>f.estadoRevision==='aprobada');
 const personas=new Set(filas.flatMap(f=>f.integrantesIds||[]));
 const total=filas.reduce((n,f)=>n+f.obac.length+f.maq.length+f.vol.length,0);
 const negro=[32,32,32],rojo=[180,0,20],oro=[232,183,34];
 function texto(s,x,y,size=9,bold=false,color=negro,opts={}){
  doc.setTextColor(...color);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.text(String(s),x,y,opts);
 }
 function cabecera(pagina){
  [negro,rojo,oro].forEach((c,i)=>{doc.setFillColor(...c);doc.rect(28,37+i*6,235,6,'F');doc.rect(349,37+i*6,235,6,'F');});
  if(logo)doc.addImage(logo,'PNG',279,14,54,64);
  texto('QUINTA COMPAÑÍA GERMANIA',306,94,16,true,negro,{align:'center'});
  texto('CUERPO DE BOMBEROS DE VILLARRICA',306,108,9,false,negro,{align:'center'});
  texto(etiqueta(inicio)+' al '+etiqueta(filas[6].fecha)+' | 22:45 a 06:00 h del día siguiente',28,126,9);
  texto('NÓMINA DE INSCRITOS - GUARDIA NOCTURNA | '+(aprobada?'PROGRAMACIÓN APROBADA':'PENDIENTE DE APROBACIÓN'),28,142,8.5,true,rojo);
  doc.setDrawColor(...oro);doc.setLineWidth(1.5);doc.line(28,750,584,750);
  texto('Emitido: '+emitidoEn.toLocaleString('es-CL',{timeZone:'America/Santiago'})+' | Página '+pagina,28,764,7);
  texto('No certifica asistencia efectiva ni acreditación. La impresión no aprueba ni cierra la semana.',28,776,7);
 }
 function preparar(n){
  // Si una nómina excede el recuadro, continúa en otra hoja sin omitir nombres.
  const nombres=n.vol.length?n.vol:['Sin inscritos'];
  let size=9.5,lineas;
  do{
   doc.setFont('helvetica','normal');doc.setFontSize(size);
   lineas=nombres.flatMap(nombre=>doc.splitTextToSize(nombre,181));
   if(lineas.length*size*1.15<=56||size<=7.5)break;
   size-=0.5;
  }while(true);
  const capacidad=Math.max(1,Math.floor(56/(size*1.15))),partes=[];
  for(let i=0;i<lineas.length;i+=capacidad)partes.push(lineas.slice(i,i+capacidad));
  return {n,size,partes};
 }
 const turnos=filas.map(preparar),paginas=Math.max(...turnos.map(t=>t.partes.length));
 for(let pagina=0;pagina<paginas;pagina++){
  if(pagina)doc.addPage();cabecera(pagina+1);
  turnos.forEach((t,i)=>{
   const x=28+(i%2)*284,y=154+Math.floor(i/2)*144,n=t.n;
   doc.setDrawColor(180);doc.setLineWidth(0.5);doc.roundedRect(x,y,272,134,5,5,'S');
   doc.setFillColor(...negro);doc.rect(x,y,272,23,'F');
   texto(dias[i].toUpperCase()+' '+fecha(n.fecha).getUTCDate()+(pagina?' · continuación':''),x+10,y+15,10,true,[255,255,255]);
   if(!pagina)texto((n.obac.length+n.maq.length+n.vol.length)+' inscritos',x+262,y+15,7,false,[255,255,255],{align:'right'});
   if(pagina&&!t.partes[pagina]){texto('Sin continuación',x+10,y+43,9);return;}
   for(const [titulo,nombres,offset] of [['OBAC',n.obac,39],['MAQUINISTA',n.maq,56]]){
    texto(titulo,x+9,y+offset,7,true,rojo);
    const s=nombres.join(' · ')||'Sin asignar';
    let tam=9.5;doc.setFont('helvetica','bold');doc.setFontSize(tam);
    while(doc.getTextWidth(s)>190&&tam>5){tam-=0.5;doc.setFontSize(tam);}
    texto(s,x+72,y+offset,tam,true);
   }
   texto('VOLUNTARIOS',x+9,y+74,7,true,[85,85,85]);
   (t.partes[pagina]||[]).forEach((s,j)=>texto(s,x+88,y+74+j*t.size*1.15,t.size));
  });
  texto((personas.size?personas.size+' VOLUNTARIOS · ':'')+total+' INSCRIPCIONES',312,607,10,true);
  const resumen=[aprobada?'Funciones de la programación aprobada.':'Funciones propuestas según precedencia vigente',aprobada?'':'y habilitación de conducción. Pendiente de aprobación.',
   'Dotación completa: '+filas.filter(f=>f.completa).length+' de 7 noches.',
   'Los espacios sin inscritos permanecen visibles.'];
  resumen.filter(Boolean).forEach((s,j)=>texto(s,312,628+j*15,8.5));
 }
 doc.setProperties({title:'Germania - Nómina de inscritos '+inicio,subject:aprobada?'Programación aprobada':'Pendiente de aprobación',author:'Quinta Compañía Germania'});
 return doc;
}
root.GermaniaGuardiaNominaPdf={crear};
})(typeof window!=='undefined'?window:globalThis);
