/**
 * ¿Este correo puede usar el simulador? Compara sin importar mayúsculas ni
 * espacios, contra la lista OPERATOR_EMAILS (ya normalizada por envServidor()).
 */
export function esOperador(correo: string | null | undefined, operadores: readonly string[]): boolean {
  if (!correo) return false;
  const normalizado = correo.trim().toLowerCase();
  return normalizado.length > 0 && operadores.includes(normalizado);
}
