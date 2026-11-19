import { PUNTOS_POR_LATA, contarLatas, type ConteoLatas, type TipoLata } from "@/lib/reglas/puntos";

/** Una lata del historial, tal como la necesita la pantalla. */
export interface EventoLata {
  tipo: TipoLata;
  maquinaId: string;
  fecha: string; // ISO
}

export const ZONA_HORARIA = "America/Santiago";

const formatoFecha = new Intl.DateTimeFormat("es-CL", {
  timeZone: ZONA_HORARIA,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "mié, 21 oct, 20:18" en hora de Chile, sin importar dónde esté el servidor. */
export function formatearFecha(iso: string): string {
  return formatoFecha.format(new Date(iso));
}

const formatoMes = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA_HORARIA, month: "long", year: "numeric" });

/** "noviembre de 2026" */
export function formatearMes(iso: string): string {
  return formatoMes.format(new Date(iso));
}

/** 52 → "52"; 1.5 → "1,5" */
export function formatearPuntos(n: number): string {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 1 });
}

export function puntosDe(tipo: TipoLata): number {
  return PUNTOS_POR_LATA[tipo];
}

/**
 * DATOS DE EJEMPLO: los mismos números de la maqueta aprobada.
 * Se muestran SOLO mientras la persona no tiene latas reales, siempre con la
 * etiqueta "DATOS DE EJEMPLO".
 */
export const HISTORIAL_EJEMPLO: readonly EventoLata[] = [
  { tipo: "auspiciadora", maquinaId: "RLT-01", fecha: "2026-10-27T21:42:00Z" },
  { tipo: "otra", maquinaId: "RLT-01", fecha: "2026-10-27T21:41:00Z" },
  { tipo: "auspiciadora", maquinaId: "RLT-01", fecha: "2026-10-24T16:05:00Z" },
  { tipo: "otra", maquinaId: "RLT-01", fecha: "2026-10-24T16:04:00Z" },
  { tipo: "auspiciadora", maquinaId: "RLT-01", fecha: "2026-10-21T23:18:00Z" },
];

export const CONTEO_EJEMPLO: ConteoLatas = { otras: 31, auspiciadoras: 14 };

/** Convierte filas de la base al formato de la pantalla. */
export function desdeFilas(filas: readonly { tipo: TipoLata; maquina_id: string; created_at: string }[]): EventoLata[] {
  return filas.map((f) => ({ tipo: f.tipo, maquinaId: f.maquina_id, fecha: f.created_at }));
}

export { contarLatas };
