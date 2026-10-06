import { NextResponse } from "next/server";
import { COOKIE_ACCESO, DURACION_ACCESO, filtroActivo, codigoConfigurado, igual, tokenEsperado, cookieValida } from "../../../lib/acceso.js";
import { estado, registrarFallo, limpiar } from "../../../lib/ratelimit.js";

export const runtime = "nodejs";
const sinCache = { "Cache-Control": "no-store" };

/* ¿Este dispositivo ya tiene acceso? */
export async function GET(request) {
  if (!filtroActivo()) return NextResponse.json({ ok: true, filtro: false }, { headers: sinCache });
  return NextResponse.json({ ok: cookieValida(request.cookies.get(COOKIE_ACCESO)?.value), filtro: true }, { headers: sinCache });
}

/* Entrar con la clave de la Compañía. */
export async function POST(request) {
  if (!filtroActivo()) return NextResponse.json({ ok: true, filtro: false }, { headers: sinCache });
  const { codigo } = await request.json().catch(() => ({}));

  const lim = await estado("acceso", request);
  if (lim.bloqueado) {
    return NextResponse.json({ ok: false, error: "demasiados_intentos", esperaSeg: lim.esperaSeg },
      { status: 429, headers: { ...sinCache, "Retry-After": String(lim.esperaSeg) } });
  }
  if (!igual(String(codigo || "").trim(), codigoConfigurado())) {
    await registrarFallo("acceso", request);
    return NextResponse.json({ ok: false, error: "clave_incorrecta" }, { status: 401, headers: sinCache });
  }
  await limpiar("acceso", request);
  const res = NextResponse.json({ ok: true }, { headers: sinCache });
  res.cookies.set(COOKIE_ACCESO, tokenEsperado(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DURACION_ACCESO,
  });
  return res;
}

/* Cerrar el acceso en este dispositivo. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: sinCache });
  res.cookies.set(COOKIE_ACCESO, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
