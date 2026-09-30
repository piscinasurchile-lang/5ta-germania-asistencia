export const runtime = "nodejs";

export async function POST() {
  return Response.json(
    { error: "odd_pdf_temporarily_unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
