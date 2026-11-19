"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { PALABRA_BORRAR } from "@/lib/auth/borrado";
import { borrarCuenta, regenerarQr, type EstadoPrivacidad } from "./acciones";

/**
 * Regenerar el QR y borrar la cuenta. Ninguna acción usa confirm():
 * la confirmación está en la misma página (un segundo botón, o escribir BORRAR).
 */
export function OpcionesPrivacidad() {
  const [qr, accionQr, regenerando] = useActionState<EstadoPrivacidad, FormData>(regenerarQr, {});
  const [borrado, accionBorrar, borrando] = useActionState<EstadoPrivacidad, FormData>(borrarCuenta, {});
  const [confirmarQr, setConfirmarQr] = useState(false);
  const [abrirBorrar, setAbrirBorrar] = useState(false);

  return (
    <div className="privacidad">
      <section className="card privacidad-item" aria-labelledby="titulo-regenerar">
        <h3 id="titulo-regenerar">Regenerar mi código QR</h3>
        <p className="muted">
          Si alguien le sacó una foto a tu QR, crea uno nuevo. El anterior deja de funcionar al instante. Tus
          puntos no cambian.
        </p>
        {qr.ok && (
          <p className="form-success" role="status">
            Listo: tu QR es nuevo. El anterior ya no funciona.
          </p>
        )}
        {qr.error && (
          <p className="form-error" role="alert">
            {qr.error}
          </p>
        )}
        {!confirmarQr ? (
          <div>
            <button className="btn ghost small" type="button" onClick={() => setConfirmarQr(true)}>
              Regenerar QR
            </button>
          </div>
        ) : (
          <form action={accionQr} onSubmit={() => setConfirmarQr(false)} className="privacidad-confirmar">
            <span>¿Crear un QR nuevo?</span>
            <button className="btn primary small" type="submit" disabled={regenerando}>
              {regenerando ? "Generando…" : "Sí, crear uno nuevo"}
            </button>
            <button className="btn ghost small" type="button" onClick={() => setConfirmarQr(false)}>
              Cancelar
            </button>
          </form>
        )}
      </section>

      <section className="card privacidad-item peligro" aria-labelledby="titulo-borrar">
        <h3 id="titulo-borrar">Borrar mi cuenta</h3>
        <p className="muted">
          Se eliminan para siempre tu correo, tu alias, tu QR y todo tu historial de latas. No se puede deshacer.
        </p>
        {!abrirBorrar ? (
          <div>
            <button className="btn ghost small btn-peligro" type="button" onClick={() => setAbrirBorrar(true)}>
              Borrar mi cuenta…
            </button>
          </div>
        ) : (
          <form action={accionBorrar} className="form">
            <div className="field">
              <label htmlFor="confirmacion">
                Escribe <b>{PALABRA_BORRAR}</b> para confirmar
              </label>
              <input
                id="confirmacion"
                name="confirmacion"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={borrado.error ? true : undefined}
                aria-describedby={borrado.error ? "error-borrar" : undefined}
              />
              {borrado.error && (
                <p id="error-borrar" className="form-error" role="alert">
                  {borrado.error}
                </p>
              )}
            </div>
            <div className="privacidad-confirmar">
              <button className="btn primary small btn-peligro-lleno" type="submit" disabled={borrando}>
                {borrando ? "Borrando…" : "Borrar mi cuenta para siempre"}
              </button>
              <button className="btn ghost small" type="button" onClick={() => setAbrirBorrar(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      <p className="muted">
        <Link href="/privacidad">Cómo cuidamos tus datos</Link>
      </p>
    </div>
  );
}
