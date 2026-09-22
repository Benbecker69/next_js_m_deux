import "server-only";
import { MOBILE_CONFIG } from "./config";
import { ApiError } from "./http";

// Brute-force brake for the login endpoint, keyed by e-mail address. It lives
// in this process's memory: enough for a single local server, and honest about
// its limit — it resets on restart and would not be shared across instances.

const failures = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5_000;

function recentFailures(key: string, now: number): number[] {
  const { windowMs } = MOBILE_CONFIG.loginRateLimit;
  const recent = (failures.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length > 0) failures.set(key, recent);
  else failures.delete(key);
  return recent;
}

export function assertLoginAllowed(key: string): void {
  if (
    recentFailures(key, Date.now()).length >= MOBILE_CONFIG.loginRateLimit.maxFailures
  ) {
    throw new ApiError(
      429,
      "TOO_MANY_ATTEMPTS",
      "Trop de tentatives. Réessayez dans quelques minutes.",
    );
  }
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  if (failures.size >= MAX_TRACKED_KEYS) {
    // Bound the memory: drop the oldest tracked key.
    const oldest = failures.keys().next().value;
    if (oldest !== undefined) failures.delete(oldest);
  }
  failures.set(key, [...recentFailures(key, now), now]);
}

export function clearLoginFailures(key: string): void {
  failures.delete(key);
}
