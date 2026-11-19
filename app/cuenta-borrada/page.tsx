import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cuenta borrada", robots: { index: false } };

export default function CuentaBorrada() {
  return (
    <div className="auth">
      <div className="card auth-card" role="status">
        <p className="eyebrow">Listo</p>
        <h1>Borramos tu cuenta</h1>
        <p className="muted">
          Eliminamos tu correo, tu alias, tu código QR y tu historial de latas. Si vuelves a ingresar con el mismo
          correo, empezarás una cuenta nueva desde cero.
        </p>
        <div>
          <Link className="btn primary" href="/">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
