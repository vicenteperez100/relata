/**
 * Formato del contenido del QR de cada persona: "relata:<token>".
 * El prefijo permite que la máquina (y el simulador) reconozcan que es un QR
 * de ReLata y no, por ejemplo, el link de una promoción.
 */
export const PREFIJO_QR = "relata:";

/** Token: 43 caracteres base64url (32 bytes aleatorios, ver la migración SQL). */
const FORMATO_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export function contenidoQr(token: string): string {
  return PREFIJO_QR + token;
}

export function esTokenValido(token: string): boolean {
  return FORMATO_TOKEN.test(token);
}

/**
 * Lee lo que escaneó la cámara y devuelve el token, o null si no es un QR de ReLata.
 * Acepta también el token solo (por si se escribe a mano).
 */
export function leerContenidoQr(texto: string): string | null {
  const limpio = texto.trim();
  const token = limpio.toLowerCase().startsWith(PREFIJO_QR) ? limpio.slice(PREFIJO_QR.length) : limpio;
  return esTokenValido(token) ? token : null;
}
