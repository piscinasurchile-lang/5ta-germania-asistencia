export const ODD_ORIGINAL_SHA="aa7fceb5cdc71d546e9b093866bdc24fc4318e8b657638926c96a3017476608d";
const dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function fecha(f){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(f||""))throw Error("Fecha inválida");
 const d=new Date(f+"T12:00:00Z");
 if(Number.isNaN(+d)||d.toISOString().slice(0,10)!==f)throw Error("Fecha inexistente");
 return d;
}
function larga(f){
 const d=fecha(f);return dias[d.getUTCDay()]+" "+d.getUTCDate()+" de "+meses[d.getUTCMonth()]+" de "+d.getUTCFullYear();
}
function corta(f){
 const d=fecha(f);
 return dias[d.getUTCDay()].replace(/^./,c=>c.toUpperCase())+" "+String(d.getUTCDate()).padStart(2,"0")+"/"+String(d.getUTCMonth()+1).padStart(2,"0")+"/"+d.getUTCFullYear();
}
export function validarODDGuardia(datos){
 const {semana,number,year,issueDate,oddAnterior}=datos;
 if(!/^\d{1,3}$/.test(String(number))||Number(number)<1||!/^\d{4}$/.test(String(year)))throw Error("Numeración ODD inválida");
 if(!/^\d{1,3}\/\d{4}$/.test(String(oddAnterior||"")))throw Error("Indica la ODD que será reemplazada");
 if(fecha(issueDate).getUTCFullYear()!==Number(year))throw Error("Fecha de emisión y año ODD diferentes");
 if(!Array.isArray(semana)||semana.length!==7)throw Error("Se requieren siete noches aprobadas");
 const inicio=fecha(semana[0].date);
 if(inicio.getUTCDay()!==3)throw Error("La guardia comienza un miércoles");
 semana.forEach((g,i)=>{
  const expected=new Date(inicio);expected.setUTCDate(expected.getUTCDate()+i);
  if(fecha(g.date).toISOString()!==expected.toISOString())throw Error("Semana de guardia incorrecta");
  if(!g.registrado||!g.complete||g.estadoRevision!=="aprobada"||
     g.obac==="Sin asignar"||g.driver==="Sin asignar"||
     !Array.isArray(g.people)||g.people.length<2||
     g.people.some(p=>!p.name||p.name==="Sin identificar"))
   throw Error("Guardia incompleta o sin aprobar: "+g.date);
  const nombres=[g.obac,g.driver,...g.people.map(p=>p.name)];
  if(new Set(nombres).size!==nombres.length)throw Error("Persona duplicada el "+g.date);
 });
 return {inicio:semana[0].date,fin:semana[6].date};
}

