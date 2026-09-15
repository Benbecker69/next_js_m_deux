"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getUserById, updateUser } from "@/lib/data/users";

export type UserFormState = {
  error: string | null;
  success: boolean;
};

export async function updateUserAdminAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const role = formData.get("role");
  if (role !== "member" && role !== "admin") {
    return { error: "Rôle invalide.", success: false };
  }

  const credits = Number(formData.get("credits"));
  if (!Number.isFinite(credits) || credits < 0) {
    return { error: "Le nombre de crédits doit être un nombre positif.", success: false };
  }

  if (userId === admin.id && role !== "admin") {
    return {
      error: "Vous ne pouvez pas retirer votre propre rôle administrateur.",
      success: false,
    };
  }

  const target = await getUserById(userId);
  if (!target) {
    return { error: "Utilisateur introuvable.", success: false };
  }

  await updateUser(userId, { role, credits });
  revalidatePath(`/admin/utilisateurs/${userId}`);
  revalidatePath("/admin/utilisateurs");

  return { error: null, success: true };
}
