import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { reenviarConfirmacion } from "./proxy";

const pedir = (url: string) => new NextRequest(new URL(url, "https://relata.test"));

describe("reenviarConfirmacion", () => {
  it("lleva un ?code= de la portada a /auth/confirmar, hacia Mi cuenta", () => {
    const r = reenviarConfirmacion(pedir("/?code=abc123"));
    expect(r?.status).toBe(307);
    const destino = new URL(r!.headers.get("location")!);
    expect(destino.pathname).toBe("/auth/confirmar");
    expect(destino.searchParams.get("code")).toBe("abc123");
    expect(destino.searchParams.get("next")).toBe("/mi-cuenta");
  });

  it("conserva token_hash, type y next", () => {
    const r = reenviarConfirmacion(pedir("/ingresar?token_hash=t1&type=email&next=%2Fsimulador"));
    const destino = new URL(r!.headers.get("location")!);
    expect(destino.pathname).toBe("/auth/confirmar");
    expect(Object.fromEntries(destino.searchParams)).toEqual({ token_hash: "t1", type: "email", next: "/simulador" });
  });

  it("no toca /auth/confirmar ni páginas sin esos parámetros", () => {
    expect(reenviarConfirmacion(pedir("/auth/confirmar?code=abc"))).toBeNull();
    expect(reenviarConfirmacion(pedir("/mi-cuenta"))).toBeNull();
    expect(reenviarConfirmacion(pedir("/?ref=qr"))).toBeNull();
  });
});
