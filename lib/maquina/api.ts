import { claveValida, registrarLata, type RpcRegistrar } from "./registrar-lata";

/** Tamaño máximo del cuerpo: un registro de lata ocupa menos de 300 bytes. */
const MAX_BYTES = 2048;

const ESTADO_HTTP = {
  datos_invalidos: 400,
  qr_invalido: 400,
  usuario_no_encontrado: 404,
  error_interno: 500,
} as const;

function json(estado: number, cuerpo: unknown, extra?: HeadersInit) {
  return Response.json(cuerpo, { status: estado, headers: { "Cache-Control": "no-store", ...extra } });
}

/**
 * Maneja POST /api/maquina/latas. Recibe sus dependencias como parámetros
 * (la clave y la función de la base) para poder probarlo sin servidor real.
 */
export async function manejarRegistro(request: Request, deps: { clave: string; rpc: RpcRegistrar }): Promise<Response> {
  if (!claveValida(request.headers.get("authorization"), deps.clave)) {
    return json(
      401,
      { ok: false, codigo: "no_autorizado", mensaje: "Falta la clave de la máquina o no es válida" },
      { "WWW-Authenticate": 'Bearer realm="relata-maquina"' },
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { ok: false, codigo: "formato_invalido", mensaje: "Envía el cuerpo como application/json" });
  }

  const texto = await request.text();
  if (texto.length > MAX_BYTES) {
    return json(413, { ok: false, codigo: "demasiado_grande", mensaje: "El cuerpo es demasiado grande" });
  }

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return json(400, { ok: false, codigo: "json_invalido", mensaje: "El cuerpo no es JSON válido" });
  }

  const resultado = await registrarLata(deps.rpc, cuerpo);
  if (!resultado.ok) return json(ESTADO_HTTP[resultado.codigo], resultado);
  return json(201, resultado);
}
