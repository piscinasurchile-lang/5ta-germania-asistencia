import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {jsPDF} from 'jspdf';
import {extractText} from 'unpdf';
const read=f=>readFileSync(new URL('../public/legacy/'+f,import.meta.url),'utf8');
const app=read('app.js'),fechas=Array.from({length:7},(_,i)=>'2026-11-'+(11+i));
const pdf=()=>{const ctx={Date};vm.createContext(ctx);vm.runInContext(read('germania-guardia-nomina-pdf.js'),ctx);return ctx.GermaniaGuardiaNominaPdf;};
const filas=()=>fechas.map(fecha=>({fecha,vol:[],maq:[],obac:[],integrantesIds:[],completa:false,estadoRevision:'sin revisión'}));
const texto=async doc=>(await extractText(new Uint8Array(doc.output('arraybuffer')),{mergePages:true})).text;
for(const cantidad of [0,1,7])test('imprime siete recuadros con '+cantidad+' noches inscritas sin exigir cierre ni dotación mínima',async()=>{
 const f=filas();for(let i=0;i<cantidad;i++){f[i].obac=['Christian Vergara'];f[i].integrantesIds=['christian'];}
 const original=JSON.stringify(f),doc=pdf().crear({jsPDF,inicio:fechas[0],filas:f}),t=await texto(doc);
 assert.equal(doc.getNumberOfPages(),1);assert.match(t,/PENDIENTE DE APROBACIÓN/);assert.match(t,/Sin asignar/);assert.match(t,/Sin inscritos/);
 for(const dia of ['MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO','LUNES','MARTES'])assert.ok(t.includes(dia));
 assert.equal(JSON.stringify(f),original);if(cantidad)assert.match(t,/Christian Vergara/);
});
test('funciones aprobadas se imprimen como tales aunque la noche esté incompleta',async()=>{
 const f=filas();f.forEach(n=>{n.estadoRevision='aprobada';n.maq=['Fernando Jerez'];n.obac=['Francisco Vega'];n.vol=['Manuel Moller'];n.integrantesIds=['jerez','vega','moller'];});
 const t=await texto(pdf().crear({jsPDF,inicio:fechas[0],filas:f}));
 assert.match(t,/PROGRAMACIÓN APROBADA/);assert.doesNotMatch(t,/PENDIENTE DE APROBACIÓN/);assert.match(t,/Fernando Jerez/);assert.match(t,/3 VOLUNTARIOS/);assert.match(t,/21 INSCRIPCIONES/);
});
test('nómina extensa conserva todos los nombres en continuaciones sin recortar',async()=>{
 const f=filas();f[0].vol=Array.from({length:40},(_,i)=>'Integrante '+i+' Apellido compuesto largo');
 const doc=pdf().crear({jsPDF,inicio:fechas[0],filas:f}),t=await texto(doc);
 assert.ok(doc.getNumberOfPages()>1);for(const n of f[0].vol)assert.ok(t.includes(n),n);
});
function cliente({bloqueado=false,falla=false}={}){
 const nodes=Object.fromEntries(['gnTablaPdf','gnHistorialPdf','gnTablaPdfMsg','gnHistorialMsg'].map(id=>[id,{disabled:false,textContent:''}]));
 const visor={closed:false,document:{},location:{replace:u=>{visor.url=u;}},close:()=>{visor.closed=true;}};
 const calls=[],c={document:{getElementById:id=>nodes[id]},LOGO_B64:'logo',gnAdd:()=>fechas[6],setTimeout:()=>{},URL:{createObjectURL:()=>{calls.push('blob');return 'blob:pdf';},revokeObjectURL:()=>{}},window:{open:()=>{calls.push('open');return bloqueado?null:visor;},jspdf:{jsPDF},GermaniaGuardiaNominaPdf:{crear:()=>({autoPrint:()=>calls.push('print'),output:()=>new Blob(['pdf']),save:()=>calls.push('save')})}},gnHistorialDatos:async(inicio,estricto)=>{calls.push('fresh:'+estricto);if(falla)throw Error('Sin conexión');return filas();}};
 vm.createContext(c);const a=app.indexOf('async function gnHistorialDescargar('),b=app.indexOf('function gnHistorialAbrirOdd(',a);vm.runInContext(app.slice(a,b),c);
 return {c,calls,nodes,visor};
}
test('cada impresión relee los datos y reserva visor antes de esperar la red',async()=>{
 const {c,calls,nodes,visor}=cliente();await c.gnHistorialDescargar(fechas[0],true);await c.gnHistorialDescargar(fechas[0],true);
 assert.deepEqual(calls,['open','fresh:true','print','blob','open','fresh:true','print','blob']);assert.equal(visor.url,'blob:pdf');assert.equal(nodes.gnTablaPdf.disabled,false);
});
test('bloqueo de ventanas móviles descarga el mismo PDF y explica cómo imprimir',async()=>{
 const {c,calls,nodes}=cliente({bloqueado:true});await c.gnHistorialDescargar(fechas[0],true);
 assert.deepEqual(calls,['open','fresh:true','save']);assert.match(nodes.gnTablaPdfMsg.textContent,/selecciona Imprimir/);
});
test('error de lectura cierra visor y no emite una nómina incompleta como si fuera actual',async()=>{
 const {c,calls,nodes,visor}=cliente({falla:true});await c.gnHistorialDescargar(fechas[0],true);
 assert.deepEqual(calls,['open','fresh:true']);assert.equal(visor.closed,true);assert.match(nodes.gnTablaPdfMsg.textContent,/Sin conexión/);assert.equal(nodes.gnTablaPdf.disabled,false);
});
test('fallo al leer maquinistas bloquea PDF estricto y conserva consumidores anteriores',async()=>{
 const c={fetch:async()=>({ok:false}),Error};vm.createContext(c);const a=app.indexOf('async function gnTablaRolSemana('),b=app.indexOf('let gnTablaSemanaVisible=',a);vm.runInContext(app.slice(a,b),c);
 await assert.rejects(c.gnTablaRolSemana('guardia-maq:',fechas[0],true),/maquinistas/);assert.equal(Object.keys(await c.gnTablaRolSemana('guardia-maq:',fechas[0])).length,0);
});
function consulta(estado){
 const people=['nuevo','viejo','maq','obac'].map(id=>({id,nombre:id,conductor:id==='maq'}));
 const c={ROSTER:people,ROSTER_KEY:'roster:v8',gnHistorialSemana:x=>x,gnWeek:()=>fechas,gnTablaRolSemana:async()=>({}),precBuscar:()=>null,nombreCompleto:p=>p.nombre,gnHistorialNombre:id=>id,gnHistorialEfectiva:()=>({}),gnHistorialLeerPrefijo:async()=>[{key:'guardia-inscripcion:'+fechas[0]+':nuevo',value:[fechas[0]]}],sGet:async key=>key==='roster:v8'?people:key==='precedencia:v1'?{lista:[]}:key.startsWith('guardia-revision:')?{estado,noches:Object.fromEntries(fechas.map(f=>[f,{vol:['viejo'],obac:'obac',maq:'maq'}]))}:null,window:{GermaniaObac:{obacDeNoche:()=>({voluntarios:['nuevo'],maquinistas:[],obac:null})}}};
 vm.createContext(c);const a=app.indexOf('async function gnHistorialDatos('),b=app.indexOf('/* Cumplimiento efectivo',a);vm.runInContext(app.slice(a,b),c);return c;
}
test('PDF durante inscripción usa nuevos inscritos aunque exista un borrador antiguo',async()=>{
 const f=await consulta('borrador').gnHistorialDatos(fechas[0],true);assert.deepEqual(Array.from(f[0].vol),['nuevo']);assert.notEqual(f[0].estadoRevision,'aprobada');
});
test('PDF de semana aprobada conserva asignaciones manuales en vez de recalcularlas',async()=>{
 const f=await consulta('aprobada').gnHistorialDatos(fechas[0],true);assert.deepEqual(Array.from(f[0].vol),['viejo']);assert.deepEqual(Array.from(f[0].maq),['maq']);assert.equal(f[0].estadoRevision,'aprobada');
});
