import test from "node:test";
import assert from "node:assert/strict";
import {
  fechaISO, filasCSV, prepararFilas, conciliar
} from "../lib/asistencia-conciliacion.mjs";
import {filasExcel} from "../lib/asistencia-xlsx.mjs";

const roster=[
  {id:"id-gustavo",nombre:"Gustavo",apellidoPaterno:"Jerez",apellidoMaterno:"Pantoja",fechaIngreso:"2026-01-01",activo:true},
  {id:"id-fernando",nombre:"Fernando",apellidoPaterno:"Jerez",apellidoMaterno:"Pantoja",fechaIngreso:"2026-01-01",activo:true},
  {id:"id-nuevo",nombre:"Voluntario",apellidoPaterno:"Nuevo",apellidoMaterno:"Uno",fechaIngreso:"2026-10-01",activo:true}
];
function makeRows(s){
  return prepararFilas(filasCSV(s),roster,["Emergencia"]).actividades;
}
test("CSV tolera comillas, saltos y fechas chilenas",()=>{
  const filas=filasCSV('fecha;tipo;actividad;asistentes\n"30/09/2026";Emergencia;"Fuego; en vivienda";"Gustavo Jerez Pantoja"\n');
  assert.equal(filas[0].detalle,"Fuego; en vivienda");
  assert.equal(fechaISO(filas[0].fecha),"2026-09-30");
  assert.equal(fechaISO("31/02/2026"),null);
});
test("dos Jerez distintos nunca se confunden",()=>{
  const r=prepararFilas([{fecha:"2026-09-30",tipo:"Emergencia",detalle:"Incendio",asistentes:"Gustavo Jerez Pantoja",ubicacion:"uno"}],roster,["Emergencia"]);
  assert.equal(r.errores.length,0);
  assert.equal(r.actividades[0].records["id-gustavo"],"presente");
  assert.equal(r.actividades[0].records["id-fernando"],"ausente");
  assert.equal(r.actividades[0].records["id-nuevo"],undefined);
});
test("apellido ambiguo o desconocido bloquea la importación",()=>{
  const r=prepararFilas([{fecha:"2026-09-30",tipo:"Emergencia",detalle:"Incendio",asistentes:"Jerez",ubicacion:"uno"}],roster);
  assert.equal(r.actividades.length,0);
  assert.equal(r.errores.length,1);
});
test("repetir el archivo no genera actividades nuevas",()=>{
  const actividades=makeRows("fecha;tipo;actividad;asistentes\n2026-09-30;Emergencia;Fuego en vivienda;Gustavo Jerez Pantoja\n");
  const primera=conciliar(actividades,[]);
  assert.equal(primera.nuevas.length,1);
  const segunda=conciliar(actividades,[actividades[0]]);
  assert.equal(segunda.nuevas.length,0);
  assert.equal(segunda.iguales.length,1);
});
test("asistencia modificada se informa sin sobrescribir",()=>{
  const a=makeRows("fecha;tipo;actividad;asistentes\n2026-09-30;Emergencia;Fuego en vivienda;Gustavo Jerez Pantoja\n")[0];
  const b=makeRows("fecha;tipo;actividad;asistentes\n2026-09-30;Emergencia;Fuego en vivienda;Fernando Jerez Pantoja\n")[0];
  const r=conciliar([b],[a]);
  assert.equal(r.nuevas.length,0);
  assert.equal(r.diferencias.length,1);
});
test("emergencias diferentes con igual fecha y tipo se conservan",()=>{
  const items=makeRows("fecha;tipo;actividad;asistentes\n2026-09-30;Emergencia;Fuego en vivienda;Gustavo Jerez Pantoja\n2026-09-30;Emergencia;Fuego en vehículo;Fernando Jerez Pantoja\n");
  assert.equal(conciliar(items,[]).nuevas.length,2);
});
test("filas iguales repetidas dentro del Excel bloquean la actualización",()=>{
  const a=makeRows("fecha;tipo;actividad;asistentes\n2026-09-30;Emergencia;Fuego en vivienda;Gustavo Jerez Pantoja\n");
  assert.equal(conciliar([...a,...a],[]).duplicadasArchivo.length,2);
});
function excelPlano() {
  const archivos=[
    ["xl/workbook.xml",'<workbook><sheets><sheet name="Septiembre" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ["xl/_rels/workbook.xml.rels",'<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>'],
    ["xl/sharedStrings.xml",'<sst><si><t>Fecha</t></si><si><t>Tipo</t></si><si><t>Actividad</t></si><si><t>Asistentes</t></si><si><t>Emergencia</t></si><si><t>Fuego en vivienda</t></si><si><t>Gustavo Jerez Pantoja</t></si></sst>'],
    ["xl/worksheets/sheet1.xml",'<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row><row r="2"><c r="A2"><v>46300</v></c><c r="B2" t="s"><v>4</v></c><c r="C2" t="s"><v>5</v></c><c r="D2" t="s"><v>6</v></c></row></sheetData></worksheet>']
  ];
  const loc=[],cent=[];let offset=0;
  for(const [nombre,txt] of archivos){
    const name=Buffer.from(nombre),data=Buffer.from(txt);
    const local=Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50,0);
    local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);
    local.writeUInt16LE(name.length,26);
    loc.push(local,name,data);
    const cd=Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50,0);
    cd.writeUInt32LE(data.length,20);cd.writeUInt32LE(data.length,24);
    cd.writeUInt16LE(name.length,28);cd.writeUInt32LE(offset,42);
    cent.push(cd,name);
    offset+=local.length+name.length+data.length;
  }
  const centro=Buffer.concat(cent),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(archivos.length,8);end.writeUInt16LE(archivos.length,10);
  end.writeUInt32LE(centro.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...loc,centro,end]);
}
test("lector xlsx identifica tabla con encabezados y celdas compartidas",()=>{
  const filas=filasExcel(excelPlano());
  assert.equal(filas.length,1);
  assert.equal(filas[0].tipo,"Emergencia");
  assert.equal(filas[0].detalle,"Fuego en vivienda");
  assert.equal(filas[0].asistentes,"Gustavo Jerez Pantoja");
  assert.equal(typeof filas[0].fecha,"number");
});
