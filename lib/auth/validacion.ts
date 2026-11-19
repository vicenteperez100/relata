import { z } from "zod";

/**
 * Validaciones del login y del alias. Son funciones puras (sin base de datos),
 * así se pueden probar con tests y usar igual en el servidor.
 */

export const esquemaCorreo = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "El correo es demasiado largo")
  .pipe(z.email("Escribe un correo válido, por ejemplo nombre@uai.cl"));

/** Debe calzar con la regla de la base: entre 2 y 30 caracteres (sin contar espacios de los bordes). */
export const ALIAS_MIN = 2;
export const ALIAS_MAX = 30;

export const esquemaAlias = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(ALIAS_MIN, `El alias debe tener al menos ${ALIAS_MIN} caracteres`)
      .max(ALIAS_MAX, `El alias puede tener hasta ${ALIAS_MAX} caracteres`)
      .regex(/^[\p{L}\p{N} ._-]+$/u, "Usa solo letras, números, espacios, punto, guion o guion bajo"),
  );

/** Primer mensaje de error de una validación, para mostrarlo en el formulario. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dato inválido";
}

export const DESTINO_POR_DEFECTO = "/mi-cuenta";

/**
 * Evita "redirecciones abiertas": que un enlace malicioso use nuestro login
 * para mandar a la persona a otro sitio (ej. ?next=https://sitio-falso.com).
 * Solo acepta rutas internas como "/mi-cuenta".
 */
export function rutaSegura(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return DESTINO_POR_DEFECTO;
  }
  try {
    // Si al resolverla cambia de dominio, no es interna.
    const url = new URL(next, "http://relata.local");
    if (url.origin !== "http://relata.local") return DESTINO_POR_DEFECTO;
    return url.pathname + url.search;
  } catch {
    return DESTINO_POR_DEFECTO;
  }
}
