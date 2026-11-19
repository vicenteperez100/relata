import "server-only";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

export interface Usuario {
  id: string;
  correo: string;
}

/**
 * La persona que inició sesión, o null.
 * getClaims() verifica la firma del token; no basta con "leer la cookie".
 */
export async function obtenerUsuario(): Promise<Usuario | null> {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, correo: String(data.claims.email ?? "") };
}

/** Para páginas privadas: si no hay sesión, manda a /ingresar y luego vuelve aquí. */
export async function requerirUsuario(volverA: string): Promise<Usuario> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect(`/ingresar?next=${encodeURIComponent(volverA)}`);
  return usuario;
}
