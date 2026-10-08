import AppFeedback from "./AppFeedback";

export const metadata = {
  title: "GERMANIA · Quinta Compañía",
  description: "Sistema de gestión de la Quinta Compañía Germania · Cuerpo de Bomberos de Villarrica",
  applicationName: "GERMANIA",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/legacy/favicon-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/legacy/favicon-64.png?v=3", sizes: "64x64", type: "image/png" },
      { url: "/legacy/germania-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/legacy/germania-512.png?v=3", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/legacy/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: { capable: true, title: "GERMANIA", statusBarStyle: "black-translucent", startupImage: ["/legacy/splash-1170x2532.png?v=3"] },
  formatDetection: { telephone: false }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07090b"
};

export default function RootLayout({ children }) {
  return <html lang="es"><body style={{ margin: 0, background: "#07090b" }}><AppFeedback />{children}</body></html>;
}
