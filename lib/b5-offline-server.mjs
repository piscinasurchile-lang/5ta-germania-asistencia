/* Integración oficial, idempotente y sin sobrescrituras de borradores B-5.
 * Reutiliza partes:index:v1, servicio:index:v1 y el correlativo institucional.
 * Sin escribir datos de guardias u oficiales.
 */
import {readState,addToList} from "./state-store.js";

const STATUS=["presente","ausente","justificado"];
const SERV_TIPOS=["Emergencia","Acto de servicio","Carga de combustible","Ejercicio con material","Mantención","Traslado","Otro"];
const SV_CAMPOS=["svFecha","svTipoAct","svHoraSalida","svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada",
"svHorometro","svCalle","svNumeracion","svSector","svUnidadCargo","svConductor","svCuerpoCargo","svPuestoMando",
"svCargoQuinta","svOfContabilidad","svOfSeguridad","svLugarInicio","svNaturaleza","svDetNaturaleza","svOrigen",
"svDetOrigen","svCausas","svDetCausa","svTipoInmueble","svConstruccion","svNiveles","svObservaciones",
"svPersonas","svMaterial","svApoyo","svCombConductor","svCombKm","svCombFecha","svCombServicentro",
"svCombRut","svCombLitros","svCombValor"];
const fechaOk=d=>/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(String(d||"")) &&
 !Number.isNaN(Date.parse(String(d)+"T12:00:00Z"));
const horaOk=v=>v===""||/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase();
export class ConflictoB5 extends Error{constructor(msg){super(msg);this.code="registro_existente";}}
export class InvalidoB5 extends Error{constructor(msg){super(msg);this.code="registro_invalido";}}
function texto(s,max=4000){return String(s||"").slice(0,max).trim();}
export function validarBorrador(item){
 if(!item||typeof item!=="object"||!/^([0-9a-f-]{36}|b5-[0-9]+-[a-z0-9]+)$/.test(item.id||"") ||
 !["lista","servicio"].includes(item.tipo)||!item.datos||typeof item.datos!=="object")
   throw new InvalidoB5("Borrador B-5 inválido");
 const d=item.datos;
 const date=item.tipo==="lista"?d.date:d.svFecha;
 if(!fechaOk(date))throw new InvalidoB5("Fecha de servicio inválida");
 if(!d.records || typeof d.records!=="object" || Object.keys(d.records).length>200)
   throw new InvalidoB5("Falta registrar la dotación");
 if(item.tipo==="lista"){
   if(!texto(d.tipo,100))throw new InvalidoB5("Falta el tipo de citación");
   if(Object.values(d.records).some(v=>!STATUS.includes(v)))throw new InvalidoB5("Estado de asistencia inválido");
 }else{
   if(!SERV_TIPOS.includes(d.svTipoAct))throw new InvalidoB5("Tipo de servicio inválido");
   if(!horaOk(String(d.svHoraSalida||"")))throw new InvalidoB5("Hora de salida inválida");
   if(Object.values(d.records).some(v=>!["si","no"].includes(v)))throw new InvalidoB5("Concurrencia inválida");
 }
 return true;
}
async function numeroOficial(sql,tipo,anio){
 const key="correlativo:"+tipo+":"+anio;
 const r=await sql`
   INSERT INTO app_state(key,value,version,updated_at)
   VALUES(${key},jsonb_build_object('actual',1),1,now())
   ON CONFLICT(key) DO UPDATE SET
     value=jsonb_build_object('actual',COALESCE((app_state.value->>'actual')::int,0)+1),
     version=app_state.version+1, updated_at=now()
   RETURNING (value->>'actual')::int AS numero
 `;
 return Number(r[0].numero);
}
async function insertarUnaVez(sql,key,value,id){
 const actual=await readState(sql,key);
 if(actual.value){
   if(actual.value.b5OfflineId===id)return actual.value;
   throw new ConflictoB5("Ya existe un registro para esta fecha, tipo y hora. Se necesita revisión.");
 }
 const json=JSON.stringify(value);
 const filas=await sql`
   INSERT INTO app_state(key,value,version,updated_at)
   VALUES(${key},${json}::jsonb,1,now())
   ON CONFLICT(key) DO NOTHING
   RETURNING value
 `;
 if(filas?.[0])return filas[0].value;
 const posterior=await readState(sql,key);
 if(posterior.value?.b5OfflineId===id)return posterior.value;
 throw new ConflictoB5("Otra persona guardó un registro coincidente. No se sobrescribió.");
}
async function indice(sql,key,info){
 const v=await addToList(sql,key,info,{uniqueBy:"clave"});
 if(!v.ok)throw new Error("El índice no es una lista");
}
function revisarNomina(items,rostro){
 const activos=new Set((Array.isArray(rostro)?rostro:[]).filter(p=>p&&p.activo!==false).map(p=>String(p.id)));
 const ids=Object.keys(items);
 if(!ids.length || ids.some(id=>!activos.has(id)))throw new ConflictoB5("La nómina cambió. Debe revisarse antes de integrar.");
 return ids;
}
async function guardarParte(sql,item,registro,key,numeroRelacionado=null){
 const previo=await readState(sql,key);
 if(previo.value && previo.value.b5OfflineId!==item.id)throw new ConflictoB5("Ya existe un parte de asistencia en esa fecha.");
 const anio=registro.date.slice(0,4);
 const numero=previo.value?.numero||numeroRelacionado||await numeroOficial(sql,"parte",anio);
 const valor=await insertarUnaVez(sql,key,{...registro,numero,anio,b5OfflineId:item.id},item.id);
 await indice(sql,"partes:index:v1",{clave:key.slice("parte:".length),date:registro.date,tipo:registro.tipo});
 return valor;
}
export async function integrarBorradorB5(sql,item){
 validarBorrador(item);
 const roster=(await readState(sql,"roster:v8")).value;
 const d=item.datos;const ids=revisarNomina(d.records,roster);
 const fecha=item.tipo==="lista"?d.date:d.svFecha;
 if(item.tipo==="lista"){
   const tipo=texto(d.tipo,100);
   const key="parte:"+fecha+"__"+slug(tipo);
   const registro={date:fecha,tipo,detalle:texto(d.detalle),registradoPor:texto(d.registradoPor,180),
     records:Object.fromEntries(ids.map(id=>[id,d.records[id]])),eligibleIds:ids,
     origenAsistencia:"citacion_manual",generaAsistencia:true};
   const guardado=await guardarParte(sql,item,registro,key);
   return {ok:true,confirmado:true,numero:guardado.numero,anio:guardado.anio,clave:key};
 }
 const tipo=d.svTipoAct, hora=String(d.svHoraSalida||"");
 const key="servicio:"+fecha+"__"+(hora?hora.replace(":",""):"sin-hora");
 const previo=await readState(sql,key);
 if(previo.value && previo.value.b5OfflineId!==item.id)throw new ConflictoB5("Ya existe una hoja de servicio en esa fecha y hora.");
 const anio=fecha.slice(0,4);
 const numero=previo.value?.numero||await numeroOficial(sql,"servicio",anio);
 const registro=Object.fromEntries(SV_CAMPOS.map(c=>[c,texto(d[c],c==="svObservaciones"?4000:1500)]));
 registro.svFecha=fecha;registro.svTipoAct=tipo;
 registro.concurrencia=Object.fromEntries(ids.map(id=>[id,d.records[id]]));
 registro.registrarAsistencia=d.registrarAsistencia!==false;
 const guardado=await insertarUnaVez(sql,key,{...registro,numero,anio,b5OfflineId:item.id},item.id);
 await indice(sql,"servicio:index:v1",{clave:key,fecha,tipo});
 if(registro.registrarAsistencia){
   const tipoParte=tipo+" B-5";
   const parteKey="parte:"+fecha+"__"+slug(tipoParte)+"__"+(hora?hora.replace(":",""):"s-h");
   const records=Object.fromEntries(ids.map(id=>[id,d.records[id]==="si"?"presente":"ausente"]));
   const detalle=[d.svCalle,d.svNumeracion,d.svSector].map(x=>texto(x,150)).filter(Boolean).join(" ")||texto(d.svNaturaleza,150);
   const origen=tipo==="Emergencia"?"emergencia_b5":"citacion_manual";
   await guardarParte(sql,item,{date:fecha,tipo:tipoParte,detalle,registradoPor:texto(d.svCargoQuinta,180),
     records,modoConcurrencia:registro.concurrencia,origenAsistencia:origen,generaAsistencia:true,
     servicioB5:true,eligibleIds:origen==="emergencia_b5"?ids.filter(id=>d.records[id]==="si"):ids},
     parteKey,guardado.numero);
   const t=await addToList(sql,"tipos:v2",tipoParte);
   if(!t.ok)throw new Error("No se pudo actualizar el tipo de asistencia");
 }
 return {ok:true,confirmado:true,numero:guardado.numero,anio:guardado.anio,clave:key};
}
