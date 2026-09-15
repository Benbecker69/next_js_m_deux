import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/data/users";
import type { User } from "@/types/domain";

const SESSION_COOKIE = "repere_session";

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Returns the current user, or null if nobody is logged in. Never redirects. */
export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return getUserById(userId);
}

/**
 * Real server-side enforcement, not UI masking: call this at the top of any
 * protected layout/page/Server Action. An unauthenticated request is
 * redirected before any protected data is ever read.
 */
export async function requireUser(): Promise<User> {
  const user = await getSession();
  if (!user) redirect("/connexion");
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
