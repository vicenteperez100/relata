import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envPublico } from "@/lib/env/publico";
import type { Database } from "./tipos";

/**
 * Cliente para el SERVIDOR que actúa como la persona que inició sesión
 * (lee su sesión desde las cookies). Sigue sujeto al RLS.
 * Hay que crear uno nuevo en cada petición; no se reutiliza.
 */
export async function supabaseServidor() {
  const env = envPublico();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Desde un Server Component no se pueden escribir cookies. No pasa nada:
          // el proxy (paso 5) se encarga de renovar la sesión.
        }
      },
    },
  });
}
