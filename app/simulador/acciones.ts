"use server";

import { revalidatePath } from "next/cache";
import { obtenerOperador } from "@/lib/auth/sesion-operador";
import { registrarLata, type ResultadoRegistro } from "@/lib/maquina/registrar-lata";
import { leerContenidoQr } from "@/lib/qr";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Acciones del simulador. Se ejecutan en el SERVIDOR: la clave secreta de
 * Supabase nunca llega al navegador del simulador.
 *
 * Importante: una acción de servidor se puede llamar directamente aunque la
 * página esté oculta, así que CADA acción verifica que sea un operador.
 */

/** Identificador de máquina para todo lo registrado desde el simulador. */
const MAQUINA_SIMULADOR = "SIM-01";

const SIN_PERMISO = "Solo los operadores pueden usar el simulador. Vuelve a ingresar.";

export type ResultadoIdentificar = { ok: true; alias: string } | { ok: false; mensaje: string };

/** Paso 1 de la máquina: leer el QR y saber a quién corresponde. */
export async function identificarPersona(leido: string): Promise<ResultadoIdentificar> {
  if (!(await obtenerOperador())) return { ok: false, mensaje: SIN_PERMISO };

  const token = leerContenidoQr(String(leido ?? ""));
  if (!token) return { ok: false, mensaje: "Ese código no es un QR de ReLata." };

  const { data, error } = await supabaseAdmin().from("profiles").select("alias").eq("qr_token", token).limit(1);
  if (error) {
    console.error("[simulador] identificar:", error.code, error.message);
    return { ok: false, mensaje: "No pudimos consultar la base de datos. Intenta de nuevo." };
  }
  if (!data?.length) {
    return { ok: false, mensaje: "QR no reconocido. Puede que la persona lo haya regenerado: pídele que recargue Mi cuenta." };
  }
  return { ok: true, alias: data[0]!.alias ?? "Sin alias" };
}

/** Paso 2: registrar una lata (el mismo camino que usa la API de la máquina). */
export async function registrarDesdeSimulador(leido: string, tipo: "auspiciadora" | "otra"): Promise<ResultadoRegistro> {
  if (!(await obtenerOperador())) return { ok: false, codigo: "error_interno", mensaje: SIN_PERMISO };

  const admin = supabaseAdmin();
  const resultado = await registrarLata(async (args) => admin.rpc("registrar_lata", args), {
    token: String(leido ?? ""),
    tipo,
    maquinaId: MAQUINA_SIMULADOR,
  });
  if (resultado.ok) revalidatePath("/mi-cuenta");
  return resultado;
}
