import { NextResponse } from "next/server";
import { cookieOficialidadValida } from "../../../lib/cookieOficialidad.js";
import { extraerJson, limpiarResultado } from "../../../lib/lecturaCargos.js";

export const runtime = "nodejs";
export const maxDuration = 60;

/* Lee una foto o PDF de una ODD de cargos y devuelve { anio, fecha, cargos: [{ cargo, nombre }] }.
   - Solo con la clave de Oficialidad (cookie), para que nadie pueda usar la clave de IA.
   - Solo se envía la imagen o el PDF: la nómina NO sale de GERMANIA; los nombres se comparan después, en el equipo.
   - Si no hay ANTHROPIC_API_KEY responde 501 y la app ofrece las otras vías (texto, planilla o a mano). */
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BASE64 = 7_000_000;
const sinCache = { "Cache-Control": "no-store" };

const INSTRUCCION = `Esta imagen o PDF es una Orden del Día (o documento similar) de una compañía de bomberos de Chile que informa quiénes ocupan los cargos de la oficialidad.
Extrae SOLO los cargos de oficialidad y la persona que los ocupa. Cargos posibles: Director, Secretario, Tesorero, Tesorero General, Capitán, Teniente 1, Teniente 2, Teniente 3, Ayudante, Jefe de Máquinas, Conductor (si hay varios conductores numéralos: Conductor, Conductor 2, Conductor 3).
No incluyas a los voluntarios sin cargo. Si el documento tiene una tabla con columnas N°, Cargo y Nombre, usa solo las filas que tengan un cargo de oficialidad.
Escribe los nombres completos tal como figuran, con tildes. Si no estás seguro de una palabra, escribe lo que ves.
Si el documento indica el año al que corresponden los cargos o la fecha de la orden, inclúyelos.
Responde ÚNICAMENTE con JSON válido, sin texto adicional ni comillas invertidas, con esta forma:
{"anio": 2027 o null, "fecha": "AAAA-MM-DD" o null, "cargos": [{"cargo": "Capitán", "nombre": "Nombre Apellido Apellido"}]}`;

function mismoOrigen(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}

export async function POST(request) {
  if (!mismoOrigen(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  if (!cookieOficialidadValida(request.cookies.get("quinta_oficialidad")?.value)) {
    return NextResponse.json({ error: "oficialidad_requerida" }, { status: 401, headers: sinCache });
  }
  const llave = process.env.ANTHROPIC_API_KEY;
  if (!llave) return NextResponse.json({ error: "lectura_no_configurada" }, { status: 501, headers: sinCache });

  let cuerpo;
  try { cuerpo = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const tipo = String(cuerpo?.media_type || ""), datos = String(cuerpo?.data || "");
  if (!TIPOS.has(tipo) || !/^[A-Za-z0-9+/=]+$/.test(datos) || datos.length < 100) {
    return NextResponse.json({ error: "archivo_invalido" }, { status: 400 });
  }
  if (datos.length > MAX_BASE64) return NextResponse.json({ error: "archivo_muy_grande" }, { status: 413 });

  const bloque = tipo === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: tipo, data: datos } }
    : { type: "image", source: { type: "base64", media_type: tipo, data: datos } };
  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": llave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: [bloque, { type: "text", text: INSTRUCCION }] }],
      }),
      signal: AbortSignal.timeout(55000),
    });
  } catch (e) {
    console.error("oficialidad-lectura: sin respuesta del servicio de lectura", e?.name);
    return NextResponse.json({ error: "lectura_sin_respuesta" }, { status: 504, headers: sinCache });
  }
  if (!resp.ok) {
    console.error("oficialidad-lectura: el servicio respondió", resp.status);
    return NextResponse.json({ error: "lectura_fallida", estado: resp.status }, { status: 502, headers: sinCache });
  }
  const j = await resp.json().catch(() => null);
  const texto = (j?.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const resultado = limpiarResultado(extraerJson(texto));
  if (!resultado || !resultado.cargos.length) {
    return NextResponse.json({ error: "no_se_encontraron_cargos" }, { status: 422, headers: sinCache });
  }
  return NextResponse.json(resultado, { headers: sinCache });
}
