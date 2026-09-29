import "server-only";

// Business rules and limits of the mobile API, gathered in one place so they
// can be read (and explained) at a glance. See docs/api-mobile.md.

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const MOBILE_CONFIG = {
  session: {
    ttlMs: 14 * DAY_MS,
    // lastUsedAt is refreshed at most this often, not on every request.
    touchIntervalMs: MINUTE_MS,
  },
  // Mirrors SIGNUP_BONUS_CREDITS in (auth)/inscription/_actions.ts, which is
  // not exported: copied here rather than touching the web action.
  signupBonusCredits: 20,
  booking: {
    // A slot may start "now": allow a little clock drift between phone and server.
    startToleranceMs: 5 * MINUTE_MS,
    // "One month ahead at most": the app's calendar stops on today's date one
    // month later (28-31 days, last slot starting at 17:00). 32 days keeps a
    // day of margin so that anything the calendar offers is accepted here,
    // whatever the phone's time zone, while a direct API call still can't
    // book months away.
    maxAdvanceMs: 32 * DAY_MS,
    minDurationMs: 30 * MINUTE_MS,
    maxDurationMs: 12 * HOUR_MS,
    defaultDurationMs: HOUR_MS,
  },
  checkIn: {
    radiusM: 150,
    opensBeforeStartMs: 15 * MINUTE_MS,
    // A phone's GPS is imprecise indoors: refuse a fix too vague to prove anything.
    maxAccuracyM: 100,
    // The position must be fresh, not a fix cached minutes ago.
    maxPositionAgeMs: MINUTE_MS,
  },
  pagination: { defaultLimit: 20, maxLimit: 50 },
  nearby: { defaultLimit: 10, maxLimit: 30 },
  loginRateLimit: { maxFailures: 10, windowMs: 10 * MINUTE_MS },
} as const;
