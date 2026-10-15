/* GERMANIA · Simulador local de Informaciones.
 * SOLO para previsualización en PR #175. No consulta ni escribe Neon, ni comunica dispositivos.
 * Nunca presentar las comunicaciones entre oficiales de esta prueba como confidenciales.
 */
(function(global){
  "use strict";
  const KEY="germania:informaciones-prueba-local:v1";
  let fallback=[];
  function leer(){
    try{
      const raw=global.localStorage?.getItem(KEY);
      const json=raw?JSON.parse(raw):[];
      return Array.isArray(json)?json.filter(x=>x&&typeof x.id==="string"):[];
    }catch{return fallback.slice()}
  }
  function guardar(items){
    fallback=items.slice();
    try{global.localStorage?.setItem(KEY,JSON.stringify(items))}catch{}
  }
  function vigente(n,ahora=Date.now()){
    const creado=Date.parse(n?.en||"");
    const limite=n?.vence?Date.parse(n.vence):creado+48*60*60*1000;
    return Number.isFinite(creado)&&Number.isFinite(limite)&&limite>ahora;
  }
  function listar(destino){
    return leer().filter(n=>n.destino===destino&&vigente(n))
      .sort((a,b)=>String(b.en).localeCompare(String(a.en)));
  }
  function publicar({texto,destino,vence,autor}){
    if(!["compania","oficiales"].includes(destino))throw Error("Destinatario inválido");
    if(typeof texto!=="string"||!texto.trim()||texto.length>2000)throw Error("Información inválida");
    const ahora=Date.now();
    const limite=vence?Date.parse(vence):ahora+48*60*60*1000;
    if(!Number.isFinite(limite)||limite<=ahora)throw Error("El vencimiento debe ser futuro");
    const id="demo-"+ahora+"-"+Math.random().toString(36).slice(2,10);
    const n={id,texto:texto.trim(),destino,vence:new Date(limite).toISOString(),
      en:new Date(ahora).toISOString(),autor:String(autor||"Oficial de prueba")};
    guardar(leer().concat(n).slice(-100));
    return n;
  }
  function retirar(id){
    const a=leer(),b=a.filter(n=>n.id!==id);
    if(a.length!==b.length)guardar(b);
    return a.length!==b.length;
  }
  global.GermaniaInformacionesPrueba={listar,publicar,retirar,vigente};
})(window);
