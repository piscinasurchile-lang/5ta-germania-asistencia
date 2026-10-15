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
 const {semana,year,number,issueDate,oddAnterior}=data;
 const fechas=validarODDGuardia(data);
 const pdf=await PDFDocument.load(original,{updateMetadata:false});
 if(pdf.getPageCount()!==3||pdf.getPages().some(p=>
   Math.abs(p.getWidth()-612)>0.2||Math.abs(p.getHeight()-935.52)>0.3))
   throw Error("El PDF original no corresponde a las tres páginas de ODD 063");
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
 // Anexo 1: se conservan los siete marcos de la tabla oficial.
 const topes=[202,297.5,384.1,483.1,582,643.8,730.2,817];
 for(let i=0;i<7;i++){
   const g=semana[i],top=topes[i],h=topes[i+1]-top;
   const items=[["OBAC",grado(g.obac,g.obacCargo)],["Conductor",grado(g.driver,g.driverCargo)],...g.people.map(p=>[
      /^(María Paz|Esthefani|Saida)\b/i.test(p.name)?"Voluntaria":"Voluntario",grado(p.name,p.cargo)])];
   const paso=Math.min(12.3,(h-7)/items.length);
   if(paso<5.9)throw Error("Demasiados voluntarios en "+g.date+" para la celda original");
   const letra=Math.min(8.9,paso-1.7);
   tapar(tres,143,top+2,132,h-4);
   tapar(tres,285,top+1,183,h-2);
   escribir(tres,fechaAnexo(g.date),145,top+(h-9)/2-2,negrita,8.6,125);
   for(let k=0;k<items.length;k++){
     const [tipo,nombre]=items[k],y=top+3+k*paso;
     escribir(tres,tipo,286.1,y,regular,letra,44);
     escribir(tres,nombre,333.6,y,regular,letra,132);
   }
 }
 return pdf.save({useObjectStreams:false});
}
