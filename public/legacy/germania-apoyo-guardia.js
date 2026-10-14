/* Apoyo del Cuerpo: no pertenece a la nómina ni a las estadísticas de la Quinta. */
(function(root){
'use strict';
var david=Object.freeze({id:'apoyo-cuerpo:david-briones',nombre:'David',apellidoPaterno:'Briones',cargo:'Cuartelero del Cuerpo',conductor:true,externo:true,activo:true});
function buscar(id){return String(id)===david.id?david:null;}
function asignar(noche){
 if(!noche||noche.maq)throw new Error('David solo puede cubrir una noche sin maquinista.');
 noche.maq=david.id;
 noche.apoyoExterno={id:david.id,nombre:'David Briones',organismo:'Cuerpo de Bomberos',responsabilidad:'Maquinista de apoyo'};
 return noche;
}
root.GermaniaApoyoGuardia={david:david,buscar:buscar,asignar:asignar};
})(typeof window!=='undefined'?window:globalThis);
