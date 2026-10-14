/* GERMANIA · Opción Tablet B-5 junto a la selección de voluntarios.
 * No agrega filas a la nómina, no cambia IDs ni crea asistencias.
 */
(function(){
  "use strict";
  var sel=document.getElementById("miVoluntario");
  if(!sel)return;
  var VALOR="__tablet_b5__";
  var CLAVE="germania:modo-dispositivo:v1";
  var PREFERENCIA="b5";

  function agregarOpcion(){
    if(sel.querySelector('option[value="'+VALOR+'"]'))return;
    // Esperar la nómina real: cargarMiVoluntario() sustituye las opciones al iniciar.
    if(sel.options.length===0 || !sel.querySelector('option[value=""]'))return;
    var option=document.createElement("option");
    option.value=VALOR;
    option.textContent="TABLET B-5 · Unidad del carro";
    sel.insertBefore(option,sel.options.length>1?sel.options[1]:null);
  }

  // La selección de B-5 tiene prioridad sobre los listeners de identidad:
  // nunca se guarda como voluntario ni puede firmar por una persona.
  sel.addEventListener("change",function(event){
    if(sel.value!==VALOR)return;
    event.stopImmediatePropagation();
    try{
      localStorage.setItem(CLAVE,PREFERENCIA);
      localStorage.removeItem("germania:voluntario-dispositivo:v2");
    }catch(error){
      console.warn("No se pudo guardar el modo Tablet B-5",error);
    }
    // Eliminar solo la identidad local de este equipo (nunca registros Neon).
    document.cookie="germania_voluntario=; Max-Age=0; Path=/; SameSite=Lax";
    try{window.top.location.assign("/b5");}
    catch(error){window.location.assign("/b5");}
  },true);

  new MutationObserver(agregarOpcion).observe(sel,{childList:true});
  agregarOpcion();
})();
