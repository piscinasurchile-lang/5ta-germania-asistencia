import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {neon} from '@neondatabase/serverless';
import {catalogoODD,avisoPersonal,numeroODD} from './odd-dominio.mjs';
import {verificarEntornoODD} from './odd-seguridad.mjs';
export function conectarODD() {
 verificarEntornoODD();
 if (!process.env.DATABASE_URL) throw Error('database_not_configured');
 return neon(process.env.DATABASE_URL);
}
let preparada;
export async function prepararArchivoODD(sql) {
 await sql`CREATE TABLE IF NOT EXISTS germania_odd_archivo (
 numero text PRIMARY KEY, documento jsonb NOT NULL, creado_en timestamptz NOT NULL DEFAULT now())`;
 await sql`CREATE TABLE IF NOT EXISTS germania_odd_pdf (
 numero text PRIMARY KEY REFERENCES germania_odd_archivo(numero), data_url text NOT NULL, nombre text NOT NULL)`;
 await sql`CREATE TABLE IF NOT EXISTS germania_odd_lecturas (
 numero text NOT NULL, persona_id text NOT NULL, leido_en timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(numero,persona_id))`;
 await sql`CREATE TABLE IF NOT EXISTS germania_odd_sync (
 clave text PRIMARY KEY, valor jsonb NOT NULL, actualizado_en timestamptz NOT NULL DEFAULT now())`;
}
export async function esquemaODD(sql) {
 if (!preparada) preparada=prepararArchivoODD(sql).catch(e=>{preparada=null;throw e;});
 return preparada;
}
export async function historicosODD() {
 const d=JSON.parse(await readFile(join(process.cwd(),'public/legacy/odd-historicas-2026.json'),'utf8'));
 return d.documentos.map(x=>({...x,titulo:x.asunto,publicadaEn:x.publicadoEn,id:'drive-'+x.driveId,fuente:'drive-historico'}));
}
export async function documentosODD(sql,persona=null) {
 const [hist,registros,legacy,metadatosLegacy]=await Promise.all([
  historicosODD(),sql`SELECT documento FROM germania_odd_archivo`,
  sql`SELECT value FROM app_state WHERE key='odd-avisos:v1' LIMIT 1`,
  readFile(join(process.cwd(),'public/legacy/odd-historicas-2026.json'),'utf8').then(s=>JSON.parse(s).metadatosLegacy||{})
 ]);
 const anteriores=(Array.isArray(legacy[0]?.value)?legacy[0].value:[])
  .filter(x=>x && Array.isArray(x.destinatarios) && x.destinatarios.includes('voluntarios'))
  .map(x=>({...x,resumen:x.resumen||metadatosLegacy[x.numero]?.resumen||'',fechaDocumento:x.fechaDocumento||metadatosLegacy[x.numero]?.fechaDocumento,historico:x.historico!==false && !x.archivoInmutable}));
 const lecturas=persona?await sql`SELECT numero,leido_en FROM germania_odd_lecturas WHERE persona_id=${persona}`:[];
 const porNumero=new Map(lecturas.map(x=>[x.numero,x.leido_en]));
 const campos=['cuando','lugar','tema','vestimenta','excusas','puntualidad','numero','id','titulo','asunto','resumen','palabrasClave','fechaDocumento','publicadaEn','publicadoEn','historico','tipo','fuente','driveId','url','pdfDriveUrl','pdf','version','anulada','dejaSinEfecto'];
 const metadatos=[...registros.map(x=>x.documento),...anteriores,...hist].map(d=>Object.fromEntries(campos.filter(k=>d[k]!==undefined).map(k=>[k,d[k]])));
 return catalogoODD(metadatos)
  .map(x=>({...x,...avisoPersonal(x,porNumero.get(x.numero))}));
}
export async function publicarDocumento(sql,documento) {
 const rows=await sql`INSERT INTO germania_odd_archivo(numero,documento)
  VALUES (${documento.numero},${JSON.stringify(documento)}::jsonb)
  ON CONFLICT(numero) DO NOTHING RETURNING numero`;
 if (!rows.length) throw Error('odd_ya_existe_original_inalterable');
 return documento;
}
export async function publicarConPDF(sql,documento,pdf) {
 const rows=await sql`WITH nueva AS (
 INSERT INTO germania_odd_archivo(numero,documento)
 VALUES (${documento.numero},${JSON.stringify(documento)}::jsonb)
 ON CONFLICT(numero) DO NOTHING RETURNING numero)
 INSERT INTO germania_odd_pdf(numero,data_url,nombre)
 SELECT numero,${pdf.dataUrl},${pdf.nombre} FROM nueva RETURNING numero`;
 if (!rows.length) throw Error('odd_ya_existe_original_inalterable');
 return documento;
}
export async function leerODD(sql,numero,persona) {
 if (!persona || !/^[A-Za-z0-9_-]{1,80}$/.test(persona)) throw Error('persona_invalida');
 await sql`INSERT INTO germania_odd_lecturas(numero,persona_id) VALUES (${numeroODD(numero)},${persona}) ON CONFLICT DO NOTHING`;
}
