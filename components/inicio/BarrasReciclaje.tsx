import s from "./inicio.module.css";

interface Pais {
  pais: string;
  /** Porcentaje de latas recicladas. Si hay rango, es el mínimo. */
  valor: number;
  /** Máximo del rango, si el dato es un rango (ej. Paraguay 80-90%). */
  hasta?: number;
  destacado?: boolean;
}

const DATOS: Pais[] = [
  { pais: "Brasil", valor: 97.4 },
  { pais: "Argentina", valor: 91.1 },
  { pais: "Paraguay", valor: 80, hasta: 90 },
  { pais: "Chile", valor: 36, destacado: true },
];

const pct = (n: number) => n.toLocaleString("es-CL", { maximumFractionDigits: 1 });

/**
 * Gráfico de barras hecho con HTML y CSS (sin librerías).
 * El país y el valor son texto, así los lectores de pantalla los leen;
 * las barras son solo decoración (aria-hidden).
 */
export function BarrasReciclaje() {
  return (
    <figure className={s.bars}>
      <h3>Latas de aluminio recicladas (%)</h3>
      {DATOS.map(({ pais, valor, hasta, destacado }) => (
        <div key={pais} className={`${s.bar} ${destacado ? s.chile : ""}`}>
          <span>{pais}</span>
          <div className={s.track} aria-hidden="true">
            <div className={s.fill} style={{ width: `${valor}%` }} />
            {hasta && <div className={s.range} style={{ left: `${valor}%`, width: `${hasta - valor}%` }} />}
          </div>
          <span className={s.val}>{hasta ? `${pct(valor)}-${pct(hasta)}%` : `${pct(valor)}%`}</span>
        </div>
      ))}
      <figcaption className={s.source}>
        Fuente: ANIR, citada en Forbes Chile (2025) y G5 Noticias (2026).
      </figcaption>
    </figure>
  );
}
