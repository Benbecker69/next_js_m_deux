import { defineConfig } from "prisma/config";

// Prisma 7 config: `prisma migrate dev`, `prisma db seed`, etc. read the
// connection string from here (not from schema.prisma anymore). Runtime
// PrismaClient instantiation is separate — see src/lib/db/prisma.ts.
// Unlike the old schema-based `url = env(...)`, this file doesn't get .env
// loaded for it automatically — load it explicitly (Node's built-in loader,
// no dotenv dependency needed).
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional in environments where DATABASE_URL is already set
  // (CI, production) — ignore if the file doesn't exist.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Plain `process.env`, not the strict `env()` helper (which throws when
    // the variable is missing): `prisma generate` runs on every `npm ci`
    // (postinstall), including while the Docker image is built, where no
    // database URL exists — and it never connects to the database anyway.
    // Commands that do connect (migrate, seed) still need the variable.
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "node prisma/seed.ts",
  },
});
