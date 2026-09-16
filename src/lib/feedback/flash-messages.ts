/**
 * Shared codes for the redirect-then-toast pattern: a Server Action that
 * calls redirect() can't also show a toast (the client tree it's running in
 * is torn down by the navigation before any "after" code could run), so it
 * appends `?ok=<code>` to the target URL instead. FlashToast reads the code
 * on arrival, shows the matching toast, then strips the param from the URL.
 * Codes are the single source of truth so a typo on either side is a build
 * error, not a silently-missing toast.
 */
export const FLASH_MESSAGES = {
  "reservation-confirmee": { variant: "success", message: "Réservation confirmée." },
  "lieu-cree": { variant: "success", message: "Lieu créé." },
  "connexion-reussie": { variant: "success", message: "Connexion réussie." },
  "profil-complete": {
    variant: "success",
    message: "Profil complété. Bienvenue sur votre tableau de bord !",
  },
  "utilisateur-supprime": { variant: "success", message: "Utilisateur supprimé." },
} as const satisfies Record<string, { variant: "success" | "error"; message: string }>;

export type FlashCode = keyof typeof FLASH_MESSAGES;

/** Appends a flash code to a redirect target — use from Server Actions. */
export function withFlash(path: string, code: FlashCode): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}ok=${code}`;
}
