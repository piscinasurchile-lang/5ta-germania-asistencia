/* Conciliación de asistencias: cálculos puros, sin escrituras a Neon. */
export function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
export function fechaISO(valor) {
  if (typeof valor === "number" && valor > 30000 && valor < 90000) {
    const iso = new Date(Date.UTC(1899, 11, 30) + Math.floor(valor) * 86400000).toISOString().slice(0, 10);
    return fechaISO(iso);
  }
  const s = String(valor ?? "").trim();
  let m = /^(\d{4})-(\d\d)-(\d\d)(?:\s.*)?$/.exec(s);
  if (!m) {
    const x = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);
    if (x) m = [s, x[3], x[2].padStart(2, "0"), x[1].padStart(2, "0")];
  }
  if (!m) return null;
  const y=Number(m[1]), mo=Number(m[2]), d=Number(m[3]);
  if (y < 2020 || y > 2100) return null;
  const check = new Date(Date.UTC(y,mo-1,d));
  return check.getUTCFullYear() === y && check.getUTCMonth()+1 === mo && check.getUTCDate() === d
    ? [m[1],m[2],m[3]].join("-") : null;
}
export function filasCSV(texto) {
  const salida=[], actual=[]; let celda="", dentro=false;
  const s=String(texto).replace(/^\uFEFF/,"");
  for (let i=0;i<s.length;i++) {
    const c=s[i];
    if (c==='"' && dentro && s[i+1]==='"') { celda+='"';i++; }
    else if (c==='"') dentro=!dentro;
    else if (c===';' && !dentro) {actual.push(celda.trim());celda="";}
    else if ((c==='\n'||c==='\r')&&!dentro) {
      actual.push(celda.trim());celda="";
      if (actual.some(Boolean)) salida.push(actual.splice(0));
      else actual.length=0;
      if (c==='\r'&&s[i+1]==='\n') i++;
    } else celda+=c;
  }
  if (dentro) throw new Error("CSV con comillas sin cerrar");
  actual.push(celda.trim());
  if (actual.some(Boolean)) salida.push(actual);
  if (!salida.length) throw new Error("Archivo CSV vacío");
  const cab=salida.shift().map(normalizar);
  const pos=(...nombres)=>cab.findIndex(c=>nombres.includes(c));
  const fi=pos("fecha","date"),ti=pos("tipo","citacion","categoria"),
    di=pos("actividad","detalle","descripcion","descripcion actividad"),
    ai=pos("asistentes","presentes","voluntarios");
  if ([fi,ti,di,ai].some(n=>n<0)) throw new Error("Columnas requeridas: fecha;tipo;actividad;asistentes");
  return salida.map((c,i)=>({fecha:c[fi],tipo:c[ti],detalle:c[di],asistentes:c[ai],ubicacion:"CSV fila "+(i+2)}));
}
export function referencias(valor) {
  if (Array.isArray(valor)) return valor.map(String).map(s=>s.trim()).filter(Boolean);
  return String(valor ?? "").split(/[,|\n]+/).map(s=>s.trim()).filter(Boolean);
}
function resolverIdentidad(valor, roster) {
  const ref=String(valor).trim(), n=normalizar(ref);
  const compact=ref.replace(/[.\-\s]/g,"").toLowerCase();
  const coinciden=roster.filter(p=>{
    const ids=[p.id,p.rut,p.clave].filter(x=>x!=null&&String(x)!=="");
    if (ids.some(x=>String(x).replace(/[.\-\s]/g,"").toLowerCase()===compact)) return true;
    const full=normalizar([p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "));
    return n===full || n===normalizar([p.nombre,p.apellidoPaterno].join(" ")) ||
      n===normalizar([String(p.nombre||"").split(/\s+/)[0],p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" ")) ||
      n===normalizar([String(p.nombre||"").split(/\s+/)[0],p.apellidoPaterno].filter(Boolean).join(" "));
  });
  return coinciden.length===1 ? {id:coinciden[0].id} : {error:coinciden.length>1?"Persona ambigua: ":"Sin ficha reconocida: "+ref,ref};
}
export function prepararFilas(filas, roster, tipos=[]) {
  const actividades=[], errores=[];
  const tiposMap=new Map(tipos.map(t=>[normalizar(t),t]));
  for (const fila of filas) {
    const ubicacion=fila.ubicacion||"fila "+(actividades.length+errores.length+1);
    const fecha=fechaISO(fila.fecha), tipo=tiposMap.get(normalizar(fila.tipo))||String(fila.tipo||"").trim(),
      detalle=String(fila.detalle||"").trim();
    if (!fecha||!tipo||!detalle) { errores.push({ubicacion,motivo:"Fecha, tipo o actividad inválidos"}); continue; }
    const asistentes=new Set(), participantes=new Set(), erroresFila=[];
    const resolverLista=(refs,ids)=>{
      for(const ref of referencias(refs)){
        const x=resolverIdentidad(ref,roster);
        if(x.error)erroresFila.push(x.error);
        else ids.add(x.id);
      }
    };
    resolverLista(fila.asistentes,asistentes);
    if(fila.participantes)resolverLista(fila.participantes,participantes);
    if(erroresFila.length) { errores.push({ubicacion,motivo:erroresFila.slice(0,4).join("; ")}); continue; }
    const records={};
    for(const p of roster) {
      if(!p?.id)continue;
      if(fila.participantes){
        if(participantes.has(p.id))records[p.id]=asistentes.has(p.id)?"presente":"ausente";
      }else{
        const desde=fechaISO(p.fechaIngreso),hasta=fechaISO(p.fechaBaja||p.fechaRetiro);
        if((desde&&fecha<desde)||(hasta&&fecha>hasta))continue;
        if(p.activo===false&&!hasta)continue;
        records[p.id]=asistentes.has(p.id)?"presente":"ausente";
      }
    }
    if([...asistentes].some(id=>!Object.hasOwn(records,id))) {
      errores.push({ubicacion,motivo:"Un asistente no figura entre los participantes"});
      continue;
    }
    actividades.push({date:fecha,tipo,detalle,records,ubicacion,
      sourceNumber:Number.isInteger(fila.sourceNumber)?fila.sourceNumber:null,
      sourceYear:Number.isInteger(fila.sourceYear)?fila.sourceYear:Number(fecha.slice(0,4)),
      claveDespacho:fila.claveDespacho||""});
  }
  return {actividades,errores};
}
function base(a){return [a.date,normalizar(a.tipo),normalizar(a.detalle)].join("|");}
function presentes(a){return Object.entries(a.records||{}).filter(([,e])=>e==="presente").map(([id])=>id).sort().join(",");}
function igual(a,b){return base(a)===base(b)&&presentes(a)===presentes(b);}
function identidadFuente(a){
  if(!Number.isInteger(a?.sourceNumber))return null;
  return "historico-"+(a.sourceYear||Number(a.date.slice(0,4)))+":"+
    String(a.sourceNumber).padStart(3,"0");
}
function coincideFuente(pt,a){
  const n=identidadFuente(a);
  if(!n)return false;
  const ids=["historico-"+a.sourceYear+":"+String(a.sourceNumber).padStart(3,"0"),
    "cbv:"+a.sourceYear+":"+String(a.sourceNumber).padStart(3,"0")];
  return ids.includes(String(pt.importId||""));
}
function mismoEstadoEnParticipantes(existente,excel){
  const r=excel.records||{},e=existente.records||{};
  return Object.keys(r).every(id=>!Object.hasOwn(e,id)||e[id]===r[id]);
}
export function conciliar(actividades, existentes) {
  const resultado={nuevas:[],iguales:[],diferencias:[],ambiguas:[],duplicadasArchivo:[]};
  const inventario=existentes.filter(p=>p&&p.date&&p.tipo);
  const encontrados=new Set(),vistosFuente=new Set();
  const datos=new Map();
  for(const a of actividades){
    const src=identidadFuente(a);
    if(src){
      if(vistosFuente.has(src)){
        resultado.duplicadasArchivo.push({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle});
        continue;
      }
      vistosFuente.add(src);
    }
    const k=base(a);
    const q=datos.get(k)||[];
    q.push(a);
    datos.set(k,q);
  }
  for(const [k,items] of datos){
    // Una fuente matriz da un número institucional inequívoco; sin él no se
    // puede resolver la ambigüedad de filas completamente iguales.
    if(items.length>1 && items.some(a=>a.sourceNumber==null) &&
       new Set(items.map(a=>presentes(a))).size!==items.length){
      resultado.duplicadasArchivo.push(...items.map(a=>({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle})));
      continue;
    }
    for(const a of items){
      const firmados=inventario.filter(p=>coincideFuente(p,a));
      const srcMatch=firmados[0];
      const disponibles=inventario.filter(p=>base(p)===base(a));
      const exacto=srcMatch || disponibles.find(p=>!encontrados.has(p)&&mismoEstadoEnParticipantes(p,a));
      const seleccionado=exacto || disponibles.find(p=>!encontrados.has(p));
      if(srcMatch && base(srcMatch)!==base(a)){
        resultado.diferencias.push({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle,
          motivo:"Cambió la fecha, tipo o descripción de la actividad "+a.sourceNumber});
        continue;
      }
      if(!seleccionado){
        if(disponibles.length){
          // Los registros originales pueden contener copias del mismo parte.
          if(disponibles.some(p=>mismoEstadoEnParticipantes(p,a)))resultado.iguales.push(a);
          else resultado.diferencias.push({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle,
            motivo:"Asistencias distintas de lo que figura en Germania"});
          continue;
        }
        resultado.nuevas.push(a);
        continue;
      }
      encontrados.add(seleccionado);
      if(mismoEstadoEnParticipantes(seleccionado,a))resultado.iguales.push(a);
      else resultado.diferencias.push({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle,
        motivo:"Asistencia diferente para una actividad ya registrada",
        presentesExcel:presentes(a).split(",").filter(Boolean).length,
        presentesGermania:presentes(seleccionado).split(",").filter(Boolean).length});
    }
  }
  return resultado;
}
