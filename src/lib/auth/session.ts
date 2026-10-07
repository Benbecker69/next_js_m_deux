import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionRecord,
  deleteSessionRecord,
  deleteSessionsOfUser,
  getSessionUserId,
} from "@/lib/data/sessions";
import { getUserById } from "@/lib/data/users";
import { withFlash } from "@/lib/feedback/flash-messages";
import type { User } from "@/types/domain";

const SESSION_COOKIE = "repere_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Only this hash is stored. SHA-256 is enough (no need for scrypt like
 * passwords): the token is 256 random bits, so it cannot be guessed or
 * brute-forced from its hash.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Signs a user in. The cookie carries an opaque random token — not the user
 * id, not any data: knowing who someone is gives no way to forge it. The
 * server keeps the token's hash and looks it up on every request.
 */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await createSessionRecord({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  // Removed on the server first: the token is dead even if the cookie
  // survives somewhere.
  if (token) await deleteSessionRecord(hashToken(token));
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Ends every other session of a user and keeps the current one — called
 * after a password change.
 */
export async function destroyOtherSessions(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  await deleteSessionsOfUser(userId, token ? hashToken(token) : undefined);
}

/**
 * Returns the current user, or null if nobody is logged in. Never redirects.
 * Wrapped in React's cache(): every protected layout calls requireX() and
 * every page under it calls it again (pages don't receive the layout's
 * already-resolved user as a prop), so a single request re-reads the same
 * session cookie and re-looks-up the same user several times over. cache()
 * memoizes per request — same inputs, one real lookup, however many times
 * getSession()/requireUser()/etc. get called while handling it.
 */
export const getSession = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = await getSessionUserId(hashToken(token));
  if (!userId) return null;
  return getUserById(userId);
});

/**
 * Real server-side enforcement, not UI masking: call this at the top of any
 * protected layout/page/Server Action. An unauthenticated request is
 * redirected before any protected data is ever read.
 */
export async function requireUser(): Promise<User> {
  const user = await getSession();
  // The toast on arrival says why the page changed (see flash-messages.ts).
  if (!user) redirect(withFlash("/connexion", "connexion-requise"));
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/acces-refuse");
  return user;
}

export async function requireOnboarded(): Promise<User> {
  const user = await requireUser();
  if (!user.onboardingCompletedAt) redirect("/bienvenue");
  return user;
}
