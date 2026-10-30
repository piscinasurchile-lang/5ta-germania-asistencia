/* Configuración de interfaz vigente. Centraliza valores existentes; no concede permisos del servidor.
   R1–R6 y cualquier cambio de personas autorizadas corresponden al responsable de seguridad. */
(function(root){
 'use strict';
 const config=Object.freeze({administradores:Object.freeze(['517']),vistaPrueba:Object.freeze(['517'])});
 Object.defineProperty(root,'GermaniaConfig',{value:config,writable:false,configurable:false});
})(typeof window==='undefined'?globalThis:window);
