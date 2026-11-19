import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Figtree } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

// Fuentes de la maqueta. Next.js las descarga al compilar y las sirve desde
// nuestro propio dominio (más rápido y sin enviar datos a Google al visitar).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ReLata · Cada lata que aplastas cuenta",
    template: "%s · ReLata",
  },
  description:
    "Compactadora inteligente de latas para supermercados, malls y estaciones de servicio: aplasta tu lata, suma puntos y sube de nivel.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecf1ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1816" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${bricolage.variable} ${figtree.variable} ${dmMono.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <div className="wrap">
          <Header />
          <main id="contenido" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
