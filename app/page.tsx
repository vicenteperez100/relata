export default function Inicio() {
  return (
    <section className="placeholder">
      <p className="eyebrow">En construcción</p>
      <h1>Cada lata que aplastas cuenta.</h1>
      <p className="muted">
        Esta es una página provisoria para revisar la base visual: colores, fuentes, header y modo
        oscuro. La página de inicio completa llega en el paso 3.
      </p>
      <p>
        <span className="demo-tag">DATOS DE EJEMPLO</span>
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="btn primary" href="/mi-cuenta">Botón principal</a>
        <button className="btn ghost" type="button">Botón secundario</button>
      </div>
    </section>
  );
}
