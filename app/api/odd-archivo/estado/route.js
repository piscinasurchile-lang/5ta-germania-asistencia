import {esOficial,headersPrivados} from '../../../../lib/odd-seguridad.mjs';
export const runtime='nodejs';
export async function GET(request){
 if(!esOficial(request))return Response.json({error:'acceso_oficial_requerido'},{status:403});
 return Response.json({subidaManual:true,driveAutomatico:false,identidad:'seleccion_de_nombre_existente_no_autenticacion_personal'},{headers:headersPrivados});
}
