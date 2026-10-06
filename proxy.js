import { NextResponse } from "next/server";
import { COOKIE_ACCESO, filtroActivo, cookieValida, rutaPublica } from "./lib/acceso.js";

/* Filtro de acceso (Next.js 16: proxy.js). Corre antes de cada solicitud.
   Sin ACCESS_CODE definido no hace nada. Con ACCESS_CODE: todo lo que no sea público exige la cookie de acceso. */
export function proxy(request) {
  if (!filtroActivo()) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  if (rutaPublica(pathname)) return NextResponse.next();
  if (cookieValida(request.cookies.get(COOKIE_ACCESO)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store", "X-Acceso": "requerido" } });
  }
  const navega = request.headers.get("sec-fetch-mode") === "navigate" || (request.headers.get("accept") || "").includes("text/html");
  if (navega) {
    const url = request.nextUrl.clone();
    url.pathname = "/acceso";
    url.search = "?volver=" + encodeURIComponent(pathname + search);
    return NextResponse.redirect(url);
  }
  return new NextResponse("Acceso restringido", { status: 401, headers: { "Cache-Control": "no-store", "X-Acceso": "requerido" } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
