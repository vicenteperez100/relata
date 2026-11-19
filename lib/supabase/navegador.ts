import { createBrowserClient } from "@supabase/ssr";
import { envPublico } from "@/lib/env/publico";
import type { Database } from "./tipos";

/**
 * Cliente para componentes del NAVEGADOR ("use client").
 * Usa la clave pública: el RLS de la base decide qué puede ver cada persona.
 */
export function supabaseNavegador() {
  const env = envPublico();
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
