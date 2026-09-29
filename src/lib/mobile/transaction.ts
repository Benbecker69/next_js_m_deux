import "server-only";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "./http";

const MAX_ATTEMPTS = 3;

/**
 * Runs `run` in one interactive transaction at the strictest isolation level.
 * Under SERIALIZABLE, two requests that would each read "nothing conflicts" and
 * then both write (two people booking the same slot, two check-ins for one
 * reservation) cannot both succeed: PostgreSQL aborts one of them (SQLSTATE
 * 40001), and we simply run it again — it then sees the other's write.
 */
export async function withSerializableTransaction<T>(
  run: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(run, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isSerializationConflict(error)) throw error;
      if (attempt >= MAX_ATTEMPTS) {
        throw new ApiError(409, "CONFLICT", "Trop de demandes simultanées. Réessayez.");
      }
    }
  }
}

/**
 * Deliberately duck-typed rather than `error instanceof
 * Prisma.PrismaClientKnownRequestError`: under `next dev` (Turbopack, Fast
 * Refresh) the generated Prisma module can be reloaded into a fresh module
 * instance, so the thrown error's class and the `Prisma` imported here stop
 * being the same object and `instanceof` silently returns false — verified by
 * hitting this in dev (P2034 in the log) while `instanceof` still failed.
 * Reading `.code`/`.cause` survives that; it's also what Prisma itself
 * recommends as the portable alternative to `instanceof` for this error.
 */
function isSerializationConflict(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && (error as { code?: string }).code === "P2034") {
    return true;
  }
  // With the `pg` driver adapter (Prisma 7) PostgreSQL's serialization failure,
  // SQLSTATE 40001, can also arrive as a DriverAdapterError whose `cause`
  // carries the original code, instead of being wrapped into P2034.
  if ("cause" in error) {
    const cause = (error as { cause?: { originalCode?: string; kind?: string } | null })
      .cause;
    return cause?.originalCode === "40001" || cause?.kind === "TransactionWriteConflict";
  }
  return false;
}
