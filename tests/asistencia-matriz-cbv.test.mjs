import test from "node:test";
import assert from "node:assert/strict";
import {filasExcel} from "../lib/asistencia-xlsx.mjs";
import {prepararFilas,conciliar} from "../lib/asistencia-conciliacion.mjs";

function zip(files) {
  const local=[],cent=[];let offset=0;
  for(const [nombre,xml] of files){
    const n=Buffer.from(nombre),body=Buffer.from(xml,"utf8");
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);
    header.writeUInt32LE(body.length,18);header.writeUInt32LE(body.length,22);header.writeUInt16LE(n.length,26);
    local.push(header,n,body);
    const dir=Buffer.alloc(46);dir.writeUInt32LE(0x02014b50,0);
    dir.writeUInt32LE(body.length,20);dir.writeUInt32LE(body.length,24);
    dir.writeUInt16LE(n.length,28);dir.writeUInt32LE(offset,42);
    cent.push(dir,n);offset+=header.length+n.length+body.length;
  }
  const directory=Buffer.concat(cent),footer=Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50,0);footer.writeUInt16LE(files.length,8);
  footer.writeUInt16LE(files.length,10);footer.writeUInt32LE(directory.length,12);footer.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,footer]);
}
function cell(r,v,style=0){
 return '<c r="'+r+'" s="'+style+'" t="inlineStr"><is><t>'+v+'</t></is></c>';
}
function numero(r,v){return '<c r="'+r+'"><v>'+v+'</v></c>';}
function fila(n,body){return '<row r="'+n+'">'+body+'</row>';}
function matriz(){
  const rows=[
    fila(8,numero("K8",1)+numero("L8",2)),
    fila(9,cell("K9","FUEGO EN VIVIENDA",1)+cell("L9","ACADEMIA SVB",2)),
    fila(10,cell("K10","10.0.1")+cell("L10","",0)),
    fila(11,cell("K11","1 JULIO 2026")+cell("L11","8 JULIO 2026")),
    fila(15,cell("F15","Jerez")+cell("G15","Pantoja")+cell("H15","Gustavo")+cell("K15","A")+cell("L15","F")),
    fila(16,cell("F16","Jerez")+cell("G16","Pantoja")+cell("H16","Fernando")+cell("K16","F")+cell("L16","A")),
    fila(17,cell("F17","Herrera")+cell("G17","Santander")+cell("H17","Andrés")+cell("K17","F")+cell("L17","F")),
    fila(18,cell("F18","Vergara")+cell("G18","Sandoval")+cell("H18","Christian")+cell("K18","A")+cell("L18","A")),
    fila(19,cell("F19","Ojeda")+cell("G19","Fuentes")+cell("H19","Esthefani")+cell("L19","A"))
  ].join("");
  const sheet="<worksheet><sheetData>"+rows+"</sheetData></worksheet>";
  const styles='<styleSheet><fills count="4"><fill><patternFill patternType="none"/></fill>'+
    '<fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/></patternFill></fill>'+
    '<fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/></patternFill></fill>'+
    '<fill><patternFill patternType="solid"><fgColor rgb="FFFFC000"/></patternFill></fill>'+
    '</fills><cellXfs count="3"><xf fillId="0"/><xf fillId="1"/><xf fillId="2"/></cellXfs></styleSheet>';
  return zip([
    ["xl/workbook.xml",'<workbook><sheets><sheet name="2026" sheetId="1" r:id="r1"/></sheets></workbook>'],
    ["xl/_rels/workbook.xml.rels",'<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/></Relationships>'],
    ["xl/styles.xml",styles],
    ["xl/worksheets/sheet1.xml",sheet]
  ]);
}
const roster=[
 {id:"g",nombre:"Gustavo",apellidoPaterno:"Jerez",apellidoMaterno:"Pantoja"},
 {id:"f",nombre:"Fernando",apellidoPaterno:"Jerez",apellidoMaterno:"Pantoja"},
 {id:"a",nombre:"Andrés",apellidoPaterno:"Herrera",apellidoMaterno:"Santander"},
 {id:"c",nombre:"Christian",apellidoPaterno:"Vergara",apellidoMaterno:"Sandoval"},
 {id:"e",nombre:"Esthefani Noemí",apellidoPaterno:"Ojeda",apellidoMaterno:"Fuentes"}
];
test("matriz CBV: eventos por columnas y participantes por filas",()=>{
 const rows=filasExcel(matriz());
 assert.equal(rows.length,2);
 assert.equal(rows[0].fecha,"2026-07-01");
 assert.equal(rows[1].fecha,"2026-07-08");
 assert.equal(rows[0].tipo,"Emergencia");
 assert.equal(rows[1].tipo,"Compañía");
 assert.equal(rows[0].sourceNumber,1);
 assert.equal(rows[0].claveDespacho,"10.0.1");
 assert.deepEqual(rows[0].asistentes,["Gustavo Jerez Pantoja","Christian Vergara Sandoval"]);
 assert.equal(rows[0].participantes.includes("Esthefani Ojeda Fuentes"),false);
 const parsed=prepararFilas(rows,roster,["Emergencia","Compañía"]);
 assert.deepEqual(parsed.errores,[]);
 assert.equal(parsed.actividades[0].records.e,undefined);
 assert.equal(parsed.actividades[1].records.e,"presente");
 assert.equal(parsed.actividades[0].records.g,"presente");
 assert.equal(parsed.actividades[0].records.f,"ausente");
 assert.equal(conciliar(parsed.actividades,[]).nuevas.length,2);
 const repeticion=conciliar(parsed.actividades,parsed.actividades);
 assert.equal(repeticion.nuevas.length,0);
 assert.equal(repeticion.iguales.length,2);
});
