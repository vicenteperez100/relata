import { formatearFecha, formatearPuntos, puntosDe, type EventoLata } from "@/lib/cuenta/vista";
import s from "./cuenta.module.css";

export function Historial({ eventos, ejemplo }: { eventos: readonly EventoLata[]; ejemplo: boolean }) {
  return (
    <section className="card" aria-labelledby="titulo-historial">
      <div className={s.secHead}>
        <h2 className={s.sec} id="titulo-historial">
          Historial reciente
        </h2>
        {ejemplo && <span className="demo-tag">DATOS DE EJEMPLO</span>}
      </div>
      {eventos.length === 0 ? (
        <p className={s.vacio}>Todavía no hay latas registradas.</p>
      ) : (
        <ul className={s.hist}>
          {eventos.map((e, i) => (
            <li key={`${e.fecha}-${i}`}>
              <span>{e.tipo === "auspiciadora" ? "Lata de la marca auspiciadora" : "Lata de otra marca"}</span>
              <span className={s.p}>+{formatearPuntos(puntosDe(e.tipo))} pts</span>
              <span className={s.when}>
                <time dateTime={e.fecha}>{formatearFecha(e.fecha)}</time> · {e.maquinaId.startsWith("SIM") ? `Simulador (${e.maquinaId})` : `Máquina ${e.maquinaId}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
