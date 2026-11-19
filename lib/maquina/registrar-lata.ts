import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { leerContenidoQr } from "@/lib/qr";
import { resumenCuenta, type ConteoLatas, type TipoLata } from "@/lib/reglas/puntos";

/**
 * Lógica para registrar una lata. No depende de Next.js ni de Supabase
 * directamente: recibe la función que habla con la base ("rpc") como
 * parámetro. Así se puede probar con una base falsa y reutilizar en el
 * simulador (paso 8).
 */

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------
export const esquemaEntrada = z.object({
  /** Lo que leyó el lector: "relata:<token>" o el token solo. */
  token: z.string().max(200),
  tipo: z.enum(["auspiciadora", "otra"]),
  maquinaId: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, "maquinaId: solo letras, números, - y _ (máx. 40)"),
});

export type EntradaLata = z.infer<typeof esquemaEntrada>;

/** La función de la base de datos (registrar_lata en la migración SQL). */
export type RpcRegistrar = (args: {
  p_token: string;
  p_tipo: TipoLata;
  p_maquina_id: string;
}) => Promise<{ data: { user_id: string; otras: number; auspiciadoras: number }[] | null; error: unknown }>;

// ---------------------------------------------------------------------------
// Resultado
// ---------------------------------------------------------------------------
export interface LataRegistrada {
  ok: true;
  tipo: TipoLata;
  puntosGanados: number;
  puntos: number;
  latas: ConteoLatas;
  nivel: { numero: number; nombre: string };
  siguienteNivel: { numero: number; nombre: string; faltan: number } | null;
  subioDeNivel: boolean;
  latasGratis: number;
  /** true si ESTA lata hizo ganar una lata gratis nueva. */
  ganoLataGratis: boolean;
}

export type ErrorRegistro =
  | { ok: false; codigo: "datos_invalidos"; mensaje: string }
  | { ok: false; codigo: "qr_invalido"; mensaje: string }
  | { ok: false; codigo: "usuario_no_encontrado"; mensaje: string }
  | { ok: false; codigo: "error_interno"; mensaje: string };

export type ResultadoRegistro = LataRegistrada | ErrorRegistro;

// ---------------------------------------------------------------------------
// Registrar
// ---------------------------------------------------------------------------
export async function registrarLata(rpc: RpcRegistrar, entrada: unknown): Promise<ResultadoRegistro> {
  const validacion = esquemaEntrada.safeParse(entrada);
  if (!validacion.success) {
    const detalle = validacion.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
    return { ok: false, codigo: "datos_invalidos", mensaje: detalle };
  }
  const { token: leido, tipo, maquinaId } = validacion.data;

  const token = leerContenidoQr(leido);
  if (!token) {
    return { ok: false, codigo: "qr_invalido", mensaje: "El código leído no es un QR de ReLata" };
  }

  const { data, error } = await rpc({ p_token: token, p_tipo: tipo, p_maquina_id: maquinaId });
  if (error) {
    console.error("[registrar-lata] rpc:", error);
    return { ok: false, codigo: "error_interno", mensaje: "No se pudo registrar la lata" };
  }
  const fila = data?.[0];
  if (!fila) {
    // Mismo mensaje sea cual sea la razón: no revelamos si un token existió alguna vez.
    return { ok: false, codigo: "usuario_no_encontrado", mensaje: "QR no reconocido. Pide a la persona que lo actualice en Mi cuenta." };
  }

  const despues = resumenCuenta({ otras: fila.otras, auspiciadoras: fila.auspiciadoras });
  const antes = resumenCuenta({
    otras: fila.otras - (tipo === "otra" ? 1 : 0),
    auspiciadoras: fila.auspiciadoras - (tipo === "auspiciadora" ? 1 : 0),
  });

  return {
    ok: true,
    tipo,
    puntosGanados: despues.puntos - antes.puntos,
    puntos: despues.puntos,
    latas: { otras: fila.otras, auspiciadoras: fila.auspiciadoras },
    nivel: { numero: despues.nivel.numero, nombre: despues.nivel.nombre },
    siguienteNivel: despues.siguiente
      ? { numero: despues.siguiente.numero, nombre: despues.siguiente.nombre, faltan: despues.faltan }
      : null,
    subioDeNivel: despues.nivel.numero > antes.nivel.numero,
    latasGratis: despues.latasGratis,
    ganoLataGratis: despues.latasGratis > antes.latasGratis,
  };
}

// ---------------------------------------------------------------------------
// Clave de la máquina
// ---------------------------------------------------------------------------
/**
 * Compara la clave recibida con la correcta en "tiempo constante": tarda lo
 * mismo acierte o no, para que nadie pueda adivinarla midiendo tiempos.
 * Se comparan los hash SHA-256 para que ambos lados tengan el mismo largo.
 */
export function claveValida(encabezado: string | null, claveCorrecta: string): boolean {
  if (!encabezado || !claveCorrecta) return false;
  const [esquema, recibida] = encabezado.split(" ");
  if (esquema !== "Bearer" || !recibida) return false;
  const a = createHash("sha256").update(recibida).digest();
  const b = createHash("sha256").update(claveCorrecta).digest();
  return timingSafeEqual(a, b);
}
