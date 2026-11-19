import { describe, expect, it } from "vitest";
import { DESTINO_POR_DEFECTO, esquemaAlias, esquemaCorreo, rutaSegura } from "./validacion";

describe("esquemaCorreo", () => {
  it("limpia espacios y pasa a minúsculas", () => {
    expect(esquemaCorreo.parse("  Vicente@UAI.cl ")).toBe("vicente@uai.cl");
  });
  it.each(["", "sin-arroba", "a@", "@b.cl", "a b@c.cl"])("rechaza %j", (correo) => {
    expect(esquemaCorreo.safeParse(correo).success).toBe(false);
  });
});

describe("esquemaAlias", () => {
  it("acepta alias normales con tildes y ñ", () => {
    expect(esquemaAlias.parse("  Ñandú  Reciclador ")).toBe("Ñandú Reciclador");
    expect(esquemaAlias.parse("vicho_99")).toBe("vicho_99");
  });
  it.each([
    ["muy corto", "a"],
    ["solo espacios", "    "],
    ["muy largo", "x".repeat(31)],
    ["símbolos raros", "<script>"],
    ["emoji", "lata 🥫"],
  ])("rechaza: %s", (_, alias) => {
    expect(esquemaAlias.safeParse(alias).success).toBe(false);
  });
});

describe("rutaSegura", () => {
  it.each([
    ["/mi-cuenta", "/mi-cuenta"],
    ["/simulador?maquina=RLT-01", "/simulador?maquina=RLT-01"],
  ])("deja pasar rutas internas: %s", (entrada, esperado) => {
    expect(rutaSegura(entrada)).toBe(esperado);
  });

  it.each([
    null,
    undefined,
    "",
    "https://sitio-falso.com",
    "//sitio-falso.com",
    "/\\sitio-falso.com",
    "javascript:alert(1)",
    "mi-cuenta",
  ])("bloquea destinos externos o raros: %j", (entrada) => {
    expect(rutaSegura(entrada)).toBe(DESTINO_POR_DEFECTO);
  });
});
