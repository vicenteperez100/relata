import Link from "next/link";

export default function NoEncontrada() {
  return (
    <div className="placeholder">
      <p className="eyebrow">Error 404</p>
      <h1>Esta página no existe</h1>
      <p className="muted">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn primary" href="/">
          Ir al inicio
        </Link>
        <Link className="btn ghost" href="/mi-cuenta">
          Mi cuenta
        </Link>
      </div>
    </div>
  );
}
