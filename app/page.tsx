import Link from "next/link";
import { BarrasReciclaje } from "@/components/inicio/BarrasReciclaje";
import { Maquina } from "@/components/inicio/Maquina";
import s from "@/components/inicio/inicio.module.css";
import { NIVELES, PUNTOS_POR_LATA, PUNTOS_POR_LATA_GRATIS } from "@/lib/reglas/puntos";

// Los números del texto salen del módulo de reglas: si cambia una regla,
// la página se actualiza sola y nunca queda desalineada con el cálculo real.
const num = (n: number) => n.toLocaleString("es-CL");
const primerNivel = NIVELES[0].nombre;
const ultimoNivel = NIVELES[NIVELES.length - 1].nombre;

const PASOS = [
  {
    titulo: "Escanea tu QR",
    texto: "Desde Mi cuenta, muestra tu código al lector de la máquina para identificarte.",
  },
  {
    titulo: "Inserta la lata",
    texto: "La máquina lee el código de barras para reconocer la marca antes de aplastarla.",
  },
  {
    titulo: "Míralo en vivo",
    texto: `La lata se aplasta al instante y sumas puntos: ${num(PUNTOS_POR_LATA.otra)} por lata, y ${num(PUNTOS_POR_LATA.auspiciadora)} si es de la marca auspiciadora.`,
  },
  {
    titulo: "Sube de nivel y gana",
    texto: `Tus puntos te llevan de ${primerNivel} a ${ultimoNivel}, y cada ${PUNTOS_POR_LATA_GRATIS} puntos ganas una lata gratis.`,
  },
];

const PARTES = [
  {
    titulo: "Mecanismo",
    texto:
      "Compactación en dos etapas: primero cada lata, a la vista de quien recicla, y cuando el depósito se llena, todo el lote en un bloque fácil de transportar.",
  },
  {
    titulo: "Incentivos",
    texto:
      "Puntos, niveles y latas gratis para quien recicla, y datos verificables de recuperación para la marca que lo auspicia.",
  },
  {
    titulo: "Alianza",
    texto:
      "La marca auspiciadora usa su propia ruta de reparto para retirar los bloques cuando entrega latas nuevas al local: logística inversa que la ayuda a cumplir la Ley REP.",
  },
];

export default function Inicio() {
  return (
    <>
      <div className={s.hero}>
        <div>
          <p className="eyebrow">Compactadora inteligente de latas</p>
          <h1>
            Cada lata que aplastas <em>cuenta.</em>
          </h1>
          <p className={s.lead}>
            ReLata es una máquina para supermercados, malls y estaciones de servicio. Aplasta tu lata
            al instante, te entrega puntos y niveles, y deja el aluminio compactado, listo para volver
            a ser lata.
          </p>
          <div className={s.cta}>
            <Link className="btn primary" href="/mi-cuenta">
              Ver mi cuenta
            </Link>
            <a className="btn ghost" href="#como-funciona">
              Cómo funciona
            </a>
          </div>
        </div>
        <Maquina />
      </div>

      <section className={s.block} id="problema" aria-labelledby="titulo-problema">
        <h2 id="titulo-problema">En Chile se recicla cerca de 1 de cada 3 latas</h2>
        <p className={s.sub}>
          El aluminio se puede reciclar una y otra vez, pero a la mayoría de las personas reciclar una
          lata les resulta incómodo y no les da nada a cambio.
        </p>
        <div className={s.problem}>
          <BarrasReciclaje />
          <dl className={s.facts}>
            <div className={s.fact}>
              <dt>15.000 t</dt>
              <dd>de aluminio terminan cada año en vertederos.</dd>
            </div>
            <div className={s.fact}>
              <dt>95%</dt>
              <dd>menos energía al reciclar aluminio que al producirlo desde cero.</dd>
            </div>
            <div className={s.fact}>
              <dt>2 a 6%</dt>
              <dd>
                del peso de una ruta de recolección es aluminio, pero su venta cubre más de la mitad
                de los costos de los recicladores.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={s.block} id="como-funciona" aria-labelledby="titulo-como">
        <h2 id="titulo-como">Cómo funciona</h2>
        <ol className={s.steps}>
          {PASOS.map((paso, i) => (
            <li key={paso.titulo}>
              <span className={s.stepNum}>PASO {i + 1}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={s.block} id="proyecto" aria-labelledby="titulo-partes">
        <h2 id="titulo-partes">Tres partes, un mismo circuito</h2>
        <div className={s.three}>
          {PARTES.map((parte) => (
            <div key={parte.titulo}>
              <h3>{parte.titulo}</h3>
              <p>{parte.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={s.ctaBand}>
        <div>
          <h2>Mira cómo se ve tu progreso</h2>
          <p>Ingresa con tu correo y obtén tu código QR.</p>
        </div>
        <Link className={`btn ${s.ctaButton}`} href="/mi-cuenta">
          Ir a Mi cuenta
        </Link>
      </div>
    </>
  );
}
