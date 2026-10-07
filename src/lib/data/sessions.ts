import "server-only";
import { prisma } from "@/lib/db/prisma";

// Storage of the website's sessions. A row links the hash of the cookie's
// token to a user; the token itself is never stored (see
// src/lib/auth/session.ts, which owns the cookie and the hashing).

export async function createSessionRecord(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  // Housekeeping at sign-in: this user's sessions that have already expired
  // are of no use to anyone.
  await prisma.session.deleteMany({
    where: { userId: input.userId, expiresAt: { lt: new Date() } },
  });
  await prisma.session.create({ data: input });
}

/** The user a token hash belongs to, or null if unknown or expired. */
export async function getSessionUserId(tokenHash: string): Promise<string | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return session.userId;
}

/** Sign-out: the token stops working even if it was copied somewhere. */
export async function deleteSessionRecord(tokenHash: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash } });
}

/**
 * Signs a user out everywhere else — after a password change, a browser that
 * was left signed in must not stay so. `exceptTokenHash` keeps the session
 * making the request; without it every session of the user is removed.
 */
export async function deleteSessionsOfUser(
  userId: string,
  exceptTokenHash?: string,
): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(exceptTokenHash ? { tokenHash: { not: exceptTokenHash } } : {}),
    },
  });
}
