import { describe, expect, it } from "vitest";
import { resumenCuenta } from "@/lib/reglas/puntos";
import { CONTEO_EJEMPLO, HISTORIAL_EJEMPLO, desdeFilas, formatearFecha, formatearMes, formatearPuntos } from "./vista";

describe("formato", () => {
  it("muestra la fecha en hora de Chile (UTC-3 en verano)", () => {
    // 23:18 UTC del 21 de octubre = 20:18 en Santiago
    expect(formatearFecha("2026-10-21T23:18:00Z")).toMatch(/21.*oct.*20:18/);
  });
  it("cambia de día si en Chile todavía es el día anterior", () => {
    expect(formatearFecha("2026-10-22T01:00:00Z")).toMatch(/21.*oct.*22:00/);
  });
  it("mes de ingreso", () => {
    expect(formatearMes("2026-11-19T12:00:00Z")).toBe("noviembre de 2026");
  });
  it("puntos con coma decimal", () => {
    expect(formatearPuntos(52)).toBe("52");
    expect(formatearPuntos(1.5)).toBe("1,5");
    expect(formatearPuntos(1501.5)).toBe("1.501,5");
  });
});

describe("datos de ejemplo", () => {
  it("coinciden con la maqueta: 52 puntos, nivel Lámina, 2 latas gratis", () => {
    const r = resumenCuenta(CONTEO_EJEMPLO);
    expect(r.puntos).toBe(52);
    expect(r.nivel.nombre).toBe("Lámina");
    expect(r.latasGratis).toBe(2);
  });
  it("el historial de ejemplo está ordenado del más nuevo al más antiguo", () => {
    const fechas = HISTORIAL_EJEMPLO.map((e) => Date.parse(e.fecha));
    expect([...fechas].sort((a, b) => b - a)).toEqual(fechas);
  });
});

describe("desdeFilas", () => {
  it("convierte nombres de columnas de la base", () => {
    expect(desdeFilas([{ tipo: "otra", maquina_id: "RLT-02", created_at: "2026-11-19T12:00:00Z" }])).toEqual([
      { tipo: "otra", maquinaId: "RLT-02", fecha: "2026-11-19T12:00:00Z" },
    ]);
  });
});
