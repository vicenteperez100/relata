"use client";

import { useActionState, useEffect } from "react";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { enviarEnlace, type EstadoIngreso } from "./acciones";

const INICIAL: EstadoIngreso = { estado: "inicial" };

export function FormularioIngreso({ next }: { next: string }) {
  const [estado, accion, enviando] = useActionState(enviarEnlace, INICIAL);
  const esperandoCorreo = estado.estado === "enviado";

  // El enlace del correo se abre en OTRA pestaña. Mientras esta muestra
  // "Revisa tu correo", revisamos si ya hay sesión (las cookies se comparten
  // entre pestañas) y, si la hay, seguimos solos a Mi cuenta.
  useEffect(() => {
    if (!esperandoCorreo) return;
    const supabase = supabaseNavegador();
    let listo = false;
    const revisar = async () => {
      if (listo) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        listo = true;
        window.location.assign(next);
      }
    };
    const intervalo = window.setInterval(revisar, 3000);
    const alVolver = () => document.visibilityState === "visible" && revisar();
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", revisar);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", revisar);
    };
  }, [esperandoCorreo, next]);

  if (estado.estado === "enviado") {
    return (
      <div className="form-ok" role="status">
        <h2>Revisa tu correo</h2>
        <p>
          Te enviamos un enlace a <b>{estado.correo}</b>. Ábrelo para entrar. Vence en una hora.
        </p>
        <p className="muted">
          El enlace abre una pestaña nueva donde quedarás dentro. Esta página también se actualizará sola cuando
          ingreses.
        </p>
        <p className="muted">¿No llegó? Revisa la carpeta de spam o promociones.</p>
        <form action={accion}>
          <input type="hidden" name="correo" value={estado.correo} />
          <input type="hidden" name="next" value={next} />
          <button className="btn ghost small" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar de nuevo"}
          </button>
        </form>
      </div>
    );
  }

  const error = estado.estado === "error" ? estado.mensaje : null;

  return (
    <form action={accion} className="form" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="correo">Tu correo</label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="nombre@correo.cl"
          defaultValue={estado.estado === "error" ? estado.correo : ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "correo-error" : undefined}
        />
        {error && (
          <p id="correo-error" className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <button className="btn primary" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
}
