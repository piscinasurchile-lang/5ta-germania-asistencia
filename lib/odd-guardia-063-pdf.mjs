import {PDFDocument,StandardFonts,rgb,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,concatTransformationMatrix,drawObject} from "pdf-lib";
import {validarODDGuardia} from "./odd-guardia-063-validacion.mjs";

const dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function fechaLarga(s){
 const d=new Date(s+"T12:00:00Z");
 return dias[d.getUTCDay()]+" "+d.getUTCDate()+" de "+meses[d.getUTCMonth()]+" de "+d.getUTCFullYear();
}
function fechaAnexo(s){
 const d=new Date(s+"T12:00:00Z");
 return dias[d.getUTCDay()].replace(/^./,x=>x.toUpperCase())+" "+
 String(d.getUTCDate()).padStart(2,"0")+"/"+String(d.getUTCMonth()+1).padStart(2,"0")+"/"+d.getUTCFullYear();
}
function grado(nombre,cargo){
 const c=String(cargo||"").toLowerCase().trim();
 const prefijo=c==="capitán"?"Cap. ":
   c==="teniente 1"?"Tte. 1ero ":
   c==="teniente 2"?"Tte. 2do ":
   c==="teniente 3"?"Tte. 3ero ":
   c==="ayudante"?"Aydte. ":
   c==="director"?"Dir. ":
   c==="tesorero general"?"Tsro. Gral. ":
   c==="tesorero"?"Tsro. ":"";
 return prefijo+String(nombre||"");
}
export async function generarGuardiaDesdeOriginal({original,...data}){
 const {semana,year,number,issueDate,oddAnterior,plantilla='063/2026'}=data;
 const fechas=validarODDGuardia(data);
 const pdf=await PDFDocument.load(original,{updateMetadata:false});
 if(pdf.getPageCount()!==3||pdf.getPages().some(p=>
   Math.abs(p.getWidth()-612)>0.2||Math.abs(p.getHeight()-935.52)>0.3))
   throw Error("El PDF original no corresponde a las tres páginas de la plantilla de Guardia");
 const [uno,dos,tres]=pdf.getPages();
 const regular=await pdf.embedFont(StandardFonts.Helvetica);
 const negrita=await pdf.embedFont(StandardFonts.HelveticaBold);
 const blanco=rgb(1,1,1),tinta=rgb(.07,.07,.07);
 const tapar=(p,x,top,w,h)=>{
   const y=p.getHeight()-top-h;
   p.drawRectangle({x,y,width:w,height:h,color:blanco,borderWidth:0});
   // La misma imagen translúcida Im1 del documento original recompone exactamente la marca de agua.
   p.pushOperators(
     pushGraphicsState(),rectangle(x,y,w,h),clip(),endPath(),
     concatTransformationMatrix(593.5,0,0,714.0401,5.900157,51.52434),
     drawObject("Im1"),popGraphicsState()
   );
 };
 const escribir=(p,s,x,top,font,size,max=Infinity)=>{
   const width=font.widthOfTextAtSize(s,size);
   const actual=width>max?size*max/width:size;
   if(actual<5.2)throw Error("Texto demasiado extenso para la plantilla original");
   p.drawText(s,{x,y:p.getHeight()-top-actual,size:actual,font,color:tinta});
 };
 const centrar=(p,s,x,top,w,font,size)=>{
   escribir(p,s,x+(w-font.widthOfTextAtSize(s,size))/2,top,font,size);
 };
 // El resto del texto, los gráficos, las firmas y la geometría del PDF no cambian.
 const mismosDatos=plantilla==='071/2026'&&String(number).padStart(3,'0')==='071'&&Number(year)===2026&&issueDate==='2026-11-10'&&fechas.inicio==='2026-11-11'&&fechas.fin==='2026-11-17'&&oddAnterior==='063/2026';
 if(!mismosDatos){
 tapar(uno,339,166,201,20);
 escribir(uno,"Villarrica, "+fechaLarga(issueDate),345,169,negrita,10,185);
 tapar(uno,232,236,156,22);
 centrar(uno,"Orden del Día "+String(number).padStart(3,"0")+"/"+year,232,239,156,negrita,13);
 tapar(uno,84,283.5,457,30.5);
 const desde=fechaLarga(fechas.inicio);
 const hasta=fechaLarga(fechas.fin);
 escribir(uno,"orden del día para la semana de Guardia Nocturna comprendida entre el "+desde+" hasta",85,285,negrita,9.8,448);
 escribir(uno,"el "+hasta+":",85,299,negrita,9.8,448);
 tapar(dos,100,614,345,20);
 escribir(dos,"La presente orden del día deja sin efecto la orden del día Nº "+oddAnterior+".",103,617,negrita,10,329);
 }
 // Solo se recompone el área del anexo: cabecera, escudo y pie originales se conservan.
 const negro=rgb(.12,.12,.12),rojo=rgb(.70,0,.08),borde=rgb(.70,.70,.70);
 const ancho=260,separacion=16,izquierda=38,topInicial=202,limite=835;
 const dividir=(texto,font,size,max)=>{
  const palabras=String(texto).split(/\s+/),lineas=[];let linea='';
  for(const palabra of palabras){const prueba=linea?linea+' '+palabra:palabra;
   if(font.widthOfTextAtSize(prueba,size)>max&&linea){lineas.push(linea);linea=palabra;}else linea=prueba;
  }
  if(linea)lineas.push(linea);return lineas;
 };
 const tarjetas=semana.map(g=>{
  const items=[['OBAC',grado(g.obac,g.obacCargo),true],['MAQUINISTA',grado(g.driver,g.driverCargo),true],...g.people.map((p,i)=>[i?'':'VOLUNTARIOS',grado(p.name,p.cargo),false])];
  const filas=items.map(([rol,nombre,destacado])=>({rol,destacado,lineas:dividir(nombre,destacado?negrita:regular,8.7,ancho-87)}));
  return {g,filas,altura:35+filas.reduce((n,f)=>n+Math.max(13,f.lineas.length*11)+(!f.rol?0:3),0)};
 });
 const paginaLimpia=p=>tapar(p,30,190,552,650);
 paginaLimpia(tres);
 let pagina=tres,top=topInicial;
 for(let i=0;i<tarjetas.length;i+=2){
  const pareja=tarjetas.slice(i,i+2),altura=Math.max(...pareja.map(t=>t.altura));
  if(top+altura>limite){
   const [copia]=await pdf.copyPages(pdf,[2]);pdf.addPage(copia);pagina=copia;paginaLimpia(pagina);top=topInicial;
  }
  pareja.forEach((tarjeta,col)=>{
   const x=izquierda+col*(ancho+separacion),y=pagina.getHeight()-top-altura;
   pagina.drawRectangle({x,y,width:ancho,height:altura,color:blanco,borderColor:borde,borderWidth:.6});
   pagina.drawRectangle({x,y:pagina.getHeight()-top-24,width:ancho,height:24,color:negro});
   pagina.drawText(fechaAnexo(tarjeta.g.date),{x:x+9,y:pagina.getHeight()-top-16,size:9,font:negrita,color:blanco});
   const cantidad=String(tarjeta.g.people.length+2)+' integrantes';
   pagina.drawText(cantidad,{x:x+ancho-9-regular.widthOfTextAtSize(cantidad,7),y:pagina.getHeight()-top-16,size:7,font:regular,color:blanco});
   let offset=top+34;
   tarjeta.filas.forEach(f=>{
    if(f.rol)pagina.drawText(f.rol,{x:x+8,y:pagina.getHeight()-offset-7,size:6.7,font:negrita,color:rojo});
    for(const [j,linea] of f.lineas.entries())pagina.drawText(linea,{x:x+78,y:pagina.getHeight()-offset-8.7-j*11,size:8.7,font:f.destacado?negrita:regular,color:tinta});
    offset+=Math.max(13,f.lineas.length*11)+(f.rol?3:0);
   });
  });
  top+=altura+14;
 }
 return pdf.save({useObjectStreams:false});
}
