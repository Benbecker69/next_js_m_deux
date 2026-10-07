// The database stores one `name` string. Showing it as "first name" and
// "last name" is a display convenience of the account form, the same one the
// mobile app offers — not a schema change. Same two functions as its
// `features/auth/name.ts`.

/**
 * First word is the first name, everything after it the last name. A
 * one-word name stays the first name and leaves the last name empty.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

/** The inverse of `splitName`: what is saved as the single `name`. */
export function joinName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
