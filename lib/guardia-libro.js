// Shared date/role rules for guardia libro closure.
export const fechaValida = f => /^\d{4}-\d{2}-\d{2}$/.test(f||"") && new Date(f+"T12:00:00Z").toISOString().slice(0,10)===f;
export function diaSiguiente(f){ const d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10); }
export function inicioSemana(f){ const d=new Date(f+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+4)%7);return d.toISOString().slice(0,10); }
export function horaChile(){return new Date().toLocaleString("sv-SE",{timeZone:"America/Santiago",hour12:false}).replace(" ","T").slice(0,16);}
export function fotoTipo(b){if(b[0]===255&&b[1]===216&&b[2]===255)return "image/jpeg";if(b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP")return "image/webp";return null;}
export function persona(roster,id){return (Array.isArray(roster)?roster:[]).find(p=>String(p.id)===String(id)&&p.activo!==false)||null;}
export function esTercero(p){return !!p&&/teniente\s*(tercero|3)/i.test(p.cargo||"");}
export function esCapitan(p){return !!p&&/capit[aá]n/i.test(p.cargo||"");}
