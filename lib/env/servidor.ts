import "server-only"; // si alguien importa esto desde el navegador, la compilación falla
import { z } from "zod";
import { validar } from "./publico";

/** Variables SECRETAS: solo existen en el servidor. Nunca llevan NEXT_PUBLIC_. */
const esquema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20, "Falta SUPABASE_SECRET_KEY"),
  MACHINE_API_KEY: z.string().min(32, "MACHINE_API_KEY debe tener al menos 32 caracteres"),
  OPERATOR_EMAILS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((correo) => correo.trim().toLowerCase())
        .filter(Boolean),
    ),
});

export type EnvServidor = z.infer<typeof esquema>;

let cache: EnvServidor | undefined;

export function envServidor(): EnvServidor {
  cache ??= validar(esquema, process.env);
  return cache;
}
