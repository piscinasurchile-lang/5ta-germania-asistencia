export const MAX_PDF = 1536 * 1024;
export const HORAS_24 = 86400000;
export function numeroODD(value) {
 const m = String(value || '').trim().match(/^(\d{1,3})\/(20\d{2})$/);
 if (!m || Number(m[1]) === 0) throw Error('numero_invalido');
 return String(Number(m[1])).padStart(3,'0') + '/' + m[2];
}
export function referenciasODD(values, propia) {
 if (!Array.isArray(values) || values.length > 50) throw Error('referencias_invalidas');
 const result = [...new Set(values.map(numeroODD))];
 if (result.includes(numeroODD(propia))) throw Error('no_puede_anularse_a_si_misma');
 return result;
}
export function extraerDisposicion(texto) {
 const textoLimpio = String(texto || '').replace(/\r/g,'').replace(/[ \t]+/g,' ');
 const dispone = textoLimpio.match(/\bSE\s+DISPONE\s*:?([\s\S]*)/i);
 const cita = textoLimpio.match(/c[íi]tese\s+([\s\S]*)/i);
 const inicio = dispone ? dispone[1] : cita ? 'Cítese ' + cita[1] : '';
 if (!inicio) return '';
 const cuerpo = inicio.split(/T[óo]mese\s+raz[óo]n|Se exige PUNTUALIDAD|Excusas al correo|Anexo\s+\d/i)[0]
  .replace(/\s+/g,' ').trim();
 if (!cuerpo || cuerpo.length < 20) return '';
 if (cuerpo.length <= 480) return cuerpo;
 const limite = cuerpo.slice(0,480);
 const fin = Math.max(limite.lastIndexOf('. '), limite.lastIndexOf('; '));
 return fin > 100 ? limite.slice(0,fin+1) : limite.slice(0,limite.lastIndexOf(' ')) + '…';
}
export function detectarReferencias(texto, propia) {
 const refs = [];
 for (const m of String(texto || '').matchAll(/deja\s+sin\s+efecto[^.\n]{0,100}?(\d{1,3})\s*\/\s*(20\d{2})/gi)) {
  const n = numeroODD(m[1]+'/'+m[2]);
  if (n !== numeroODD(propia)) refs.push(n);
 }
 return [...new Set(refs)];
}
export function catalogoODD(documentos) {
 const mapa = new Map();
 for (const d of documentos) {
  if (!d) continue;
  let numero;
  try { numero = numeroODD(d.numero); } catch { continue; }
  if (!mapa.has(numero)) mapa.set(numero,{...d,numero});
 }
 const porAnulada = new Map();
 for (const d of mapa.values()) for (const ref of d.dejaSinEfecto || []) {
  let numero;
  try { numero = numeroODD(ref); } catch { continue; }
  if (numero === d.numero) continue;
  const anteriores = porAnulada.get(numero) || [];
  anteriores.push(d.numero); porAnulada.set(numero,anteriores);
 }
 return [...mapa.values()].map(d => ({...d,sinEfectoPor:porAnulada.get(d.numero)||[]}))
  .sort((a,b)=>Number(b.numero.split('/')[1])-Number(a.numero.split('/')[1]) || Number(b.numero.split('/')[0])-Number(a.numero.split('/')[0]));
}
export function avisoPersonal(d,leidoEn,ahora=Date.now()) {
 const publicado = Date.parse(d.publicadaEn || d.publicadoEn || '');
 const historico = d.historico === true;
 const pendiente = !historico && !leidoEn;
 return {leidoEn:leidoEn||null,pendiente,destacado:!historico && Number.isFinite(publicado) && ahora >= publicado && ahora-publicado < HORAS_24};
}
export function validarPublicacion(entrada, existentes) {
 const numero = numeroODD(entrada.numero);
 if (existentes.some(d=>numeroODD(d.numero)===numero)) throw Error('odd_ya_existe_original_inalterable');
 const titulo = String(entrada.titulo || '').trim();
 const resumen = String(entrada.resumen || '').trim();
 if (!titulo || titulo.length > 240) throw Error('titulo_invalido');
 if (resumen.length < 15 || resumen.length > 600) throw Error('resumen_requiere_revision');
 const dejaSinEfecto = referenciasODD(entrada.dejaSinEfecto || [],numero);
 const [n,y] = numero.split('/').map(Number);
 for (const ref of dejaSinEfecto) {
  const [rn,ry] = ref.split('/').map(Number);
  if (ry > y || (ry === y && rn >= n)) throw Error('solo_puede_dejar_sin_efecto_odd_anteriores');
 }
 return {numero,titulo,resumen,dejaSinEfecto};
}

export function extraerFechaDocumento(texto) {
 const meses={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12};
 const m=String(texto||'').match(/Villarrica,\s*[^\r\n]*?(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(20\d{2})/i);
 if(!m||!meses[m[2].toLowerCase()])return null;
 const y=Number(m[3]),mes=meses[m[2].toLowerCase()],dia=Number(m[1]);
 const d=new Date(Date.UTC(y,mes-1,dia));
 if(d.getUTCFullYear()!==y||d.getUTCMonth()!==mes-1||d.getUTCDate()!==dia)return null;
 return d.toISOString().slice(0,10);
}
export function datosCitacion(entrada={}) {
 const tipo=String(entrada.tipo||'disposicion');
 if(!['citacion','academia','curso','taller','ejercicio','disposicion','otro'].includes(tipo))throw Error('tipo_invalido');
 const fecha=String(entrada.fecha||'');const hora=String(entrada.hora||'');
 if(fecha&&(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||!Number.isFinite(Date.parse(fecha+'T12:00:00Z'))||new Date(fecha+'T12:00:00Z').toISOString().slice(0,10)!==fecha))throw Error('fecha_invalida');
 if(hora&&(!fecha||!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)))throw Error('hora_invalida');
 const campos={};for(const key of ['lugar','tema','vestimenta','excusas']){campos[key]=String(entrada[key]||'').trim();if(campos[key].length>320)throw Error('datos_citacion_invalidos');}
 return {tipo,cuando:fecha?{fecha,hora}:null,...campos,puntualidad:entrada.puntualidad===true};
}
