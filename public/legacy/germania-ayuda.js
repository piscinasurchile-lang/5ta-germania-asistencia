/* GERMANIA · Ayuda «?» en los botones.
   Cada botón conocido lleva una «?» pequeña en su esquina; al tocarla se explica qué hace, sin
   ejecutar el botón. Para agregar uno: una línea en AY (por id, por pantalla o por texto). */
(function(){
"use strict";
var AY={
 /* Pantallas y atajos */
 "go:germania":"Vuelve al Inicio: tu estado, novedades, tarjetas de guardia y quién está hoy.",
 "go:estado":"Marca cómo estás hoy: en cuartel, disponible, fuera de Villarrica o no disponible. Es lo que ve la Compañía en «Quién está hoy».",
 "go:lista":"Pasar lista: registra quién estuvo presente, ausente o justificado en una citación o reunión.",
 "go:servicio":"Hoja de servicio de una emergencia con la unidad B-5: quién concurrió y los datos de la salida.",
 "go:guardia":"Guardia nocturna: tus noches y, para el mando, la gestión de la semana.",
 "go:historial":"Tu historial: las actividades a las que asististe.",
 "go:panel":"Estadística: asistencia, premios y cumplimiento de guardia de toda la Compañía.",
 "go:config":"Oficiales: nómina, hojas de vida, ingresos, bajas, precedencia, respaldos y más. Solo para oficiales.",
 "go:oficialidad":"Registra la oficialidad del año.",
 "go:mi":"Tus noches de guardia de la semana.",
 "gv:mi":"Tus noches de guardia de la semana.",
 "gv:gestion":"Gestión de la guardia: programar semanas, revisar la dotación y reemplazos. Solo mando.",
 /* Inicio */
 "#miEstadoChip":"Toca para marcar o cambiar tu estado de hoy.",
 "#cambiarFotoBtn":"Cambia tu fotografía de perfil.",
 "#cambiarVolBtn":"Úsalo si este teléfono lo usa otra persona: te deja elegir otro nombre.",
 "#novedadAgregar":"Publica una novedad de la Compañía en el aviso «Sin emergencias».",
 "#actualizarMinuta":"Vuelve a consultar el estado de todos los voluntarios.",
 "#inicioElegir":"Te lleva a elegir tus noches de guardia de esta semana.",
 "#irGestionar":"Abre la gestión de la guardia: cobertura, revisión y reemplazos.",
 /* Pasar lista / hoja de servicio */
 "#guardarBtn":"Guarda el parte de asistencia. Queda con número correlativo.",
 "#marcarTodosBtn":"Marca como presentes a todos de una vez; luego corriges las excepciones.",
 "#pdfBtn":"Genera el PDF del parte para imprimir o enviar.",
 "#waBtn":"Prepara el resumen para compartirlo por WhatsApp.",
 "#svTipoActAgregarBtn":"Agrega un tipo de actividad a la lista de opciones.",
 "#svLimpiarBtn":"Marca a todos como «no concurre» para partir de cero.",
 "#svGuardarBtn":"Guarda la hoja de servicio. Una vez guardada solo se corrige desbloqueándola.",
 "#svPdfBtn":"Genera el PDF de la hoja de servicio.",
 "#svWaBtn":"Prepara el resumen de la hoja para WhatsApp.",
 /* Guardia · programación */
 "#gnPrevMes":"Mes anterior del calendario.",
 "#gnNextMes":"Mes siguiente del calendario.",
 "#gnBorrarSemana":"Anula la semana seleccionada y avisa cuántas inscripciones tenía. Pide confirmación.",
 "#gnCerrarInscripcion":"Cierra ahora la elección de noches y pasa la semana a asignación. Las tarjetas dejan de aparecer.",
 "#gnSuspenderPeriodo":"Suspende la semana por orden de Comandancia. Queda marcada en rojo.",
 "#gnConfirmarPeriodo":"Abre la elección: aparecen las tarjetas a voluntarios, maquinistas, OBAC y mando hasta la fecha de cierre.",
 "#gnAgregarBtn":"Agrega al voluntario seleccionado a la guardia.",
 "#gnGuardarBtn":"Guarda la guardia de esa noche.",
 "#gnPdfBtn":"PDF de esta guardia.",
 "#gnSemana":"Informe de la última semana.",
 "#gnMes":"Informe de este mes.",
 "#gnPdfSemanal":"PDF del informe de guardias del período elegido.",
 "#gnPdfEstad":"PDF con la estadística de guardias del período.",
 "#gnInfo":"Infografía de guardias para mostrar o compartir.",
 "#histLimpiar":"Borra los filtros del historial.",
 /* Guardia · revisión y roles */
 "#giConfirmar":"Confirma las noches que marcaste. Mínimo 2; puedes marcar todas las que quieras.",
 "#giJustificar":"Si no puedes cumplir, explica el motivo por correo a la Oficialidad.",
 "#hrGuardar":"Guarda la hora de inicio de las noches que cambiaste.",
 "#rvCrear":"Arma el borrador de la dotación con lo que la gente inscribió.",
 "#rvAprobar":"Aprueba la dotación: crea las guardias de la semana y cada voluntario ve sus noches.",
 "#rvReabrir":"Vuelve la dotación a borrador para corregirla.",
 "#avEnviar":"Avisa que no puedes esa noche. Se busca un reemplazo y la noche no te cuenta.",
 "#avCancelar":"Cierra sin enviar el aviso.",
 "#mnVer":"Mira tus noches y avisa si alguna no puedes.",
 /* Estadística */
 "#cargar":"Vuelve a calcular la estadística.",
 "#volver":"Vuelve a GERMANIA.",
 "#pnPdf":"Informe de estadística en PDF.",
 "#pnInfo":"Infografía de estadística.",
 "#pnCsv":"Descarga las tablas a Excel.",
 "#pnCargarHist":"Incorpora las actividades de enero a junio de 2026.",
 "#premiosCalcularBtn":"Revisa a toda la Compañía: quién se acerca a un premio de antigüedad y si cumple la asistencia mínima.",
 /* Oficiales · subpantallas */
 "sub:oficialidad":"Oficialidad del año.","sub:precedencia":"Orden de precedencia vigente (ODD).","sub:nomina":"Lista de voluntarios con sus datos. Aquí se compara una lista nueva sin borrar a nadie.",
 "sub:hoja":"Hoja de vida de cada voluntario: antecedentes, cursos y premios. Solo búsqueda; los ingresos se hacen en «Ingreso».",
 "sub:ingreso":"Único lugar para agregar un voluntario nuevo.","sub:cursos":"Cursos de cada voluntario.","sub:eppPersonal":"Entrega de equipo de protección personal.",
 "sub:alertas":"Todo lo que requiere atención: EPP vencido, mantenciones y premios.","sub:inventariob5":"Inventario de la unidad B-5.","sub:mantencionesb5":"Mantenciones de la unidad B-5.",
 "sub:correlativos":"Numeración de partes y hojas de servicio.","sub:tipos":"Tipos de citación disponibles.","sub:importar":"Cargar históricos, respaldo completo y datos de prueba.","sub:bajas":"Baja, reactivación o eliminación de integrantes (nunca por no venir en una lista).",
 /* Oficiales · acciones */
 "#cmpBtn":"Compara la lista nueva con la nómina. Solo informa: no agrega, no da de baja y no borra a nadie.",
 "#precAnalizarBtn":"Revisa la ODD nueva antes de usarla.",
 "#precGuardarBtn":"Guarda esta lista como la precedencia vigente.",
 "#agregarCargoBtn":"Agrega un cargo a la lista.",
 "#guardarOficialidadBtn":"Guarda la oficialidad del año.",
 "#eppGuardarBtn":"Guarda la entrega de EPP.",
 "#rescateBuscarBtn":"Busca datos recuperables en los respaldos.",
 "#registrarIngresoBtn":"Registra al voluntario nuevo y crea su hoja de vida.",
 "#hvPdfBtn":"PDF de la hoja de vida.",
 "#hvFotoBtn":"Carga o cambia la fotografía.",
 "#hvAgregarBtn":"Agrega un antecedente a la hoja de vida.",
 "#hvTransferenciaPdfBtn":"Genera una copia de antecedentes para entregar.",
 "#premioAsistenciaGuardarBtn":"Guarda el criterio de asistencia mínima para premios.",
 "#darBajaBtn":"Da de baja al integrante conservando su hoja de vida.",
 "#reactivarBtn":"Devuelve a un integrante de baja a la lista activa.",
 "#borrarMiembroBtn":"Elimina un registro creado por error. Exige validación de Capitán, Secretario y Ayudante.",
 "#alertasActualizarBtn":"Vuelve a calcular las alertas.",
 "#correlativoAjustarBtn":"Guarda el ajuste del número correlativo.",
 "#invCategoriaAgregarBtn":"Agrega una categoría al inventario.",
 "#invGuardarBtn":"Guarda el ítem del inventario.",
 "#mntTipoAgregarBtn":"Agrega un tipo de mantención.",
 "#mntGuardarBtn":"Guarda la mantención.",
 "#cursosPdfBtn":"PDF de cursos.",
 "#agregarTipoBtn":"Agrega un tipo de citación.",
 "#verPruebaBtn":"Muestra lo guardado en modo prueba. Solo consulta.",
 "#gpVerBtn":"Muestra las guardias de prueba.",
 "#gpRetirarBtn":"Retira las guardias de prueba dejando respaldo.",
 "#fotosOptimizarBtn":"Reduce las fotos pesadas para que la app abra más rápido; guarda respaldo antes.",
 "#impCargarBtn":"Incorpora las 67 actividades de enero a junio de 2026.",
 "#impBorrarBtn":"Borra solo lo que se importó. Pide confirmación.",
 "#impExportarBtn":"Descarga un respaldo completo.",
 "#bajaEntrarBtn":"Entra a la sección protegida con la clave de Oficialidad.",
 "#bajaCambiarClaveBtn":"Cambia la clave de Oficialidad.",
 "#bajaSalirBtn":"Vuelve a bloquear la sección.",
 "#oddInformarBtn":"El Ayudante informa una ODD.",
 "#activarCorreoCompaniaBtn":"Activa el correo de la Compañía para recibir justificaciones.",
};
/* Botones que se crean al vuelo: se reconocen por su texto */
var TX=[
 [/^Confirmar mis noches/i,"Confirma las noches que marcaste. Mínimo 2; puedes marcar todas las que quieras."],
 [/^Guardar selecci/i,"Guarda las noches que elegiste para este rol."],
 [/^Elegir mis noches/i,"Te lleva a elegir tus noches."],
 [/^No puedo esta noche/i,"Avisa que esa noche no puedes. Se busca reemplazo y la noche no te cuenta."],
 [/^Asignar reemplazo/i,"Asigna a quien cubrirá la noche. Se acredita a quien cubre."],
 [/^Sin reemplazo/i,"Deja la noche sin reemplazo: el aviso queda cerrado y la noche no cuenta."],
 [/^Reintentar/i,"Vuelve a intentar la carga."],
 [/^Guardar horario/i,"Guarda el horario de inicio de las noches."],
 [/^(Marcar todos|Limpiar)/i,"Atajo para marcar o limpiar todo de una vez."],
 [/^Pedir esta noche/i,"Pide sumarte a una noche después del cierre; lo decide el mando."]
];
var NO='[data-nav], .mobile-menu *, #gNav *, #gNavMas, .gn-day, #testModeBanner, #testModeBanner *, #testCleanBtn, .tabs .tab';
function desc(el){
  var d=el.id&&AY["#"+el.id]; if(d) return d;
  var k=el.dataset||{};
  if(k.sub&&AY["sub:"+k.sub]) return AY["sub:"+k.sub];
  if(k.gv&&AY["gv:"+k.gv]) return AY["gv:"+k.gv];
  if(k.go&&AY["go:"+k.go]) return AY["go:"+k.go];
  var t=(el.textContent||"").replace(/[?]\s*$/,"").trim(), i;
  for(i=0;i<TX.length;i++) if(TX[i][0].test(t)) return TX[i][1];
  return "";
}
function titulo(el){ var c=el.cloneNode(true); var q=c.querySelector(".ayuda-q"); if(q) q.remove(); return (c.textContent||el.getAttribute("aria-label")||"").replace(/\s+/g," ").trim().slice(0,60); }
function marcar(){
  document.querySelectorAll("button, summary, label.btn, .tile").forEach(function(el){
    if(el.querySelector(":scope > .ayuda-q")||el.matches(NO)) return;
    var d=desc(el); if(!d) return;
    el.classList.add("ayuda-host");
    var q=document.createElement("span"); q.className="ayuda-q"; q.setAttribute("role","button"); q.setAttribute("tabindex","0"); q.setAttribute("aria-label","¿Qué hace este botón?"); q.textContent="?"; q.dataset.d=d;
    el.appendChild(q);
  });
}
function hoja(el,d){
  var s=document.getElementById("ayudaSheet");
  if(!s){ s=document.createElement("div"); s.id="ayudaSheet"; s.setAttribute("role","dialog"); s.setAttribute("aria-live","polite"); document.body.appendChild(s);
    s.addEventListener("click",function(e){ if(e.target===s||e.target.closest(".ayuda-x")) s.classList.remove("on"); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") s.classList.remove("on"); }); }
  s.innerHTML='<div class="ayuda-box"><b>'+String(titulo(el)).replace(/[<>&]/g,"")+'</b><p></p><button type="button" class="ayuda-x">Entendido</button></div>';
  s.querySelector("p").textContent=d; s.classList.add("on");
}
function alTocar(e){
  var q=e.target.closest&&e.target.closest(".ayuda-q"); if(!q) return;
  e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  if(e.type==="click"||e.key==="Enter"||e.key===" ") hoja(q.parentElement,q.dataset.d);
}
document.addEventListener("click",alTocar,true);
document.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" ") alTocar(e); },true);
var t=null; function prog(){ clearTimeout(t); t=setTimeout(marcar,200); }
if(window.MutationObserver) new MutationObserver(prog).observe(document.body,{childList:true,subtree:true});
marcar();
window.gnAyuda=AY;
})();
