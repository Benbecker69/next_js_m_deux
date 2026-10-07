import { CLOSING_HOUR, OPENING_HOUR } from "./slots";

// The opening hours, checked on the server. The picker only offers whole
// hours between 9h and 18h, but a Server Action can be called without the
// picker: this is the same rule, enforced where the booking is written.
//
// Read in Paris time, not in the server's own time zone (UTC inside the
// Docker image): every location is in mainland France, and "open from 9h"
// means 9h there.

const HOUR_MS = 3_600_000;

const parisClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

/** The Paris calendar day and hour (0–23) of an instant. */
function parisDayAndHour(date: Date): { day: string; hour: number } {
  const parts = Object.fromEntries(
    parisClock.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

/**
 * A booking fits the opening hours when it starts and ends on the hour, on
 * the same day, no earlier than the opening and no later than the closing.
 */
export function isWithinOpeningHours(startAt: Date, endAt: Date): boolean {
  // Paris is a whole number of hours away from UTC: on the hour here is on
  // the hour there.
  const onTheHour = (date: Date) => date.getTime() % HOUR_MS === 0;
  if (!onTheHour(startAt) || !onTheHour(endAt)) return false;

  const start = parisDayAndHour(startAt);
  const end = parisDayAndHour(endAt);
  return (
    start.day === end.day &&
    start.hour >= OPENING_HOUR &&
    end.hour <= CLOSING_HOUR &&
    end.hour > start.hour
  );
}
