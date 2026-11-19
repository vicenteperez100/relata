import { envServidor } from "@/lib/env/servidor";
import { manejarRegistro } from "@/lib/maquina/api";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/maquina/latas — la máquina registra una lata.
 *
 *   Authorization: Bearer <MACHINE_API_KEY>
 *   Content-Type: application/json
 *   { "token": "relata:<token del QR>", "tipo": "auspiciadora" | "otra", "maquinaId": "RLT-01" }
 *
 * Respuestas: 201 registrada · 400 datos o QR inválidos · 401 sin clave ·
 * 404 QR no reconocido · 413/415 formato · 500 error interno.
 * Toda la lógica está en lib/maquina (con tests).
 */
export async function POST(request: Request) {
  const admin = supabaseAdmin();
  return manejarRegistro(request, {
    clave: envServidor().MACHINE_API_KEY,
    rpc: async (args) => admin.rpc("registrar_lata", args),
  });
}
