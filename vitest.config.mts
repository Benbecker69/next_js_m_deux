import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests of the pure business rules (booking, arrival, validation…).
// They run in plain Node: no browser, no database, no Next.js server.
export default defineConfig({
  resolve: {
    // Same `@/` alias as tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
