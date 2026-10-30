import {writeState,addToList} from './state-store.js';
export function validarCambios(cambios){
 if(!Array.isArray(cambios)||!cambios.length||cambios.length>24)throw Error('cambios_invalidos');
 const claves=new Set();
 for(const c of cambios){
  if(!c||typeof c.key!=='string'||!(/^(guardia-plan:\d{4}-\d{2}-\d{2}|guardia-revision:\d{4}-\d{2}-\d{2}|guardia:\d{4}-\d{2}-\d{2}__\d{4}|guardia-aviso:\d{4}-\d{2}-\d{2}:[a-zA-Z0-9_-]+)$/.test(c.key)||['guardia-plan:index','guardias:index'].includes(c.key)))throw Error('clave_invalida');
  if(c.op==='add'){
   if(!['guardia-plan:index','guardias:index'].includes(c.key)||c.item===undefined)throw Error('cambios_invalidos');
  }else{
   if(c.op!=='set'||!Object.hasOwn(c,'value')||!Number.isInteger(c.ifVersion)||c.ifVersion<0||claves.has(c.key))throw Error('version_requerida');
   claves.add(c.key);
  }
 }
 return cambios;
}
// Una conexión y una transacción PostgreSQL: también revierte el historial del trigger ante un fallo.
export async function guardarCambiosAtomicos(client,cambios){
 validarCambios(cambios);
 const sql=(strings,...values)=>{let text=strings[0];values.forEach((_,i)=>{text+='$'+(i+1)+strings[i+1];});return client.query(text,values).then(r=>r.rows);};
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout = '5s'");
  const keys=[...new Set(cambios.map(c=>c.key))].sort();
  const locked=await client.query('SELECT key,version FROM app_state WHERE key=ANY($1::text[]) ORDER BY key FOR UPDATE',[keys]);
  const versions=new Map(locked.rows.map(r=>[r.key,Number(r.version)]));
  for(const c of cambios)if(c.op==='set'&&(versions.get(c.key)||0)!==c.ifVersion)throw Object.assign(Error('version_conflict'),{conflicto:true});
  const resultados=[];
  for(const c of cambios){
   const r=c.op==='add'?await addToList(sql,c.key,c.item,{uniqueBy:c.uniqueBy||null,sort:c.sort||null}):await writeState(sql,c.key,c.value,{ifVersion:c.ifVersion});
   if(!r.ok)throw Object.assign(Error(r.conflict?'version_conflict':'lista_invalida'),{conflicto:!!r.conflict});
   resultados.push({key:c.key,version:r.version});
  }
  await client.query('COMMIT');return resultados;
 }catch(error){
  try{await client.query('ROLLBACK');}catch(rollbackError){throw Object.assign(Error('transaccion_no_confirmada'),{cause:rollbackError});}
  throw error;
 }
}
