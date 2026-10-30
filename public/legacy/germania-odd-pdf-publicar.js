(function(){
 "use strict";
 const boton=document.getElementById("oddPdfPublicarBtn");
 if(boton)boton.addEventListener("click",function(){
  if(window.GermaniaODD)return window.GermaniaODD.abrirPublicar();
  alert("No se pudo cargar el Archivo de ODD. Recarga la aplicación.");
 });
})();
