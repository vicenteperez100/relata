import { NIVELES, PUNTOS_POR_LATA_GRATIS, type Resumen } from "@/lib/reglas/puntos";
import { formatearPuntos } from "@/lib/cuenta/vista";
import s from "./cuenta.module.css";

/** Nivel, puntos, barra de progreso y estadísticas. Todo sale de resumenCuenta(). */
export function Progreso({ r }: { r: Resumen }) {
  const porcentaje = Math.round(r.porcentaje);
  return (
    <>
      <section className={`card ${s.level}`} aria-labelledby="titulo-nivel">
        <div className={s.levelTop}>
          <h2 className={s.levelName} id="titulo-nivel">
            <small>NIVEL {r.nivel.numero}</small>
            {r.nivel.nombre}
          </h2>
          <div className={s.pts}>
            <span className="label">Puntos</span>
            <b>{formatearPuntos(r.puntos)}</b>
          </div>
        </div>
        <div
          className={s.progress}
          role="progressbar"
          aria-label={r.siguiente ? `Progreso al nivel ${r.siguiente.nombre}` : "Nivel máximo alcanzado"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentaje}
          aria-valuetext={`${porcentaje}%`}
        >
          <i style={{ width: `${r.porcentaje}%` }} />
        </div>
        <p className={s.note}>
          {r.siguiente
            ? `Te faltan ${formatearPuntos(r.faltan)} puntos para el nivel ${r.siguiente.numero} (${r.siguiente.nombre}).`
            : "Llegaste al nivel máximo. ¡Gracias por reciclar!"}
        </p>
        <ol className={s.levels} aria-label="Niveles">
          {NIVELES.map((n) => (
            <li key={n.numero} className={n.numero <= r.nivel.numero ? s.on : undefined}>
              {n.numero} · {n.nombre}
              {n.numero === r.nivel.numero && <span className="sr-only"> (tu nivel actual)</span>}
            </li>
          ))}
        </ol>
      </section>

      <div className={s.stats}>
        <div className={`card ${s.stat}`}>
          <b>{r.totalLatas}</b>
          <span>latas recicladas</span>
        </div>
        <div className={`card ${s.stat}`}>
          <b>{r.latasAuspiciadoras}</b>
          <span>de la marca auspiciadora (valen 1,5)</span>
        </div>
        <div className={`card ${s.stat}`}>
          <b>{r.latasGratis}</b>
          <span>latas gratis ganadas</span>
        </div>
      </div>
      <p className={s.note}>
        Ganas una lata gratis cada {PUNTOS_POR_LATA_GRATIS} puntos. Te faltan{" "}
        {formatearPuntos(r.faltanParaLataGratis)} para la siguiente.
      </p>
    </>
  );
}
