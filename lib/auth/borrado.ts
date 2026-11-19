/** Palabra que hay que escribir para confirmar el borrado de la cuenta. */
export const PALABRA_BORRAR = "BORRAR";

/** Evita borrar por un clic accidental: exige escribir la palabra exacta. */
export function confirmacionBorradoValida(texto: string | null | undefined): boolean {
  return (texto ?? "").trim().toUpperCase() === PALABRA_BORRAR;
}
