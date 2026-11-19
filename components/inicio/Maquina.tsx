import { PUNTOS_POR_LATA } from "@/lib/reglas/puntos";
import s from "./inicio.module.css";

const puntosAuspiciadora = PUNTOS_POR_LATA.auspiciadora.toLocaleString("es-CL");

/**
 * Ilustración animada de la máquina (primera etapa: aplastar cada lata).
 * La animación es solo CSS y se detiene si la persona pidió menos movimiento.
 */
export function Maquina() {
  return (
    <svg
      className={s.machine}
      viewBox="0 0 360 340"
      role="img"
      aria-label="Ilustración de la máquina ReLata: una placa baja, aplasta la lata y la pantalla muestra los puntos ganados"
    >
      {/* Cuerpo */}
      <rect className={s.body} x="60" y="14" width="240" height="316" rx="20" />

      {/* Pantalla */}
      <rect className={s.deep} x="86" y="38" width="188" height="56" rx="10" />
      <g className={s.screenMsg}>
        <text className={s.screenText} x="100" y="62">¡LATA ACEPTADA!</text>
        <text className={`${s.screenText} ${s.screenAccent}`} x="100" y="82">
          +{puntosAuspiciadora} puntos
        </text>
      </g>

      {/* Cámara de compactación */}
      <rect className={s.deep} x="86" y="112" width="188" height="136" rx="12" />
      <g className={s.plate}>
        <rect className={s.metal} x="100" y="120" width="160" height="14" rx="4" />
        <rect className={s.metal} x="174" y="104" width="12" height="20" rx="3" />
      </g>
      <g className={s.can}>
        <rect className={s.metal} x="152" y="174" width="56" height="66" rx="8" />
        <rect className={s.stripe} x="152" y="196" width="56" height="18" />
        <rect className={s.metal} x="152" y="170" width="56" height="8" rx="4" />
      </g>

      {/* Depósito con latas ya aplastadas */}
      <rect className={s.slot} x="86" y="262" width="110" height="46" rx="8" />
      <rect className={s.metal} x="96" y="276" width="40" height="18" rx="3" />
      <rect className={s.metal} x="142" y="276" width="40" height="18" rx="3" />

      {/* Lector de QR */}
      <rect className={s.deep} x="212" y="262" width="62" height="46" rx="8" />
      <path className={s.reader} d="M224 274h14v14h-14zM246 274h14v14h-14zM224 296h14M246 296h14" />
    </svg>
  );
}
