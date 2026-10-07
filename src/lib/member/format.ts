import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale-constants";

// Dates as the member area shows them. Pure functions, usable from Server and
// Client Components alike.
//
// Everything is computed in the time zone of the locations (mainland France),
// never in "the machine's" zone: these pages render on the server, which may
// well run in UTC, and a booking at 14h must read 14h wherever the code runs.

const TIME_ZONE = "Europe/Paris";
const DAY_MS = 86_400_000;

// "en-CA" writes dates as 2026-10-06: a sortable, comparable day key.
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-10-06": the calendar day `date` falls on, in France. */
export function dayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

/** Whole calendar days from `from` to `to`: 0 today, 1 tomorrow, -1 yesterday. */
export function dayDiff(to: Date, from: Date): number {
  const [toYear, toMonth, toDay] = dayKey(to).split("-").map(Number);
  const [fromYear, fromMonth, fromDay] = dayKey(from).split("-").map(Number);
  return Math.round(
    (Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      DAY_MS,
  );
}

function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Mardi 6 octobre" — a day as a heading. */
export function formatDayLong(date: Date, locale: Locale): string {
  return upperFirst(
    date.toLocaleDateString(INTL_LOCALE[locale], {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
}

/** "mar. 6 oct." — a day in a list. */
export function formatDayShort(date: Date, locale: Locale): string {
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** The three lines of a small calendar tile: "mar.", "6", "oct.". */
export function formatDayParts(
  date: Date,
  locale: Locale,
): { weekday: string; day: string; month: string } {
  const part = (options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString(INTL_LOCALE[locale], { timeZone: TIME_ZONE, ...options });
  return {
    weekday: part({ weekday: "short" }),
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
  };
}

/** "14h", "14h30" in French; "14:00", "14:30" in English. */
export function formatHour(date: Date, locale: Locale): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  if (locale === "fr") return minute === "00" ? `${hour}h` : `${hour}h${minute}`;
  return `${hour}:${minute}`;
}

/** "14h–17h" — the hours of a booking, when its day is shown elsewhere. */
export function formatHourRange(
  startIso: string,
  endIso: string,
  locale: Locale,
): string {
  return `${formatHour(new Date(startIso), locale)}–${formatHour(new Date(endIso), locale)}`;
}

/** "6 oct. à 14h" — a single moment, day and hour. */
export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(INTL_LOCALE[locale], {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
  });
  return `${day}, ${formatHour(date, locale)}`;
}

/** "1,5" in French, "1.5" in English — no trailing ",0". */
export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(INTL_LOCALE[locale], { maximumFractionDigits: 1 });
}

/** "350 m", "1,2 km". */
export function formatDistance(meters: number, locale: Locale): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${formatNumber(meters / 1000, locale)} km`;
}

/**
 * Fills the `{name}` holes of a dictionary sentence:
 * `fill("Dans {n} h", { n: 3 })` → "Dans 3 h". Keeps word order a matter of
 * translation instead of string concatenation in the components.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
