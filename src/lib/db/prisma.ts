import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

// Singleton, cached on `globalThis` across Next.js dev hot-reloads — without
// this, every module reload during `next dev` would open a fresh pool of
// Postgres connections instead of reusing one, quickly exhausting the
// database's connection limit. Not needed in production (one process, one
// import), but harmless there.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
