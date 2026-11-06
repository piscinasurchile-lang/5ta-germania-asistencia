import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 const html=await readFile(path.join(process.cwd(),'prototypes/germania-revision-simplificada.html'),'utf8');
 const integrada=new URL(request.url).searchParams.get('integrada')==='1';
 const presentado=html.replace('</head>','<link rel="stylesheet" href="/legacy/germania-guardia-asignacion.css?v=20261106textos1"></head>').replace('<body>',integrada?'<body class="integrada">':'<body>');
 const operativo=presentado.replace(/<section class="edit"><h3>Vista de prueba · Mi espacio<\/h3>[\s\S]*?<button id="reset"[^>]*>Restablecer datos de prueba<\/button>/,'');
 const integrado=operativo.replace(/<script>[\s\S]*?<\/script>/,'<script src="/legacy/germania-guardia-asignacion.js?v=20261106textos1" defer></script>');
 return new Response(integrado,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

