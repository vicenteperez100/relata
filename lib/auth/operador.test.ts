import { describe, expect, it } from "vitest";
import { esOperador } from "./operador";

const LISTA = ["ana@ejemplo.cl", "beto@ejemplo.cl"];

describe("esOperador", () => {
  it("reconoce a quien está en la lista, sin importar mayúsculas ni espacios", () => {
    expect(esOperador("ana@ejemplo.cl", LISTA)).toBe(true);
    expect(esOperador("  ANA@Ejemplo.CL ", LISTA)).toBe(true);
  });
  it.each([null, undefined, "", "   ", "carla@ejemplo.cl", "ana@ejemplo.cl.evil.com", "ana@ejemplo"])(
    "rechaza %j",
    (correo) => expect(esOperador(correo, LISTA)).toBe(false),
  );
  it("con la lista vacía nadie es operador", () => {
    expect(esOperador("ana@ejemplo.cl", [])).toBe(false);
  });
});
