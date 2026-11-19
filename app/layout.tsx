import type { Metadata } from "next";
import "./globals.css";

// Las fuentes y los colores de la marca se agregan en el paso 2.
export const metadata: Metadata = {
  title: "ReLata",
  description: "Compactadora inteligente de latas: cada lata que aplastas cuenta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
