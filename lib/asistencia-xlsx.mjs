import {inflateRawSync} from "node:zlib";
import {filasCSV, normalizar} from "./asistencia-conciliacion.mjs";

const MAX_ENTRADA=8*1024*1024, MAX_DESCOMPRIMIDO=24*1024*1024;
function xmlText(s) {
  return String(s??"").replace(/&#x([0-9a-f]+);/gi,(_,v)=>String.fromCodePoint(parseInt(v,16)))
    .replace(/&#(\d+);/g,(_,v)=>String.fromCodePoint(parseInt(v,10)))
    .replace(/&(?:amp|lt|gt|quot|apos);/g,v=>({"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'"}[v]));
}
function atributo(s,n){
  const m=new RegExp("(?:^|\\s)"+n.replace(":","\\:")+"\\s*=\\s*([\"'])(.*?)\\1","i").exec(s);
  return m?xmlText(m[2]):"";
}
function textoNodos(xml) {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gi)].map(m=>xmlText(m[1])).join("");
}
function zipArchivos(input) {
  const buf=Buffer.from(input);
  if(buf.length>MAX_ENTRADA) throw new Error("Excel supera 8 MB");
  let end=-1;
  for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--)
    if(buf.readUInt32LE(i)===0x06054b50){end=i;break;}
  if(end<0)throw new Error("Excel no tiene estructura ZIP válida");
  const total=buf.readUInt16LE(end+10), inicio=buf.readUInt32LE(end+16);
  if(total>1500||inicio>=buf.length)throw new Error("Excel con demasiados archivos internos");
  let offset=inicio,extraido=0;
  const out=new Map();
  for(let j=0;j<total;j++){
    if(offset+46>buf.length||buf.readUInt32LE(offset)!==0x02014b50)throw new Error("ZIP incompleto");
    const flags=buf.readUInt16LE(offset+8), metodo=buf.readUInt16LE(offset+10),
      comp=buf.readUInt32LE(offset+20),uncomp=buf.readUInt32LE(offset+24),
      n=buf.readUInt16LE(offset+28),e=buf.readUInt16LE(offset+30),comment=buf.readUInt16LE(offset+32),
      local=buf.readUInt32LE(offset+42);
    const path=buf.subarray(offset+46,offset+46+n).toString("utf8");
    offset+=46+n+e+comment;
    if(flags&1||!([0,8].includes(metodo)))throw new Error("Excel ZIP cifrado o método no admitido");
    if(uncomp>MAX_ENTRADA||extraido+uncomp>MAX_DESCOMPRIMIDO)throw new Error("Excel excede límite descomprimido");
    if(local+30>buf.length||buf.readUInt32LE(local)!==0x04034b50)throw new Error("Excel ZIP inválido");
    const ln=buf.readUInt16LE(local+26),le=buf.readUInt16LE(local+28), start=local+30+ln+le;
    if(start+comp>buf.length)throw new Error("ZIP truncado");
    const data=metodo===0?buf.subarray(start,start+comp):inflateRawSync(buf.subarray(start,start+comp),{maxOutputLength:MAX_ENTRADA});
    if(data.length!==uncomp)throw new Error("Entrada ZIP con tamaño incorrecto");
    extraido+=uncomp;
    if(out.has(path))throw new Error("Rutas duplicadas en el Excel");
    if(/^(xl\/(?:workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml)|docProps\/app\.xml)$/.test(path))
      out.set(path,data.toString("utf8"));
  }
  return out;
}
function columna(ref) {
  const m=/^([A-Z]+)\d+$/i.exec(ref||"");
  if(!m)return -1;
  let n=0;
  for(const c of m[1].toUpperCase())n=n*26+c.charCodeAt(0)-64;
  return n-1;
}
function leerHoja(xml,compartidas) {
  const filas=[];
  for(const m of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)){
    const row=[],estilos=[],body=m[2];
    for(const c of body.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
      const attr=c[1], pos=columna(atributo(attr,"r"));
      if(pos<0||pos>2000)continue;
      estilos[pos]=Number(atributo(attr,'s')||0);
      const tipo=atributo(attr,"t"), data=c[2]||"";
      const v=/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/.exec(data)?.[1]||"";
      let val=tipo==="inlineStr"?textoNodos(data):xmlText(v);
      if(tipo==="s")val=compartidas[Number(v)]??"";
      else if(tipo!=="str" && tipo!=="inlineStr" && tipo!=="e" && val!=="" && Number.isFinite(Number(val)))val=Number(val);
      row[pos]=val;
    }
    if(row.some(v=>v!==undefined && String(v).trim()!==""))filas.push({numero:Number(atributo(m[1],"r"))||filas.length+1,celda:row,estilos});
    if(filas.length>12000)throw new Error("Excel con demasiadas filas");
  }
  return filas;
}
function filasEstructuradas(nombre,filas) {
  let header=null;
  for(let i=0;i<Math.min(80,filas.length);i++){
    const valores=filas[i].celda.map(normalizar);
    const index=(...xs)=>valores.findIndex(v=>xs.includes(v));
    const a=index("fecha","date"),b=index("tipo","citacion","categoria"),
      c=index("actividad","descripcion","descripcion actividad","detalle"),
      d=index("asistentes","presentes","voluntarios");
    if([a,b,c,d].every(v=>v>=0)){header={i,a,b,c,d};break;}
  }
  if(!header)return null;
  return filas.slice(header.i+1).filter(f=>f.celda.some(v=>v!==undefined)).map(f=>({
    fecha:f.celda[header.a], tipo:f.celda[header.b], detalle:f.celda[header.c],
    asistentes:f.celda[header.d],ubicacion:nombre+" fila "+f.numero
  })).filter(f=>String(f.fecha||"").trim());
}

const MONTHS={"ENERO":1,"FEBRERO":2,"MARZO":3,"ABRIL":4,"MAYO":5,"JUNIO":6,
 "JULIO":7,"AGOSTO":8,"SEPTIEMBRE":9,"SETIEMBRE":9,"OCTUBRE":10,"NOVIEMBRE":11,"DICIEMBRE":12};
function fechaMatriz(v){
 const m=/^(\d{1,2})\s+([A-ZÁÉÍÓÚÑ]+)\s+(\d{4})$/i.exec(String(v||"").trim());
 if(!m)return null;
 const mo=MONTHS[normalizar(m[2]).toUpperCase()],dia=Number(m[1]),anio=Number(m[3]);
 const d=new Date(Date.UTC(anio,(mo||0)-1,dia));
 return mo&&d.getUTCFullYear()===anio&&d.getUTCMonth()===mo-1&&d.getUTCDate()===dia?
   [anio,String(mo).padStart(2,"0"),String(dia).padStart(2,"0")].join("-"):null;
}
function estilosColor(xml){
 const fills=/<(?:\w+:)?fills\b[^>]*>([\s\S]*?)<\/(?:\w+:)?fills>/.exec(xml)?.[1]||"";
 const xf=/<(?:\w+:)?cellXfs\b[^>]*>([\s\S]*?)<\/(?:\w+:)?cellXfs>/.exec(xml)?.[1]||"";
 const colores=[...fills.matchAll(/<(?:\w+:)?fill\b[^>]*>([\s\S]*?)<\/(?:\w+:)?fill>/g)]
   .map(m=>/<(?:\w+:)?fgColor\b[^>]*rgb=["']([^"']+)/.exec(m[1])?.[1]?.toUpperCase()||"");
 return [...xf.matchAll(/<(?:\w+:)?xf\b([^>]*?)\/>/g)].map(m=>colores[Number(atributo(m[1],"fillId"))]||"");
}
function filaMatrizGermania(nombre,filas,estilos){
 const encabezados=new Map(filas.map(f=>[f.numero,f]));
 const ord=encabezados.get(8)?.celda,descripcion=encabezados.get(9)?.celda,
   codigos=encabezados.get(10)?.celda,fechas=encabezados.get(11)?.celda,
   styles=encabezados.get(9)?.estilos;
 if(!ord||!descripcion||!fechas||!styles)return null;
 // La fila 13 identifica a los voluntarios en F/G/H. Nunca deducir por número de fila.
 const personas=filas.filter(f=>f.numero>=14).map(f=>{
   const p=String(f.celda[5]??"").trim(),m=String(f.celda[6]??"").trim(),n=String(f.celda[7]??"").trim();
   return {fila:f,ref:[n,p,m].filter(Boolean).join(" ")};
 }).filter(p=>p.fila.celda[5]&&p.fila.celda[7]);
 if(personas.length<4)return null;
 const actividades=[];
 for(let ix=10;ix<ord.length;ix++){
   const num=ord[ix];
   if(num===undefined||num===null||num==="")continue;
   if(!Number.isInteger(Number(num))||Number(num)<1||Number(num)>10000)
     throw new Error("Número de actividad inválido en la planilla");
   const detalle=String(descripcion[ix]??"").trim(),fecha=fechaMatriz(fechas[ix]);
   if(!detalle||!fecha)throw new Error("Actividad "+num+": fecha o descripción inválida");
   const c=estilos[Number(styles[ix]||0)]||"";
   const tipo=c==="FFFFFF00"?"Compañía":c==="FFFF0000"?"Emergencia":
     c==="FFFFC000"?"Comandancia":null;
   if(!tipo)throw new Error("Actividad "+num+": categoría de color no reconocida ("+c+")");
   const participantes=[],asistentes=[];
   for(const p of personas){
     const v=String(p.fila.celda[ix]??"").trim().toUpperCase();
     if(v===""||v==="-")continue; // Alta posterior al evento: no genera ausencia.
     if(v!=="A"&&v!=="F")throw new Error("Actividad "+num+": estado distinto de A/F para "+p.ref);
     participantes.push(p.ref);
     if(v==="A")asistentes.push(p.ref);
   }
   if(!participantes.length)throw new Error("Actividad "+num+": sin estados para ninguna persona");
   actividades.push({fecha,tipo,detalle,asistentes,participantes,sourceNumber:Number(num),
     sourceYear:Number(fecha.slice(0,4)),claveDespacho:String(codigos?.[ix]??"").trim(),
     ubicacion:nombre+" · actividad "+num});
 }
 if(!actividades.length)return null;
 const ids=new Set();
 for(const a of actividades){
   const key=a.sourceYear+":"+a.sourceNumber;
   if(ids.has(key))throw new Error("Número de actividad repetido: "+key);
   ids.add(key);
 }
 return actividades;
}

export function filasExcel(buffer) {
  const files=zipArchivos(buffer);
  const book=files.get("xl/workbook.xml"),rels=files.get("xl/_rels/workbook.xml.rels");
  if(!book||!rels)throw new Error("El archivo no contiene un libro Excel reconocido");
  const shared=files.get("xl/sharedStrings.xml")||"";
  const strings=[...shared.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>textoNodos(m[1]));
  const relationships=new Map();
  for(const m of rels.matchAll(/<Relationship\b([^>]*?)\/>/g)){
    relationships.set(atributo(m[1],"Id"),atributo(m[1],"Target"));
  }
  const listado=[],noReconocidas=[];
  const colores=estilosColor(files.get('xl/styles.xml')||'');
  for(const m of book.matchAll(/<sheet\b([^>]*?)\/>/g)){
    const nombre=atributo(m[1],"name"), id=atributo(m[1],"r:id");
    const target=relationships.get(id);
    if(!target)continue;
    const path=target.startsWith("/")?target.slice(1):target.startsWith("xl/")?target:"xl/"+target;
    if(!/^xl\/worksheets\/[^/]+\.xml$/.test(path))continue;
    const xml=files.get(path);
    if(!xml)continue;
    const hoja=leerHoja(xml,strings);
    const filas=filasEstructuradas(nombre,hoja)||filaMatrizGermania(nombre,hoja,colores);
    if(filas)listado.push(...filas);
    else noReconocidas.push(nombre);
  }
  if(!listado.length)throw new Error("No se reconoció la tabla de asistencias ni la matriz institucional.");
  if(noReconocidas.length)throw new Error("Hojas sin formato reconocido: "+noReconocidas.join(", ")+". No se importa parcialmente.");
  return listado;
}
export function filasArchivo(nombre,bytes) {
  if(/\.csv$/i.test(nombre))return filasCSV(Buffer.from(bytes).toString("utf8"));
  if(/\.xlsx$/i.test(nombre))return filasExcel(bytes);
  throw new Error("Seleccione un archivo .xlsx o .csv");
}
