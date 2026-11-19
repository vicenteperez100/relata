import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Permite importar con "@/lib/..." igual que en Next.js
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(new URL("./test/server-only-vacio.ts", import.meta.url)),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
