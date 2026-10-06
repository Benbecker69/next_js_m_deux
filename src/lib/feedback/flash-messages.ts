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
  "reservation-confirmee": {
    variant: "success",
    title: "Réservation confirmée",
    message: "Votre créneau est réservé et les crédits ont été débités de votre solde.",
  },
  "lieu-cree": {
    variant: "success",
    title: "Lieu créé",
    message: "Ajoutez-lui maintenant des espaces pour qu'il puisse être réservé.",
  },
  "connexion-reussie": {
    variant: "success",
    title: "Connexion réussie",
    message: "Heureux de vous revoir.",
  },
  "compte-cree": {
    variant: "success",
    title: "Compte créé",
    message: "20 crédits de bienvenue ont été ajoutés à votre solde.",
  },
  "profil-complete": {
    variant: "success",
    title: "Profil complété",
    message: "Bienvenue sur votre tableau de bord !",
  },
  "utilisateur-supprime": {
    variant: "success",
    title: "Utilisateur supprimé",
    message: "Son compte et ses réservations ont été supprimés.",
  },
  deconnexion: {
    variant: "success",
    title: "Vous êtes déconnecté",
    message: "À bientôt sur Repère.",
  },
  "connexion-requise": {
    variant: "error",
    title: "Connexion requise",
    message: "Connectez-vous pour accéder à cette page.",
  },
} as const satisfies Record<
  string,
  { variant: "success" | "error"; title: string; message: string }
>;

export type FlashCode = keyof typeof FLASH_MESSAGES;

/** Appends a flash code to a redirect target — use from Server Actions. */
export function withFlash(path: string, code: FlashCode): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}ok=${code}`;
}
