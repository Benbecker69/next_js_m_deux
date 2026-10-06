import "server-only";
import {
  getUserByEmail,
  getUserById,
  updateUserEmail,
  updateUserPassword,
  verifyUserPasswordById,
} from "@/lib/data/users";
import { toMeDto } from "./dto";
import { ApiError } from "./http";
import { revokeOtherMobileSessions } from "./auth";

// Account security: change password, change email. Neither exists on the
// web yet (its own "Sécurité" tab is read-only and literally says the
// ability to change the password "arrivera dans une prochaine mise à jour")
// — this is new capability, not a reuse of an existing web action, built on
// the same `src/lib/auth/password.ts` primitives and the same
// `INVALID_CREDENTIALS`/`EMAIL_TAKEN` error codes the rest of the API
// already uses, so the contract stays consistent even though the flow is new.

const WRONG_PASSWORD = "Mot de passe actuel incorrect.";

/**
 * Requires the current password (a mobile session token alone isn't enough
 * to prove the human typing right now still knows it). Every other active
 * session is revoked afterward — a device that only had the old password
 * stops working, while this one stays signed in.
 */
export async function changePassword(
  userId: string,
  sessionId: string,
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  const valid = await verifyUserPasswordById(userId, input.currentPassword);
  if (!valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", WRONG_PASSWORD);
  }
  const ok = await updateUserPassword(userId, input.newPassword);
  if (!ok) {
    throw new ApiError(404, "USER_NOT_FOUND", "Utilisateur introuvable.");
  }
  await revokeOtherMobileSessions(userId, sessionId);
}

const EMAIL_TAKEN = "Un compte existe déjà avec cette adresse e-mail.";

/** Same current-password requirement as `changePassword`; the new address must not already belong to another account. */
export async function changeEmail(
  userId: string,
  input: { currentPassword: string; email: string },
) {
  const valid = await verifyUserPasswordById(userId, input.currentPassword);
  if (!valid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", WRONG_PASSWORD);
  }

  const existing = await getUserByEmail(input.email);
  if (existing && existing.id !== userId) {
    throw new ApiError(409, "EMAIL_TAKEN", EMAIL_TAKEN);
  }

  const result = await updateUserEmail(userId, input.email);
  if (result === "email_taken") {
    // Two changes to the same new address at once — the pre-check above
    // missed it, the database's own unique constraint did not.
    throw new ApiError(409, "EMAIL_TAKEN", EMAIL_TAKEN);
  }
  if (result === "error") {
    throw new ApiError(404, "USER_NOT_FOUND", "Utilisateur introuvable.");
  }

  const updated = await getUserById(userId);
  if (!updated) {
    throw new ApiError(404, "USER_NOT_FOUND", "Utilisateur introuvable.");
  }
  return { user: toMeDto(updated) };
}
