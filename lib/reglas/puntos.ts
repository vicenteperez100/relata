/**
 * Reglas de negocio de ReLata: puntos, niveles y latas gratis.
 *
 * Este módulo es "puro": no usa base de datos ni internet. Recibe números y
 * devuelve números. Por eso es fácil de probar (ver puntos.test.ts) y se puede
 * usar igual en la página, en la API y en el simulador.
 *
 * Detalle técnico: 1,5 no se puede representar siempre exacto con decimales
 * en un computador (0,1 + 0,2 = 0,30000000000000004). Para evitarlo, los
 * cálculos internos se hacen en "medios puntos" (números enteros) y solo al
 * final se divide por 2.
 */

/** Puntos por cada lata, según su tipo. */
export const PUNTOS_POR_LATA = {
  otra: 1,
  auspiciadora: 1.5,
} as const;

export type TipoLata = keyof typeof PUNTOS_POR_LATA;

/** Cada cuántos puntos se gana una lata gratis. */
export const PUNTOS_POR_LATA_GRATIS = 20;

export interface Nivel {
  numero: number;
  nombre: string;
  /** Puntos mínimos para estar en este nivel. */
  minimo: number;
}

/** Niveles ordenados de menor a mayor. */
export const NIVELES: readonly Nivel[] = [
  { numero: 1, nombre: "Lata", minimo: 0 },
  { numero: 2, nombre: "Lámina", minimo: 25 },
  { numero: 3, nombre: "Bloque", minimo: 75 },
  { numero: 4, nombre: "Lingote", minimo: 150 },
  { numero: 5, nombre: "Infinito", minimo: 300 },
];

/** Cuántas latas de cada tipo ha reciclado una persona. */
export interface ConteoLatas {
  otras: number;
  auspiciadoras: number;
}

function validarCantidad(valor: number, nombre: string): void {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new RangeError(`${nombre} debe ser un número entero mayor o igual a 0 (recibí ${valor})`);
  }
}

function validarPuntos(puntos: number): void {
  if (!Number.isFinite(puntos) || puntos < 0) {
    throw new RangeError(`Los puntos deben ser un número mayor o igual a 0 (recibí ${puntos})`);
  }
}

/** Puntos = otras × 1 + auspiciadoras × 1,5 */
export function calcularPuntos({ otras, auspiciadoras }: ConteoLatas): number {
  validarCantidad(otras, "otras");
  validarCantidad(auspiciadoras, "auspiciadoras");
  const mediosPuntos = otras * 2 + auspiciadoras * 3;
  return mediosPuntos / 2;
}

/** Cuenta las latas de una lista de eventos (por ejemplo, el historial). */
export function contarLatas(eventos: readonly { tipo: TipoLata }[]): ConteoLatas {
  const conteo: ConteoLatas = { otras: 0, auspiciadoras: 0 };
  for (const evento of eventos) {
    if (evento.tipo === "auspiciadora") conteo.auspiciadoras++;
    else if (evento.tipo === "otra") conteo.otras++;
    else throw new RangeError(`Tipo de lata desconocido: ${String(evento.tipo)}`);
  }
  return conteo;
}

/** El nivel más alto cuyo mínimo ya se alcanzó. */
export function nivelPara(puntos: number): Nivel {
  validarPuntos(puntos);
  let actual = NIVELES[0];
  for (const nivel of NIVELES) {
    if (puntos >= nivel.minimo) actual = nivel;
  }
  return actual;
}

/** El nivel que viene después, o null si ya está en el máximo. */
export function siguienteNivel(puntos: number): Nivel | null {
  const actual = nivelPara(puntos);
  return NIVELES.find((n) => n.numero === actual.numero + 1) ?? null;
}

export interface Progreso {
  nivel: Nivel;
  siguiente: Nivel | null;
  /** Porcentaje (0 a 100) recorrido entre el nivel actual y el siguiente. */
  porcentaje: number;
  /** Puntos que faltan para el siguiente nivel (0 si ya está en el máximo). */
  faltan: number;
}

export function progresoNivel(puntos: number): Progreso {
  const nivel = nivelPara(puntos);
  const siguiente = siguienteNivel(puntos);
  if (!siguiente) return { nivel, siguiente: null, porcentaje: 100, faltan: 0 };
  const tramo = siguiente.minimo - nivel.minimo;
  const avance = puntos - nivel.minimo;
  return {
    nivel,
    siguiente,
    porcentaje: Math.min(100, (avance / tramo) * 100),
    faltan: siguiente.minimo - puntos,
  };
}

/** Una lata gratis cada 20 puntos: floor(puntos / 20). */
export function latasGratis(puntos: number): number {
  validarPuntos(puntos);
  return Math.floor(puntos / PUNTOS_POR_LATA_GRATIS);
}

/** Puntos que faltan para la próxima lata gratis. */
export function faltanParaLataGratis(puntos: number): number {
  const proxima = (latasGratis(puntos) + 1) * PUNTOS_POR_LATA_GRATIS;
  return proxima - puntos;
}

export interface Resumen extends Progreso {
  puntos: number;
  totalLatas: number;
  latasAuspiciadoras: number;
  latasGratis: number;
  faltanParaLataGratis: number;
}

/** Todo lo que muestra "Mi cuenta", calculado de una vez. */
export function resumenCuenta(conteo: ConteoLatas): Resumen {
  const puntos = calcularPuntos(conteo);
  return {
    puntos,
    totalLatas: conteo.otras + conteo.auspiciadoras,
    latasAuspiciadoras: conteo.auspiciadoras,
    latasGratis: latasGratis(puntos),
    faltanParaLataGratis: faltanParaLataGratis(puntos),
    ...progresoNivel(puntos),
  };
}
