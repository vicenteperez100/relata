import { describe, expect, it } from "vitest";
import {
  NIVELES,
  calcularPuntos,
  contarLatas,
  faltanParaLataGratis,
  latasGratis,
  nivelPara,
  progresoNivel,
  resumenCuenta,
  siguienteNivel,
} from "./puntos";

describe("calcularPuntos", () => {
  it("una lata de otra marca vale 1 punto", () => {
    expect(calcularPuntos({ otras: 1, auspiciadoras: 0 })).toBe(1);
  });

  it("una lata auspiciadora vale 1,5 puntos", () => {
    expect(calcularPuntos({ otras: 0, auspiciadoras: 1 })).toBe(1.5);
  });

  it("suma ambos tipos (ejemplo de la maqueta: 31 otras + 14 auspiciadoras = 52)", () => {
    expect(calcularPuntos({ otras: 31, auspiciadoras: 14 })).toBe(52);
  });

  it("no acumula errores de decimales con muchas latas", () => {
    // 0,1 + 0,2 !== 0,3 en JavaScript; aquí debe dar exacto.
    expect(calcularPuntos({ otras: 0, auspiciadoras: 1001 })).toBe(1501.5);
  });

  it("cero latas son cero puntos", () => {
    expect(calcularPuntos({ otras: 0, auspiciadoras: 0 })).toBe(0);
  });

  it("rechaza cantidades negativas o con decimales", () => {
    expect(() => calcularPuntos({ otras: -1, auspiciadoras: 0 })).toThrow(RangeError);
    expect(() => calcularPuntos({ otras: 0, auspiciadoras: 2.5 })).toThrow(RangeError);
    expect(() => calcularPuntos({ otras: Number.NaN, auspiciadoras: 0 })).toThrow(RangeError);
  });
});

describe("contarLatas", () => {
  it("cuenta cada tipo desde una lista de eventos", () => {
    const eventos = [
      { tipo: "otra" as const },
      { tipo: "auspiciadora" as const },
      { tipo: "auspiciadora" as const },
    ];
    expect(contarLatas(eventos)).toEqual({ otras: 1, auspiciadoras: 2 });
  });

  it("rechaza tipos desconocidos", () => {
    // @ts-expect-error: probamos a propósito un tipo inválido
    expect(() => contarLatas([{ tipo: "botella" }])).toThrow(RangeError);
  });
});

describe("nivelPara", () => {
  it.each([
    [0, 1, "Lata"],
    [24.5, 1, "Lata"],
    [25, 2, "Lámina"],
    [74.5, 2, "Lámina"],
    [75, 3, "Bloque"],
    [149.5, 3, "Bloque"],
    [150, 4, "Lingote"],
    [299.5, 4, "Lingote"],
    [300, 5, "Infinito"],
    [10_000, 5, "Infinito"],
  ])("%s puntos → nivel %i (%s)", (puntos, numero, nombre) => {
    const nivel = nivelPara(puntos);
    expect(nivel.numero).toBe(numero);
    expect(nivel.nombre).toBe(nombre);
  });

  it("los niveles están ordenados y empiezan en 0", () => {
    expect(NIVELES[0].minimo).toBe(0);
    for (let i = 1; i < NIVELES.length; i++) {
      expect(NIVELES[i].minimo).toBeGreaterThan(NIVELES[i - 1].minimo);
    }
  });

  it("rechaza puntos negativos", () => {
    expect(() => nivelPara(-1)).toThrow(RangeError);
  });
});

describe("siguienteNivel y progresoNivel", () => {
  it("en el nivel máximo no hay siguiente y el progreso es 100%", () => {
    expect(siguienteNivel(300)).toBeNull();
    expect(progresoNivel(450)).toMatchObject({ porcentaje: 100, faltan: 0, siguiente: null });
  });

  it("calcula porcentaje y puntos faltantes (52 pts: de Lámina a Bloque)", () => {
    const p = progresoNivel(52);
    expect(p.nivel.nombre).toBe("Lámina");
    expect(p.siguiente?.nombre).toBe("Bloque");
    expect(p.porcentaje).toBe(54); // (52 - 25) / (75 - 25) = 54%
    expect(p.faltan).toBe(23);
  });

  it("justo al subir de nivel el progreso parte en 0%", () => {
    expect(progresoNivel(25).porcentaje).toBe(0);
  });
});

describe("latas gratis", () => {
  it.each([
    [0, 0],
    [19.5, 0],
    [20, 1],
    [39.5, 1],
    [40, 2],
    [52, 2],
  ])("%s puntos → %i latas gratis", (puntos, gratis) => {
    expect(latasGratis(puntos)).toBe(gratis);
  });

  it("indica cuánto falta para la próxima", () => {
    expect(faltanParaLataGratis(0)).toBe(20);
    expect(faltanParaLataGratis(52)).toBe(8);
    expect(faltanParaLataGratis(19.5)).toBe(0.5);
    expect(faltanParaLataGratis(20)).toBe(20);
  });
});

describe("resumenCuenta", () => {
  it("reproduce los números de la maqueta", () => {
    expect(resumenCuenta({ otras: 31, auspiciadoras: 14 })).toMatchObject({
      puntos: 52,
      totalLatas: 45,
      latasAuspiciadoras: 14,
      latasGratis: 2,
      faltanParaLataGratis: 8,
      porcentaje: 54,
      faltan: 23,
      nivel: { numero: 2, nombre: "Lámina" },
    });
  });
});
