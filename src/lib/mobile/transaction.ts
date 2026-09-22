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

function isSerializationConflict(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return true;
  }
  // With the `pg` driver adapter (Prisma 7) PostgreSQL's serialization failure,
  // SQLSTATE 40001, does not come back as P2034: it arrives as a
  // DriverAdapterError whose `cause` carries the original code.
  if (typeof error === "object" && error !== null && "cause" in error) {
    const cause = error.cause as { originalCode?: string; kind?: string } | null;
    return cause?.originalCode === "40001" || cause?.kind === "TransactionWriteConflict";
  }
  return false;
}
