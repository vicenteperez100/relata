import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (antes "middleware"): corre antes de cada página.
 * Su único trabajo es RENOVAR la sesión de Supabase cuando está por vencer
 * y guardar las cookies nuevas. No decide quién entra a qué: eso lo hace
 * cada página en el servidor (lib/auth/sesion.ts).
 */
export async function proxy(request: NextRequest) {
  // Si el enlace del correo dejó a la persona en otra página (por ejemplo la
  // portada, cuando Supabase usa la "Site URL"), la llevamos a /auth/confirmar
  // con los mismos datos para completar el ingreso.
  const reenvio = reenviarConfirmacion(request);
  if (reenvio) return reenvio;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Sin Supabase configurado (aún no hay .env.local), el sitio sigue funcionando.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Evita que un CDN guarde en caché la sesión de una persona y se la muestre a otra.
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Verifica el token y, si hace falta, lo renueva (y llama a setAll).
  await supabase.auth.getClaims();

  return response;
}

/** Parámetros que Supabase agrega al enlace del correo. */
const PARAMETROS_INGRESO = ["code", "token_hash"] as const;

export function reenviarConfirmacion(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith("/auth/confirmar")) return null;
  if (!PARAMETROS_INGRESO.some((p) => searchParams.has(p))) return null;

  const destino = request.nextUrl.clone();
  destino.pathname = "/auth/confirmar";
  if (!destino.searchParams.has("next")) destino.searchParams.set("next", "/mi-cuenta");
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: [
    // Todo menos la API de la máquina (usa su propia clave), archivos estáticos e íconos.
    "/((?!api/|_next/static|_next/image|icon.svg|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2?)$).*)",
  ],
};
