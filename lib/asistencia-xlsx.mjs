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
    if(/^(xl\/(?:workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^/]+\.xml)|docProps\/app\.xml)$/.test(path))
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
    const row=[],body=m[2];
    for(const c of body.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
      const attr=c[1], pos=columna(atributo(attr,"r"));
      if(pos<0||pos>2000)continue;
      const tipo=atributo(attr,"t"), data=c[2]||"";
      const v=/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/.exec(data)?.[1]||"";
      let val=tipo==="inlineStr"?textoNodos(data):xmlText(v);
      if(tipo==="s")val=compartidas[Number(v)]??"";
      else if(tipo!=="str" && tipo!=="inlineStr" && tipo!=="e" && val!=="" && Number.isFinite(Number(val)))val=Number(val);
      row[pos]=val;
    }
    if(row.some(v=>v!==undefined && String(v).trim()!==""))filas.push({numero:Number(atributo(m[1],"r"))||filas.length+1,celda:row});
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
  for(const m of book.matchAll(/<sheet\b([^>]*?)\/>/g)){
    const nombre=atributo(m[1],"name"), id=atributo(m[1],"r:id");
    const target=relationships.get(id);
    if(!target)continue;
    const path=target.startsWith("/")?target.slice(1):target.startsWith("xl/")?target:"xl/"+target;
    if(!/^xl\/worksheets\/[^/]+\.xml$/.test(path))continue;
    const xml=files.get(path);
    if(!xml)continue;
    const filas=filasEstructuradas(nombre,leerHoja(xml,strings));
    if(filas)listado.push(...filas);
    else noReconocidas.push(nombre);
  }
  if(!listado.length)throw new Error("No se encontraron hojas con columnas Fecha, Tipo, Actividad y Asistentes. Es necesario adaptar el lector al formato de la planilla original.");
  if(noReconocidas.length)throw new Error("Hojas sin formato reconocido: "+noReconocidas.join(", ")+". No se importa parcialmente.");
  return listado;
}
export function filasArchivo(nombre,bytes) {
  if(/\.csv$/i.test(nombre))return filasCSV(Buffer.from(bytes).toString("utf8"));
  if(/\.xlsx$/i.test(nombre))return filasExcel(bytes);
  throw new Error("Seleccione un archivo .xlsx o .csv");
}
