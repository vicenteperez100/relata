import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { rutaSegura } from "@/lib/auth/validacion";
import { supabaseServidor } from "@/lib/supabase/servidor";

const TIPOS_VALIDOS: EmailOtpType[] = ["email", "magiclink", "signup"];

/**
 * Aquí llega la persona al hacer clic en el enlace del correo.
 * Acepta los dos formatos de Supabase:
 *  · token_hash + type: funciona aunque abras el correo en otro dispositivo
 *    (requiere la plantilla de correo del README).
 *  · code: formato por defecto; solo funciona en el mismo navegador donde pediste el enlace.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const destino = rutaSegura(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await supabaseServidor();
  let ok = false;

  if (tokenHash && tipo && TIPOS_VALIDOS.includes(tipo)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    ok = !error;
    if (error) console.error("[confirmar] verifyOtp:", error.code, error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.error("[confirmar] exchangeCode:", error.code, error.message);
  }

  if (!ok) {
    return NextResponse.redirect(new URL(`/ingresar?error=enlace&next=${encodeURIComponent(destino)}`, origin));
  }
  return NextResponse.redirect(new URL(destino, origin));
}
