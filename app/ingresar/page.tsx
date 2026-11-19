import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuario } from "@/lib/auth/sesion";
import { rutaSegura } from "@/lib/auth/validacion";
import { FormularioIngreso } from "./FormularioIngreso";

export const metadata: Metadata = { title: "Ingresar" };

const ERRORES: Record<string, string> = {
  enlace: "El enlace no es válido o ya venció. Pide uno nuevo.",
};

/**
 * El "cascarón" (título y texto) se muestra al instante. Lo que depende de la
 * persona (sesión, parámetros de la URL) va dentro de <Suspense>.
 */
export default function Ingresar({ searchParams }: PageProps<"/ingresar">) {
  return (
    <div className="auth">
      <div className="card auth-card">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Ingresa con tu correo</h1>
        <p className="muted">
          Te enviaremos un enlace para entrar, sin contraseña. Si es tu primera vez, se crea tu cuenta.
        </p>
        <Suspense fallback={<p className="muted">Cargando…</p>}>
          <Formulario searchParams={searchParams} />
        </Suspense>
        <p className="auth-privacy">
          Solo guardamos tu correo y el alias que elijas. <Link href="/#proyecto">¿Qué es ReLata?</Link>
        </p>
      </div>
    </div>
  );
}

async function Formulario({ searchParams }: { searchParams: PageProps<"/ingresar">["searchParams"] }) {
  const params = await searchParams;
  const next = rutaSegura(typeof params.next === "string" ? params.next : null);
  const codigoError = typeof params.error === "string" ? params.error : null;

  // Si ya inició sesión, no tiene sentido mostrar el login.
  if (await obtenerUsuario()) redirect(next);

  return (
    <>
      {codigoError && ERRORES[codigoError] && (
        <p className="form-error" role="alert">
          {ERRORES[codigoError]}
        </p>
      )}
      <FormularioIngreso next={next} />
    </>
  );
}
