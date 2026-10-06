import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getUserById } from "@/lib/data/users";
import type { User } from "@/types/domain";
import { MOBILE_CONFIG } from "./config";
import { ApiError } from "./http";
import { generateSessionToken, hashSessionToken } from "./token";

// Mobile authentication: `Authorization: Bearer <token>`. The web keeps its
// own cookie session (src/lib/auth/session.ts); this file never touches it.

export type MobileAuth = { user: User; sessionId: string };

export async function createMobileSession(
  userId: string,
  deviceName?: string,
): Promise<{ token: string; expiresAt: string }> {
  const { token, tokenHash } = generateSessionToken();
  const session = await prisma.mobileSession.create({
    data: {
      userId,
      tokenHash,
      deviceName: deviceName || null,
      expiresAt: new Date(Date.now() + MOBILE_CONFIG.session.ttlMs),
    },
  });
  // The token is returned once, here. Only its hash stays in the database.
  return { token, expiresAt: session.expiresAt.toISOString() };
}

function readBearerToken(request: Request): string {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i);
  if (!match?.[1]) {
    throw new ApiError(401, "UNAUTHENTICATED", "Connexion requise.");
  }
  return match[1];
}

/** Resolves the caller from the bearer token, or throws a 401 ApiError. */
export async function requireMobileUser(request: Request): Promise<MobileAuth> {
  const session = await prisma.mobileSession.findUnique({
    where: { tokenHash: hashSessionToken(readBearerToken(request)) },
  });
  if (!session) {
    throw new ApiError(401, "INVALID_TOKEN", "Session invalide. Reconnectez-vous.");
  }
  if (session.revokedAt) {
    throw new ApiError(401, "SESSION_REVOKED", "Session terminée. Reconnectez-vous.");
  }
  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    throw new ApiError(401, "SESSION_EXPIRED", "Session expirée. Reconnectez-vous.");
  }
  const user = await getUserById(session.userId);
  if (!user) {
    throw new ApiError(401, "INVALID_TOKEN", "Session invalide. Reconnectez-vous.");
  }
  if (now - session.lastUsedAt.getTime() > MOBILE_CONFIG.session.touchIntervalMs) {
    await prisma.mobileSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date(now) },
    });
  }
  return { user, sessionId: session.id };
}

export async function revokeMobileSession(sessionId: string): Promise<void> {
  await prisma.mobileSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes every other active session of a user — called after a password
 * change: a device that had the old password (or a stolen token) stops
 * working, while the one making this request stays signed in. `revokedAt`
 * is only ever set once, so an already-revoked or expired row is left alone.
 */
export async function revokeOtherMobileSessions(
  userId: string,
  exceptSessionId: string,
): Promise<void> {
  await prisma.mobileSession.updateMany({
    where: { userId, id: { not: exceptSessionId }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
