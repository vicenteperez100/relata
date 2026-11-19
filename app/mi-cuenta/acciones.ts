"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuario } from "@/lib/auth/sesion";
import { PALABRA_BORRAR, confirmacionBorradoValida } from "@/lib/auth/borrado";
import { esquemaAlias, primerError } from "@/lib/auth/validacion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type EstadoAlias = { error?: string; ok?: boolean };

export async function guardarAlias(_previo: EstadoAlias, datos: FormData): Promise<EstadoAlias> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/ingresar?next=/mi-cuenta");

  const validacion = esquemaAlias.safeParse(String(datos.get("alias") ?? ""));
  if (!validacion.success) return { error: primerError(validacion.error) };

  // El RLS de la base garantiza que solo pueda cambiar SU propio alias.
  const supabase = await supabaseServidor();
  const { error } = await supabase.from("profiles").update({ alias: validacion.data }).eq("id", usuario.id);
  if (error) {
    console.error("[alias] update:", error.code, error.message);
    return { error: "No pudimos guardar tu alias. Intenta de nuevo." };
  }

  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function cerrarSesion() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Privacidad
// ---------------------------------------------------------------------------
export type EstadoPrivacidad = { error?: string; ok?: boolean };

/** Crea un QR nuevo. El anterior deja de funcionar en todas las máquinas. */
export async function regenerarQr(): Promise<EstadoPrivacidad> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/ingresar?next=/mi-cuenta");

  // Función de la base que solo cambia el token de quien la llama (auth.uid()).
  const supabase = await supabaseServidor();
  const { error } = await supabase.rpc("regenerar_qr_token");
  if (error) {
    console.error("[privacidad] regenerar QR:", error.code, error.message);
    return { error: "No pudimos generar un QR nuevo. Intenta de nuevo." };
  }
  revalidatePath("/mi-cuenta");
  return { ok: true };
}

/**
 * Borra la cuenta y TODOS sus datos: el usuario de Supabase Auth (correo),
 * y en cascada su perfil (alias, QR) y su historial de latas.
 */
export async function borrarCuenta(_previo: EstadoPrivacidad, datos: FormData): Promise<EstadoPrivacidad> {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/ingresar?next=/mi-cuenta");

  if (!confirmacionBorradoValida(String(datos.get("confirmacion") ?? ""))) {
    return { error: `Escribe ${PALABRA_BORRAR} para confirmar.` };
  }

  // Borrar un usuario requiere la clave secreta (cliente admin, solo servidor).
  const { error } = await supabaseAdmin().auth.admin.deleteUser(usuario.id);
  if (error) {
    console.error("[privacidad] borrar cuenta:", error.status, error.message);
    return { error: "No pudimos borrar tu cuenta. Intenta de nuevo en un momento." };
  }

  // La sesión ya no es válida: solo limpiamos las cookies de este navegador.
  const supabase = await supabaseServidor();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/cuenta-borrada");
}
