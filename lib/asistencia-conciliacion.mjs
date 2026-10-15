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
    return n===full || n===normalizar([p.nombre,p.apellidoPaterno].join(" "));
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
    const ids=new Set(); const erroresFila=[];
    for (const ref of referencias(fila.asistentes)) {
      const x=resolverIdentidad(ref,roster);
      if (x.error) erroresFila.push(x.error);
      else ids.add(x.id);
    }
    if (erroresFila.length) { errores.push({ubicacion,motivo:erroresFila.slice(0,4).join("; ")}); continue; }
    const records={};
    for (const p of roster) {
      if (!p?.id) continue;
      const desde=fechaISO(p.fechaIngreso);
      const hasta=fechaISO(p.fechaBaja||p.fechaRetiro);
      if (desde&&fecha<desde || hasta&&fecha>hasta) continue;
      if(p.activo===false&&!hasta) continue;
      records[p.id]=ids.has(p.id)?"presente":"ausente";
    }
    actividades.push({date:fecha,tipo,detalle,records,ubicacion});
  }
  return {actividades,errores};
}
function base(a){return [a.date,normalizar(a.tipo),normalizar(a.detalle)].join("|");}
function presentes(a){return Object.entries(a.records||{}).filter(([,e])=>e==="presente").map(([id])=>id).sort().join(",");}
function igual(a,b){return base(a)===base(b)&&presentes(a)===presentes(b);}
export function conciliar(actividades, existentes) {
  const m=new Map(), resultado={nuevas:[],iguales:[],diferencias:[],ambiguas:[],duplicadasArchivo:[]};
  for (const p of existentes) {
    if(!p?.date||!p?.tipo) continue;
    const k=base(p);
    if(!m.has(k))m.set(k,[]);
    m.get(k).push(p);
  }
  const origen=new Map();
  for(const a of actividades){
    const k=base(a);
    if(!origen.has(k))origen.set(k,[]);
    origen.get(k).push(a);
  }
  for(const [k,items] of origen){
    const originales=m.get(k)||[];
    const repetidos=new Set();
    for(const a of items){
      const exactos=items.filter(b=>igual(a,b));
      if(exactos.length>1)repetidos.add(a.ubicacion);
    }
    if(repetidos.size) {
      resultado.duplicadasArchivo.push(...items.map(a=>({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle})));
      continue;
    }
    if(!originales.length) {
      // Sin ID de evento, dos actividades iguales en día/tipo/detalle no son distinguibles.
      if(items.length===1) resultado.nuevas.push(items[0]);
      else resultado.ambiguas.push(...items.map(a=>({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle})));
      continue;
    }
    const pendientes=originales.slice();
    const cambios=[];
    for(const a of items){
      const pos=pendientes.findIndex(b=>igual(a,b));
      if(pos>=0){resultado.iguales.push(a);pendientes.splice(pos,1);}
      else cambios.push(a);
    }
    if(!cambios.length)continue;
    if(cambios.length===1&&pendientes.length===1&&items.length===1&&originales.length===1){
      const a=cambios[0],p=pendientes[0];
      resultado.diferencias.push({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle,
        presentesExcel:presentes(a).split(",").filter(Boolean).length,
        presentesGermania:presentes(p).split(",").filter(Boolean).length});
    }else{
      resultado.ambiguas.push(...cambios.map(a=>({ubicacion:a.ubicacion,fecha:a.date,tipo:a.tipo,detalle:a.detalle})));
    }
  }
  return resultado;
}
