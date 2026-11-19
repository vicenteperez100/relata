"use client";

import { useActionState } from "react";
import { ALIAS_MAX } from "@/lib/auth/validacion";
import { guardarAlias, type EstadoAlias } from "./acciones";

export function FormularioAlias({ aliasActual }: { aliasActual: string | null }) {
  const [estado, accion, guardando] = useActionState<EstadoAlias, FormData>(guardarAlias, {});

  return (
    <form action={accion} className="form">
      <div className="field">
        <label htmlFor="alias">{aliasActual ? "Cambiar alias" : "¿Cómo quieres que te llamemos?"}</label>
        <input
          id="alias"
          name="alias"
          type="text"
          autoComplete="nickname"
          required
          maxLength={ALIAS_MAX}
          defaultValue={aliasActual ?? ""}
          placeholder="Por ejemplo: Vicho"
          aria-invalid={estado.error ? true : undefined}
          aria-describedby="alias-ayuda"
        />
        <p id="alias-ayuda" className="field-hint">
          Un apodo basta: no necesitas usar tu nombre real.
        </p>
        {estado.error && (
          <p className="form-error" role="alert">
            {estado.error}
          </p>
        )}
        {estado.ok && aliasActual && (
          <p className="form-success" role="status">
            Alias guardado.
          </p>
        )}
      </div>
      <button className="btn primary" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar alias"}
      </button>
    </form>
  );
}
