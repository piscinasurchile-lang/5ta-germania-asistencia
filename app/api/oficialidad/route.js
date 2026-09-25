import { listarOficiales2026, buscarOficial2026 } from "../../../lib/oficialidad-2026";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const codigo = new URL(request.url).searchParams.get("codigo");

  if (codigo) {
    const oficial = buscarOficial2026(codigo);
    return Response.json({ anio: 2026, oficial, autorizado: Boolean(oficial) }, { headers: { "Cache-Control": "no-store" } });
  }

  const oficiales = listarOficiales2026();
  return Response.json({ anio: 2026, oficiales, total: oficiales.length }, { headers: { "Cache-Control": "no-store" } });
}
