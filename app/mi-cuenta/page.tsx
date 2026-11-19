import type { Metadata } from "next";
import { Suspense } from "react";
import { requerirUsuario } from "@/lib/auth/sesion";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { cerrarSesion } from "./acciones";
import { FormularioAlias } from "./FormularioAlias";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function MiCuenta() {
  return (
    <Suspense fallback={<p className="placeholder muted">Cargando tu cuenta…</p>}>
      <Cuenta />
    </Suspense>
  );
}

async function Cuenta() {
  const usuario = await requerirUsuario("/mi-cuenta");

  const supabase = await supabaseServidor();
  const { data: perfil } = await supabase.from("profiles").select("alias").eq("id", usuario.id).single();
  const alias = perfil?.alias ?? null;

  // Primera vez: pedir el alias antes de mostrar la cuenta.
  if (!alias) {
    return (
      <div className="auth">
        <div className="card auth-card">
          <p className="eyebrow">Primer ingreso</p>
          <h1>Elige tu alias</h1>
          <p className="muted">Es el nombre que verás en tu cuenta y en la pantalla de la máquina.</p>
          <FormularioAlias aliasActual={null} />
        </div>
      </div>
    );
  }

  return (
    <div className="placeholder">
      <p className="eyebrow">Mi cuenta</p>
      <h1>Hola, {alias}</h1>
      <p className="muted">
        Ingresaste como <b>{usuario.correo}</b>. Tu código QR, tus puntos, tu nivel y tu historial llegan en
        el paso 6.
      </p>
      <div className="card">
        <FormularioAlias aliasActual={alias} />
      </div>
      <form action={cerrarSesion}>
        <button className="btn ghost" type="submit">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
