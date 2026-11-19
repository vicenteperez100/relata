import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Simulador } from "@/components/simulador/Simulador";
import s from "@/components/simulador/simulador.module.css";
import { requerirUsuario } from "@/lib/auth/sesion";
import { obtenerOperador } from "@/lib/auth/sesion-operador";
import { contenidoQr } from "@/lib/qr";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Simulador", robots: { index: false } };

export default function PaginaSimulador() {
  return (
    <>
      <div className={s.head}>
        <p className="eyebrow">Demo</p>
        <h1>Simulador de la máquina</h1>
      </div>
      <Suspense fallback={<p className="muted">Cargando simulador…</p>}>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  const usuario = await requerirUsuario("/simulador");
  const operador = await obtenerOperador();

  if (!operador) {
    return (
      <div className={`card ${s.sinAcceso}`}>
        <h2>No tienes acceso al simulador</h2>
        <p className="muted">
          El simulador es solo para operadores de la demo. Tu correo (<b>{usuario.correo}</b>) no está en la
          lista <code>OPERATOR_EMAILS</code>.
        </p>
        <p>
          <Link href="/mi-cuenta">Volver a Mi cuenta</Link>
        </p>
      </div>
    );
  }

  // El QR propio del operador, para probar con un solo dispositivo.
  const supabase = await supabaseServidor();
  const { data } = await supabase.from("profiles").select("qr_token").eq("id", operador.id).single();

  return (
    <>
      <p className="muted" style={{ maxWidth: "70ch" }}>
        Simula la máquina: lee el QR de una persona y registra latas. Las latas quedan guardadas de verdad
        en su cuenta, marcadas como <b>Máquina SIM-01</b> (simulador).
      </p>
      <Simulador miQr={data ? contenidoQr(data.qr_token) : ""} />
    </>
  );
}
