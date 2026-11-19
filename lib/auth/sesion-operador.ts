import "server-only";
import { envServidor } from "@/lib/env/servidor";
import { esOperador } from "./operador";
import { obtenerUsuario, type Usuario } from "./sesion";

/** La persona con sesión, solo si su correo está en OPERATOR_EMAILS. */
export async function obtenerOperador(): Promise<Usuario | null> {
  const usuario = await obtenerUsuario();
  if (!usuario || !esOperador(usuario.correo, envServidor().OPERATOR_EMAILS)) return null;
  return usuario;
}
