"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerUsuario } from "@/lib/auth/sesion";
import { esquemaAlias, primerError } from "@/lib/auth/validacion";
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
