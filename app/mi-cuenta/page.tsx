import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function MiCuenta() {
  return (
    <section className="placeholder">
      <p className="eyebrow">Mi cuenta</p>
      <h1>Pronto podrás ingresar aquí</h1>
      <p className="muted">
        El ingreso con tu correo, tu código QR, tus puntos y tu nivel llegan en los pasos 5 y 6.
      </p>
    </section>
  );
}
