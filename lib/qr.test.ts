import { describe, expect, it } from "vitest";
import { contenidoQr, leerContenidoQr } from "./qr";

const TOKEN = "Ab3_-xYz0123456789abcdefghijklmnopqrstuvwxy"; // 43 caracteres

describe("QR", () => {
  it("el token tiene 43 caracteres (sanity check del ejemplo)", () => {
    expect(TOKEN).toHaveLength(43);
  });
  it("ida y vuelta: lo que se codifica se puede leer", () => {
    expect(leerContenidoQr(contenidoQr(TOKEN))).toBe(TOKEN);
  });
  it("acepta el token solo, con espacios o prefijo en mayúsculas", () => {
    expect(leerContenidoQr(`  ${TOKEN} `)).toBe(TOKEN);
    expect(leerContenidoQr(`RELATA:${TOKEN}`)).toBe(TOKEN);
  });
  it.each([
    "",
    "relata:",
    "relata:corto",
    "https://promo.example.com",
    `relata:${TOKEN}x`,
    `relata:${TOKEN.slice(0, 42)}=`,
    "RLT-USR-000482",
  ])("rechaza %j", (texto) => {
    expect(leerContenidoQr(texto)).toBeNull();
  });
});
