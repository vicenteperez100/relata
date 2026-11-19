import { beforeEach, describe, expect, it, vi } from "vitest";
import { manejarRegistro } from "./api";
import { claveValida, registrarLata, type RpcRegistrar } from "./registrar-lata";

const CLAVE = "clave-secreta-de-la-maquina-0123456789";
const TOKEN = "Ab3_-xYz0123456789abcdefghijklmnopqrstuvwxy";

/** Base de datos falsa en memoria que imita a registrar_lata() del SQL. */
function baseFalsa(inicial = { otras: 0, auspiciadoras: 0 }) {
  const conteo = { ...inicial };
  const rpc = vi.fn<RpcRegistrar>(async ({ p_token, p_tipo }) => {
    if (p_token !== TOKEN) return { data: [], error: null };
    if (p_tipo === "otra") conteo.otras++;
    else conteo.auspiciadoras++;
    return { data: [{ user_id: "u1", ...conteo }], error: null };
  });
  return { rpc, conteo };
}

function peticion(cuerpo: unknown, opciones: { clave?: string | null; tipo?: string } = {}) {
  const headers: Record<string, string> = { "content-type": opciones.tipo ?? "application/json" };
  const clave = opciones.clave === undefined ? CLAVE : opciones.clave;
  if (clave !== null) headers.authorization = `Bearer ${clave}`;
  return new Request("http://localhost/api/maquina/latas", {
    method: "POST",
    headers,
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

const LATA = { token: `relata:${TOKEN}`, tipo: "auspiciadora", maquinaId: "RLT-01" };

describe("claveValida", () => {
  it("acepta la clave correcta", () => expect(claveValida(`Bearer ${CLAVE}`, CLAVE)).toBe(true));
  it.each<[string | null, string]>([
    [null, "sin encabezado"],
    ["", "vacío"],
    [CLAVE, "sin 'Bearer'"],
    [`Basic ${CLAVE}`, "otro esquema"],
    [`Bearer ${CLAVE}x`, "clave distinta"],
    ["Bearer ", "Bearer sin clave"],
  ])("rechaza %j (%s)", (encabezado) => expect(claveValida(encabezado, CLAVE)).toBe(false));
  it("si el servidor no tiene clave configurada, rechaza todo", () => {
    expect(claveValida("Bearer ", "")).toBe(false);
  });
});

describe("POST /api/maquina/latas", () => {
  let db: ReturnType<typeof baseFalsa>;
  beforeEach(() => {
    db = baseFalsa();
  });
  const enviar = (req: Request) => manejarRegistro(req, { clave: CLAVE, rpc: db.rpc });

  it("401 sin clave, y no toca la base", async () => {
    const res = await enviar(peticion(LATA, { clave: null }));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain("Bearer");
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("401 con clave incorrecta", async () => {
    expect((await enviar(peticion(LATA, { clave: "otra-clave" }))).status).toBe(401);
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("415 si no es JSON", async () => {
    expect((await enviar(peticion("tipo=otra", { tipo: "text/plain" }))).status).toBe(415);
  });

  it("400 si el JSON está roto", async () => {
    const res = await enviar(peticion("{roto"));
    expect(res.status).toBe(400);
    expect((await res.json()).codigo).toBe("json_invalido");
  });

  it("413 si el cuerpo es enorme", async () => {
    expect((await enviar(peticion({ ...LATA, relleno: "x".repeat(5000) }))).status).toBe(413);
  });

  it.each([
    [{ ...LATA, tipo: "botella" }, "tipo inválido"],
    [{ ...LATA, maquinaId: "RLT 01; DROP" }, "maquinaId inválido"],
    [{ tipo: "otra", maquinaId: "RLT-01" }, "sin token"],
  ])("400 datos inválidos: %s", async (cuerpo, _) => {
    const res = await enviar(peticion(cuerpo));
    expect(res.status).toBe(400);
    expect((await res.json()).codigo).toBe("datos_invalidos");
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("400 si el QR no es de ReLata (y no consulta la base)", async () => {
    const res = await enviar(peticion({ ...LATA, token: "https://promo.example.com" }));
    expect(res.status).toBe(400);
    expect((await res.json()).codigo).toBe("qr_invalido");
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("404 si el QR tiene buen formato pero no existe", async () => {
    const res = await enviar(peticion({ ...LATA, token: "relata:" + "Z".repeat(43) }));
    expect(res.status).toBe(404);
    expect((await res.json()).codigo).toBe("usuario_no_encontrado");
  });

  it("201: registra una lata auspiciadora y devuelve el nuevo estado", async () => {
    const res = await enviar(peticion(LATA));
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({
      ok: true,
      tipo: "auspiciadora",
      puntosGanados: 1.5,
      puntos: 1.5,
      latas: { otras: 0, auspiciadoras: 1 },
      nivel: { numero: 1, nombre: "Lata" },
      siguienteNivel: { numero: 2, nombre: "Lámina", faltan: 23.5 },
      subioDeNivel: false,
      ganoLataGratis: false,
    });
    expect(db.rpc).toHaveBeenCalledWith({ p_token: TOKEN, p_tipo: "auspiciadora", p_maquina_id: "RLT-01" });
  });

  it("acepta el token sin el prefijo relata:", async () => {
    expect((await enviar(peticion({ ...LATA, token: TOKEN }))).status).toBe(201);
  });

  it("avisa cuando la lata hace subir de nivel (24 → 25 puntos)", async () => {
    db = baseFalsa({ otras: 24, auspiciadoras: 0 });
    const r = await (await enviar(peticion({ ...LATA, tipo: "otra" }))).json();
    expect(r).toMatchObject({ puntos: 25, subioDeNivel: true, nivel: { nombre: "Lámina" } });
  });

  it("avisa cuando gana una lata gratis (19 → 20,5 puntos)", async () => {
    db = baseFalsa({ otras: 19, auspiciadoras: 0 });
    const r = await (await enviar(peticion(LATA))).json();
    expect(r).toMatchObject({ puntos: 20.5, ganoLataGratis: true, latasGratis: 1 });
  });

  it("500 si la base falla, sin filtrar el detalle técnico", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const rpc: RpcRegistrar = async () => ({ data: null, error: { message: "connection refused at 10.0.0.5" } });
    const res = await manejarRegistro(peticion(LATA), { clave: CLAVE, rpc });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("10.0.0.5");
  });
});

describe("registrarLata (usada también por el simulador)", () => {
  it("diez latas seguidas suman bien", async () => {
    const db = baseFalsa();
    let ultimo;
    for (let i = 0; i < 10; i++) ultimo = await registrarLata(db.rpc, { ...LATA, tipo: i % 2 ? "otra" : "auspiciadora" });
    expect(ultimo).toMatchObject({ ok: true, puntos: 12.5, latas: { otras: 5, auspiciadoras: 5 } });
  });
});
