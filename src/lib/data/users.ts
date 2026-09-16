import "server-only";
import type { Prisma, User as UserRow } from "@/generated/prisma";
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
