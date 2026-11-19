import "server-only";
import { createClient } from "@supabase/supabase-js";
import { envPublico } from "@/lib/env/publico";
import { envServidor } from "@/lib/env/servidor";
import type { Database } from "./tipos";

/**
 * Cliente ADMIN con la clave secreta: se salta el RLS.
 * Solo para el servidor y solo para tareas que lo necesitan de verdad:
 * registrar latas (API de la máquina) y borrar cuentas.
 * "server-only" impide que este archivo termine en el navegador.
 */
export function supabaseAdmin() {
  return createClient<Database>(envPublico().NEXT_PUBLIC_SUPABASE_URL, envServidor().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
