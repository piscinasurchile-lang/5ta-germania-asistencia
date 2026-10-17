/* GERMANIA · Categorías de asistencia (fuente única para citaciones, partes y estadística).
 * Categorías: Emergencias · Comandancia (incluye Funerales) · Compañía · Otras. La Guardia Nocturna es una estadística aparte.
 * Cada tipo del desplegable lleva su categoría automáticamente; los partes nuevos la guardan (campo "categoria");
 * los antiguos se deducen del tipo. Reglas del administrador, 17-oct-2026.
 */
(function(root){
  "use strict";
  var CATEGORIAS=["Emergencias","Comandancia","Compañía","Otras"];
  var CATALOGO=[
    ["Emergencia","Emergencias"],
    ["Citación de Comandancia","Comandancia"],["Día del Bombero","Comandancia"],
    ["Funeral","Comandancia"],
    ["Citación de Compañía","Compañía"],["Sesión ordinaria","Compañía"],["Sesión extraordinaria","Compañía"],
    ["Reunión extraordinaria","Compañía"],["Instrucción","Compañía"],["Ejercicio","Compañía"],["Curso práctico","Compañía"],
    ["Capacitación","Compañía"],["Curso","Compañía"],["Aniversario de la Compañía","Compañía"],
    ["Otro","Otras"]
  ];
  function norm(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();}
  function dePorTipo(tipo){
    var n=norm(tipo);if(!n)return "Otras";
    for(var i=0;i<CATALOGO.length;i++)if(norm(CATALOGO[i][0])===n)return CATALOGO[i][1];
    if(/funeral|exequia|sepelio/.test(n))return "Comandancia";
    if(/emerg|10-|incend|rescate|alarma|llamado|acto de servicio/.test(n))return "Emergencias";
    if(/comand|dia del bombero|desfile/.test(n))return "Comandancia";
    if(/compan|ejercicio|instruc|curso|capacit|reunion|sesion|aniversario|academ|citacion|anb/.test(n))return "Compañía";
    return "Otras";
  }
  function esGuardia(pt){return /guardia/.test(norm(pt&&pt.tipo))||String(pt&&pt.origenAsistencia||"")==="guardia";}
  function deParte(pt){
    if(pt&&pt.categoria==="Funerales")return "Comandancia";
    if(pt&&pt.categoria&&CATEGORIAS.indexOf(pt.categoria)>=0)return pt.categoria;
    var o=String(pt&&pt.origenAsistencia||"");
    if(o==="emergencia_b5")return "Emergencias";
    if(o==="comandancia_citacion")return "Comandancia";
    return dePorTipo(pt&&pt.tipo);
  }
  /* ¿Este parte obliga a asistir (cuenta para el %)? Anulados y guardia nocturna no. */
  function cuenta(pt){return !!pt&&pt.anulado!==true&&!esGuardia(pt);}
  /* Tipos del desplegable: los guardados + los del catálogo que falten (sin duplicar ni borrar ninguno). */
  function completarTipos(lista){
    var out=Array.isArray(lista)?lista.slice():[],vistos=new Set(out.map(norm));
    CATALOGO.forEach(function(c){if(!vistos.has(norm(c[0]))){out.push(c[0]);vistos.add(norm(c[0]));}});
    return out;
  }
  root.GermaniaCategorias={CATEGORIAS:CATEGORIAS,CATALOGO:CATALOGO,dePorTipo:dePorTipo,deParte:deParte,cuenta:cuenta,esGuardia:esGuardia,completarTipos:completarTipos};
})(typeof window!=="undefined"?window:globalThis);
