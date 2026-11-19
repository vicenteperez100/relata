import type { Metadata } from "next";
import { Suspense } from "react";
import { Historial } from "@/components/cuenta/Historial";
import { Progreso } from "@/components/cuenta/Progreso";
import { TarjetaQr } from "@/components/cuenta/TarjetaQr";
import s from "@/components/cuenta/cuenta.module.css";
import { requerirUsuario } from "@/lib/auth/sesion";
import { CONTEO_EJEMPLO, HISTORIAL_EJEMPLO, desdeFilas } from "@/lib/cuenta/vista";
import { resumenCuenta } from "@/lib/reglas/puntos";
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

  // Las tres consultas van en paralelo. El RLS asegura que solo vuelvan datos propios.
  const [perfilRes, conteoRes, historialRes] = await Promise.all([
    supabase.from("profiles").select("alias, qr_token, created_at").eq("id", usuario.id).single(),
    supabase.from("conteo_latas").select("otras, auspiciadoras").eq("user_id", usuario.id),
    supabase
      .from("can_events")
      .select("tipo, maquina_id, created_at")
      .eq("user_id", usuario.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const error = perfilRes.error ?? conteoRes.error ?? historialRes.error;
  if (error || !perfilRes.data) {
    console.error("[mi-cuenta]", error?.code, error?.message);
    throw new Error("No se pudo cargar la cuenta");
  }
  const perfil = perfilRes.data;

  // Primera vez: pedir el alias antes de mostrar la cuenta.
  if (!perfil.alias) {
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

  const conteoReal = conteoRes.data?.[0] ?? { otras: 0, auspiciadoras: 0 };
  // Sin latas todavía: mostramos cómo se verá la cuenta, con DATOS DE EJEMPLO.
  const ejemplo = conteoReal.otras + conteoReal.auspiciadoras === 0;
  const resumen = resumenCuenta(ejemplo ? CONTEO_EJEMPLO : conteoReal);
  const eventos = ejemplo ? HISTORIAL_EJEMPLO : desdeFilas(historialRes.data ?? []);

  return (
    <>
      <div className={s.head}>
        <p className="eyebrow">
          Mi cuenta {ejemplo && <span className="demo-tag">DATOS DE EJEMPLO</span>}
        </p>
        <h1>Hola, {perfil.alias}</h1>
        {ejemplo && (
          <div className={s.aviso} role="note">
            <b>Aún no has reciclado latas.</b>
            <span>
              Los puntos, el nivel y el historial de abajo son datos de ejemplo para que veas cómo se verá tu
              cuenta. Tu código QR sí es real: muéstralo en una máquina ReLata para empezar.
            </span>
          </div>
        )}
      </div>

      <div className={s.grid}>
        <TarjetaQr alias={perfil.alias} token={perfil.qr_token} desde={perfil.created_at} />
        <div className={`${s.col} ${ejemplo ? s.ejemplo : ""}`} aria-label={ejemplo ? "Datos de ejemplo" : undefined}>
          <Progreso r={resumen} />
          <Historial eventos={eventos} ejemplo={ejemplo} />
        </div>
      </div>

      <section className={s.ajustes} aria-labelledby="titulo-ajustes">
        <h2 id="titulo-ajustes">Tu cuenta</h2>
        <p className="muted">
          Ingresaste como <b>{usuario.correo}</b>. Solo guardamos tu correo y tu alias.
        </p>
        <div className="card">
          <FormularioAlias aliasActual={perfil.alias} />
        </div>
        <form action={cerrarSesion}>
          <button className="btn ghost" type="submit">
            Cerrar sesión
          </button>
        </form>
      </section>
    </>
  );
}
