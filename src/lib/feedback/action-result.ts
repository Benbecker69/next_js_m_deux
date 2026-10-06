import type { ZodError } from "zod";

/**
 * The shapes every Server Action answers with, and the messages they share.
 * No "server-only" here on purpose: Client Components import the types and
 * the network message.
 *
 * Two families of actions:
 *  - a form action (`useActionState`) returns `{ error, fieldErrors?, values?, success? }`;
 *  - a button action (cancel, delete, toggle) returns an `ActionResult`.
 * Neither throws for a case we expect: in production Next.js replaces the
 * message of an error thrown by a Server Action with a generic one, so a
 * thrown "Réservation introuvable." would never reach the user.
 */

/** One message per field name, shown under that field. */
export type FieldErrors = Record<string, string>;

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/** Messages that are the same wherever they appear. */
export const MESSAGES = {
  unexpected:
    "Une erreur inattendue s'est produite de notre côté. Rien n'a été modifié : réessayez dans un instant.",
  network:
    "Impossible de joindre le serveur. Vérifiez votre connexion internet, puis réessayez.",
  notSaved:
    "La modification n'a pas pu être enregistrée. Rechargez la page, puis réessayez.",
} as const;

/** First message of each field — a field shows one problem at a time. */
export function fieldErrorsFrom(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
}

/**
 * The one-line summary shown in the toast: the message itself when a single
 * field is wrong, a count when there are several (each field then carries
 * its own message).
 */
export function validationSummary(fieldErrors: FieldErrors): string {
  const messages = Object.values(fieldErrors);
  if (messages.length === 1) return messages[0];
  return `${messages.length} champs sont à corriger avant de continuer.`;
}

/** What a form action returns when zod refuses the submission. */
export function validationFailure(error: ZodError): {
  error: string;
  fieldErrors: FieldErrors;
} {
  const fieldErrors = fieldErrorsFrom(error);
  return { error: validationSummary(fieldErrors), fieldErrors };
}

const slotFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
  // Messages are written on the server, which may not run in the member's
  // time zone: every location is in mainland France.
  timeZone: "Europe/Paris",
});

/** "mardi 6 octobre à 14:00" — a slot named inside a sentence. */
export function formatSlot(iso: string): string {
  return slotFormatter.format(new Date(iso));
}

/** "1 crédit", "18 crédits". */
export function credits(count: number): string {
  return `${count} crédit${count === 1 ? "" : "s"}`;
}
