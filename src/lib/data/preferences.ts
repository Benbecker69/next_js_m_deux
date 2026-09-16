import "server-only";
import type { Prisma, Preference as PreferenceRow } from "@/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import type { Preference } from "@/types/domain";

function toPreference(row: PreferenceRow): Preference {
  return {
    id: row.id,
    userId: row.userId,
    defaultLocationId: row.defaultLocationId,
    theme: row.theme,
    notificationsEnabled: row.notificationsEnabled,
  };
}

const DEFAULT_PREFERENCE: Omit<Preference, "id" | "userId"> = {
  defaultLocationId: null,
  theme: "system",
  notificationsEnabled: true,
};

export async function getPreferenceByUser(userId: string): Promise<Preference> {
  const row = await prisma.preference.upsert({
    where: { userId },
    update: {},
    create: { userId, ...DEFAULT_PREFERENCE },
  });
  return toPreference(row);
}

export async function updatePreference(
  userId: string,
  patch: Partial<Preference>,
): Promise<Preference | null> {
  const row = await prisma.preference.upsert({
    where: { userId },
    update: patch as Prisma.PreferenceUncheckedUpdateInput,
    create: { userId, ...DEFAULT_PREFERENCE, ...patch },
  });
  return toPreference(row);
}
