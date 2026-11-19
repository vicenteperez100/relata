/**
 * Logo de ReLata en SVG, basado en referencia/logo-relata.jpg:
 * dos flechas verdes en círculo (reciclaje) y una lata plateada abollada.
 *
 * Usa los tokens de color (var(--...)), así se adapta al modo oscuro.
 * Es decorativo: el nombre "ReLata" va como texto al lado.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/* Flecha superior: avanza hacia la derecha */}
      <path d="M8.03 18.19A17 17 0 0 1 21.63 7.17" fill="none" stroke="var(--accent)" strokeWidth="4.2" />
      <path d="M26.6 6.5 21.07 3.21 22.19 11.13Z" fill="var(--accent)" />
      {/* Flecha grande: da la vuelta y sube por la izquierda */}
      <path d="M29.81 8.03A17 17 0 1 1 7.58 28.4" fill="none" stroke="var(--accent)" strokeWidth="4.2" />
      <path d="M6.29 23.57 3.72 29.44 11.44 27.36Z" fill="var(--accent)" />
      {/* Lata */}
      <rect x="17.5" y="13" width="13" height="22" rx="3" fill="var(--silver)" />
      <path d="M27 13h.5a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H27Z" fill="var(--silver-ink)" opacity="0.6" />
      <rect x="18.5" y="11.6" width="11" height="2.2" rx="1.1" fill="var(--silver-ink)" />
      <rect x="18.5" y="34.2" width="11" height="2.2" rx="1.1" fill="var(--silver-ink)" />
      <rect x="20" y="15.5" width="1.6" height="17" rx="0.8" fill="#fff" opacity="0.75" />
      {/* Abolladura */}
      <path d="M17.5 24.6 21.6 23.5 24.4 25.1 27.3 23.8 30.5 24.5" fill="none" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo completo: ícono + nombre "ReLata", como en el logo oficial. */
export function Logo() {
  return (
    <>
      <LogoMark />
      <b>
        <i>Re</i>Lata
      </b>
    </>
  );
}
