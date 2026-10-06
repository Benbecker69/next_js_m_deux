import "server-only";
import { Prisma, type User as UserRow } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { User } from "@/types/domain";

// Never include passwordHash here — this is the shape returned to the rest
// of the app (session, admin UI, ...), same as the old mock layer.
function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    memberType: row.memberType,
    credits: row.credits,
    avatarUrl: row.avatarUrl,
    onboardingCompletedAt: row.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? toUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toUser(row) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  credits?: number;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const row = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      credits: input.credits ?? 0,
    },
  });
  return toUser(row);
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User | null> {
  try {
    const row = await prisma.user.update({
      where: { id },
      // `patch` comes from zod-validated call sites (src/lib/validation) —
      // its literal string values (role/memberType) are already within the
      // enum's valid set. Prisma's generated enum types are nominal TS
      // enums, stricter than the plain string unions used in the domain
      // layer, so a structural assert is needed here.
      data: patch as Prisma.UserUpdateInput,
    });
    return toUser(row);
  } catch {
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies a user's current password by id, not email — the mobile
 * change-password/change-email flows already have the id (from the bearer
 * session), not a fresh login form. `passwordHash` never leaves this file.
 */
export async function verifyUserPasswordById(
  id: string,
  password: string,
): Promise<boolean> {
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) return false;
  return verifyPassword(password, row.passwordHash);
}

/**
 * `updateUser`'s `Partial<User>` can't touch the password: `passwordHash`
 * isn't part of the public `User` domain type. `false` on any error, same
 * convention as `deleteUser`.
 */
export async function updateUserPassword(
  id: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return true;
  } catch {
    return false;
  }
}

export type ChangeEmailResult = "ok" | "email_taken" | "error";

/**
 * Unlike `updateUser` (which swallows every error into a generic `null`),
 * this distinguishes a uniqueness conflict — the same race `createUser`
 * already guards against at registration (`P2002` on two sign-ups with the
 * same address at once) — from any other failure, so the caller can return
 * the same `EMAIL_TAKEN` the registration endpoint already uses.
 */
export async function updateUserEmail(
  id: string,
  email: string,
): Promise<ChangeEmailResult> {
  try {
    await prisma.user.update({ where: { id }, data: { email: email.toLowerCase() } });
    return "ok";
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return "email_taken";
    }
    return "error";
  }
}

/** Looks up a user by email and checks the password — used by login only. */
export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!row) return null;
  const valid = await verifyPassword(password, row.passwordHash);
  return valid ? toUser(row) : null;
}
