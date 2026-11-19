import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cada test importa los módulos de nuevo, para que no reutilicen el caché.
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("envPublico", () => {
  it("acepta valores válidos y pone la URL del sitio por defecto", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_1234567890abcdef");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { envPublico } = await import("./publico");
    expect(envPublico().NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("explica qué falta si la URL no es válida", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "no-es-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const { envPublico } = await import("./publico");
    expect(() => envPublico()).toThrow(/NEXT_PUBLIC_SUPABASE_URL[\s\S]*NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });
});

describe("envServidor", () => {
  it("convierte OPERATOR_EMAILS en una lista limpia y en minúsculas", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_1234567890abcdef");
    vi.stubEnv("MACHINE_API_KEY", "x".repeat(32));
    vi.stubEnv("OPERATOR_EMAILS", " Ana@Ejemplo.cl, ,beto@ejemplo.cl ");
    const { envServidor } = await import("./servidor");
    expect(envServidor().OPERATOR_EMAILS).toEqual(["ana@ejemplo.cl", "beto@ejemplo.cl"]);
  });

  it("rechaza una MACHINE_API_KEY corta", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_1234567890abcdef");
    vi.stubEnv("MACHINE_API_KEY", "corta");
    const { envServidor } = await import("./servidor");
    expect(() => envServidor()).toThrow(/MACHINE_API_KEY/);
  });
});
