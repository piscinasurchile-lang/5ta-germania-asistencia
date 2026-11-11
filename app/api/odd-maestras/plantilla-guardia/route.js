import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "odd_guardia_original_063_2026";
const SHA256 = "aa7fceb5cdc71d546e9b093866bdc24fc4318e8b657638926c96a3017476608d";
const SOURCE = "Documento original ODD 063/2026, 14-20 octubre 2026, aportado por administración Germania";
const ORIGINALES=[{key:'odd_guardia_original_071_2026',sha:'7765fe3ac9fb672eaa28ac1a78d178675ce1d35ade923d5f880ace0e338c97b2',numero:'071',source:'ODD 071/2026, 11-17 noviembre 2026, aportada por administración Germania'}, {key:KEY,sha:SHA256,numero:'063',source:SOURCE}];
const noStore = { "Cache-Control": "private, no-store" };
const db = () => process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const json = (data, status = 200) => Response.json(data, { status, headers: noStore });
const sameOrigin = request => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
};

async function getAsset(sql,key = null) {
 for(const original of ORIGINALES.filter(o=>!key||o.key===key)){
  const rows = await sql`
    SELECT key, source, effective_year, octet_length(data)::int AS bytes,
           encode(data, 'base64') AS encoded
    FROM document_assets WHERE key = ${original.key} AND active = true LIMIT 1
  `;
  if(rows[0])return {...rows[0],original};
 }
 return null;
}

export async function GET(request) {
  const sql = db();
  if (!sql) return json({ error: "base_no_configurada" }, 503);
  try {
    const asset = await getAsset(sql);
    if (!asset) return json({
      available: false,
      name: "ODD 063/2026 · Guardia Nocturna",
      sha256: SHA256,
      requiresOriginal: true
    }, 404);
    const buffer = Buffer.from(asset.encoded, "base64");
    if (createHash("sha256").update(buffer).digest("hex") !== asset.original.sha)
      return json({ error: "plantilla_original_no_verificada" }, 409);
    if (new URL(request.url).searchParams.get("info") === "1")
      return json({ available: true, name: "ODD "+asset.original.numero+"/2026 · Guardia Nocturna",
        size: asset.bytes, sha256: asset.original.sha, source: asset.source });
    return new Response(buffer, {
      headers: { ...noStore, "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ODD-'+asset.original.numero+'-2026-original.pdf"',
        "X-Germania-Plantilla":asset.original.numero+'/2026',
        "X-Content-Type-Options": "nosniff" }
    });
  } catch (error) {
    console.error("plantilla guardia GET", error);
    return json({ error: "plantilla_no_disponible" }, 503);
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: "origen_no_permitido" }, 403);
  const sql = db();
  if (!sql) return json({ error: "base_no_configurada" }, 503);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 5_000_000) return json({ error: "archivo_excede_limite" }, 413);
  try {
    const body = await request.json();
    const original=ORIGINALES.find(o=>body?.confirmacion==='GUARDAR_ORIGINAL_ODD_'+o.numero+'_2026');
    if (!original ||
        typeof body?.base64 !== "string" || body.base64.length > 5_000_000)
      return json({ error: "solicitud_invalida" }, 400);
    const raw = Buffer.from(body.base64, "base64");
    const sha = createHash("sha256").update(raw).digest("hex");
    if (sha !== original.sha || !raw.subarray(0, 5).equals(Buffer.from("%PDF-")))
      return json({ error: "pdf_no_es_el_original_"+original.numero+"_2026", expectedSha256: original.sha }, 422);
    const existing = await getAsset(sql,original.key);
    if (existing) {
      const prior = createHash("sha256").update(Buffer.from(existing.encoded,"base64")).digest("hex");
      return prior === original.sha ? json({ ok: true, alreadyStored: true, sha256: original.sha }) :
        json({ error: "ya_existe_otro_documento_bloqueado" }, 409);
    }
    await sql`
      INSERT INTO document_assets (key, data, active, source, effective_year)
      VALUES (${original.key}, decode(${body.base64}, 'base64'), true, ${original.source}, 2026)
      ON CONFLICT (key) DO NOTHING
    `;
    const saved = await getAsset(sql,original.key);
    const savedSha = saved && createHash("sha256")
      .update(Buffer.from(saved.encoded, "base64")).digest("hex");
    if (savedSha !== original.sha) return json({ error: "no_se_pudo_verificar_guardado" }, 409);
    return json({ ok: true, sha256: original.sha, pages: 3, bytes: saved.bytes });
  } catch (error) {
    console.error("plantilla guardia POST", error);
    return json({ error: "error_al_guardar_plantilla" }, 503);
  }
}
