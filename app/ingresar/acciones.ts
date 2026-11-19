"use server";

import { envPublico } from "@/lib/env/publico";
import { esquemaCorreo, primerError, rutaSegura } from "@/lib/auth/validacion";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type EstadoIngreso =
  | { estado: "inicial" }
  | { estado: "enviado"; correo: string }
  | { estado: "error"; mensaje: string; correo?: string };

/** Envía el enlace mágico al correo. Si la persona es nueva, Supabase crea su cuenta. */
export async function enviarEnlace(_previo: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const correoCrudo = String(datos.get("correo") ?? "");
  const validacion = esquemaCorreo.safeParse(correoCrudo);
  if (!validacion.success) {
    return { estado: "error", mensaje: primerError(validacion.error), correo: correoCrudo };
  }
  const correo = validacion.data;
  const destino = rutaSegura(String(datos.get("next") ?? ""));

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email: correo,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${envPublico().NEXT_PUBLIC_SITE_URL}/auth/confirmar?next=${encodeURIComponent(destino)}`,
    },
  });

  if (error) {
    console.error("[ingresar] signInWithOtp:", error.status, error.code, error.message);
    const mensaje =
      error.status === 429
        ? "Se enviaron demasiados correos seguidos. Espera un par de minutos y vuelve a intentarlo."
        : "No pudimos enviar el correo. Intenta de nuevo en un momento.";
    return { estado: "error", mensaje, correo };
  }

  return { estado: "enviado", correo };
}
