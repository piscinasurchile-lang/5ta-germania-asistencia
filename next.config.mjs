/* Cabeceras de seguridad para todas las rutas. */
const cabeceras = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

export default {
  async headers() {
    return [{ source: "/:path*", headers: cabeceras }];
  },
};
