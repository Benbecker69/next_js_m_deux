import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/locale-constants";
import type { toCheckInHistoryDto, toReservationDto } from "@/lib/mobile/dto";
import type { getMemberSummary } from "@/lib/mobile/summary";
import { dayDiff, dayKey, fill, formatDayShort } from "./format";

// How the member area reads a reservation: which phase it is in, whether it
// can be cancelled, how a list is cut into days. The same rules as the mobile
// app (`features/reservations/` there), written once more because the two
// projects do not share code — if one changes, change the other.
//
// The shapes come from the server functions the mobile API also uses
// (`src/lib/mobile/`): the site and the app read the very same objects.

export type MemberReservation = ReturnType<typeof toReservationDto>;
export type MemberCheckIn = ReturnType<typeof toCheckInHistoryDto>;
export type MemberSummary = Awaited<ReturnType<typeof getMemberSummary>>["summary"];

export type ReservationPhase = "upcoming" | "past" | "cancelled";

/**
 * "cancelled" always wins; otherwise a reservation is "past" once it has
 * fully ENDED — one in progress still counts as upcoming, exactly like the
 * server's own `scope=upcoming`.
 */
export function reservationPhase(
  reservation: Pick<MemberReservation, "status" | "endAt">,
  now: Date,
): ReservationPhase {
  if (reservation.status === "cancelled") return "cancelled";
  return new Date(reservation.endAt).getTime() > now.getTime() ? "upcoming" : "past";
}

/**
 * Why a reservation cannot be cancelled, or `null` when it can. Mirrors what
 * the Server Action refuses, so the page explains the missing button instead
 * of offering one that fails.
 */
export function cancelBlocker(
  reservation: Pick<MemberReservation, "status" | "startAt" | "checkIn">,
  now: Date,
): "started" | "arrived" | "inactive" | null {
  if (reservation.status !== "confirmed") return "inactive";
  if (reservation.checkIn.state === "done") return "arrived";
  if (new Date(reservation.startAt).getTime() <= now.getTime()) return "started";
  return null;
}

/** "Aujourd'hui" / "Demain" / "Hier" close to `now`, a short date otherwise. */
export function dayHeaderLabel(
  date: Date,
  now: Date,
  t: Dictionary["member"]["reservations"],
  locale: Locale,
): string {
  const diff = dayDiff(date, now);
  if (diff === 0) return t.today;
  if (diff === 1) return t.tomorrow;
  if (diff === -1) return t.yesterday;
  return formatDayShort(date, locale);
}

export type DaySection<T> = { key: string; date: Date; items: T[] };

/**
 * A list cut into one section per calendar day. `items` must already be
 * sorted by date (either way): consecutive items of the same day are merged,
 * nothing is re-ordered.
 */
export function groupByDay<T>(items: T[], getIso: (item: T) => string): DaySection<T>[] {
  const sections: DaySection<T>[] = [];
  for (const item of items) {
    const date = new Date(getIso(item));
    const key = dayKey(date);
    const current = sections[sections.length - 1];
    if (current && current.key === key) {
      current.items.push(item);
    } else {
      sections.push({ key, date, items: [item] });
    }
  }
  return sections;
}

/**
 * How far away a reservation is, in the words someone would use: "En cours",
 * "Dans 35 min", "Dans 3 h", "Demain", "Dans 4 jours". Days are calendar
 * days: at 23h, a booking at 9h the next morning is "Demain".
 */
export function startsInLabel(
  reservation: Pick<MemberReservation, "startAt" | "endAt">,
  now: Date,
  t: Dictionary["member"]["home"],
): string {
  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  if (now >= start && now <= end) return t.inProgress;

  const days = dayDiff(start, now);
  if (days === 1) return t.tomorrow;
  if (days > 1) return fill(t.inDays, { n: days });

  const minutes = Math.round((start.getTime() - now.getTime()) / 60_000);
  if (minutes < 60) return fill(t.inMinutes, { n: Math.max(1, minutes) });
  return fill(t.inHours, { n: Math.floor(minutes / 60) });
}

/** Share of finished bookings with a validated arrival, 0–100; `null` when there is none yet. */
export function attendanceRate(attendance: MemberSummary["attendance"]): number | null {
  if (attendance.past === 0) return null;
  return Math.round((attendance.attended / attendance.past) * 100);
}

/** The reason of a refused arrival, in words. Unknown codes fall back to "Refusée". */
export function checkInReasonLabel(
  reason: string | null,
  t: Dictionary["member"]["arrivals"],
): string {
  const reasons: Record<string, string> = t.reasons;
  return (reason && reasons[reason]) || t.reasons.OTHER;
}
