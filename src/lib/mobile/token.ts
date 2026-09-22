import "server-only";
import { createHash, randomBytes } from "node:crypto";

// Opaque bearer token for the mobile app. It is not a JWT: it carries no data,
// it is just 256 random bits that the server can look up (and revoke).

const TOKEN_PREFIX = "rpm_";

/** The prefix only makes a leaked token recognisable; the secret is the random part. */
export function generateSessionToken(): { token: string; tokenHash: string } {
  const token = TOKEN_PREFIX + randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSessionToken(token) };
}

/**
 * Only this hash is stored. SHA-256 is enough here (no need for scrypt like
 * passwords): the token is 256 random bits, so it cannot be guessed or
 * brute-forced from its hash. The lookup is done by hash in the database, so
 * there is no string comparison in our code whose timing could leak anything.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
