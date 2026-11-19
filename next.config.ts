import type { NextConfig } from "next";

/**
 * Encabezados de seguridad para todas las respuestas:
 *  · nosniff: el navegador no "adivina" el tipo de archivo.
 *  · Referrer-Policy: no envía la URL completa a otros sitios.
 *  · X-Frame-Options / frame-ancestors: nadie puede meter ReLata dentro de
 *    otro sitio (evita engaños tipo "clickjacking").
 *  · Permissions-Policy: solo la cámara, y solo para nuestro sitio (simulador).
 */
const seguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: seguridad }];
  },
};

export default nextConfig;
