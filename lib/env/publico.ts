import { z } from "zod";

/**
 * Variables PÚBLICAS (llegan al navegador). Next.js solo las incluye si se
 * escriben literalmente como process.env.NEXT_PUBLIC_..., por eso van una a una.
 */
const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20, "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export type EnvPublico = z.infer<typeof esquema>;

let cache: EnvPublico | undefined;

/** Lee y valida las variables públicas. Falla con un mensaje claro si falta alguna. */
export function envPublico(): EnvPublico {
  cache ??= validar(esquema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  });
  return cache;
}

export function validar<T extends z.ZodType>(esquema: T, valores: unknown): z.infer<T> {
  const r = esquema.safeParse(valores);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Variables de entorno inválidas (revisa .env.local):\n${detalle}`);
  }
  return r.data;
}
