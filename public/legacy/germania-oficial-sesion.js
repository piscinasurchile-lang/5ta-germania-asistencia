/* Si el servidor exige la sesión de oficialidad (GERMANIA_EXIGIR_SESION_OFICIAL=1) para ratificar, acreditar, cerrar o resolver,
 * pide la clave de la oficialidad una vez, abre la sesión y repite la acción. Con la exigencia apagada no hace nada. */
(function(){
  var orig=window.fetch;if(!orig||window.__oficialSesion)return;window.__oficialSesion=true;
  var pidiendo=null;
  function abrir(){
    if(pidiendo)return pidiendo;
    pidiendo=(async function(){
      var pin=window.prompt("Esta acción requiere la clave de la oficialidad. Ingrésala para continuar:");
      if(!pin)return false;
      try{var r=await orig("/api/auth/officiality",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin:String(pin).trim()})});return r.ok;}catch(e){return false;}
    })().finally(function(){pidiendo=null;});
    return pidiendo;
  }
  window.fetch=async function(input,init){
    var res=await orig.apply(this,arguments);
    try{
      var url=typeof input==="string"?input:(input&&input.url)||"";
      var metodo=String((init&&init.method)||(input&&input.method)||"GET").toUpperCase();
      if(res.status===403&&metodo==="POST"&&url.indexOf("/api/guardia/")===0){
        var d=await res.clone().json().catch(function(){return null;});
        if(d&&d.error==="oficialidad_requerida"){
          if(await abrir())return orig.apply(this,arguments);
        }
      }
    }catch(e){}
    return res;
  };
})();
